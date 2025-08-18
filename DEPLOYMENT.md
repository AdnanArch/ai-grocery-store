# Deployment Guide

This guide covers deploying the AI Grocery Store application to different environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Staging Environment](#staging-environment)
- [Production Environment](#production-environment)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Monitoring and Logging](#monitoring-and-logging)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- Docker and Docker Compose installed
- Git installed
- Access to your deployment environment
- Required API keys and credentials

## Local Development

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <your-repository-url>
   cd ai-grocery-store
   ```

2. **Set up environment variables**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Run the application**

   ```bash
   # Using the setup script
   ./setup.sh

   # Or manually
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - AI Service: http://localhost:5000
   - phpMyAdmin: http://localhost:8081

### Development Workflow

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

## Staging Environment

### Setup

1. **Create staging environment file**

   ```bash
   cp env.example .env.staging
   ```

2. **Configure staging variables**

   ```env
   # Staging URLs
   FRONTEND_URL=https://staging.yourdomain.com
   REACT_APP_API_URL=https://staging.yourdomain.com/api
   REACT_APP_AI_SERVICE_URL=https://staging.yourdomain.com/ai

   # Staging Database
   DB_HOST=staging-db.yourdomain.com
   DB_PORT=3306
   DB_NAME=grocerystore_staging
   DB_USERNAME=staging_user
   DB_PASSWORD=secure_staging_password

   # Staging Email
   MAIL_USERNAME=staging@yourdomain.com
   MAIL_PASSWORD=staging_email_password

   # Test Stripe Keys
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

3. **Deploy to staging**

   ```bash
   # Set environment file
   export ENV_FILE=.env.staging

   # Deploy using production compose
   docker-compose -f docker-compose.prod.yml --env-file .env.staging up -d
   ```

## Production Environment

### Pre-deployment Checklist

- [ ] All tests pass
- [ ] Security scan completed
- [ ] Environment variables configured
- [ ] Database backup created
- [ ] SSL certificates ready
- [ ] Monitoring configured
- [ ] Backup strategy in place

### Production Configuration

1. **Create production environment file**

   ```bash
   cp env.example .env.production
   ```

2. **Configure production variables**

   ```env
   # Production URLs
   FRONTEND_URL=https://yourdomain.com
   REACT_APP_API_URL=https://yourdomain.com/api
   REACT_APP_AI_SERVICE_URL=https://yourdomain.com/ai

   # Production Database
   DB_HOST=production-db.yourdomain.com
   DB_PORT=3306
   DB_NAME=grocerystore_production
   DB_USERNAME=production_user
   DB_PASSWORD=secure_production_password

   # Production Email
   MAIL_USERNAME=noreply@yourdomain.com
   MAIL_PASSWORD=production_email_password

   # Live Stripe Keys
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

   # Production JWT (generate a secure key)
   JWT_KEY=your_secure_production_jwt_key

   # Production JazzCash
   JAZZCASH_MERCHANT_ID=your_production_merchant_id
   JAZZCASH_PASSWORD=your_production_password
   JAZZCASH_API_URL=https://payments.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction
   ```

3. **Deploy to production**

   ```bash
   # Set environment file
   export ENV_FILE=.env.production

   # Deploy using production compose
   docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
   ```

## Docker Deployment

### Using Docker Compose

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d

# With custom environment file
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml ai-grocery-store

# Check services
docker service ls

# Scale services
docker service scale ai-grocery-store_backend=3
```

### Using Kubernetes

1. **Create namespace**

   ```yaml
   apiVersion: v1
   kind: Namespace
   metadata:
     name: ai-grocery-store
   ```

2. **Create ConfigMap for environment variables**

   ```yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: ai-grocery-store-config
     namespace: ai-grocery-store
   data:
     MYSQL_DATABASE: grocerystore
     MYSQL_USER: grocery
     # Add other non-sensitive variables
   ```

3. **Create Secret for sensitive data**

   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: ai-grocery-store-secrets
     namespace: ai-grocery-store
   type: Opaque
   data:
     MYSQL_ROOT_PASSWORD: <base64-encoded-password>
     JWT_KEY: <base64-encoded-jwt-key>
     STRIPE_SECRET_KEY: <base64-encoded-stripe-key>
     # Add other sensitive variables
   ```

4. **Deploy using kubectl**
   ```bash
   kubectl apply -f k8s/
   ```

## Cloud Deployment

### AWS Deployment

1. **Using AWS ECS**

   ```bash
   # Create ECS cluster
   aws ecs create-cluster --cluster-name ai-grocery-store

   # Create task definition
   aws ecs register-task-definition --cli-input-json file://task-definition.json

   # Create service
   aws ecs create-service --cluster ai-grocery-store --service-name ai-grocery-store --task-definition ai-grocery-store:1
   ```

2. **Using AWS EKS**

   ```bash
   # Create EKS cluster
   eksctl create cluster --name ai-grocery-store --region us-west-2

   # Deploy application
   kubectl apply -f k8s/
   ```

### Google Cloud Deployment

1. **Using Google Cloud Run**

   ```bash
   # Build and push images
   gcloud builds submit --tag gcr.io/PROJECT_ID/ai-grocery-store

   # Deploy to Cloud Run
   gcloud run deploy ai-grocery-store --image gcr.io/PROJECT_ID/ai-grocery-store
   ```

2. **Using Google Kubernetes Engine**

   ```bash
   # Create GKE cluster
   gcloud container clusters create ai-grocery-store --zone us-central1-a

   # Deploy application
   kubectl apply -f k8s/
   ```

### Azure Deployment

1. **Using Azure Container Instances**

   ```bash
   # Deploy container group
   az container create --resource-group myResourceGroup --name ai-grocery-store --image your-registry.azurecr.io/ai-grocery-store
   ```

2. **Using Azure Kubernetes Service**

   ```bash
   # Create AKS cluster
   az aks create --resource-group myResourceGroup --name ai-grocery-store --node-count 1

   # Deploy application
   kubectl apply -f k8s/
   ```

## Monitoring and Logging

### Application Monitoring

1. **Health Checks**

   ```bash
   # Check application health
   curl http://localhost:8080/api/health
   curl http://localhost:5000/health
   curl http://localhost:3000
   ```

2. **Log Monitoring**

   ```bash
   # View application logs
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f ai-service
   ```

3. **Database Monitoring**

   ```bash
   # Check database status
   docker-compose exec mysql mysqladmin status

   # Monitor database performance
   docker-compose exec mysql mysql -e "SHOW PROCESSLIST;"
   ```

### Performance Monitoring

1. **Resource Usage**

   ```bash
   # Monitor container resources
   docker stats

   # Monitor system resources
   htop
   ```

2. **Application Metrics**
   - Use Spring Boot Actuator for backend metrics
   - Implement custom metrics for business logic
   - Monitor API response times and error rates

### Log Aggregation

1. **ELK Stack Setup**

   ```yaml
   # docker-compose.logging.yml
   version: "3.8"
   services:
     elasticsearch:
       image: docker.elastic.co/elasticsearch/elasticsearch:7.17.0
       environment:
         - discovery.type=single-node
       ports:
         - "9200:9200"

     logstash:
       image: docker.elastic.co/logstash/logstash:7.17.0
       volumes:
         - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
       ports:
         - "5044:5044"

     kibana:
       image: docker.elastic.co/kibana/kibana:7.17.0
       ports:
         - "5601:5601"
   ```

2. **Fluentd Configuration**

   ```conf
   # fluentd.conf
   <source>
     @type forward
     port 24224
   </source>

   <match **>
     @type elasticsearch
     host elasticsearch
     port 9200
     index_name ai-grocery-store
   </match>
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**

   ```bash
   # Check database connectivity
   docker-compose exec backend ping mysql

   # Check database logs
   docker-compose logs mysql

   # Reset database
   docker-compose down -v
   docker-compose up -d
   ```

2. **Port Conflicts**

   ```bash
   # Check port usage
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :8080
   netstat -tulpn | grep :5000

   # Change ports in .env file
   FRONTEND_PORT=3001
   BACKEND_PORT=8081
   AI_SERVICE_PORT=5001
   ```

3. **Memory Issues**

   ```bash
   # Check memory usage
   docker stats

   # Increase memory limits in docker-compose.yml
   deploy:
     resources:
       limits:
         memory: 1G
   ```

4. **SSL Certificate Issues**

   ```bash
   # Check certificate validity
   openssl x509 -in certificate.crt -text -noout

   # Renew certificates
   certbot renew
   ```

### Performance Optimization

1. **Database Optimization**

   ```sql
   -- Add indexes for frequently queried columns
   CREATE INDEX idx_product_category ON products(category_id);
   CREATE INDEX idx_order_user ON orders(user_id);
   CREATE INDEX idx_order_date ON orders(created_at);
   ```

2. **Application Optimization**

   - Enable caching for frequently accessed data
   - Implement database connection pooling
   - Use CDN for static assets
   - Enable gzip compression

3. **Container Optimization**

   ```dockerfile
   # Multi-stage builds
   FROM node:16-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production

   FROM node:16-alpine
   WORKDIR /app
   COPY --from=builder /app/node_modules ./node_modules
   COPY . .
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

### Backup and Recovery

1. **Database Backup**

   ```bash
   # Create backup
   docker-compose exec mysql mysqldump -u root -p grocerystore > backup.sql

   # Restore backup
   docker-compose exec -T mysql mysql -u root -p grocerystore < backup.sql
   ```

2. **Application Backup**

   ```bash
   # Backup configuration
   tar -czf config-backup.tar.gz .env* docker-compose*.yml

   # Backup data volumes
   docker run --rm -v ai-grocery-store_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql-data-backup.tar.gz -C /data .
   ```

## Security Considerations

1. **Network Security**

   - Use firewalls to restrict access
   - Implement VPN for remote access
   - Use private subnets for databases

2. **Application Security**

   - Regularly update dependencies
   - Use HTTPS in production
   - Implement rate limiting
   - Monitor for security vulnerabilities

3. **Data Security**
   - Encrypt sensitive data at rest
   - Use secure communication protocols
   - Implement proper access controls
   - Regular security audits

## Support

For deployment issues:

1. Check the troubleshooting section
2. Review application logs
3. Check system resources
4. Verify configuration
5. Create an issue in the repository

---

**Note**: Always test deployments in a staging environment before deploying to production.
