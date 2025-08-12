# The Dot - Development Guide

## 🚀 Quick Start

### Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Docker & Docker Compose** - [Download](https://docs.docker.com/get-docker/)
- **Kubernetes (kubectl)** - [Install Guide](https://kubernetes.io/docs/tasks/tools/)
- **Helm 3+** - [Install Guide](https://helm.sh/docs/intro/install/)
- **Git** - [Download](https://git-scm.com/downloads)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd the-dot
   ```

2. **Make install script executable:**
   ```bash
   chmod +x install.sh
   ```

3. **Install and setup development environment:**
   ```bash
   ./install.sh install
   ```

4. **Start development environment:**
   ```bash
   ./install.sh dev
   ```

The application will be available at:
- **Frontend:** http://localhost:3000
- **API Gateway:** http://localhost
- **RabbitMQ Management:** http://localhost:15672 (admin/admin123)
- **MinIO Console:** http://localhost:9001 (minioadmin/minioadmin)

## 🏗️ Architecture Overview

### Microservices

| Service | Port | Description |
|---------|------|-------------|
| **Auth Service** | 3001 | Authentication & Authorization |
| **User Service** | 3002 | User & Team Management |
| **Application Service** | 3003 | Application Registry |
| **Ticket Service** | 3004 | ITSM Ticketing System |
| **Project Service** | 3005 | Agile Project Management |
| **Comment Service** | 3006 | Comments & Notifications |
| **Reporting Service** | 3007 | Reports & Analytics |
| **Audit Service** | 3008 | Audit Trail & Logging |

### Infrastructure Components

- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **RabbitMQ** - Message broker for async communication
- **MinIO** - S3-compatible object storage
- **NGINX** - API Gateway and load balancer

### Frontend

- **React 18** with TypeScript
- **TailwindCSS** for styling
- **Zustand** for state management
- **React Query** for API state management
- **Socket.io** for real-time updates

## 🛠️ Development Workflow

### Running Individual Services

Each service can be run independently for development:

```bash
# Auth Service
cd services/auth-service
npm run start:dev

# Frontend
cd frontend
npm start
```

### Database Operations

#### Prisma Commands (per service)

```bash
cd services/auth-service  # or any other service

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# View database
npx prisma studio

# Seed database
npx prisma db seed
```

### API Documentation

Each service exposes Swagger documentation at:
- Auth Service: http://localhost:3001/api/docs
- User Service: http://localhost:3002/api/docs
- etc.

## 🧪 Testing

### Running Tests

```bash
# Run all tests
./install.sh test

# Run tests for specific service
cd services/auth-service
npm test

# Run tests with coverage
npm run test:cov

# Run frontend tests
cd frontend
npm test
```

### Test Structure

```
services/auth-service/
├── src/
│   ├── auth/
│   │   ├── auth.service.spec.ts
│   │   └── auth.controller.spec.ts
│   └── users/
└── test/
    └── auth.e2e-spec.ts  # End-to-end tests
```

## 📦 Docker & Containerization

### Development Containers

```bash
# Build all images
docker-compose -f docker-compose.dev.yml build

# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop all services
docker-compose -f docker-compose.dev.yml down
```

### Production Images

Each service has optimized production Dockerfiles:

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
# ... build stage

FROM node:18-alpine AS production
# ... production stage with minimal footprint
```

## ☸️ Kubernetes Deployment

### Local Development (minikube/kind)

```bash
# Start local cluster
minikube start

# Deploy application
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n the-dot

# Port forward for testing
kubectl port-forward service/nginx 8080:80 -n the-dot
```

### Production Deployment

```bash
# Using Helm (recommended)
helm install the-dot ./helm/the-dot

# Or using kubectl
kubectl apply -f k8s/
```

### Monitoring Deployments

```bash
# Check pod status
kubectl get pods -n the-dot

# View logs
kubectl logs -f deployment/auth-service -n the-dot

# Describe deployment
kubectl describe deployment auth-service -n the-dot

# Check horizontal pod autoscaler
kubectl get hpa -n the-dot
```

## 🔐 Security & Configuration

### Environment Variables

Each service requires specific environment variables. Copy `.env.example` to `.env` and update values:

#### Auth Service
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/auth_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
```

### Secrets Management

In production, use Kubernetes secrets:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: the-dot-secrets
  namespace: the-dot
type: Opaque
stringData:
  JWT_SECRET: "your-production-jwt-secret"
  JWT_REFRESH_SECRET: "your-production-refresh-secret"
```

## 🔍 Monitoring & Observability

### Health Checks

Each service exposes health check endpoints:
- `/health` - Basic health check
- `/health/ready` - Readiness check
- `/health/live` - Liveness check

### Logging

Structured logging with different levels:
- **Error** - System errors
- **Warn** - Warnings
- **Info** - General information
- **Debug** - Debug information

### Metrics

Services expose Prometheus metrics at `/metrics` endpoint.

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline includes:

1. **Code Quality Checks**
   - ESLint
   - Prettier
   - Type checking

2. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

3. **Security Scanning**
   - Dependency scanning
   - Container image scanning
   - SAST analysis

4. **Build & Deploy**
   - Docker image builds
   - Kubernetes deployment
   - Environment promotion

### Manual Deployment

```bash
# Build and tag images
docker build -t the-dot/auth-service:v1.0.0 services/auth-service/

# Push to registry
docker push the-dot/auth-service:v1.0.0

# Update Kubernetes deployment
kubectl set image deployment/auth-service auth-service=the-dot/auth-service:v1.0.0 -n the-dot
```

## 🎯 User Roles & Permissions

### Role Hierarchy

| Role | Description | Permissions |
|------|-------------|-------------|
| **ADMIN** | System Administrator | Full access to all features |
| **SUPPORT_L3** | Senior Support | Advanced ticket management, user management |
| **SUPPORT_L2** | Mid-level Support | Ticket management, basic reporting |
| **SUPPORT_L1** | Basic Support | Create and update tickets |
| **DEVELOPER** | Development Team | Project management, code-related tickets |
| **PROJECT_MANAGER** | Project Manager | Project oversight, team management |
| **CLIENT** | External Client | Submit tickets, view own issues |

### Default Credentials

For development and testing:

```
Admin: admin@thedot.local / admin123
Support L1: support.l1@thedot.local / password123
Support L2: support.l2@thedot.local / password123
Support L3: support.l3@thedot.local / password123
Developer: developer@thedot.local / password123
PM: pm@thedot.local / password123
Client: client@thedot.local / password123
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose -f docker-compose.dev.yml ps postgres

# Check database logs
docker-compose -f docker-compose.dev.yml logs postgres

# Reset database
cd services/auth-service
npx prisma migrate reset
```

#### Service Not Starting
```bash
# Check service logs
docker-compose -f docker-compose.dev.yml logs auth-service

# Restart specific service
docker-compose -f docker-compose.dev.yml restart auth-service

# Rebuild service
docker-compose -f docker-compose.dev.yml build auth-service
```

#### Port Conflicts
```bash
# Check what's using the port
lsof -i :3001

# Kill process using port
kill -9 $(lsof -t -i:3001)
```

### Debug Mode

Enable debug logging:

```bash
# For Node.js services
DEBUG=* npm run start:dev

# For specific modules
DEBUG=prisma:* npm run start:dev
```

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint rules
- Write tests for new features
- Update documentation

### Commit Messages

Follow conventional commits:
```
feat: add user management API
fix: resolve database connection issue
docs: update installation guide
test: add unit tests for auth service
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
