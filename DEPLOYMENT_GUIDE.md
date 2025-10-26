# Step-by-Step Deployment Guide for Car Wash Microservices App

## Prerequisites
- GitHub account
- Azure account (sign up at https://azure.microsoft.com/free/)
- Docker Hub account
- Git installed locally
- Azure CLI installed (optional, but recommended)

## Step 1: Prepare Your Repository
1. Create a new public repository on GitHub
2. Push your current code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/car-wash-app.git
   git push -u origin main
   ```

## Step 2: Containerize Your Applications

### Frontend Dockerfile
Create `Dockerfile` in `car-wash-app-fronted/car-wash-app/`:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

FROM nginx:alpine
COPY --from=build /app/dist/aquashine-app /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

Create `nginx.conf` in the same directory:
```nginx
events {}
http {
    server {
        listen 80;
        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
        }
    }
}
```

### Backend Dockerfiles
For each microservice (e.g., user-service), create a `Dockerfile` in the service root:
```dockerfile
FROM openjdk:21-jdk-slim
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Docker Compose for Local Development
Create `docker-compose.yml` in the root:
```yaml
version: '3.8'
services:
  eureka-server:
    build: ./carwashBackend/CArWash  BAcked/eureka-server
    ports:
      - "8761:8761"

  api-gateway:
    build: ./carwashBackend/CArWash  BAcked/api-gateway
    ports:
      - "8080:8080"
    depends_on:
      - eureka-server

  user-service:
    build: ./carwashBackend/CArWash  BAcked/user-service
    ports:
      - "8081:8081"
    depends_on:
      - eureka-server
      - mysql

  # Add other services similarly...

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: carwash
    ports:
      - "3306:3306"

  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
```

## Step 3: Set Up Azure Resources

### 3.1 Create Azure Resource Group
```bash
az group create --name carwash-rg --location eastus
```

### 3.2 Create Azure Database for MySQL
```bash
az mysql flexible-server create \
  --resource-group carwash-rg \
  --name carwash-mysql \
  --location eastus \
  --admin-user adminuser \
  --admin-password YourSecurePassword123! \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage 32 \
  --version 8.0 \
  --public-access Enabled
```

### 3.3 Create Azure Cosmos DB (MongoDB API)
```bash
az cosmosdb create \
  --name carwash-cosmos \
  --resource-group carwash-rg \
  --kind MongoDB \
  --locations regionName=eastus failoverPriority=0 \
  --default-consistency-level Session
```

### 3.4 Create Azure Service Bus
```bash
az servicebus namespace create \
  --resource-group carwash-rg \
  --name carwash-servicebus \
  --location eastus \
  --sku Basic
```

## Step 4: Set Up CI/CD with GitHub Actions

### 4.1 Create GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:
```yaml
name: Build and Deploy
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    - name: Build and push frontend
      run: |
        cd car-wash-app-fronted/car-wash-app
        docker build -t yourdockerhub/carwash-frontend:latest .
        docker push yourdockerhub/carwash-frontend:latest

    - name: Build and push user-service
      run: |
        cd carwashBackend/CArWash\ BAcked/user-service
        mvn clean package -DskipTests
        docker build -t yourdockerhub/user-service:latest .
        docker push yourdockerhub/user-service:latest

    # Repeat for other services...

    - name: Deploy to Azure
      uses: azure/webapps-deploy@v2
      with:
        app-name: carwash-frontend
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        images: 'yourdockerhub/carwash-frontend:latest'
```

### 4.2 Set Up Secrets in GitHub
Go to your GitHub repo > Settings > Secrets and variables > Actions
Add:
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `AZURE_WEBAPP_PUBLISH_PROFILE` (get from Azure portal)

## Step 5: Deploy Frontend to Azure Static Web Apps

1. Go to Azure portal > Create resource > Static Web App
2. Select your resource group
3. Name: carwash-frontend
4. Plan: Free
5. Source: GitHub
6. Select your repo and branch
7. Build details:
   - Build preset: Angular
   - App location: car-wash-app-fronted/car-wash-app
   - API location: (leave blank)
   - Output location: dist/aquashine-app

## Step 6: Deploy Backend to Azure Container Apps

