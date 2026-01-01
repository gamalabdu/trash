/**
 * Quick verification script for .env.local
 * Run: node verify-env.js
 */

console.log('🔍 Verifying environment setup...\n');

// Test 1: Check if dotenv can load the file
const dotenv = require('dotenv');
const path = require('path');

const envLocalPath = path.resolve(__dirname, '.env.local');
console.log('1. Checking .env.local file...');
console.log('   Path:', envLocalPath);

try {
  const result = dotenv.config({ path: envLocalPath, override: true });
  
  if (result.error) {
    console.log('   ❌ Error:', result.error.message);
    process.exit(1);
  }
  
  if (result.parsed) {
    console.log('   ✅ File parsed successfully');
    console.log('   Keys found:', Object.keys(result.parsed).join(', '));
    
    if (result.parsed.STRIPE_SECRET_KEY) {
      const key = result.parsed.STRIPE_SECRET_KEY;
      console.log('\n2. Checking STRIPE_SECRET_KEY...');
      console.log('   ✅ Key found');
      console.log('   Length:', key.length);
      console.log('   Starts with:', key.substring(0, 15) + '...');
      console.log('   Is test key:', key.startsWith('sk_test_'));
      console.log('   Is live key:', key.startsWith('sk_live_'));
      
      if (!key.startsWith('sk_')) {
        console.log('   ❌ ERROR: Key should start with sk_test_ or sk_live_');
        process.exit(1);
      }
    } else {
      console.log('\n2. Checking STRIPE_SECRET_KEY...');
      console.log('   ❌ STRIPE_SECRET_KEY not found in parsed result!');
      console.log('   Available keys:', Object.keys(result.parsed));
      process.exit(1);
    }
  } else {
    console.log('   ⚠️  No parsed result (file might be empty or have syntax errors)');
    process.exit(1);
  }
} catch (error) {
  console.log('   ❌ Exception:', error.message);
  process.exit(1);
}

// Test 2: Check process.env
console.log('\n3. Checking process.env...');
if (process.env.STRIPE_SECRET_KEY) {
  console.log('   ✅ STRIPE_SECRET_KEY is in process.env');
  console.log('   Value preview:', process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...');
} else {
  console.log('   ❌ STRIPE_SECRET_KEY is NOT in process.env');
  process.exit(1);
}

// Test 3: Try to initialize Stripe (without making API calls)
console.log('\n4. Testing Stripe initialization...');
try {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  console.log('   ✅ Stripe client initialized successfully');
  console.log('   (Note: This doesn\'t test API connectivity)');
} catch (error) {
  console.log('   ❌ Error initializing Stripe:', error.message);
  process.exit(1);
}

console.log('\n✅ All checks passed! Your .env.local file is configured correctly.');
console.log('   Make sure to restart your server: npm run server');



