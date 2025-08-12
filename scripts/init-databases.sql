-- Initialize databases for each microservice
CREATE DATABASE auth_db;
CREATE DATABASE user_db;
CREATE DATABASE application_db;
CREATE DATABASE ticket_db;
CREATE DATABASE project_db;
CREATE DATABASE comment_db;
CREATE DATABASE reporting_db;
CREATE DATABASE audit_db;

-- Create service-specific users (optional for development)
-- In production, each service should have its own database user
-- CREATE USER auth_user WITH PASSWORD 'secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE auth_db TO auth_user;

-- Repeat for other services...
