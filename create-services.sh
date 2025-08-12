#!/bin/bash

# Create all missing microservices based on auth-service template

services=(
  "user-service"
  "application-service"
  "ticket-service" 
  "project-service"
  "comment-service"
  "reporting-service"
  "audit-service"
)

for service in "${services[@]}"; do
  echo "Creating $service..."
  
  # Create service directory
  mkdir -p "services/$service/src"
  
  # Copy basic structure from auth-service
  cp -r "services/auth-service/src" "services/$service/"
  cp "services/auth-service/package.json" "services/$service/"
  cp "services/auth-service/tsconfig.json" "services/$service/"
  cp "services/auth-service/nest-cli.json" "services/$service/"
  
  # Update package.json name
  sed -i "s/auth-service/$service/g" "services/$service/package.json"
  
  echo "$service created successfully"
done

echo "All microservices created!"
