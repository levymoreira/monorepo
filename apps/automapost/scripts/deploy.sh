#!/bin/bash

# Git-based deployment script for automapost
# Deploys latest changes from main branch to remote server

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Project root directory (parent of scripts directory)
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Path to the PEM key file (relative to project directory)
KEY_FILE="$PROJECT_DIR/../server-azure/secrets/onevmforall_key.pem"

# VM connection details
VM_USER="azureuser"
VM_IP="20.238.16.25"
VM_PORT="22"
REMOTE_PROJECT_DIR="~/automapost"

echo "🚀 Deploying automapost to remote server..."
echo "============================================="
echo "Remote: $VM_USER@$VM_IP:$REMOTE_PROJECT_DIR"
echo "Key: $KEY_FILE"
echo ""

# Start SSH agent and add the SSH key
echo "🔑 Setting up SSH agent..."
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/automapost
echo ""

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ Error: PEM key file not found at $KEY_FILE"
    exit 1
fi

# Set correct permissions for the key file
chmod 600 "$KEY_FILE"

echo "📦 Step 1: Incrementing version and pushing changes..."
echo "====================================================="

# Get current version from package.json
CURRENT_VERSION=$(grep '"version"' package.json | sed 's/.*"version": "\(.*\)",/\1/')
echo "Current version: $CURRENT_VERSION"

# Parse version components
IFS='.' read -r major minor patch <<< "$CURRENT_VERSION"

# Increment patch version
NEW_PATCH=$((patch + 1))
NEW_VERSION="$major.$minor.$NEW_PATCH"

echo "New version: $NEW_VERSION"

# Update package.json with new version
sed -i.bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json

# Remove backup file
rm package.json.bak

# Commit and push version change
git add package.json
TIMESTAMP=$(date '+%d/%m/%y %H:%M')
git commit -m "🚀 Release $NEW_VERSION - $TIMESTAMP"
git push origin main

echo "✅ Version bumped to $NEW_VERSION and pushed to repository"

echo ""
echo "📊 Step 2: Checking current PM2 status on remote..."
echo "=================================================="
ssh -i "$KEY_FILE" -p "$VM_PORT" "$VM_USER@$VM_IP" "source ~/.bashrc && source ~/.profile && export PATH=\$PATH:\$HOME/.npm-global/bin:\$HOME/.local/bin && cd $REMOTE_PROJECT_DIR && pm2 ls"

echo ""
echo "🔄 Step 3: Updating code from Git repository..."
echo "==============================================="
ssh -i "$KEY_FILE" -p "$VM_PORT" "$VM_USER@$VM_IP" "source ~/.bashrc && source ~/.profile && export PATH=\$PATH:\$HOME/.npm-global/bin:\$HOME/.local/bin && cd $REMOTE_PROJECT_DIR && git fetch origin && git reset --hard origin/main && echo '📅 Updated to commit:' && git log -1 --pretty=format:'🕐 %cd | 🔑 %h | 💬 %s' --date=format:'%Y-%m-%d %H:%M:%S'"

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to update code from Git repository"
    exit 1
fi

echo ""
echo "🔨 Step 4: Building application (zero-downtime)..."
echo "================================================="

# Build the application in a temporary directory to avoid downtime
ssh -i "$KEY_FILE" -p "$VM_PORT" "$VM_USER@$VM_IP" "
source ~/.bashrc && source ~/.profile && export PATH=\$PATH:\$HOME/.npm-global/bin:\$HOME/.local/bin && 
cd $REMOTE_PROJECT_DIR && 
echo '🏗️  Building application...' &&
yarn &&
yarn build:prod &&
echo '✅ Build completed successfully!' &&
echo '🔄 Performing zero-downtime reload...' &&
if pm2 describe automapost > /dev/null 2>&1; then
    pm2 reload automapost --update-env
    echo '✅ Application reloaded with zero downtime!'
else
    pm2 start ecosystem.config.js --env production
    echo '✅ Application started for the first time!'
fi
"

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to build and deploy application"
    echo "🔄 Attempting rollback..."
    ssh -i "$KEY_FILE" -p "$VM_PORT" "$VM_USER@$VM_IP" "
    source ~/.bashrc && source ~/.profile && export PATH=\$PATH:\$HOME/.npm-global/bin:\$HOME/.local/bin && 
    cd $REMOTE_PROJECT_DIR && 
    git reset --hard HEAD~1 &&
    yarn build &&
    pm2 reload automapost --update-env
    "
    echo "⚠️  Rollback completed. Please check the application."
    exit 1
fi

echo ""
echo "📝 Step 5: Showing last commit information..."
echo "============================================"
ssh -i "$KEY_FILE" -p "$VM_PORT" "$VM_USER@$VM_IP" "source ~/.bashrc && source ~/.profile && export PATH=\$PATH:\$HOME/.npm-global/bin:\$HOME/.local/bin && cd $REMOTE_PROJECT_DIR && git log -1 --pretty=format:'🕐 Time: %cd%n🔑 Hash: %h%n💬 Message: %s%n👤 Author: %an' --date=format:'%Y-%m-%d %H:%M:%S'"

echo ""
echo ""
echo "📊 Step 6: Checking final PM2 status..."
echo "======================================="
ssh -i "$KEY_FILE" -p "$VM_PORT" "$VM_USER@$VM_IP" "source ~/.bashrc && source ~/.profile && export PATH=\$PATH:\$HOME/.npm-global/bin:\$HOME/.local/bin && cd $REMOTE_PROJECT_DIR && pm2 ls"

echo ""
echo "✅ Deployment completed successfully!"
echo "🌐 Application should be running at: http://$VM_IP:3003"