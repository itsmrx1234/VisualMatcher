#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🎯 Starting Visual Product Matcher...\n');

// Check if .env exists
if (!existsSync('.env')) {
  console.log('⚠️  No .env file found. Creating from template...');
  try {
    execSync('cp .env.example .env', { stdio: 'inherit' });
    console.log('📝 Created .env file from template.');
    console.log('🔑 Please edit .env and add your GEMINI_API_KEY\n');
  } catch (error) {
    console.log('❌ Could not create .env file. Please copy .env.example to .env manually.\n');
  }
}

// Check for required environment variables
if (!process.env.REPLICATE_API_TOKEN) {
  console.log('⚠️  REPLICATE_API_TOKEN not found in .env file.');
  console.log('🔑 Get your free API token from: https://replicate.com/account/api-tokens');
  console.log('📝 Add it to your .env file as: REPLICATE_API_TOKEN=your_token_here\n');
}

// Build if dist doesn't exist
if (!existsSync('dist/index.js')) {
  console.log('🔨 No build found. Building project...');
  try {
    execSync('node build.js', { stdio: 'inherit' });
    console.log('');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Start the server
console.log('🚀 Starting server...');
console.log('🌐 Opening http://localhost:5000\n');

try {
  process.env.NODE_ENV = 'production';
  execSync('node dist/index.js', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Server failed to start:', error.message);
  process.exit(1);
}