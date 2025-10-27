# Render Deployment Guide for Car Wash Microservices App

## Overview
This guide provides a deployment strategy using Render and other free platforms, focusing on simplicity and cost-free options.

**Free Platforms Used:**
- Render (backend microservices - 750 hours/month free)
- Vercel (frontend)
- Aiven (MySQL database)
- MongoDB Atlas (MongoDB database)
- CloudAMQP (RabbitMQ)

## Step 1: Create All Required Accounts

### 1.1 Vercel (Frontend)
1. Go to https://vercel.com
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Vercel to access your GitHub account
4. Verify your email

### 1.2 Render (Backend)
1. Go to https://render.com
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Render to access your GitHub account

### 1.3 Aiven (MySQL Database)
1. Go to https://aiven.io
2. Click "Sign Up" → "Continue with GitHub"
3. Complete onboarding
4. Create a MySQL service (free tier: 1GB storage, 1 CPU, 512MB RAM)

### 1.4 MongoDB Atlas (MongoDB Database)
1. Go to https://mongodb.com/atlas
2. Click "Try Free" → "Continue with GitHub"
3. Select "M0" cluster (free tier)
4. Choose your cloud provider and region

### 1.5 CloudAMQP (Message Broker)
1. Go to https://cloudamqp.com
2. Click "Sign Up"
3. Enter email and password
4. Select "Little Lemur" plan (free)

## Step 2: Set Up Databases

### 2.1 Aiven Setup
1. In Aiven dashboard, click "Create service"
2. Select "MySQL" from the service list
3. Choose "Hobbyist" plan (free tier)
4. Name: `carwash-db`
5. Region: Choose nearest to you
6. Click "Create service"
7. Wait for service to be ready (5-10 minutes)
8. Go to "Overview" tab
9. Copy the connection details:
   - Host: `carwash-db-manu975269-7220.h.aivencloud.com`
   - Port: `18002`
   - Username: `avnadmin`
   - Password: (click to reveal in Aiven dashboard)
   - Database name: `carwash-db`
10. The connection string will look like:
    ```
    mysql://avnadmin:<your-password>@carwash-db-manu975269-7220.h.aivencloud.com:18002/carwash-db
    ```

### 2.2 MongoDB Atlas Setup
1. In Atlas dashboard, click "Create" → "M0 Cluster"
2. Choose provider and region
3. Click "Create Cluster"
4. Wait for cluster to be ready (5-10 minutes)
5. Go to "Database" → "Connect"
6. Choose "Connect your application"
7. Copy the connection string:
   ```
   mongodb+srv://<db_username>:<db_password>@cluster0.gbzqn.mongodb.net/?appName=Cluster0
   ```

### 2.3 CloudAMQP Setup
1. In CloudAMQP dashboard, your instance should be created
2. Click on your instance name
3. Copy the connection details:
   - AMQP URL: `amqps://yXLgxxxxx:***@gull.rmq.cloudamqp.com/yXLgxxxxx`
   - Username: `yXLgxxxxx`
   - Password: `yXLgxxxxx`
   - Virtual Host: `yXLgxxxxx`
   - Host: `gull.rmq.cloudamqp.com`
   - Ports: `5672 (5671 for TLS)`

## Step 3: Prepare Your Code for Deployment

### 3.1 Update Application Properties
Create `application-prod.properties` in each service's `src/main/resources/` (already done):

**For user-service:**
```properties
spring.profiles.active=prod

# Database
spring.datasource.url=jdbc:mysql://carwash-db-manu975269-7220.h.aivencloud.com:18002/carwash-db
spring.datasource.username=avnadmin
spring.datasource.password=<your-aiven-password>
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# Eureka
eureka.client.service-url.defaultZone=http://eureka-server:8761/eureka/

# JWT
jwt.secret=your-jwt-secret-here

# Server
server.port=8081
```

**For booking-service:**
```properties
spring.profiles.active=prod

# MySQL Database
spring.datasource.url=jdbc:mysql://carwash-db-manu975269-7220.h.aivencloud.com:18002/carwash-db
spring.datasource.username=avnadmin
spring.datasource.password=<your-aiven-password>

# MongoDB
spring.data.mongodb.uri=mongodb+srv://<db_username>:<db_password>@cluster0.gbzqn.mongodb.net/carwash

# RabbitMQ
spring.rabbitmq.host=gull.rmq.cloudamqp.com
spring.rabbitmq.port=5672
spring.rabbitmq.username=yXLgxxxxx
spring.rabbitmq.password=yXLgxxxxx
spring.rabbitmq.virtual-host=yXLgxxxxx

# Eureka
eureka.client.service-url.defaultZone=http://eureka-server:8761/eureka/

server.port=8082
```

