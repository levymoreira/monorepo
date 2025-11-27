# PM2 Usage Guide

This project includes PM2 configuration for production deployment and process management.

## Prerequisites

Install PM2 globally:
```bash
npm install -g pm2
pm2 deploy production setup # deploys the code in the remote
pm2 deploy production # once setup is done you can just run that 
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run pm2:deploy` | Build and start the application with PM2 |
| `npm run pm2:start` | Start the application using PM2 |
| `npm run pm2:stop` | Stop the application |
| `npm run pm2:restart` | Restart the application |
| `npm run pm2:delete` | Delete the application from PM2 |
| `npm run pm2:logs` | View application logs |
| `npm run pm2:monit` | Open PM2 monitoring dashboard |

## Quick Start

1. **Deploy to production:**
   ```bash
   npm run pm2:deploy
   ```

2. **View logs:**
   ```bash
   npm run pm2:logs
   ```

3. **Monitor performance:**
   ```bash
   npm run pm2:monit
   ```

## Configuration

The PM2 configuration is defined in `ecosystem.config.js`:

- **Instances**: Runs in cluster mode with maximum CPU cores
- **Memory limit**: Auto-restart if memory usage exceeds 1GB
- **Logs**: Stored in `./logs/` directory
- **Auto-restart**: Enabled with 10 max restarts
- **Port**: 3000 (configurable via environment)

## Log Files

- Error logs: `./logs/err.log`
- Output logs: `./logs/out.log`
- Combined logs: `./logs/combined.log`

## Environment Variables

Set these in your production environment:
- `NODE_ENV=production`
- `PORT=3000` (or your preferred port)

## Deployment

For automated deployment, the configuration is already set up for Azure deployment:

### First-time setup:
```bash
pm2 deploy production setup
```

### Subsequent deployments:
```bash
pm2 deploy production
```

### Troubleshooting Deployment:

1. **SSH Key Issues**: Ensure your SSH key has proper permissions:
   ```bash
   chmod 600 ~/w/server-azure/secrets/onevmforall_key.pem
   ```

2. **Git Access**: Make sure your Azure server has access to your GitHub repo:
   ```bash
   # On the server, test git access:
   git clone git@github.com:levymoreira/automapost.git
   ```

3. **NVM Setup**: Ensure NVM is properly installed and configured on the server:
   ```bash
   # On the server, check if NVM is available:
   source ~/.nvm/nvm.sh
   nvm --version
   
   # Install and use a Node.js version:
   nvm install node
   nvm use node
   nvm alias default node
   ```

4. **Node.js Version**: Verify Node.js and npm are working:
   ```bash
   # On the server:
   node --version
   npm --version
   ```

5. **PM2 Installation**: PM2 should be installed globally on the server:
   ```bash
   # On the server:
   npm install -g pm2
   ```

6. **NVM in Non-Interactive Shells**: The deployment script automatically sources NVM, but you can test it manually:
   ```bash
   # Test the same command used in deployment:
   source ~/.nvm/nvm.sh && nvm use node && npm --version
   ```
