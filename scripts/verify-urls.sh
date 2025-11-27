#!/bin/bash

# URL Verification Script for Docker Compose Development
# This script helps verify if your services are accessible

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Verifying Docker Compose Services..."
echo ""

# Check if docker compose is running
if ! docker compose ps | grep -q "Up"; then
    echo -e "${RED}❌ No services are running. Start them with: make up${NC}"
    exit 1
fi

# Load environment variables from .env if it exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local description=$3
    
    echo -n "Checking ${description} (${service_name})... "
    
    # Check if container is running
    if docker compose ps | grep -q "${service_name}.*Up"; then
        echo -e "${GREEN}✓ Container running${NC}"
        
        # Try to curl the URL if provided
        if [ -n "$url" ]; then
            echo -n "  Testing URL ${url}... "
            if curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" | grep -q "200\|301\|302"; then
                echo -e "${GREEN}✓ Accessible${NC}"
            else
                echo -e "${YELLOW}⚠ May not be accessible (check domain/DNS)${NC}"
            fi
        fi
    else
        echo -e "${RED}✗ Container not running${NC}"
    fi
    echo ""
}

# Check all services
echo "=== Container Status ==="
docker compose ps
echo ""

echo "=== Service Health Checks ==="

# Check Traefik
check_service "traefik" "" "Traefik Reverse Proxy"

# Check Next.js apps (if domains are set)
if [ -n "$NEXT_APP_ONE_DOMAIN" ]; then
    check_service "next-app-one" "https://${NEXT_APP_ONE_DOMAIN}" "Next.js App One"
else
    echo -e "${YELLOW}⚠ NEXT_APP_ONE_DOMAIN not set in .env${NC}"
fi

if [ -n "$NEXT_APP_TWO_DOMAIN" ]; then
    check_service "next-app-two" "https://${NEXT_APP_TWO_DOMAIN}" "Next.js App Two"
else
    echo -e "${YELLOW}⚠ NEXT_APP_TWO_DOMAIN not set in .env${NC}"
fi

# Check Express API
if [ -n "$EXPRESS_API_DOMAIN" ]; then
    check_service "express-api" "https://${EXPRESS_API_DOMAIN}" "Express API"
else
    echo -e "${YELLOW}⚠ EXPRESS_API_DOMAIN not set in .env${NC}"
fi

# Check Blog
if [ -n "$BLOG_DOMAIN" ]; then
    check_service "levymoreira-blog" "https://${BLOG_DOMAIN}" "Levy Moreira Blog"
else
    echo -e "${YELLOW}⚠ BLOG_DOMAIN not set in .env${NC}"
fi

# Check Automapost
if [ -n "$AUTOMAPOST_DOMAIN" ]; then
    check_service "automapost" "https://${AUTOMAPOST_DOMAIN}" "Automapost"
else
    echo -e "${YELLOW}⚠ AUTOMAPOST_DOMAIN not set in .env${NC}"
fi

# Check Grafana
if [ -n "$GRAFANA_DOMAIN" ]; then
    check_service "grafana" "https://${GRAFANA_DOMAIN}" "Grafana Dashboard"
else
    echo -e "${YELLOW}⚠ GRAFANA_DOMAIN not set in .env${NC}"
fi

# Check other services
check_service "redis" "" "Redis Cache"
check_service "loki" "" "Loki Log Storage"
check_service "promtail" "" "Promtail Log Collector"
check_service "cron-logger" "" "Cron Logger"

echo "=== Quick Test Commands ==="
echo ""
echo "Test services directly (bypassing Traefik):"
echo "  docker compose exec next-app-one curl -s http://localhost:3000"
echo "  docker compose exec next-app-two curl -s http://localhost:3000"
echo "  docker compose exec levymoreira-blog curl -s http://localhost:3000"
echo "  docker compose exec automapost curl -s http://localhost:3000"
echo "  docker compose exec express-api curl -s http://localhost:4000"
echo ""
echo "View logs:"
echo "  make logs                    # All services"
echo "  docker compose logs -f traefik  # Traefik only"
echo ""
echo "Check Traefik routing:"
echo "  docker compose logs traefik | grep -i 'router\|error'"
echo ""

