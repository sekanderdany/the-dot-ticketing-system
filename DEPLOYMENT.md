# The Dot - Production Deployment Guide

## 🌟 Overview

This guide covers deploying "The Dot" to production environments including cloud platforms, on-premises infrastructure, and hybrid setups.

## 🏭 Production Architecture

### Infrastructure Requirements

#### Minimum Requirements
- **CPU:** 8 cores total across all services
- **Memory:** 16 GB RAM
- **Storage:** 100 GB SSD
- **Network:** 1 Gbps bandwidth

#### Recommended Production Setup
- **CPU:** 16+ cores
- **Memory:** 32+ GB RAM  
- **Storage:** 500+ GB SSD with backup
- **Network:** Load balancer with SSL termination
- **Database:** Managed PostgreSQL with read replicas
- **Cache:** Redis Cluster
- **Message Queue:** RabbitMQ Cluster

### High Availability Setup

```yaml
# Production cluster configuration
Kubernetes Cluster:
  - 3+ Master Nodes
  - 5+ Worker Nodes
  - Multi-zone deployment
  - Automated backup & disaster recovery

Database Tier:
  - PostgreSQL Primary + 2 Read Replicas
  - Automated backups every 6 hours
  - Point-in-time recovery

Cache Tier:
  - Redis Cluster (3 masters + 3 slaves)
  - Persistent storage
  - Automatic failover

Message Queue:
  - RabbitMQ Cluster (3 nodes)
  - Durable queues
  - High availability setup
```

## ☁️ Cloud Platform Deployments

### AWS Deployment

#### Using EKS (Elastic Kubernetes Service)

```bash
# 1. Create EKS cluster
eksctl create cluster \
  --name the-dot-prod \
  --version 1.28 \
  --region us-west-2 \
  --nodegroup-name workers \
  --node-type m5.large \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 10 \
  --managed

# 2. Configure kubectl
aws eks update-kubeconfig --region us-west-2 --name the-dot-prod

# 3. Install AWS Load Balancer Controller
kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller//crds?ref=master"

# 4. Deploy application
kubectl apply -f k8s/aws/
```

#### AWS Services Integration

```yaml
# AWS RDS for PostgreSQL
Database:
  Engine: PostgreSQL 14
  Instance: db.r5.xlarge
  Multi-AZ: true
  Backup: 7 days retention
  
# AWS ElastiCache for Redis
Cache:
  Engine: Redis 7.0
  Node Type: cache.r6g.large
  Cluster Mode: enabled
  
# AWS S3 for file storage
Storage:
  Bucket: the-dot-attachments-prod
  Versioning: enabled
  Encryption: AES-256
```

### Google Cloud Platform (GKE)

```bash
# 1. Create GKE cluster
gcloud container clusters create the-dot-prod \
  --num-nodes=3 \
  --machine-type=e2-standard-4 \
  --enable-autoscaling \
  --min-nodes=1 \
  --max-nodes=10 \
  --zone=us-central1-a

# 2. Get credentials
gcloud container clusters get-credentials the-dot-prod --zone=us-central1-a

# 3. Deploy application
kubectl apply -f k8s/gcp/
```

### Microsoft Azure (AKS)

```bash
# 1. Create resource group
az group create --name the-dot-prod --location eastus

# 2. Create AKS cluster
az aks create \
  --resource-group the-dot-prod \
  --name the-dot-aks \
  --node-count 3 \
  --node-vm-size Standard_D4s_v3 \
  --enable-addons monitoring \
  --generate-ssh-keys

# 3. Get credentials
az aks get-credentials --resource-group the-dot-prod --name the-dot-aks

# 4. Deploy application
kubectl apply -f k8s/azure/
```

## 🐳 Container Registry Setup

### GitHub Container Registry

```bash
# 1. Login to GitHub Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# 2. Build and push images
docker build -t ghcr.io/your-org/the-dot-auth-service:latest services/auth-service/
docker push ghcr.io/your-org/the-dot-auth-service:latest

# 3. Update Kubernetes manifests
sed -i 's|the-dot/auth-service:latest|ghcr.io/your-org/the-dot-auth-service:latest|g' k8s/*.yaml
```

