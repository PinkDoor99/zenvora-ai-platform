# Zenvora AI Platform - Terraform Configuration
# Infrastructure as Code for AWS deployment

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.10"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
  token                  = data.aws_eks_cluster_auth.cluster_auth.token
}

# Random resources for unique naming
resource "random_pet" "cluster_name" {
  prefix = "zenvora"
  length = 2
}

resource "random_string" "db_password" {
  length  = 32
  special = true
}

resource "random_string" "jwt_secret" {
  length  = 64
  special = false
}

# VPC Configuration
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${random_pet.cluster_name.id}-vpc"
  cidr = var.vpc_cidr

  azs             = var.availability_zones
  private_subnets = var.private_subnets
  public_subnets  = var.public_subnets
  intra_subnets   = var.intra_subnets

  enable_nat_gateway   = true
  single_nat_gateway   = false
  one_nat_gateway_per_az = true
  enable_vpn_gateway   = false

  tags = merge(var.tags, {
    Name = "${random_pet.cluster_name.id}-vpc"
  })
}

# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = random_pet.cluster_name.id
  cluster_version = var.eks_version
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets

  cluster_endpoint_public_access = true
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }

  eks_managed_node_groups = {
    general = {
      instance_types = var.instance_types
      min_size     = var.min_nodes
      max_size     = var.max_nodes
      desired_size = var.desired_nodes
      subnet_ids   = module.vpc.private_subnets

      labels = {
        role = "general"
      }

      tags = merge(var.tags, {
        Name = "${random_pet.cluster_name.id}-general-nodes"
      })
    }

    system = {
      instance_types = ["t3.medium"]
      min_size     = 2
      max_size     = 3
      desired_size = 2
      subnet_ids   = module.vpc.private_subnets

      labels = {
        role = "system"
      }

      taints = {
        dedicated = {
          key    = "node-role.kubernetes.io/system"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      }

      tags = merge(var.tags, {
        Name = "${random_pet.cluster_name.id}-system-nodes"
      })
    }
  }

  tags = var.tags
}

# EKS Cluster Auth
data "aws_eks_cluster_auth" "cluster_auth" {
  name = module.eks.cluster_name
}

# RDS PostgreSQL Database
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = "${random_pet.cluster_name.id}-postgres"

  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class
  allocated_storage = 100
  max_allocated_storage = 1000
  storage_encrypted = true
  storage_type = "gp3"
  iops = 3000

  db_name  = "zenvora_production"
  username = "zenvora_user"
  password = random_string.db_password.result

  vpc_security_group_ids = [module.security_group.db_security_group_id]
  db_subnet_group_name  = module.vpc.database_subnet_group_name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = false
  final_snapshot_identifier = "${random_pet.cluster_name.id}-final-snapshot"

  tags = merge(var.tags, {
    Name = "${random_pet.cluster_name.id}-postgres"
  })
}

# ElastiCache Redis
module "elasticache" {
  source  = "terraform-aws-modules/elasticache/aws"
  version = "~> 1.0"

  cluster_id           = "${random_pet.cluster_name.id}-redis"
  cluster_description   = "Zenvora AI Platform Redis Cache"
  node_type            = var.redis_instance_class
  number_of_cache_clusters = 1
  parameter_group_name = "default.redis7"
  engine_version       = "7.0"
  port                 = 6379
  security_group_ids   = [module.security_group.redis_security_group_id]
  subnet_group_name    = module.vpc.redis_subnet_group_name

  auth_token = random_string.db_password.result

  tags = merge(var.tags, {
    Name = "${random_pet.cluster_name.id}-redis"
  })
}

# S3 Bucket for Application Storage
resource "aws_s3_bucket" "app_storage" {
  bucket = "${random_pet.cluster_name.id}-storage"
}

resource "aws_s3_bucket_versioning" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_s3_bucket_public_access_block" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = module.alb.alb_dns_name
    origin_id   = module.alb.alb_arn

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Zenvora AI Platform CDN"
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = module.alb.alb_arn
    compress              = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = merge(var.tags, {
    Name = "${random_pet.cluster_name.id}-cdn"
  })
}

# Application Load Balancer
module "alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 8.0"

  name = "${random_pet.cluster_name.id}-alb"
  vpc_id  = module.vpc.vpc_id
  subnets = module.vpc.public_subnets

  security_groups = [module.security_group.alb_security_group_id]

  target_groups = [
    {
      name_prefix      = "app-"
      backend_protocol = "HTTP"
      backend_port     = 80
      target_type      = "ip"
    },
    {
      name_prefix      = "collab-"
      backend_protocol = "HTTP"
      backend_port     = 3003
      target_type      = "ip"
    }
  ]

  http_tcp_listeners = [
    {
      port     = 80
      protocol = "HTTP"
      default = {
        target_group_index = 0
      }
    },
    {
      port     = 3003
      protocol = "HTTP"
      default = {
        target_group_index = 1
      }
    }
  ]

  tags = merge(var.tags, {
    Name = "${random_pet.cluster_name.id}-alb"
  })
}

