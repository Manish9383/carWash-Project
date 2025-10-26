# Deployment TODO List

## Phase 1: Preparation and Containerization
- [ ] Create public GitHub repository
- [ ] Push all code to GitHub
- [ ] Create Dockerfile for Angular frontend
- [ ] Create Dockerfile for each microservice (7 services)
- [ ] Create docker-compose.yml for local development
- [ ] Test docker-compose locally

## Phase 2: CI/CD Pipeline
- [ ] Set up GitHub Actions workflow (.github/workflows/deploy.yml)
- [ ] Configure Docker Hub secrets in GitHub
- [ ] Test CI/CD pipeline

## Phase 3: Azure Setup
- [ ] Create Azure resource group
- [ ] Provision Azure Database for MySQL (free tier)
- [ ] Provision Azure Cosmos DB (MongoDB API, free tier)
- [ ] Provision Azure Service Bus (free tier)
- [ ] Create Azure Container Apps environment

## Phase 4: Deployment
- [ ] Deploy frontend to Azure Static Web Apps
- [ ] Deploy eureka-server to Azure Container Apps
- [ ] Deploy api-gateway to Azure Container Apps
- [ ] Deploy user-service to Azure Container Apps
- [ ] Deploy booking-service to Azure Container Apps
- [ ] Deploy payment-service to Azure Container Apps
- [ ] Deploy review-service to Azure Container Apps
- [ ] Deploy notification-service to Azure Container Apps
- [ ] Deploy car-service to Azure Container Apps

## Phase 5: Configuration
- [ ] Set environment variables for all services
- [ ] Update application-prod.properties for each service
- [ ] Configure service discovery (Eureka)
- [ ] Update Angular environment.prod.ts
- [ ] Replace RabbitMQ with Azure Service Bus
- [ ] Configure CORS settings

## Phase 6: Security and Monitoring
- [ ] Enable HTTPS (Azure provides free SSL)
- [ ] Set up Azure Application Insights
- [ ] Configure Azure Defender
- [ ] Implement proper authentication checks
- [ ] Set up monitoring alerts

## Phase 7: Testing and Go-Live
- [ ] Perform end-to-end testing
- [ ] Test all microservice communications
- [ ] Verify database connections
- [ ] Check message broker functionality
- [ ] Update DNS/custom domain (if needed)
- [ ] Go live and monitor

## Additional Tasks
- [ ] Document all environment variables
- [ ] Create rollback procedures
- [ ] Set up automated backups (if needed)
- [ ] Optimize for cost (scale down when not in use)
