#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🏭 Preparing production build...');

try {
  // Copy production env to local env
  fs.copyFileSync('.env.production', '.env.local');
  console.log('✅ Copied .env.production to .env.local');
  
  // Run the build
  console.log('🔨 Running next build...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('✅ Production build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
