#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, writeFileSync, readFileSync } from 'fs';

console.log('🔧 Setting up Visual Product Matcher for local development...\n');

try {
  // Check if package.json exists
  if (!existsSync('package.json') && existsSync('package.local.json')) {
    console.log('📦 Setting up package.json...');
    execSync('cp package.local.json package.json', { stdio: 'inherit' });
  }

  // Create .env from template if it doesn't exist
  if (!existsSync('.env')) {
    console.log('📝 Creating .env file...');
    execSync('cp .env.example .env', { stdio: 'inherit' });
    console.log('🔑 Please edit .env and add your REPLICATE_API_TOKEN');
    console.log('   Get it from: https://replicate.com/account/api-tokens\n');
  }

  // Install dependencies
  console.log('⬇️  Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Make scripts executable
  console.log('🔧 Making scripts executable...');
  try {
    execSync('chmod +x build.js start.js setup.js', { stdio: 'inherit' });
  } catch (error) {
    // Windows doesn't need chmod, ignore error
  }

  console.log('\n✅ Setup completed successfully!');
  console.log('\n🚀 Quick start:');
  console.log('1. Edit .env and add your REPLICATE_API_TOKEN');
  console.log('2. Run: npm start');
  console.log('3. Open: http://localhost:5000\n');

} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  console.log('\n🔧 Manual setup:');
  console.log('1. Copy package.local.json to package.json');
  console.log('2. Copy .env.example to .env');
  console.log('3. Edit .env and add your GEMINI_API_KEY');
  console.log('4. Run: npm install');
  console.log('5. Run: npm start');
  process.exit(1);
}