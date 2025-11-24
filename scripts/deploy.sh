#!/bin/bash

# Deployment script for Azure Container Registry
# Increments version, builds, pushes images, and triggers server update

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ACR_REGISTRY="monoreporegistry.azurecr.io"
ACR_USERNAME=${ACR_USERNAME}
ACR_PASSWORD=${ACR_PASSWORD}
PROJECT_NAME="monorepo"
VERSION_FILE=".version"
ALL_SERVICES=("next-app-one" "next-app-two" "express-api" "cron-logger")
SERVICES=()  # Will be set based on parameter or all services

# Load deployment configuration
if [ -f .deploy.env ]; then
    export $(cat .deploy.env | grep -v '^#' | xargs)
fi

# Required variables (can be set in .deploy.env or environment)
SERVER_HOST=${SERVER_HOST:-}
SERVER_USER=${SERVER_USER:-}
SERVER_PATH=${SERVER_PATH:-/opt/monorepo}

# Get script directory and resolve key path
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEFAULT_SSH_KEY="${PROJECT_ROOT}/scripts/monorepo-vm1_key.pem"
SSH_KEY=${SSH_KEY:-$DEFAULT_SSH_KEY}

# Function to get current version
get_current_version() {
    if [ -f "$VERSION_FILE" ]; then
        cat "$VERSION_FILE"
    else
        echo "0.0.0"
    fi
}

# Function to increment version
increment_version() {
    local version=$1
    local major=$(echo $version | cut -d. -f1)
    local minor=$(echo $version | cut -d. -f2)
    local patch=$(echo $version | cut -d. -f3)
    
    # Increment patch version
    patch=$((patch + 1))
    
    echo "${major}.${minor}.${patch}"
}

# Function to save version
save_version() {
    local version=$1
    echo "$version" > "$VERSION_FILE"
    echo -e "${GREEN}✓ Version saved: ${version}${NC}"
}

# Function to login to ACR
login_acr() {
    echo -e "${YELLOW}🔐 Logging in to Azure Container Registry...${NC}"
    
    # Try azure cli login first
    if command -v az &> /dev/null; then
        echo -e "  Using Azure CLI..."
        az acr login --name monoreporegistry || {
            echo -e "${RED}✗ Azure CLI login failed${NC}"
            echo -e "${YELLOW}  Trying docker login...${NC}"
            echo "${ACR_PASSWORD}" | docker login --username "${ACR_USERNAME}" --password-stdin "${ACR_REGISTRY}" || {
                echo -e "${RED}✗ Docker login failed. Please login manually:${NC}"
                echo -e "  echo \"\$ACR_PASSWORD\" | docker login --username \"\$ACR_USERNAME\" --password-stdin \"\$ACR_REGISTRY\""
                exit 1
            }
        }
    else
        echo -e "  Azure CLI not found, using docker login..."
        echo "${ACR_PASSWORD}" | docker login --username "${ACR_USERNAME}" --password-stdin "${ACR_REGISTRY}" || {
            echo -e "${RED}✗ Docker login failed. Please login manually:${NC}"
            echo -e "  echo \"\$ACR_PASSWORD\" | docker login --username \"\$ACR_USERNAME\" --password-stdin \"\$ACR_REGISTRY\""
            exit 1
        }
    fi
    
    echo -e "${GREEN}✓ Logged in to ${ACR_REGISTRY}${NC}"
}

# Function to build and tag images
build_and_tag_images() {
    local version=$1
    
    echo -e "${YELLOW}📦 Building Docker images...${NC}"
    
    for service in "${SERVICES[@]}"; do
        echo -e "  Building ${service}..."
        
        # Build image
        docker compose build ${service} || {
            echo -e "${RED}✗ Failed to build ${service}${NC}"
            exit 1
        }
        
        # Tag with version
        local image_name="${PROJECT_NAME}-${service}"
        local versioned_tag="${ACR_REGISTRY}/${image_name}:${version}"
        local latest_tag="${ACR_REGISTRY}/${image_name}:latest"
        
        docker tag "${image_name}:latest" "${versioned_tag}" || {
            echo -e "${RED}✗ Failed to tag ${service}${NC}"
            exit 1
        }
        
        docker tag "${image_name}:latest" "${latest_tag}" || {
            echo -e "${RED}✗ Failed to tag ${service} as latest${NC}"
            exit 1
        }
        
        echo -e "${GREEN}    ✓ Tagged as ${versioned_tag}${NC}"
        echo -e "${GREEN}    ✓ Tagged as ${latest_tag}${NC}"
    done
    
    echo -e "${GREEN}✓ All images built and tagged${NC}"
}

# Function to push images to ACR
push_images() {
    local version=$1
    
    echo -e "${YELLOW}📤 Pushing images to Azure Container Registry...${NC}"
    
    for service in "${SERVICES[@]}"; do
        local image_name="${PROJECT_NAME}-${service}"
        local versioned_tag="${ACR_REGISTRY}/${image_name}:${version}"
        local latest_tag="${ACR_REGISTRY}/${image_name}:latest"
        
        echo -e "  Pushing ${service} (version ${version})..."
        docker push "${versioned_tag}" || {
            echo -e "${RED}✗ Failed to push ${versioned_tag}${NC}"
            exit 1
        }
        
        echo -e "  Pushing ${service} (latest)..."
        docker push "${latest_tag}" || {
            echo -e "${RED}✗ Failed to push ${latest_tag}${NC}"
            exit 1
        }
        
        echo -e "${GREEN}    ✓ ${service} pushed successfully${NC}"
    done
    
    echo -e "${GREEN}✓ All images pushed to ${ACR_REGISTRY}${NC}"
}

