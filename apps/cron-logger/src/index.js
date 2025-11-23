const cron = require('node-cron');

const MESSAGE = process.env.CRON_MESSAGE || 'cron-logger heartbeat';

console.log('Cron logger booted, scheduling job every minute.');

cron.schedule('* * * * *', () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${MESSAGE}`);
});

process.on('SIGTERM', () => {
  console.log('Cron logger received SIGTERM, exiting.');
  process.exit(0);
});
