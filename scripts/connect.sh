#!/bin/bash

# Connect to Azure VM
# Connects to the VM using the SSH key and credentials from docs/VM.md

set -e

# VM Configuration
VM_USER="azureuser"
VM_IP="98.71.75.120"
VM_PATH="/opt/azure-sites-poc"

# Get script directory and resolve key path
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VM_KEY="${PROJECT_ROOT}/scripts/monorepo-vm1_key.pem"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if key file exists
check_key_file() {
    if [ ! -f "$VM_KEY" ]; then
        echo -e "${RED}Error: SSH key file not found: ${VM_KEY}${NC}"
        echo -e "${YELLOW}Expected location: ${VM_KEY}${NC}"
        exit 1
    fi
    
    # Set proper permissions on key file
    chmod 600 "$VM_KEY" 2>/dev/null || true
}

# Function to connect to VM
connect_vm() {
    local extra_args="${@}"
    
    echo -e "${GREEN}🔌 Connecting to VM...${NC}"
    echo -e "${YELLOW}User:${NC} ${VM_USER}"
    echo -e "${YELLOW}IP:${NC} ${VM_IP}"
    echo -e "${YELLOW}Key:${NC} ${VM_KEY}"
    echo ""
    
    # Connect via SSH
    ssh -i "$VM_KEY" \
        -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        -o LogLevel=ERROR \
        ${extra_args} \
        "${VM_USER}@${VM_IP}"
}

# Function to execute command on VM
execute_command() {
    local command="${@}"
    
    if [ -z "$command" ]; then
        echo -e "${RED}Error: No command provided${NC}"
        echo "Usage: ./scripts/connect.sh 'command to execute'"
        exit 1
    fi
    
    echo -e "${GREEN}🔌 Executing command on VM...${NC}"
    echo -e "${YELLOW}Command:${NC} ${command}"
    echo ""
    
    ssh -i "$VM_KEY" \
        -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        -o LogLevel=ERROR \
        "${VM_USER}@${VM_IP}" \
        "${command}"
}

# Function to show usage
show_usage() {
    echo "Usage:"
    echo "  ./scripts/connect.sh                    # Connect to VM interactively"
    echo "  ./scripts/connect.sh 'command'          # Execute command on VM"
    echo "  ./scripts/connect.sh -t 'command'      # Execute command with TTY"
    echo ""
    echo "Examples:"
    echo "  ./scripts/connect.sh"
    echo "  ./scripts/connect.sh 'cd /opt/azure-sites-poc && docker compose ps'"
    echo "  ./scripts/connect.sh 'docker compose logs -f'"
    echo ""
}

# Main script logic
main() {
    # Check if key file exists
    check_key_file
    
    # If arguments provided, execute command; otherwise connect interactively
    if [ $# -eq 0 ]; then
        # No arguments - connect interactively
        connect_vm
    elif [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        # Show help
        show_usage
    elif [ "$1" = "-t" ]; then
        # Execute with TTY allocation
        shift
        connect_vm -t "${@}"
    else
        # Execute command
        execute_command "${@}"
    fi
}

# Run main function
main "${@}"