**Repeat for other services with appropriate configurations.**

### 3.2 Update Eureka Configuration
In `eureka-server/src/main/resources/application.yml`:
```yaml
server:
  port: 8761

eureka:
  instance:
    hostname: eureka-server
  client:
    register-with-eureka: false
    fetch-registry: false
    service-url:
      defaultZone: http://eureka-server:8761/eureka/
```

## Step 4: Deploy Backend to Render

### 4.1 Connect GitHub to Render
1. In Render dashboard, click "New" → "Web Service"
2. Choose "Connect GitHub"
3. Authorize Render to access your repositories
4. Select your `carWash-Project` repository

### 4.2 Deploy Eureka Server
1. Click "Connect" on your repo
2. Configure service:
   - Name: `eureka-server`
   - Environment: `Docker`
   - Root Directory: `carwashBackend/CArWash_Backend/eureka-server`
   - Docker Command: (leave default)
3. Environment variables:
   - `SPRING_PROFILES_ACTIVE`: `prod`
4. Click "Create Web Service"

### 4.3 Deploy API Gateway
1. Create another web service
2. Name: `api-gateway`
3. Environment: `Docker`
4. Root Directory: `carwashBackend/CArWash_Backend/api-gateway`
5. Environment variables:
   - `SPRING_PROFILES_ACTIVE`: `prod`
   - `EUREKA_URI`: `http://eureka-server:8761/eureka/`

### 4.4 Deploy Other Services
Repeat for each service, setting appropriate environment variables:

**User Service:**
- Name: `user-service`
- Root Directory: `carwashBackend/CArWash_Backend/user-service`
- Environment variables:
  - `SPRING_PROFILES_ACTIVE`: `prod`
  - `MYSQL_URL`: `mysql://avnadmin:<your-aiven-password>@carwash-db-manu975269-7220.h.aivencloud.com:18002/carwash-db?sslaccept=strict`
  - `JWT_SECRET`: `your-jwt-secret`

**Booking Service:**
- Name: `booking-service`
- Root Directory: `carwashBackend/CArWash_Backend/booking-service`
- Environment variables:
  - `SPRING_PROFILES_ACTIVE`: `prod`
  - `MYSQL_URL`: `mysql://avnadmin:<your-aiven-password>@carwash-db-manu975269-7220.h.aivencloud.com:18002/carwash-db?sslaccept=strict`
  - `MONGODB_URI`: `mongodb+srv://<db_username>:<db_password>@cluster0.gbzqn.mongodb.net/carwash`
  - `CLOUDAMQP_URL`: `amqps://yXLgxxxxx:yXLgxxxxx@gull.rmq.cloudamqp.com/yXLgxxxxx`

**Repeat for notification-service, review-service, payment-service, car-service**

## Step 5: Deploy Frontend to Vercel

### 5.1 Connect Repository
1. In Vercel dashboard, click "New Project"
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: Angular
   - Root Directory: `car-wash-app-fronted/car-wash-app`
   - Build Command: `npm run build`
   - Output Directory: `dist/aquashine-app`

### 5.2 Set Environment Variables
In Vercel project settings → Environment Variables:
- `API_BASE_URL`: `https://api-gateway.onrender.com`

### 5.3 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your frontend will be available at `your-project.vercel.app`

## Step 6: Configure CORS and Final Setup

### 6.1 Update API Gateway CORS
In `api-gateway/src/main/resources/application.yml`:
```yaml
spring:
  cloud:
    gateway:
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOrigins: "https://your-project.vercel.app"
            allowedMethods: "*"
            allowedHeaders: "*"
```

### 6.2 Test Your Application
1. Visit your Vercel URL
2. Check if services are communicating
3. Test user registration, booking, etc.

## Step 7: Monitoring and Maintenance

### 7.1 Render Monitoring
- Check service logs in Render dashboard
- Monitor resource usage (750 hours free/month)

### 7.2 Vercel Analytics
- View deployment history
- Monitor performance

## Troubleshooting

- **Service Connection Issues**: Check Render internal URLs
- **Database Connection**: Verify connection strings
- **CORS Errors**: Update allowed origins in API gateway
- **Build Failures**: Check logs in Render/Vercel dashboards

## Cost Optimization

- Render: Stay within 750 hours/month free quota
- Aiven: Monitor usage (1GB storage, 1 CPU, 512MB RAM free)
- MongoDB Atlas: Stay within 512MB storage
- CloudAMQP: Monitor message count (1M free/month)

This setup provides a completely free, production-ready deployment for your microservices application!
