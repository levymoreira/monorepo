module.exports = {
  apps: [
    {
      name: 'automapost',
      script: 'server.js',
      cwd: './',
      instances: 'max', // 4 instances with load balancing
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      // PM2 configuration
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      // Auto restart configuration
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // Health monitoring
      kill_timeout: 5000,
      listen_timeout: 8000,
      // Zero-downtime deployment settings
      wait_ready: true,
      reload_delay: 1000,
      // Advanced features
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ],
  
  deploy: {
    production: {
      user: 'azureuser',
      key: '~/w/server-azure/secrets/onevmforall_key.pem',
      host: ["20.238.16.25"],
      ref: 'origin/main',
      repo: 'git@github.com:levymoreira/automapost.git',
      path: '/home/azureuser/automapost',
      'pre-deploy-local': '',
      'post-deploy': 'source ~/.bashrc && yarn install && yarn build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}
