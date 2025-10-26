# Step-by-Step Alternative Free Deployment Guide

## Step 1: Create All Required Accounts

### 1.1 Vercel (Frontend)
1. Go to https://vercel.com
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Vercel to access your GitHub account
4. Verify your email

### 1.2 Railway (Backend)
1. Go to https://railway.app
2. Click "Login" → "Continue with GitHub"
3. Authorize Railway to access your GitHub account

### 1.3 PlanetScale (MySQL Database)
1. Go to https://planetscale.com
2. Click "Sign Up" → "Continue with GitHub"
3. Complete onboarding

### 1.4 MongoDB Atlas (MongoDB Database)
1. Go to https://mongodb.com/atlas
2. Click "Try Free" → "Continue with Google" or GitHub
3. Select "M0" cluster (free tier)
4. Choose your cloud provider and region

### 1.5 CloudAMQP (Message Broker)
1. Go to https://cloudamqp.com
2. Click "Sign Up"
3. Enter email and password
4. Select "Little Lemur" plan (free)

## Step 2: Set Up Databases

### 2.1 PlanetScale Setup
1. In PlanetScale dashboard, click "Create Database"
2. Name: `carwash-db`
3. Region: Choose nearest to you
4. Click "Create Database"
5. Go to "Connect" tab
6. Copy the connection string (it will look like):
   ```
   mysql://username:password@host/database?sslaccept=strict
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
   mongodb+srv://username:password@cluster.mongodb.net/database
   ```

### 2.3 CloudAMQP Setup
1. In CloudAMQP dashboard, your instance should be created
2. Click on your instance name
3. Copy the connection details:
   - AMQP URL
   - Username
   - Password
   - Virtual Host

## Step 3: Prepare Your Code for Deployment

### 3.1 Update Application Properties
Create `application-prod.properties` in each service's `src/main/resources/`:

**For user-service:**
```properties
spring.profiles.active=prod

# Database
spring.datasource.url=jdbc:mysql://your-planetscale-host:3306/carwash-db
spring.datasource.username=your-planetscale-username
spring.datasource.password=your-planetscale-password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# Eureka
eureka.client.service-url.defaultZone=http://eureka-server.railway.internal:8761/eureka/

# JWT
jwt.secret=your-jwt-secret-here

# Server
server.port=8081
```

**For booking-service:**
```properties
spring.profiles.active=prod

# MySQL Database
spring.datasource.url=jdbc:mysql://your-planetscale-host:3306/carwash-db
spring.datasource.username=your-planetscale-username
spring.datasource.password=your-planetscale-password

# MongoDB
spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/carwash

# RabbitMQ
spring.rabbitmq.host=your-cloudamqp-host
spring.rabbitmq.port=5672
spring.rabbitmq.username=your-cloudamqp-username
spring.rabbitmq.password=your-cloudamqp-password
spring.rabbitmq.virtual-host=your-vhost

# Eureka
eureka.client.service-url.defaultZone=http://eureka-server.railway.internal:8761/eureka/

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
    hostname: eureka-server.railway.internal
  client:
    register-with-eureka: false
    fetch-registry: false
    service-url:
      defaultZone: http://eureka-server.railway.internal:8761/eureka/
```

## Step 4: Deploy Backend to Railway

### 4.1 Connect GitHub to Railway
1. In Railway dashboard, click "New Project"
2. Choose "Deploy from GitHub repo"
3. Authorize Railway to access your repositories
4. Select your `carWash-Project` repository

### 4.2 Deploy Eureka Server
1. In Railway project, click "Add Service" → "Add from GitHub"
2. Select your repo
3. Set root directory: `carwashBackend/CArWash  BAcked/eureka-server`
4. Environment variables:
   - `SPRING_PROFILES_ACTIVE`: `prod`
5. Click "Deploy"

### 4.3 Deploy API Gateway
1. Add another service
2. Root directory: `carwashBackend/CArWash  BAcked/api-gateway`
3. Environment variables:
   - `SPRING_PROFILES_ACTIVE`: `prod`
   - `EUREKA_URI`: `http://eureka-server.railway.internal:8761/eureka/`

### 4.4 Deploy Other Services
Repeat for each service, setting appropriate environment variables:

**User Service:**
- Root directory: `carwashBackend/CArWash  BAcked/user-service`
- Environment variables:
  - `SPRING_PROFILES_ACTIVE`: `prod`
  - `MYSQL_URL`: `your-planetscale-connection-string`
  - `JWT_SECRET`: `your-jwt-secret`

**Booking Service:**
- Root directory: `carwashBackend/CArWash  BAcked/booking-service`
- Environment variables:
  - `SPRING_PROFILES_ACTIVE`: `prod`
  - `MYSQL_URL`: `your-planetscale-connection-string`
  - `MONGODB_URI`: `your-mongodb-connection-string`
  - `RABBITMQ_URL`: `your-cloudamqp-connection-string`

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
- `API_BASE_URL`: `https://your-api-gateway-url.railway.app`

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

### 7.1 Railway Monitoring
- Check service logs in Railway dashboard
- Monitor resource usage

### 7.2 Vercel Analytics
- View deployment history
- Monitor performance

## Troubleshooting

- **Service Connection Issues**: Check Railway internal URLs
- **Database Connection**: Verify connection strings
- **CORS Errors**: Update allowed origins in API gateway
- **Build Failures**: Check logs in Railway/Vercel dashboards

## Cost Optimization

- Railway: Stay within 100 hours/month free quota
- PlanetScale: Monitor row reads (100M free/month)
- MongoDB Atlas: Stay within 512MB storage
- CloudAMQP: Monitor message count (1M free/month)

This setup provides a completely free, production-ready deployment for your microservices application!
