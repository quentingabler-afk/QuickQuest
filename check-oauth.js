// Run this to check if OAuth is configured correctly
// Usage: node check-oauth.js

require('dotenv').config();

console.log('\n=== OAUTH CONFIGURATION CHECK ===\n');

let hasErrors = false;

// Check environment variables
console.log('1. Checking .env file...');
const requiredEnvVars = {
  'DATABASE_URL': process.env.DATABASE_URL,
  'JWT_SECRET': process.env.JWT_SECRET,
  'RESEND_API_KEY': process.env.RESEND_API_KEY,
  'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
  'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
  'GITHUB_CLIENT_ID': process.env.GITHUB_CLIENT_ID,
  'GITHUB_CLIENT_SECRET': process.env.GITHUB_CLIENT_SECRET,
  'FRONTEND_URL': process.env.FRONTEND_URL,
};

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value || value.includes('your-') || value.includes('YOUR_')) {
    console.log(`   ❌ ${key}: MISSING or PLACEHOLDER`);
    hasErrors = true;
  } else {
    console.log(`   ✅ ${key}: ${value.substring(0, 20)}...`);
  }
}

// Check if required files exist
console.log('\n2. Checking required files...');
const fs = require('fs');
const requiredFiles = [
  'src/config/passport.js',
  'src/controllers/oauth.controller.js',
  'src/routes/auth.routes.js',
  'src/utils/email.js',
  'src/utils/jwt.js',
];

for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file}: NOT FOUND`);
    hasErrors = true;
  }
}

// Check if packages are installed
console.log('\n3. Checking installed packages...');
const requiredPackages = [
  'passport',
  'passport-google-oauth20',
  'passport-github2',
  'resend',
  'express',
  '@prisma/client',
];

for (const pkg of requiredPackages) {
  try {
    require.resolve(pkg);
    console.log(`   ✅ ${pkg}`);
  } catch (e) {
    console.log(`   ❌ ${pkg}: NOT INSTALLED`);
    hasErrors = true;
  }
}

// Try to load passport config
console.log('\n4. Testing passport configuration...');
try {
  const passport = require('./src/config/passport');
  console.log('   ✅ Passport loaded successfully');
} catch (e) {
  console.log(`   ❌ Passport failed to load: ${e.message}`);
  hasErrors = true;
}

// Check FRONTEND_URL format
console.log('\n5. Checking FRONTEND_URL format...');
if (process.env.FRONTEND_URL) {
  if (process.env.FRONTEND_URL.includes('.html')) {
    console.log(`   ⚠️  FRONTEND_URL should NOT include .html file`);
    console.log(`   Current: ${process.env.FRONTEND_URL}`);
    console.log(`   Should be: http://localhost:3000`);
    hasErrors = true;
  } else {
    console.log(`   ✅ FRONTEND_URL format correct: ${process.env.FRONTEND_URL}`);
  }
}

// Summary
console.log('\n=== SUMMARY ===\n');
if (hasErrors) {
  console.log('❌ OAuth configuration has errors. Fix the issues above.\n');
  process.exit(1);
} else {
  console.log('✅ OAuth configuration looks good!\n');
  console.log('Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Visit: http://localhost:5000/api/auth/google');
  console.log('3. Should redirect to Google login\n');
  process.exit(0);
}
