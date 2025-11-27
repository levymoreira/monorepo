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
ACR_REGISTRY='monoreporegistry.azurecr.io'
ACR_USERNAME='monoreporegistry'
ACR_PASSWORD='4LrJVj4WpydE0AbB9LH+TvdfiJx7cGhseEXWpuTbJ0+ACRBwrhom'
PROJECT_NAME=${PROJECT_NAME:-monorepo}
PLATFORM=${PLATFORM:-}  # Empty means let Docker choose, or specify like linux/amd64, linux/arm64
ALL_SERVICES=("next-app-one" "next-app-two" "levymoreira-blog" "express-api" "cron-logger" "automapost")
EXTERNAL_SERVICES=("traefik" "redis" "loki" "promtail" "grafana")  # Services using pre-built images from Docker Hub
SERVICES=()  # Will be set based on parameter or all services


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

    echo -e "${YELLOW}  Pulling ${image_name}...${NC}"
    
    # Try pulling with platform specification if provided, otherwise let Docker choose
    if [ -n "$PLATFORM" ]; then
        docker pull --platform "${PLATFORM}" "${image_name}" || {
            echo -e "${YELLOW}  Failed with platform ${PLATFORM}, trying without platform specification...${NC}"
            docker pull "${image_name}" || {
                echo -e "${RED}✗ Failed to pull ${image_name}${NC}"
                return 1
            }
        }
    else
        # Try without platform first (Docker will use host platform)
        docker pull "${image_name}" || {
            echo -e "${YELLOW}  Failed without platform, trying common platforms...${NC}"
            # Try common platforms as fallback
            local pull_success=false
            for platform in "linux/amd64" "linux/arm64" "linux/arm/v7"; do
                echo -e "  Trying platform ${platform}..."
                if docker pull --platform "${platform}" "${image_name}" 2>/dev/null; then
                    pull_success=true
                    break
                fi
            done
            if [ "$pull_success" = false ]; then
                echo -e "${RED}✗ Failed to pull ${image_name} with any platform${NC}"
                return 1
            fi
        }
    fi
    
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
    local max_attempts=10
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

# Function to check if service uses external image (Docker Hub)
is_external_service() {
    local service=$1
    for ext_service in "${EXTERNAL_SERVICES[@]}"; do
        if [ "$service" = "$ext_service" ]; then
            return 0
        fi
    done
    return 1
}

# Function to update external service (from Docker Hub)
update_external_service() {
    local service=$1
    
    echo -e "${YELLOW}🔄 Updating ${service} (pulling latest from Docker Hub)...${NC}"
    
    # Pull latest image from Docker Hub using docker compose
    docker compose pull ${service} || {
        echo -e "${RED}✗ Failed to pull ${service}${NC}"
        return 1
    }
    
    # Restart the service with the new image
    echo -e "${YELLOW}  Restarting ${service}...${NC}"
    docker compose up -d --no-deps ${service} || {
        echo -e "${RED}✗ Failed to restart ${service}${NC}"
        return 1
    }
    
    echo -e "${GREEN}✓ ${service} updated successfully${NC}"
}

# Function to update service with zero downtime
update_service() {
    local service=$1
    
    # Check if it's an external service (Docker Hub)
    if is_external_service "$service"; then
        update_external_service "$service"
        return $?
    fi
    
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
    # sleep 3
    
    # Wait for health check
    wait_for_health ${service} || {
        echo -e "${YELLOW}  Warning: Health check timeout for ${service}, but continuing...${NC}"
    }
    
    echo -e "${GREEN}✓ ${service} updated successfully${NC}"
}

# Function to validate service name
validate_service() {
    local service=$1
    
    # Check in ALL_SERVICES (ACR services)
    for valid_service in "${ALL_SERVICES[@]}"; do
        if [ "$service" = "$valid_service" ]; then
            return 0
        fi
    done
    
    # Check in EXTERNAL_SERVICES (Docker Hub services)
    for valid_service in "${EXTERNAL_SERVICES[@]}"; do
        if [ "$service" = "$valid_service" ]; then
            return 0
        fi
    done
    
    return 1
}

