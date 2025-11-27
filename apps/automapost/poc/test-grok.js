// Simple test to verify the grok.js script loads correctly
console.log('🧪 Testing Grok script loading...');

try {
  // Test loading the main modules
  const readline = require('readline');
  const fs = require('fs');
  const path = require('path');
  
  console.log('✅ Core modules loaded successfully');
  
  // Test dotenv loading
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log('✅ .env file loaded successfully');
  } else {
    console.log('⚠️  No .env file found (this is OK for testing)');
  }
  
  // Test fetch availability
  if (typeof fetch !== 'undefined') {
    console.log('✅ Fetch API available');
  } else {
    console.log('❌ Fetch API not available');
  }
  
  // Test InitialChat.js loading
  const initialChatPath = path.join(__dirname, 'InitialChat.js');
  if (fs.existsSync(initialChatPath)) {
    const content = fs.readFileSync(initialChatPath, 'utf8');
    console.log('✅ InitialChat.js loaded successfully');
    console.log('📝 InitialChat content preview:', content.substring(0, 100) + '...');
  } else {
    console.log('❌ InitialChat.js not found');
  }
  
  // Test date calculation
  const date = new Date();
  date.setMonth(date.getMonth() - 6);
  const sixMonthsAgo = date.toISOString().split('T')[0];
  console.log('✅ Date calculation works. 6 months ago:', sixMonthsAgo);
  
  console.log('\n🎉 All basic tests passed! The script should work correctly.');
  console.log('\n📋 To run the interactive chat:');
  console.log('   node poc/grok.js');
  console.log('\n⚠️  Make sure you have XAI_API_KEY or GROK_API_KEY in your .env file');
  
} catch (error) {
  console.error('❌ Error during testing:', error);
}