### AWS ECR

```bash
# 1. Create ECR repositories
aws ecr create-repository --repository-name the-dot/auth-service --region us-west-2

# 2. Get login token
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-west-2.amazonaws.com

# 3. Tag and push images
docker tag the-dot/auth-service:latest 123456789012.dkr.ecr.us-west-2.amazonaws.com/the-dot/auth-service:latest
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/the-dot/auth-service:latest
```

## 🔒 Security Hardening

### Network Security

```yaml
# Network Policies
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: the-dot-network-policy
  namespace: the-dot
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: the-dot
    ports:
    - protocol: TCP
      port: 3001
```

### Pod Security Standards

```yaml
# Pod Security Policy
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: the-dot-psp
spec:
  privileged: false
  runAsUser:
    rule: MustRunAsNonRoot
  fsGroup:
    rule: RunAsAny
  volumes:
  - configMap
  - secret
  - persistentVolumeClaim
```

### TLS/SSL Configuration

```yaml
# TLS Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: the-dot-ingress
  namespace: the-dot
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - app.thedot.com
    secretName: the-dot-tls
  rules:
  - host: app.thedot.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 3000
```

## 📊 Monitoring & Observability

### Prometheus & Grafana Setup

```bash
# 1. Install Prometheus Operator
kubectl create namespace monitoring
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring

# 2. Deploy ServiceMonitors
kubectl apply -f monitoring/service-monitors.yaml

# 3. Import Grafana dashboards
kubectl apply -f monitoring/grafana-dashboards.yaml
```

### Logging with ELK Stack

```bash
# 1. Install Elasticsearch
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch -n logging --create-namespace

# 2. Install Logstash
helm install logstash elastic/logstash -n logging

# 3. Install Kibana
helm install kibana elastic/kibana -n logging

# 4. Install Filebeat
helm install filebeat elastic/filebeat -n logging
```

### Application Performance Monitoring

```yaml
# Jaeger for distributed tracing
apiVersion: jaegertracing.io/v1
kind: Jaeger
metadata:
  name: the-dot-jaeger
  namespace: the-dot
spec:
  strategy: production
  storage:
    type: elasticsearch
    elasticsearch:
      nodeCount: 3
      storage:
        size: 10Gi
```

## 🔄 Backup & Disaster Recovery

### Database Backup Strategy

```bash
# Automated PostgreSQL backups
#!/bin/bash
BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# Retention policy (keep 30 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Upload to cloud storage
aws s3 cp "$BACKUP_DIR/backup_$DATE.sql.gz" s3://the-dot-backups/postgresql/
```

### Kubernetes Backup with Velero

```bash
# 1. Install Velero
kubectl create namespace velero
velero install \
  --provider aws \
  --plugins velero/velero-plugin-for-aws:v1.5.0 \
  --bucket the-dot-backups \
  --secret-file ./credentials-velero

# 2. Create backup schedule
velero schedule create the-dot-backup \
  --schedule="0 2 * * *" \
  --include-namespaces the-dot \
  --ttl 720h0m0s
```

## 🚀 Performance Optimization

### Database Optimization

```sql
-- PostgreSQL performance tuning
-- shared_preload_libraries = 'pg_stat_statements'
-- max_connections = 200
-- shared_buffers = 4GB
-- effective_cache_size = 12GB
-- maintenance_work_mem = 1GB
-- checkpoint_completion_target = 0.9
-- wal_buffers = 64MB
-- default_statistics_target = 100

-- Create indexes for common queries
CREATE INDEX CONCURRENTLY idx_tickets_status_created ON tickets(status, created_at);
CREATE INDEX CONCURRENTLY idx_users_email_active ON users(email, is_active);
CREATE INDEX CONCURRENTLY idx_projects_team_status ON projects(team_id, status);
```

### Redis Configuration

```redis
# redis.conf optimizations
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
tcp-keepalive 300
timeout 0
```

### Application-Level Optimizations

