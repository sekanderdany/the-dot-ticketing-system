# Create all missing microservices based on auth-service template

$services = @(
  "user-service",
  "application-service", 
  "ticket-service",
  "project-service",
  "comment-service",
  "reporting-service",
  "audit-service"
)

foreach ($service in $services) {
  Write-Host "Creating $service..."
  
  # Create service directory
  New-Item -ItemType Directory -Path "services\$service" -Force
  
  # Copy basic structure from auth-service
  Copy-Item -Path "services\auth-service\*" -Destination "services\$service\" -Recurse -Force
  
  # Update package.json name
  $packageJsonPath = "services\$service\package.json"
  if (Test-Path $packageJsonPath) {
    $content = Get-Content $packageJsonPath -Raw
    $content = $content -replace "auth-service", $service
    Set-Content $packageJsonPath $content
  }
  
  Write-Host "$service created successfully"
}

Write-Host "All microservices created!"
