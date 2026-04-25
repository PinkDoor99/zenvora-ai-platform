#!/bin/bash

# Zenvora AI Platform - Automated Deployment Script
# This script automates the deployment process for production environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="zenvora-ai-platform"
APP_DIR="/var/www/zenvora"
BACKUP_DIR="/var/backups/zenvora"
LOG_FILE="/var/log/zenvora/deploy.log"
ENVIRONMENT="production"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# Function to check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root. Run as the application user."
        exit 1
    fi
}

# Function to backup current deployment
backup_current() {
    print_status "Creating backup of current deployment..."
    
    if [ -d "$APP_DIR" ]; then
        BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        
        # Backup application files
        cp -r "$APP_DIR" "$BACKUP_DIR/$BACKUP_NAME"
        
        # Backup database
        if command -v pg_dump &> /dev/null; then
            pg_dump -h localhost -U zenvora_user zenvora_production > "$BACKUP_DIR/$BACKUP_NAME/database.sql"
        fi
        
        print_success "Backup created: $BACKUP_DIR/$BACKUP_NAME"
        log_message "Backup created: $BACKUP_DIR/$BACKUP_NAME"
    else
        print_warning "No existing application found, skipping backup"
    fi
}

# Function to install system dependencies
install_dependencies() {
    print_status "Installing system dependencies..."
    
    # Update package list
    sudo apt update
    
    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        print_status "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Install PM2 if not present
    if ! command -v pm2 &> /dev/null; then
        print_status "Installing PM2..."
        sudo npm install -g pm2
    fi
    
    # Install Nginx if not present
    if ! command -v nginx &> /dev/null; then
        print_status "Installing Nginx..."
        sudo apt install -y nginx
    fi
    
    print_success "Dependencies installed successfully"
    log_message "System dependencies installed"
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if PostgreSQL is installed
    if ! command -v psql &> /dev/null; then
        print_status "Installing PostgreSQL..."
        sudo apt install -y postgresql postgresql-contrib
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    fi
    
    # Create database and user if they don't exist
    sudo -u postgres psql -c "SELECT 1 FROM pg_roles WHERE rolname='zenvora_user'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER zenvora_user WITH PASSWORD 'zenvora_password';"
    
    sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname='zenvora_production'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE zenvora_production OWNER zenvora_user;"
    
    print_success "Database setup completed"
    log_message "Database setup completed"
}

# Function to create application directory
create_app_directory() {
    print_status "Creating application directory..."
    
    # Create application user if not exists
    if ! id "zenvora" &>/dev/null; then
        sudo adduser --system --group --home $APP_DIR zenvora
    fi
    
    # Create application directory
    sudo mkdir -p $APP_DIR
    sudo chown zenvora:zenvora $APP_DIR
    
    print_success "Application directory created"
    log_message "Application directory created: $APP_DIR"
}

# Function to deploy application
deploy_application() {
    print_status "Deploying application..."
    
    # Clone or update repository
    if [ -d "$APP_DIR/.git" ]; then
        cd $APP_DIR
        sudo -u zenvora git pull origin main
    else
        sudo -u zenvora git clone <REPOSITORY_URL> $APP_DIR
        cd $APP_DIR
    fi
    
    # Install dependencies
    sudo -u zenvora npm ci --production
    
    # Create environment file if not exists
    if [ ! -f "$APP_DIR/.env.production" ]; then
        sudo -u zenvora cp $APP_DIR/.env.example $APP_DIR/.env.production
        print_warning "Please configure $APP_DIR/.env.production with your production settings"
    fi
    
    print_success "Application deployed successfully"
    log_message "Application deployed to $APP_DIR"
}

# Function to setup SSL certificate
setup_ssl() {
    print_status "Setting up SSL certificate..."
    
    # Install Certbot if not present
    if ! command -v certbot &> /dev/null; then
        sudo apt install -y certbot python3-certbot-nginx
    fi
    
    # Get SSL certificate (interactive)
    echo "Please enter your domain name:"
    read DOMAIN_NAME
    
    if [ ! -z "$DOMAIN_NAME" ]; then
        sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME
        print_success "SSL certificate installed for $DOMAIN_NAME"
        log_message "SSL certificate installed for $DOMAIN_NAME"
    else
        print_warning "No domain name provided, skipping SSL setup"
    fi
}

# Function to configure Nginx
configure_nginx() {
    print_status "Configuring Nginx..."
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/zenvora > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name _;

    ssl_certificate /etc/letsencrypt/live/zenvora/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zenvora/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # Enable site
    sudo ln -sf /etc/nginx/sites-available/zenvora /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    sudo nginx -t && sudo nginx -s reload
    
    print_success "Nginx configured successfully"
    log_message "Nginx configured"
}

