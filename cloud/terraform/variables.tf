# Zenvora AI Platform - Terraform Variables

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones for the VPC"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "private_subnets" {
  description = "Private subnets for the VPC"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnets" {
  description = "Public subnets for the VPC"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "intra_subnets" {
  description = "Intra subnets for the VPC"
  type        = list(string)
  default     = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]
}

variable "eks_version" {
  description = "EKS cluster version"
  type        = string
  default     = "1.28"
}

variable "instance_types" {
  description = "EC2 instance types for EKS nodes"
  type        = list(string)
  default     = ["t3.large", "t3.xlarge"]
}

variable "min_nodes" {
  description = "Minimum number of EKS nodes"
  type        = number
  default     = 2
}

variable "max_nodes" {
  description = "Maximum number of EKS nodes"
  type        = number
  default     = 20
}

variable "desired_nodes" {
  description = "Desired number of EKS nodes"
  type        = number
  default     = 3
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.r6g.large"
}

variable "redis_instance_class" {
  description = "ElastiCache instance class"
  type        = string
  default     = "cache.r6g.large"
}

variable "domain_name" {
  description = "Custom domain name for the application"
  type        = string
  default     = ""
}

variable "app_version" {
  description = "Application version to deploy"
  type        = string
  default     = "latest"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Environment = "production"
    Project     = "zenvora-ai-platform"
    ManagedBy   = "terraform"
  }
}