```yaml
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-service-hpa
  namespace: the-dot
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## 🔍 Health Checks & Alerting

### Comprehensive Health Checks

```yaml
# Kubernetes health check configuration
livenessProbe:
  httpGet:
    path: /health/live
    port: 3001
  initialDelaySeconds: 60
  periodSeconds: 30
  timeoutSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3001
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 5
  failureThreshold: 3
```

### Alerting Rules

```yaml
# Prometheus alerting rules
groups:
- name: the-dot.alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: High error rate detected
      
  - alert: DatabaseConnectionPool
    expr: database_connections_active / database_connections_max > 0.8
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: Database connection pool utilization high
```

## 📈 Scaling Strategies

### Vertical Scaling

```yaml
# Resource requests and limits
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

### Horizontal Scaling

```yaml
# Cluster Autoscaler
apiVersion: v1
kind: ConfigMap
metadata:
  name: cluster-autoscaler-status
  namespace: kube-system
data:
  nodes.max: "20"
  nodes.min: "3"
  scale-down-delay-after-add: "10m"
  scale-down-unneeded-time: "10m"
```

## 🔧 Maintenance & Updates

### Rolling Updates

```bash
# Zero-downtime deployment strategy
kubectl set image deployment/auth-service \
  auth-service=ghcr.io/your-org/the-dot-auth-service:v2.0.0 \
  -n the-dot

# Monitor rollout
kubectl rollout status deployment/auth-service -n the-dot

# Rollback if needed
kubectl rollout undo deployment/auth-service -n the-dot
```

### Database Migrations

```bash
# Safe database migration process
# 1. Create database backup
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > backup_pre_migration.sql

# 2. Run migration in maintenance window
kubectl exec -it auth-service-pod -- npx prisma migrate deploy

# 3. Verify migration
kubectl exec -it auth-service-pod -- npx prisma db seed --preview-feature
```

## 🎯 Production Checklist

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates installed
- [ ] Monitoring and alerting configured
- [ ] Backup and recovery procedures tested
- [ ] Security scans passed
- [ ] Load testing completed
- [ ] Documentation updated

### Post-Deployment Checklist

- [ ] All services healthy
- [ ] Database connections stable
- [ ] Logs flowing correctly
- [ ] Monitoring dashboards working
- [ ] Alerts configured and tested
- [ ] Performance metrics baseline established
- [ ] User acceptance testing passed
- [ ] Rollback procedure documented

### Ongoing Maintenance

- [ ] Daily health checks
- [ ] Weekly performance reviews
- [ ] Monthly security updates
- [ ] Quarterly disaster recovery tests
- [ ] Regular backup validation
- [ ] Capacity planning reviews
- [ ] Security audits
- [ ] Dependency updates

## 📞 Support & Troubleshooting

### Emergency Contacts

```yaml
# On-call rotation
Primary: DevOps Team Lead
Secondary: Senior Backend Developer
Escalation: Engineering Manager

# Service Dependencies
Database: DBA Team
Infrastructure: Platform Team
Security: InfoSec Team
```

### Common Production Issues

#### Service Unavailable
```bash
# Check pod status
kubectl get pods -n the-dot

# Check service endpoints
kubectl get endpoints -n the-dot

# Check ingress configuration
kubectl describe ingress the-dot-ingress -n the-dot
```

#### Database Performance Issues
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check connection count
SELECT count(*) FROM pg_stat_activity;

-- Check blocking queries
SELECT * FROM pg_stat_activity WHERE wait_event IS NOT NULL;
```

#### Memory/CPU Issues
```bash
# Check resource usage
kubectl top pods -n the-dot

# Check HPA status
kubectl get hpa -n the-dot

# Scale manually if needed
kubectl scale deployment auth-service --replicas=5 -n the-dot
```

## 📚 Additional Resources

- [Kubernetes Production Best Practices](https://kubernetes.io/docs/setup/best-practices/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Redis Production Deployment](https://redis.io/docs/management/admin/)
- [NGINX Performance Tuning](https://nginx.org/en/docs/http/ngx_http_core_module.html)
- [Prometheus Monitoring](https://prometheus.io/docs/practices/alerting/)

---

**Remember**: Always test deployments in staging environments that mirror production before deploying to production. Have rollback procedures ready and ensure your team is familiar with emergency procedures.
