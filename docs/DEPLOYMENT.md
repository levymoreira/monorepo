# Deployment Guide

This guide explains how to deploy your applications to Azure Container Registry and update the remote server with zero downtime.

## Overview

The deployment process:
1. **Increments version** - Automatically increments patch version (e.g., 0.0.1 → 0.0.2)
2. **Builds images** - Builds all Docker images locally
3. **Tags images** - Tags with version and `latest`
4. **Pushes to ACR** - Uploads to Azure Container Registry (`monoreporegistry.azurecr.io`)
5. **Triggers server update** - SSHs to server and runs update script
6. **Zero-downtime update** - Server pulls latest images and updates services gracefully

## Prerequisites

1. **Azure CLI** (recommended) or Docker CLI configured
2. **ACR Access** - Access to `monoreporegistry.azurecr.io`
3. **SSH Access** - SSH key and access to remote server
4. **Server Setup** - Docker Compose installed on remote server

## Quick Start

### 1. Configure Deployment

Copy the example configuration file:

```bash
cp .deploy.env.example .deploy.env
```

Edit `.deploy.env` with your server details:

```bash
# Azure Container Registry
ACR_REGISTRY=monoreporegistry.azurecr.io

# Server Configuration
SERVER_HOST=your-server-ip-or-hostname
SERVER_USER=azureuser
SERVER_PATH=/opt/azure-sites-poc

# SSH Key (optional, defaults to ~/.ssh/id_rsa)
SSH_KEY=~/.ssh/your-key.pem

# Project name
PROJECT_NAME=azure-sites-poc
```

### 2. Login to Azure Container Registry

**Option A: Using Azure CLI (Recommended)**
```bash
az login
az acr login --name monoreporegistry
```

**Option B: Using Docker CLI**
```bash
# Get ACR credentials
az acr credential show --name monoreporegistry

# Login with Docker
docker login monoreporegistry.azurecr.io
# Enter username and password from above command
```

### 3. Deploy

Run the deployment script:

```bash
./scripts/deploy.sh
```

Or use the Makefile:

```bash
make deploy
```

## How It Works

### Version Management

- Version is stored in `.version` file (e.g., `0.0.1`)
- Each deployment increments the patch version (`0.0.1` → `0.0.2`)
- Images are tagged with both version and `latest`:
  - `monoreporegistry.azurecr.io/azure-sites-poc-next-app-one:0.0.2`
  - `monoreporegistry.azurecr.io/azure-sites-poc-next-app-one:latest`

### Deployment Process

1. **Local Build Phase:**
   ```
   - Reads current version from .version
   - Increments version (patch +1)
   - Builds all Docker images
   - Tags images with version and latest
   ```

2. **ACR Push Phase:**
   ```
   - Logs in to Azure Container Registry
   - Pushes all images (versioned and latest tags)
   ```

3. **Server Update Phase:**
   ```
   - Copies get-latest-docker-images.sh to server
   - SSHs to server and executes update script
   - Server pulls latest images from ACR
   - Updates services with zero downtime
   ```

### Zero-Downtime Strategy

The server update script (`get-latest-docker-images.sh`) ensures zero downtime by:

1. **Pulling latest images** - Pulls `:latest` tag from ACR
2. **Scaling up** - Uses Docker Compose `--scale` to ensure redundancy
3. **Graceful replacement** - Docker Compose replaces old containers with new ones
4. **Health checks** - Waits for new containers to be healthy
5. **Verification** - Confirms all services are running

## Server Setup

### Initial Server Configuration

1. **Install Docker and Docker Compose:**
   ```bash
   # On Ubuntu/Debian
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   
   # Install Docker Compose
   sudo apt-get update
   sudo apt-get install docker-compose-plugin
   ```

2. **Clone repository on server:**
   ```bash
   git clone <your-repo-url> /opt/azure-sites-poc
   cd /opt/azure-sites-poc
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   # Edit .env with your production configuration
   ```

4. **Create `scripts/` directory:**
   ```bash
   mkdir -p scripts
   ```

5. **Configure ACR access on server:**
   ```bash
   # Login to ACR
   az acr login --name monoreporegistry
   # or
   docker login monoreporegistry.azurecr.io
   ```

6. **Initial deployment:**
   ```bash
   make up
   ```

### SSH Key Setup

For passwordless SSH access:

1. **Generate SSH key (if needed):**
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/deploy_key -C "deploy@your-machine"
   ```

2. **Copy public key to server:**
   ```bash
   ssh-copy-id -i ~/.ssh/deploy_key.pub azureuser@your-server-ip
   ```

3. **Update `.deploy.env`:**
   ```bash
   SSH_KEY=~/.ssh/deploy_key
   ```

4. **Test SSH connection:**
   ```bash
   ssh -i ~/.ssh/deploy_key azureuser@your-server-ip
   ```

## Manual Server Update

If you need to manually update the server:

1. **SSH to server:**
   ```bash
   ssh -i ~/.ssh/your-key.pem azureuser@your-server-ip
   ```

2. **Run update script:**
   ```bash
   cd /opt/azure-sites-poc
   ACR_REGISTRY=monoreporegistry.azurecr.io \
   PROJECT_NAME=azure-sites-poc \
   bash scripts/get-latest-docker-images.sh
   ```

## Troubleshooting

### Deployment Fails at ACR Login

**Problem:** Cannot login to Azure Container Registry

**Solutions:**
```bash
# Try Azure CLI login
az login
az acr login --name monoreporegistry

# Or get credentials and use Docker login
az acr credential show --name monoreporegistry
docker login monoreporegistry.azurecr.io
```

### SSH Connection Fails

**Problem:** Cannot connect to server via SSH

**Solutions:**
1. **Check SSH key path:**
   ```bash
   ls -la ~/.ssh/your-key.pem
   ```

2. **Test SSH manually:**
   ```bash
   ssh -i ~/.ssh/your-key.pem azureuser@your-server-ip
   ```

3. **Check server firewall** - Ensure port 22 is open

4. **Verify SSH key permissions:**
   ```bash
   chmod 600 ~/.ssh/your-key.pem
   ```

### Server Update Fails

**Problem:** Server cannot pull images or update services

**Solutions:**
1. **Check ACR access on server:**
   ```bash
   ssh -i ~/.ssh/your-key.pem azureuser@your-server-ip
   docker login monoreporegistry.azurecr.io
   ```

2. **Check Docker Compose:**
   ```bash
   docker compose version
   ```

3. **Check service status:**
   ```bash
   docker compose ps
   docker compose logs
   ```

4. **Manually pull and update:**
   ```bash
   docker pull monoreporegistry.azurecr.io/azure-sites-poc-next-app-one:latest
   docker compose up -d --scale next-app-one=2 next-app-one
   ```

### Version File Issues

**Problem:** Version not incrementing or file missing

**Solutions:**
1. **Create version file manually:**
   ```bash
   echo "0.0.0" > .version
   ```

2. **Check version file:**
   ```bash
   cat .version
   ```

3. **Reset version:**
   ```bash
   echo "0.0.1" > .version
   ```

## Advanced Usage

### Deploy Specific Service

To deploy only one service, modify `SERVICES` array in `scripts/deploy.sh`:

```bash
SERVICES=("next-app-one") ./scripts/deploy.sh
```

### Custom Version Format

To use semantic versioning with major/minor increments, modify the `increment_version()` function in `scripts/deploy.sh`.

### CI/CD Integration

**GitHub Actions Example:**

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Deploy
        env:
          SERVER_HOST: ${{ secrets.SERVER_HOST }}
          SERVER_USER: ${{ secrets.SERVER_USER }}
          SSH_KEY: ${{ secrets.SSH_KEY }}
        run: |
          cp .deploy.env.example .deploy.env
          echo "SERVER_HOST=$SERVER_HOST" >> .deploy.env
          echo "SERVER_USER=$SERVER_USER" >> .deploy.env
          echo "SSH_KEY=$SSH_KEY" >> .deploy.env
          ./scripts/deploy.sh
```

## Security Best Practices

1. **Never commit `.deploy.env`** - Already in `.gitignore`
2. **Use SSH keys** - Avoid password authentication
3. **Rotate credentials** - Regularly update ACR and SSH credentials
4. **Restrict ACR access** - Use service principals with minimal permissions
5. **Secure SSH** - Use key-only authentication, disable password auth
6. **Monitor deployments** - Review logs after each deployment

## Files Created

- `scripts/deploy.sh` - Main deployment script (runs locally)
- `scripts/get-latest-docker-images.sh` - Server update script
- `.deploy.env.example` - Configuration template
- `.version` - Version tracking file (auto-created)
- `.gitignore` - Excludes sensitive files

## Support

For issues:
1. Check the troubleshooting section above
2. Review deployment logs
3. Check server logs: `docker compose logs`
4. Verify ACR access: `az acr repository list --name monoreporegistry`