### 6.1 Create Container Apps Environment
```bash
az containerapp env create \
  --name carwash-env \
  --resource-group carwash-rg \
  --location eastus
```

### 6.2 Deploy Eureka Server
```bash
az containerapp create \
  --name eureka-server \
  --resource-group carwash-rg \
  --environment carwash-env \
  --image yourdockerhub/eureka-server:latest \
  --target-port 8761 \
  --ingress external \
  --cpu 0.5 \
  --memory 1Gi \
  --min-replicas 1 \
  --max-replicas 1
```

### 6.3 Deploy Other Services
Repeat for each service, making sure to set dependencies and environment variables.

Example for user-service:
```bash
az containerapp create \
  --name user-service \
  --resource-group carwash-rg \
  --environment carwash-env \
  --image yourdockerhub/user-service:latest \
  --target-port 8080 \
  --ingress internal \
  --cpu 0.5 \
  --memory 1Gi \
  --min-replicas 1 \
  --max-replicas 3 \
  --env-vars \
    SPRING_PROFILES_ACTIVE=prod \
    EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server.internal.azurecontainerapps.io:8761/eureka/ \
    SPRING_DATASOURCE_URL=jdbc:mysql://carwash-mysql.mysql.database.azure.com:3306/carwash \
    SPRING_DATASOURCE_USERNAME=adminuser@carwash-mysql \
    SPRING_DATASOURCE_PASSWORD=YourSecurePassword123!
```

## Step 7: Configure Environment Variables

For each service, set appropriate environment variables in Azure Container Apps:
- Database connections
- Eureka server URL
- JWT secrets
- RabbitMQ/Service Bus connection strings
- CORS origins (set to your frontend URL)

## Step 8: Update Application Configurations

### 8.1 Update application.properties for production
In each service, create `application-prod.properties`:
```properties
spring.profiles.active=prod

# Database
spring.datasource.url=jdbc:mysql://${MYSQL_HOST}:3306/${MYSQL_DATABASE}
spring.datasource.username=${MYSQL_USER}
spring.datasource.password=${MYSQL_PASSWORD}

# MongoDB
spring.data.mongodb.uri=mongodb://${COSMOS_CONNECTION_STRING}

# Eureka
eureka.client.service-url.defaultZone=${EUREKA_URL}

# RabbitMQ (replace with Service Bus)
spring.rabbitmq.host=${RABBITMQ_HOST}
spring.rabbitmq.port=5672
spring.rabbitmq.username=${RABBITMQ_USER}
spring.rabbitmq.password=${RABBITMQ_PASSWORD}

# JWT
jwt.secret=${JWT_SECRET}

# CORS
app.cors.allowed-origins=${FRONTEND_URL}
```

### 8.2 Update Angular environment
Create `environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api-gateway.internal.azurecontainerapps.io'
};
```

## Step 9: Replace RabbitMQ with Azure Service Bus

1. Update your services to use Azure Service Bus instead of RabbitMQ
2. Add Azure Service Bus SDK to your pom.xml:
```xml
<dependency>
    <groupId>com.azure</groupId>
    <artifactId>azure-messaging-servicebus</artifactId>
    <version>7.15.2</version>
</dependency>
```

## Step 10: Testing and Monitoring

1. Test your deployed application
2. Set up Azure Application Insights for monitoring
3. Configure alerts for performance issues

## Step 11: Go Live

1. Update your DNS to point to the Azure Static Web App URL (if using custom domain)
2. Enable custom domain in Azure Static Web Apps (free SSL included)
3. Monitor your application and scale as needed

## Troubleshooting

- Check Azure Container Apps logs: `az containerapp logs show --name <app-name> --resource-group carwash-rg`
- Verify environment variables are set correctly
- Ensure services can communicate via internal DNS
- Check firewall settings for databases

## Cost Optimization

- Use Azure free tiers where possible
- Scale down when not in use
- Monitor usage to avoid unexpected charges
- Consider Azure credits if available

## Security Best Practices

- Never commit secrets to code
- Use Azure Key Vault for sensitive data
- Enable Azure Defender
- Regularly update dependencies
- Implement proper authentication and authorization

This guide provides a comprehensive, cost-free deployment strategy. Adjust as needed based on your specific requirements and Azure's evolving free tier offerings.