# Function to trigger server update via SSH
trigger_server_update() {
    if [ -z "$SERVER_HOST" ] || [ -z "$SERVER_USER" ]; then
        echo -e "${YELLOW}⚠ SERVER_HOST or SERVER_USER not set, skipping server update${NC}"
        echo -e "  Set SERVER_HOST and SERVER_USER in .deploy.env or environment"
        return 0
    fi
    
    echo -e "${YELLOW}🚀 Triggering server update via SSH...${NC}"
    
    # Check if SSH key exists
    if [ ! -f "$SSH_KEY" ]; then
        echo -e "${RED}✗ SSH key not found: ${SSH_KEY}${NC}"
        echo -e "${YELLOW}  Set SSH_KEY in .deploy.env or ensure default key exists at:${NC}"
        echo -e "${YELLOW}  ${DEFAULT_SSH_KEY}${NC}"
        exit 1
    fi
    
    # Copy update script to server
    echo -e "  Copying update script to server..."
    scp -i "${SSH_KEY}" -o StrictHostKeyChecking=no \
        scripts/get-latest-docker-images.sh \
        "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/scripts/get-latest-docker-images.sh" || {
        echo -e "${RED}✗ Failed to copy update script${NC}"
        exit 1
    }
    
    # Build services list for server script
    local services_list=$(IFS=' '; echo "${SERVICES[*]}")
    
    # Execute update script on server
    echo -e "  Executing update script on server..."
    ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no \
        "${SERVER_USER}@${SERVER_HOST}" \
        "cd ${SERVER_PATH} && \
         chmod +x scripts/get-latest-docker-images.sh && \
         ACR_REGISTRY=${ACR_REGISTRY} \
         PROJECT_NAME=${PROJECT_NAME} \
         SERVICES='${services_list}' \
         bash scripts/get-latest-docker-images.sh" || {
        echo -e "${RED}✗ Server update failed${NC}"
        exit 1
    }
    
    echo -e "${GREEN}✓ Server update triggered successfully${NC}"
}

# Function to validate service name
validate_service() {
    local service=$1
    
    for valid_service in "${ALL_SERVICES[@]}"; do
        if [ "$service" = "$valid_service" ]; then
            return 0
        fi
    done
    
    return 1
}

# Function to show usage
show_usage() {
    echo "Usage:"
    echo "  ./scripts/deploy.sh [SERVICE]"
    echo ""
    echo "Arguments:"
    echo "  SERVICE    Optional. Service name to deploy. If omitted, deploys all services."
    echo ""
    echo "Available Services:"
    for service in "${ALL_SERVICES[@]}"; do
        echo "  - ${service}"
    done
    echo ""
    echo "Examples:"
    echo "  ./scripts/deploy.sh                    # Deploy all services"
    echo "  ./scripts/deploy.sh next-app-one       # Deploy only next-app-one"
    echo "  ./scripts/deploy.sh express-api        # Deploy only express-api"
    echo ""
}

# Function to display summary
display_summary() {
    local version=$1
    
    echo ""
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Deployment Completed Successfully!${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}Version:${NC} ${version}"
    echo -e "${BLUE}Registry:${NC} ${ACR_REGISTRY}"
    echo ""
    echo -e "${BLUE}Deployed Services:${NC}"
    for service in "${SERVICES[@]}"; do
        echo -e "  - ${PROJECT_NAME}-${service}:${version}"
        echo -e "    ${ACR_REGISTRY}/${PROJECT_NAME}-${service}:${version}"
    done
    echo ""
    if [ -n "$SERVER_HOST" ]; then
        echo -e "${BLUE}Server:${NC} ${SERVER_USER}@${SERVER_HOST}"
        echo -e "${BLUE}Status:${NC} Updated with zero downtime"
    fi
    echo ""
}

# Main deployment flow
main() {
    # Parse arguments
    if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        show_usage
        exit 0
    fi
    
    # Determine which services to deploy
    if [ $# -eq 0 ]; then
        # No argument - deploy all services
        SERVICES=("${ALL_SERVICES[@]}")
        echo -e "${BLUE}No service specified, deploying all services${NC}"
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
        echo -e "${BLUE}Deploying single service: ${requested_service}${NC}"
    else
        echo -e "${RED}Error: Too many arguments${NC}"
        echo ""
        show_usage
        exit 1
    fi
    
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}🚀 Starting Deployment${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
    
    # Get and increment version
    current_version=$(get_current_version)
    echo -e "${BLUE}Current version:${NC} ${current_version}"
    
    new_version=$(increment_version "$current_version")
    echo -e "${BLUE}New version:${NC} ${new_version}"
    echo ""
    
    # Save new version
    save_version "$new_version"
    
    # Login to ACR
    login_acr
    echo ""
    
    # Build and tag images
    build_and_tag_images "$new_version"
    echo ""
    
    # Push images
    push_images "$new_version"
    echo ""
    
    # Trigger server update
    trigger_server_update
    echo ""
    
    # Display summary
    display_summary "$new_version"
}

# Run main function with all arguments
main "${@}"

