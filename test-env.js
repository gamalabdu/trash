/**
 * Test script to verify .env.local is loading correctly
 * Run: node test-env.js
 */

const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

console.log('🔍 Testing .env.local file loading...\n');

const envLocalPath = path.resolve(__dirname, '.env.local');

if (!fs.existsSync(envLocalPath)) {
  console.error('❌ .env.local file not found at:', envLocalPath);
  process.exit(1);
}

console.log('✅ .env.local file exists');
console.log('   Path:', envLocalPath);
console.log('');

// Read the raw file content
const fileContent = fs.readFileSync(envLocalPath, 'utf8');
console.log('📄 File content:');
console.log('---');
console.log(fileContent);
console.log('---');
console.log('');

// Check for common issues
const lines = fileContent.split('\n');
lines.forEach((line, index) => {
  const lineNum = index + 1;
  const trimmed = line.trim();
  
  if (trimmed && trimmed.includes('STRIPE_SECRET_KEY')) {
    console.log(`📝 Line ${lineNum}: Found STRIPE_SECRET_KEY`);
    
    if (trimmed.includes('=')) {
      const parts = trimmed.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        
        console.log(`   Key: "${key}"`);
        console.log(`   Value length: ${value.length}`);
        console.log(`   Value starts with: "${value.substring(0, 20)}..."`);
        
        if (value.startsWith('sk_test_') || value.startsWith('sk_live_')) {
          console.log('   ✅ Format looks correct');
        } else {
          console.log('   ⚠️  Value should start with sk_test_ or sk_live_');
        }
        
        // Check for common issues
        if (value.includes('"') || value.includes("'")) {
          console.log('   ⚠️  WARNING: Value contains quotes - remove them!');
        }
        if (key !== 'STRIPE_SECRET_KEY') {
          console.log('   ⚠️  WARNING: Key name has extra spaces');
        }
        if (line !== trimmed) {
          console.log('   ⚠️  WARNING: Line has leading/trailing whitespace');
        }
      }
    } else {
      console.log(`   ❌ ERROR: Line ${lineNum} doesn't contain = sign`);
    }
  }
});

console.log('\n🔧 Testing dotenv parsing...\n');

// Try to parse with dotenv
const result = dotenv.config({ path: envLocalPath });

if (result.error) {
  console.error('❌ Error parsing .env.local:', result.error.message);
  process.exit(1);
}

if (result.parsed) {
  console.log('✅ dotenv parsed the file');
  console.log('   Parsed keys:', Object.keys(result.parsed).join(', '));
  
  if (result.parsed.STRIPE_SECRET_KEY) {
    const key = result.parsed.STRIPE_SECRET_KEY;
    console.log('\n✅ STRIPE_SECRET_KEY was parsed successfully!');
    console.log('   Length:', key.length);
    console.log('   Starts with:', key.substring(0, 12) + '...');
    console.log('   Is test key:', key.startsWith('sk_test_'));
  } else {
    console.error('\n❌ STRIPE_SECRET_KEY was NOT found in parsed result!');
    console.error('   Available keys:', Object.keys(result.parsed).join(', '));
  }
} else {
  console.error('❌ dotenv returned no parsed result');
}

// Check process.env
console.log('\n🌍 Checking process.env...\n');
if (process.env.STRIPE_SECRET_KEY) {
  console.log('✅ STRIPE_SECRET_KEY is in process.env');
  console.log('   Value:', process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...');
} else {
  console.error('❌ STRIPE_SECRET_KEY is NOT in process.env');
}