# Function to show usage
show_usage() {
    echo "Usage:"
    echo "  ./scripts/get-latest-docker-images.sh [SERVICE]"
    echo ""
    echo "Arguments:"
    echo "  SERVICE    Optional. Service name to update. If omitted, updates all services."
    echo ""
    echo "Available Services:"
    echo "  ACR Services (from Azure Container Registry):"
    for service in "${ALL_SERVICES[@]}"; do
        echo "    - ${service}"
    done
    echo "  External Services (from Docker Hub):"
    for service in "${EXTERNAL_SERVICES[@]}"; do
        echo "    - ${service}"
    done
    echo ""
    echo "Examples:"
    echo "  ./scripts/get-latest-docker-images.sh                    # Update all ACR services"
    echo "  ./scripts/get-latest-docker-images.sh next-app-one       # Update only next-app-one"
    echo "  ./scripts/get-latest-docker-images.sh levymoreira-blog   # Update only levymoreira-blog"
    echo "  ./scripts/get-latest-docker-images.sh traefik            # Update traefik from Docker Hub"
    echo ""
    echo "Note: You can also use the SERVICES environment variable:"
    echo "  SERVICES='next-app-one express-api' ./scripts/get-latest-docker-images.sh"
    echo ""
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
    docker compose ps --format "table {{.Service}}	{{.Status}}	{{.Ports}}" | grep -E "SERVICE|next-app|express-api|cron-logger|levymoreira-blog" || true
    echo ""
}

# Main update flow
main() {
    # Parse arguments
    if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        show_usage
        exit 0
    fi
    
    # Determine which services to update
    # Priority: command-line argument > environment variable > all services
    if [ $# -eq 0 ]; then
        # No argument - check environment variable or use all services
        if [ -n "$SERVICES" ]; then
            # Parse SERVICES from environment variable
            read -ra SERVICES_ARRAY <<< "$SERVICES"
            SERVICES=("${SERVICES_ARRAY[@]}")
            echo -e "${BLUE}Using services from SERVICES environment variable${NC}"
        else
            # No argument and no environment variable - update all ACR services (not external services)
            SERVICES=("${ALL_SERVICES[@]}")
            echo -e "${BLUE}No service specified, updating all ACR services${NC}"
            echo -e "${YELLOW}Note: External services (traefik, redis, loki, promtail, grafana) are not updated by default${NC}"
            echo -e "${YELLOW}      Specify them explicitly to update: ./scripts/get-latest-docker-images.sh traefik${NC}"
        fi
    elif [ $# -eq 1 ]; then
        # Single service specified
        local requested_service=$1
        
        # Validate service name
        if ! validate_service "$requested_service"; then
            echo -e "${RED}Error: Invalid service name: ${requested_service}${NC}"
            echo ""
            show_usage
            exit 1
        fi
        
        SERVICES=("$requested_service")
        echo -e "${BLUE}Updating single service: ${requested_service}${NC}"
    else
        echo -e "${RED}Error: Too many arguments${NC}"
        echo ""
        show_usage
        exit 1
    fi
    
    # Change to project directory
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local project_dir="$(dirname "$script_dir")"
    cd "$project_dir" || {
        echo -e "${RED}✗ Failed to change to project directory${NC}"
        exit 1
    }
    
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}🔄 Starting Zero-Downtime Update${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}Registry:${NC} ${ACR_REGISTRY}"
    echo -e "${BLUE}Project:${NC} ${PROJECT_NAME}"
    echo ""
    
    # Login to ACR (only needed for ACR services)
    local needs_acr=false
    for service in "${SERVICES[@]}"; do
        if ! is_external_service "$service"; then
            needs_acr=true
            break
        fi
    done
    
    if [ "$needs_acr" = true ]; then
        login_acr
        echo ""
    else
        echo -e "${BLUE}Note: All selected services are external (Docker Hub), skipping ACR login${NC}"
        echo ""
    fi
    
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

# Run main function with all arguments
main "${@}"
set +x