# Security Groups
module "security_group" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name = "${random_pet.cluster_name.id}-sg"
  vpc_id = module.vpc.vpc_id

  ingress_with_cidr_blocks = [
    {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      description = "HTTP"
      cidr_blocks = ["0.0.0.0/0"]
    },
    {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      description = "HTTPS"
      cidr_blocks = ["0.0.0.0/0"]
    },
    {
      from_port   = 3003
      to_port     = 3003
      protocol    = "tcp"
      description = "WebSocket"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]

  egress_with_cidr_blocks = [
    {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      description = "All traffic"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]

  tags = merge(var.tags, {
    Name = "${random_pet.cluster_name.id}-sg"
  })
}

# Route 53 Hosted Zone (if using custom domain)
resource "aws_route53_zone" "main" {
  count = var.domain_name != "" ? 1 : 0
  name  = var.domain_name
}

resource "aws_route53_record" "www" {
  count   = var.domain_name != "" ? 1 : 0
  zone_id = aws_route53_zone.main[0].zone_id
  name    = "www.${var.domain_name}"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.cdn.domain_name
    zone_id               = aws_cloudfront_distribution.cdn.hosted_zone_id
    evaluate_target_health = true
  }
}

# ACM Certificate (if using custom domain)
resource "aws_acm_certificate" "cert" {
  count           = var.domain_name != "" ? 1 : 0
  domain_name     = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = ["*.${var.domain_name}"]

  tags = merge(var.tags, {
    Name = "${random_pet.cluster_name.id}-cert"
  })
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/eks/${random_pet.cluster_name.id}/application"
  retention_in_days = 30

  tags = merge(var.tags, {
    Name = "${random_pet.cluster_name.id}-logs"
  })
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "${random_pet.cluster_name.id}-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace          = "AWS/EKS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors EKS cluster CPU utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ClusterName = module.eks.cluster_name
  }

  tags = merge(var.tags, {
    Name = "${random_pet.cluster_name.id}-high-cpu"
  })
}

# SNS Topic for Alerts
resource "aws_sns_topic" "alerts" {
  name = "${random_pet.cluster_name.id}-alerts"

  tags = merge(var.tags, {
    Name = "${random_pet.cluster_name.id}-alerts"
  })
}

# IAM Role for EKS
resource "aws_iam_role" "eks_cluster_role" {
  name = "${random_pet.cluster_name.id}-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${random_pet.cluster_name.id}-eks-cluster-role"
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster_role.name
}

# Helm Provider Configuration
data "aws_eks_cluster" "cluster" {
  name = module.eks.cluster_name
}

provider "helm" {
  kubernetes {
    host                   = data.aws_eks_cluster.cluster.endpoint
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.cluster_auth.token
  }
}

# Deploy Ingress Controller
resource "helm_release" "ingress_controller" {
  name       = "nginx-ingress"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  namespace  = "ingress-nginx"
  version    = "4.7.0"

  set {
    name  = "controller.replicaCount"
    value = 2
  }

  set {
    name  = "controller.metrics.enabled"
    value = true
  }

  set {
    name  = "controller.service.type"
    value = "LoadBalancer"
  }

  set {
    name  = "controller.publishService.enabled"
    value = true
  }

  depends_on = [module.eks]
}

# Deploy Cert-Manager
resource "helm_release" "cert_manager" {
  name       = "cert-manager"
  repository = "https://charts.jetstack.io"
  chart      = "cert-manager"
  namespace  = "cert-manager"
  version    = "1.13.0"

  set {
    name  = "installCRDs"
    value = true
  }

  set {
    name  = "replicaCount"
    value = 1
  }

  depends_on = [helm_release.ingress_controller]
}

# Deploy Prometheus and Grafana
resource "helm_release" "prometheus" {
  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = "monitoring"
  version    = "45.0.0"

  set {
    name  = "prometheus.prometheusSpec.replicas"
    value = 2
  }

  set {
    name  = "grafana.adminPassword"
    value = random_string.db_password.result
  }

  set {
    name  = "prometheusOperator.enabled"
    value = true
  }

  depends_on = [helm_release.cert_manager]
}

# Deploy Zenvora Application
resource "helm_release" "zenvora" {
  name       = "zenvora"
  repository = "./helm-charts"
  chart      = "zenvora-platform"
  namespace  = "zenvora-prod"
  version    = "1.0.0"

  set {
    name  = "replicaCount"
    value = 3
  }

  set {
    name  = "image.tag"
    value = var.app_version
  }

  set {
    name  = "ingress.enabled"
    value = true
  }

  set {
    name  = "ingress.hosts[0].host"
    value = var.domain_name != "" ? var.domain_name : "${random_pet.cluster_name.id}.example.com"
  }

  set {
    name  = "database.host"
    value = module.rds.db_instance_address
  }

  set {
    name  = "database.password"
    value = random_string.db_password.result
  }

  set {
    name  = "redis.host"
    value = module.elasticache.redis_endpoint
  }

  set {
    name  = "redis.password"
    value = random_string.db_password.result
  }

  set {
    name  = "secrets.jwtSecret"
    value = random_string.jwt_secret.result
  }

  set {
    name  = "autoscaling.enabled"
    value = true
  }

  set {
    name  = "autoscaling.minReplicas"
    value = 3
  }

  set {
    name  = "autoscaling.maxReplicas"
    value = 20
  }

  depends_on = [helm_release.prometheus]
}

# Outputs
output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "region" {
  description = "AWS region"
  value       = var.aws_region
}

output "database_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = module.rds.db_instance_address
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = module.elasticache.redis_endpoint
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = module.alb.alb_dns_name
}

output "cdn_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.cdn.domain_name
}

output "s3_bucket_name" {
  description = "S3 bucket name for storage"
  value       = aws_s3_bucket.app_storage.bucket
}
