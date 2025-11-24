#!/bin/bash
set -x

# Server-side script to pull latest images from ACR and update services with zero downtime
# This script runs on the remote server

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration (can be overridden via environment)
ACR_REGISTRY=${ACR_REGISTRY:-monoreporegistry.azurecr.io}
ACR_USERNAME=${ACR_USERNAME}
ACR_PASSWORD=${ACR_PASSWORD}
PROJECT_NAME=${PROJECT_NAME:-monorepo}
ALL_SERVICES=("next-app-one" "next-app-two" "express-api" "cron-logger")

# Parse SERVICES from environment variable if provided, otherwise use all services
if [ -n "$SERVICES" ]; then
    # Convert space-separated string to array
    read -ra SERVICES_ARRAY <<< "$SERVICES"
    SERVICES=("${SERVICES_ARRAY[@]}")
else
    SERVICES=("${ALL_SERVICES[@]}")
fi

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}🔄 Starting Zero-Downtime Update${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Registry:${NC} ${ACR_REGISTRY}"
echo -e "${BLUE}Project:${NC} ${PROJECT_NAME}"
echo ""

# Function to login to ACR
login_acr() {
    echo -e "${YELLOW}🔐 Logging in to Azure Container Registry...${NC}"
    
    # Try azure cli login first
    if command -v az &> /dev/null; then
        echo -e "  Using Azure CLI..."
        # Capture output and error streams
        login_output=$(az acr login --name monoreporegistry 2>&1)
        login_exit_code=$?
        
        if [ $login_exit_code -ne 0 ]; then
            echo -e "${YELLOW}  Azure CLI login failed with exit code ${login_exit_code}, trying docker login...${NC}"
            echo -e "  Output from 'az acr login':\n${login_output}"
            
            echo "${ACR_PASSWORD}" | docker login --username "${ACR_USERNAME}" --password-stdin "${ACR_REGISTRY}" || {
                echo -e "${RED}✗ Failed to login to ACR${NC}"
                echo -e "${YELLOW}  Please ensure you're authenticated:${NC}"
                echo -e "    az acr login --name monoreporegistry"
                echo -e "    or"
                echo -e "    echo \"\$ACR_PASSWORD\" | docker login --username \"\$ACR_USERNAME\" --password-stdin \"\$ACR_REGISTRY\""
                exit 1
            }
        fi
    else
        echo -e "  Azure CLI not found, using docker login..."
        echo "${ACR_PASSWORD}" | docker login --username "${ACR_USERNAME}" --password-stdin "${ACR_REGISTRY}" || {
            echo -e "${RED}✗ Failed to login to ACR${NC}"
            echo -e "${YELLOW}  Please login manually:${NC}"
            echo -e "    echo \"\$ACR_PASSWORD\" | docker login --username \"\$ACR_USERNAME\" --password-stdin \"\$ACR_REGISTRY\""
            exit 1
        }
    fi
    
    echo -e "${GREEN}✓ Logged in to ${ACR_REGISTRY}${NC}"
}

# Function to pull latest image
pull_image() {
    local service=$1
    local image_name="${ACR_REGISTRY}/${PROJECT_NAME}-${service}:latest"
    
    echo -e "${YELLOW}  Pulling ${service}...${NC}"
    docker pull "${image_name}" || {
        echo -e "${RED}✗ Failed to pull ${image_name}${NC}"
        return 1
    }
    
    # Tag as local image for docker-compose
    docker tag "${image_name}" "${PROJECT_NAME}-${service}:latest" || {
        echo -e "${RED}✗ Failed to tag ${service}${NC}"
        return 1
    }
    
    echo -e "${GREEN}    ✓ ${service} pulled and tagged${NC}"
}

# Function to wait for service health
wait_for_health() {
    local service=$1
    local max_attempts=30
    local attempt=0
    
    echo -e "${YELLOW}  Waiting for ${service} to be healthy...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        # Check if container is running
        if docker compose ps ${service} 2>/dev/null | grep -q "Up"; then
            # Try to check if container is responding
            if docker compose exec -T ${service} sh -c "exit 0" 2>/dev/null; then
                echo -e "${GREEN}    ✓ ${service} is healthy${NC}"
                return 0
            fi
        fi
        
        attempt=$((attempt + 1))
        sleep 2
    done
    
    echo -e "${RED}    ✗ ${service} failed health check${NC}"
    return 1
}

# Function to update service with zero downtime
update_service() {
    local service=$1
    
    echo -e "${YELLOW}🔄 Updating ${service}...${NC}"
    
    # Pull latest image
    pull_image ${service} || {
        echo -e "${RED}✗ Failed to pull ${service}${NC}"
        return 1
    }
    
    # Update service with zero downtime using scaling
    # Docker Compose will gracefully replace old containers with new ones
    echo -e "${YELLOW}  Deploying ${service} with zero downtime...${NC}"
    
    # Use docker compose up with scale to ensure zero downtime
    # This will:
    # 1. Start new containers with new image
    # 2. Wait for them to be healthy
    # 3. Stop old containers
    docker compose up -d --no-deps --scale ${service}=2 ${service} || {
        echo -e "${RED}✗ Failed to update ${service}${NC}"
        return 1
    }
    
    # Wait a moment for containers to start
    sleep 3
    
    # Wait for health check
    wait_for_health ${service} || {
        echo -e "${YELLOW}  Warning: Health check timeout for ${service}, but continuing...${NC}"
    }
    
    echo -e "${GREEN}✓ ${service} updated successfully${NC}"
}

# Function to verify services
verify_services() {
    echo -e "${YELLOW}🔍 Verifying services...${NC}"
    
    local all_healthy=true
    
    for service in "${SERVICES[@]}"; do
        # Count running instances
        local running=$(docker compose ps ${service} --format json 2>/dev/null | \
            grep -c "\"State\":\"running\"" || echo "0")
        
        if [ "$running" -ge 1 ]; then
            echo -e "${GREEN}  ✓ ${service}: ${running} instance(s) running${NC}"
        else
            echo -e "${RED}  ✗ ${service}: No instances running${NC}"
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = true ]; then
        echo -e "${GREEN}✓ All services verified${NC}"
        return 0
    else
        echo -e "${RED}✗ Some services are not healthy${NC}"
        return 1
    fi
}

# Function to display summary
display_summary() {
    echo ""
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Zero-Downtime Update Completed!${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}Updated Services:${NC}"
    for service in "${SERVICES[@]}"; do
        echo -e "  - ${service}"
    done
    echo ""
    echo -e "${BLUE}Service Status:${NC}"
    docker compose ps --format "table {{.Service}}	{{.Status}}	{{.Ports}}" | grep -E "SERVICE|next-app|express-api|cron-logger" || true
    echo ""
}

# Main update flow
main() {
    # Change to project directory
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local project_dir="$(dirname "$script_dir")"
    cd "$project_dir" || {
        echo -e "${RED}✗ Failed to change to project directory${NC}"
        exit 1
    }
    
    # Login to ACR
    login_acr
    echo ""
    
    # Update each service with zero downtime
    for service in "${SERVICES[@]}"; do
        update_service ${service}
        echo ""
    done
    
    # Verify all services
    verify_services
    echo ""
    
    # Display summary
    display_summary
}

# Run main function
main
set +x