# Function to setup PM2
setup_pm2() {
    print_status "Setting up PM2..."
    
    # Create PM2 ecosystem file
    sudo -u zenvora tee $APP_DIR/ecosystem.config.js > /dev/null <<EOF
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
    time: true,
    max_memory_restart: '1G'
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
    time: true,
    max_memory_restart: '512M'
  }]
};
EOF

    # Create log directory
    sudo mkdir -p /var/log/zenvora
    sudo chown zenvora:zenvora /var/log/zenvora
    
    # Start application with PM2
    sudo -u zenvora pm2 start $APP_DIR/ecosystem.config.js --env production
    
    # Save PM2 configuration
    sudo -u zenvora pm2 save
    sudo -u zenvora pm2 startup
    
    print_success "PM2 setup completed"
    log_message "PM2 setup completed"
}

# Function to setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Create monitoring script
    sudo tee /usr/local/bin/zenvora-monitor > /dev/null <<'EOF'
#!/bin/bash

# Zenvora Monitoring Script
LOG_FILE="/var/log/zenvora/monitor.log"

# Check PM2 processes
if ! pm2 list | grep -q "zenvora-main.*online"; then
    echo "$(date): Main application is down, restarting..." >> $LOG_FILE
    pm2 restart zenvora-main
fi

if ! pm2 list | grep -q "zenvora-collaboration.*online"; then
    echo "$(date): Collaboration server is down, restarting..." >> $LOG_FILE
    pm2 restart zenvora-collaboration
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "$(date): Disk usage is ${DISK_USAGE}%, cleaning up..." >> $LOG_FILE
    # Clean up old logs
    find /var/log/zenvora -name "*.log" -mtime +7 -delete
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEMORY_USAGE -gt 85 ]; then
    echo "$(date): Memory usage is ${MEMORY_USAGE}%, restarting applications..." >> $LOG_FILE
    pm2 restart all
fi
EOF

    sudo chmod +x /usr/local/bin/zenvora-monitor
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/zenvora-monitor") | crontab -
    
    print_success "Monitoring setup completed"
    log_message "Monitoring setup completed"
}

# Function to run health checks
health_check() {
    print_status "Running health checks..."
    
    # Check if main application is responding
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        print_success "Main application is healthy"
    else
        print_error "Main application health check failed"
        return 1
    fi
    
    # Check if collaboration server is responding
    if curl -f http://localhost:3003 > /dev/null 2>&1; then
        print_success "Collaboration server is healthy"
    else
        print_error "Collaboration server health check failed"
        return 1
    fi
    
    # Check PM2 processes
    if pm2 list | grep -q "zenvora-main.*online" && pm2 list | grep -q "zenvora-collaboration.*online"; then
        print_success "PM2 processes are running"
    else
        print_error "Some PM2 processes are not running"
        return 1
    fi
    
    print_success "All health checks passed"
    log_message "Health checks passed"
    return 0
}

# Function to rollback deployment
rollback() {
    print_status "Rolling back to previous deployment..."
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t $BACKUP_DIR | grep backup_ | head -n1)
    
    if [ ! -z "$LATEST_BACKUP" ]; then
        # Stop current application
        sudo -u zenvora pm2 stop all
        
        # Restore from backup
        sudo rm -rf $APP_DIR
        sudo cp -r "$BACKUP_DIR/$LATEST_BACKUP" $APP_DIR
        sudo chown -R zenvora:zenvora $APP_DIR
        
        # Restore database if backup exists
        if [ -f "$BACKUP_DIR/$LATEST_BACKUP/database.sql" ]; then
            sudo -u postgres psql -d zenvora_production < "$BACKUP_DIR/$LATEST_BACKUP/database.sql"
        fi
        
        # Restart application
        sudo -u zenvora pm2 start all
        
        print_success "Rollback completed to: $LATEST_BACKUP"
        log_message "Rollback completed to: $LATEST_BACKUP"
    else
        print_error "No backup found for rollback"
        return 1
    fi
}

# Function to display usage
usage() {
    echo "Usage: $0 [OPTION]"
    echo "Options:"
    echo "  deploy     - Full deployment (default)"
    echo "  update     - Update existing deployment"
    echo "  rollback   - Rollback to previous version"
    echo "  health     - Run health checks"
    echo "  backup     - Create backup only"
    echo "  help       - Show this help message"
}

# Main deployment function
main() {
    local action=${1:-deploy}
    
    print_status "Starting Zenvora AI Platform deployment..."
    log_message "Deployment started with action: $action"
    
    case $action in
        "deploy")
            check_root
            backup_current
            install_dependencies
            setup_database
            create_app_directory
            deploy_application
            setup_ssl
            configure_nginx
            setup_pm2
            setup_monitoring
            health_check
            print_success "Deployment completed successfully!"
            ;;
        "update")
            check_root
            backup_current
            deploy_application
            sudo -u zenvora pm2 reload all
            health_check
            print_success "Update completed successfully!"
            ;;
        "rollback")
            check_root
            rollback
            health_check
            ;;
        "health")
            health_check
            ;;
        "backup")
            backup_current
            ;;
        "help")
            usage
            ;;
        *)
            print_error "Unknown option: $action"
            usage
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"
