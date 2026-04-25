# Zenvora AI Platform - Complete Deployment Guide

## 🚀 Production Deployment Instructions

This guide covers deploying the Zenvora AI Platform to production environments including cloud platforms, Docker containers, and traditional servers.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Platform Deployment](#cloud-platform-deployment)
6. [Traditional Server Deployment](#traditional-server-deployment)
7. [Security Configuration](#security-configuration)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Performance Optimization](#performance-optimization)
10. [Troubleshooting](#troubleshooting)

## 🛠️ Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 8.x or higher
- **Database**: PostgreSQL 13+ or MySQL 8+ (for production)
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 20GB, Recommended 100GB+
- **Network**: Stable internet connection

### Required Services
- **Web Server**: Nginx or Apache (for production)
- **Process Manager**: PM2 or systemd
- **Reverse Proxy**: Nginx (recommended)
- **SSL Certificate**: Let's Encrypt or commercial certificate

## 🔧 Environment Setup

### 1. Clone and Prepare Repository

```bash
# Clone the repository
git clone <your-repository-url>
cd zenvora-ai-platform

# Install dependencies
npm install

# Install global dependencies
npm install -g pm2
npm install -g nginx
```

### 2. Environment Configuration

Create environment files:

```bash
# Production environment
cp .env.example .env.production
```

Edit `.env.production`:

```env
# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database Configuration
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zenvora_production
DB_USER=zenvora_user
DB_PASSWORD=your_secure_password

# Redis Configuration (for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Security
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_key_here
CORS_ORIGIN=https://yourdomain.com

# File Upload
MAX_FILE_SIZE=50MB
UPLOAD_PATH=/var/www/zenvora/uploads

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Monitoring
SENTRY_DSN=your_sentry_dsn_here
LOG_LEVEL=info
```

## 🗄️ Database Configuration

### PostgreSQL Setup

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE zenvora_production;
CREATE USER zenvora_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE zenvora_production TO zenvora_user;
\q

# Run migrations
npm run migrate:prod
```

### Database Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(255),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    language VARCHAR(50),
    code TEXT,
    collaborators JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    visibility VARCHAR(20) DEFAULT 'private',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analyses table
CREATE TABLE analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    metrics JSONB,
    suggestions JSONB,
    issues JSONB,
    insights JSONB,
    recommendations JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
    token VARCHAR(255) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Tool Usage table
CREATE TABLE ai_tool_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tool_name VARCHAR(100) NOT NULL,
    input_data JSONB,
    output_data JSONB,
    processing_time INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_updated_at ON projects(updated_at);
CREATE INDEX idx_analyses_project_id ON analyses(project_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

## 🐳 Docker Deployment

### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start the application
CMD ["npm", "start"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=zenvora_production
      - POSTGRES_USER=zenvora_user
      - POSTGRES_PASSWORD=your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass your_redis_password
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 3. Deploy with Docker

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Scale application
docker-compose up -d --scale app=2

# Update application
docker-compose pull
docker-compose up -d
```

## ☁️ Cloud Platform Deployment

### AWS Deployment

#### 1. EC2 Setup

```bash
# Create EC2 instance (Ubuntu 22.04)
# Security groups: HTTP (80), HTTPS (443), SSH (22), Custom (3001)

# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx

# Install PM2
sudo npm install -g pm2
```

#### 2. Application Deployment

```bash
# Clone repository
git clone <your-repository-url>
cd zenvora-ai-platform

# Install dependencies
npm install

# Configure environment
cp .env.example .env.production
# Edit .env.production with production values

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 3. Nginx Configuration

```nginx
# /etc/nginx/sites-available/zenvora
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 4. SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Google Cloud Platform Deployment

#### 1. Create App Engine Configuration

```yaml
# app.yaml
runtime: nodejs18

instance_class: F2

env_variables:
  NODE_ENV: production
  PORT: 8080
  DB_HOST: ${DB_HOST}
  DB_USER: ${DB_USER}
  DB_PASSWORD: ${DB_PASSWORD}
  DB_NAME: ${DB_NAME}

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.65

handlers:
- url: /.*
  script: auto
  secure: always
```

#### 2. Deploy to App Engine

```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize project
gcloud init

# Deploy application
gcloud app deploy

# View logs
gcloud app logs tail -s default
```

### Azure Deployment

#### 1. Create Web App

```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Create resource group
az group create --name zenvora-rg --location eastus

# Create app service plan
az appservice plan create --name zenvora-plan --resource-group zenvora-rg --sku B1

# Create web app
az webapp create --name zenvora-app --resource-group zenvora-rg --plan zenvora-plan --runtime "NODE|18-lts"

# Deploy application
az webapp up --name zenvora-app --resource-group zenvora-rg
```

## 🖥️ Traditional Server Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx

# Install PM2
sudo npm install -g pm2

# Install Redis (for caching)
sudo apt install redis-server
```

### 2. Application Setup

```bash
# Create application user
sudo adduser --system --group --home /var/www/zenvora zenvora

# Create application directory
sudo mkdir -p /var/www/zenvora
sudo chown zenvora:zenvora /var/www/zenvora

# Deploy application
sudo -u zenvora -H git clone <your-repository-url> /var/www/zenvora
cd /var/www/zenvora

# Install dependencies
sudo -u zenvora npm ci --production

# Configure environment
sudo -u zenvora cp .env.example .env.production
# Edit .env.production
```

### 3. PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'zenvora-main',
    script: 'backend/server_enhanced.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/zenvora/error.log',
    out_file: '/var/log/zenvora/out.log',
    log_file: '/var/log/zenvora/combined.log',
    time: true
  },
  {
    name: 'zenvora-collaboration',
    script: 'collaboration_server.js',
    instances: 1,
    env: {
      NODE_ENV: 'production',
      PORT: 3003
    },
    error_file: '/var/log/zenvora/collab-error.log',
    out_file: '/var/log/zenvora/collab-out.log',
    log_file: '/var/log/zenvora/collab-combined.log',
    time: true
  }]
};
```

### 4. Start Application

```bash
# Create log directory
sudo mkdir -p /var/log/zenvora
sudo chown zenvora:zenvora /var/log/zenvora

# Start with PM2
sudo -u zenvora pm2 start ecosystem.config.js --env production

# Save PM2 configuration
sudo -u zenvora pm2 save
sudo -u zenvora pm2 startup
```

## 🔒 Security Configuration

### 1. Firewall Setup

```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Database Security

```bash
# Secure PostgreSQL
sudo -u postgres psql
ALTER USER postgres PASSWORD 'strong_postgres_password';
\q

# Configure PostgreSQL security
sudo nano /etc/postgresql/15/main/postgresql.conf
# Set: listen_addresses = 'localhost'

sudo nano /etc/postgresql/15/main/pg_hba.conf
# Add: local all all md5
```

### 3. Application Security

```javascript
// Security middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Apply security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
```

## 📊 Monitoring and Logging

### 1. Application Monitoring

```javascript
// Monitoring setup
const winston = require('winston');
const Sentry = require('@sentry/node');

// Winston logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Sentry error tracking
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### 2. Health Checks

```javascript
// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    await db.query('SELECT 1');
    
    // Check Redis connection
    await redis.ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
      redis: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

### 3. PM2 Monitoring

```bash
# Monitor PM2 processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart zenvora-main

# Scale application
pm2 scale zenvora-main 4
```

## ⚡ Performance Optimization

### 1. Database Optimization

```sql
-- Create indexes for frequently queried columns
CREATE INDEX CONCURRENTLY idx_projects_user_status ON projects(user_id, status);
CREATE INDEX CONCURRENTLY idx_analyses_created_at ON analyses(created_at DESC);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM projects WHERE user_id = $1 AND status = 'active';
```

### 2. Caching Strategy

```javascript
// Redis caching
const redis = require('redis');
const client = redis.createClient();

// Cache middleware
const cache = (duration = 300) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};

// Apply caching to API endpoints
app.get('/api/projects/:userId', cache(600), getProjects);
```

### 3. Compression and Minification

```javascript
// Compression middleware
const compression = require('compression');
app.use(compression());

// Static file serving with compression
app.use(express.static('public', {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Check connection
   psql -h localhost -U zenvora_user -d zenvora_production
   ```

2. **Application Not Starting**
   ```bash
   # Check PM2 status
   pm2 status
   
   # View logs
   pm2 logs zenvora-main
   
   # Restart application
   pm2 restart zenvora-main
   ```

3. **Nginx Configuration Issues**
   ```bash
   # Test Nginx configuration
   sudo nginx -t
   
   # Reload Nginx
   sudo nginx -s reload
   
   # Check Nginx logs
   sudo tail -f /var/log/nginx/error.log
   ```

4. **SSL Certificate Issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew
   
   # Test SSL configuration
   openssl s_client -connect yourdomain.com:443
   ```

### Performance Issues

1. **High Memory Usage**
   ```bash
   # Monitor memory usage
   pm2 monit
   
   # Check for memory leaks
   node --inspect app.js
   ```

2. **Slow Database Queries**
   ```bash
   # Monitor database performance
   sudo -u postgres psql -d zenvora_production -c "
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;"
   ```

### Backup and Recovery

```bash
# Database backup
pg_dump -h localhost -U zenvora_user zenvora_production > backup.sql

# Database restore
psql -h localhost -U zenvora_user zenvora_production < backup.sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/var/backups/zenvora"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U zenvora_user zenvora_production > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

## 📞 Support

For deployment issues:
1. Check application logs
2. Verify environment configuration
3. Test database connectivity
4. Monitor system resources
5. Review security configurations

## 🔄 Updates and Maintenance

### Regular Maintenance

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js packages
npm update

# Restart services
pm2 restart all
sudo nginx -s reload

# Backup database
./backup_script.sh
```

### Zero-Downtime Deployment

```bash
# Deploy with zero downtime
pm2 reload zenvora-main

# Or use blue-green deployment
# Deploy to staging, test, then switch traffic
```

This deployment guide provides comprehensive instructions for deploying Zenvora AI Platform to production environments across multiple platforms and deployment methods.
