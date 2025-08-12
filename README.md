# The Dot - Modern IT Service Management & Project Management

> *"One Dot. Every Project. Every Problem. Solved."*

A comprehensive microservices-based web application for IT service management (ITSM) and project management, built with modern technologies and designed for Kubernetes deployment.

## 🏗️ Architecture Overview

The Dot is built as a microservices architecture with the following components:

### Core Services
- **Auth Service** - JWT-based authentication and authorization
- **User & Team Management Service** - User, team, and role management
- **Application Service** - Application registry and team mapping
- **Ticketing Service (ITSM)** - Incident, service request, problem, and change management
- **Project Management Service** - Agile project management with sprints and issues
- **Comment & Notification Service** - Real-time communication and notifications
- **Reporting Service** - Comprehensive reporting and analytics
- **Audit Trail Service** - Immutable audit logging

### Frontend
- **React SPA** - Modern, responsive web interface with role-based access

### Infrastructure
- **API Gateway** - NGINX-based routing and load balancing
- **Message Queue** - RabbitMQ for asynchronous communication
- **Cache** - Redis for session management and SLA timers
- **Database** - PostgreSQL with service-specific schemas
- **Storage** - MinIO for file attachments

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Kubernetes cluster (local or cloud)
- Helm 3.x
- Node.js 18+
- PostgreSQL 14+

### Local Development
```bash
# Clone the repository
git clone <repository-url>
cd the-dot

# Start infrastructure services
docker-compose -f docker-compose.dev.yml up -d

# Install dependencies for all services
npm run install:all

# Start all services in development mode
npm run dev

# Start frontend
cd frontend
npm start
```

### Kubernetes Deployment
```bash
# Deploy using Helm
helm install the-dot ./helm/the-dot

# Or deploy individual services
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmaps/
kubectl apply -f k8s/secrets/
kubectl apply -f k8s/services/
```

## 📁 Project Structure

```
the-dot/
├── services/                    # Microservices
│   ├── auth-service/           # Authentication & Authorization
│   ├── user-service/           # User & Team Management
│   ├── application-service/    # Application Registry
│   ├── ticket-service/         # ITSM Ticketing
│   ├── project-service/        # Project Management
│   ├── comment-service/        # Comments & Notifications
│   ├── reporting-service/      # Reports & Analytics
│   └── audit-service/          # Audit Trail
├── frontend/                   # React SPA
├── gateway/                    # API Gateway (NGINX)
├── k8s/                       # Kubernetes manifests
├── helm/                      # Helm charts
├── docker-compose.dev.yml     # Development environment
├── docker-compose.prod.yml    # Production environment
└── scripts/                   # Deployment & utility scripts
```

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: NestJS (for structured microservices)
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18
- **Routing**: React Router
- **State Management**: Zustand
- **UI Framework**: TailwindCSS
- **HTTP Client**: Axios
- **Real-time**: Socket.io client

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **API Gateway**: NGINX
- **Message Broker**: RabbitMQ
- **Cache**: Redis
- **Storage**: MinIO
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack

## 🎯 Key Features

### ITSM Module
- **Ticket Types**: Incident, Service Request, Problem, Change
- **SLA Management**: Automated escalation and tracking
- **Time Tracking**: Custom time logging per user
- **Audit Trail**: Complete action history
- **Delegation**: Flexible assignment and escalation
- **RCA**: Root cause analysis for incidents

### Project Management Module
- **Agile Methodology**: Sprints, backlogs, releases
- **Issue Types**: Epic, Story, Task, Bug
- **Planning**: Sprint planning and backlog grooming
- **Dependencies**: Issue linking and tracking
- **Metrics**: Story points, velocity, burndown

### Shared Features
- **Role-Based Access**: Admin, Support (L1-L3), Developer, Client, PM
- **Real-time Updates**: WebSocket-based notifications
- **Comprehensive Reporting**: CSV exports with custom filters
- **File Attachments**: Secure file handling
- **Responsive Design**: Mobile-first approach

## 🔐 Security

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Secure inter-service communication
- Rate limiting and CORS protection
- Audit logging for compliance
- Secrets management via Kubernetes secrets

## 📊 Monitoring & Observability

- **Metrics**: Prometheus for application metrics
- **Visualization**: Grafana dashboards
- **Logging**: Centralized logging with ELK
- **Tracing**: Distributed tracing support
- **Health Checks**: Kubernetes-ready health endpoints

## 🧪 Testing

- **Unit Tests**: Jest for all services
- **Integration Tests**: Supertest with test containers
- **E2E Tests**: Cypress for frontend
- **API Documentation**: OpenAPI/Swagger specs
- **Load Testing**: K6 for performance testing

## 🚀 CI/CD Pipeline

GitHub Actions workflow includes:
- Code quality checks (ESLint, Prettier)
- Security scanning
- Unit and integration tests
- Docker image builds
- Kubernetes deployment
- Automated rollback on failure

## 📈 Scalability

- Horizontal pod autoscaling
- Database connection pooling
- Redis clustering support
- Load balancing with NGINX
- Microservices architecture for independent scaling

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation in `/docs`
