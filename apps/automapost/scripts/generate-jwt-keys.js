#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Create keys directory if it doesn't exist
const keysDir = path.join(process.cwd(), 'keys');
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

// Save keys to files
fs.writeFileSync(path.join(keysDir, 'private.key'), privateKey);
fs.writeFileSync(path.join(keysDir, 'public.key'), publicKey);

console.log('✅ JWT RSA keys generated successfully!');
console.log('📁 Keys saved to:', keysDir);
console.log('\n⚠️  Important: Add /keys to your .gitignore file!');
console.log('\n📝 Add these to your .env.local file:');
console.log(`JWT_PRIVATE_KEY_PATH="${path.join(keysDir, 'private.key')}"`);
console.log(`JWT_PUBLIC_KEY_PATH="${path.join(keysDir, 'public.key')}"`);
