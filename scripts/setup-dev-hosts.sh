#!/bin/bash

# Setup development hosts file entries for macOS
# This script adds localhost domains to /etc/hosts for local development

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

HOSTS_FILE="/etc/hosts"
DOMAINS=(
    "nextone.localhost"
    "nexttwo.localhost"
    "api.localhost"
    "blog.localhost"
    "automapost.localhost"
    "grafana.localhost"
    "traefik.localhost"
)

echo "🔧 Setting up development hosts file entries..."
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${YELLOW}⚠️  Warning: This script is designed for macOS${NC}"
    echo "On Linux, you may need to modify /etc/hosts manually"
    exit 1
fi

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}⚠️  This script requires sudo privileges to modify /etc/hosts${NC}"
    echo "Please run: sudo $0"
    exit 1
fi

# Backup hosts file
BACKUP_FILE="${HOSTS_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo "📋 Creating backup: ${BACKUP_FILE}"
cp "$HOSTS_FILE" "$BACKUP_FILE"

# Check if entries already exist
EXISTING_ENTRIES=false
for domain in "${DOMAINS[@]}"; do
    if grep -q "$domain" "$HOSTS_FILE" 2>/dev/null; then
        EXISTING_ENTRIES=true
        echo -e "${YELLOW}⚠️  Entry for ${domain} already exists${NC}"
    fi
done

if [ "$EXISTING_ENTRIES" = true ]; then
    echo ""
    read -p "Some entries already exist. Do you want to add them anyway? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted. Backup saved at: ${BACKUP_FILE}"
        exit 0
    fi
fi

# Add entries
echo ""
echo "➕ Adding entries to ${HOSTS_FILE}..."
echo ""

for domain in "${DOMAINS[@]}"; do
    # Check if entry doesn't already exist
    if ! grep -q "127.0.0.1.*${domain}" "$HOSTS_FILE" 2>/dev/null; then
        echo "127.0.0.1 ${domain}" >> "$HOSTS_FILE"
        echo -e "${GREEN}✓${NC} Added ${domain}"
    else
        echo -e "${YELLOW}⊘${NC} Skipped ${domain} (already exists)"
    fi
done

# Flush DNS cache
echo ""
echo "🔄 Flushing DNS cache..."
dscacheutil -flushcache
killall -HUP mDNSResponder 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Development hosts setup complete!${NC}"
echo ""
echo "Added domains:"
for domain in "${DOMAINS[@]}"; do
    echo "  - ${domain}"
done
echo ""
echo "You can now access your services at:"
echo "  - http://nextone.localhost"
echo "  - http://nexttwo.localhost"
echo "  - http://api.localhost"
echo "  - http://blog.localhost"
echo "  - http://automapost.localhost"
echo "  - http://grafana.localhost"
echo "  - http://traefik.localhost"
echo ""
echo "Backup saved at: ${BACKUP_FILE}"
echo ""
echo "To remove these entries later, edit ${HOSTS_FILE} or restore from backup:"
echo "  sudo cp ${BACKUP_FILE} ${HOSTS_FILE}"

