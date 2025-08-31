#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔥 Starting Visual Product Matcher in development mode...\n');

// Check if .env exists
if (!existsSync('.env')) {
  console.log('⚠️  No .env file found. Run setup first:');
  console.log('   node setup.js\n');
  process.exit(1);
}

// Check for required environment variables
if (!process.env.REPLICATE_API_TOKEN) {
  console.log('⚠️  REPLICATE_API_TOKEN not found in .env file.');
  console.log('🔑 Get your free API token from: https://replicate.com/account/api-tokens');
  console.log('📝 Add it to your .env file as: REPLICATE_API_TOKEN=your_token_here\n');
}

console.log('🚀 Starting development server...');
console.log('🌐 Frontend: http://localhost:5173');
console.log('🔧 Backend: http://localhost:5000');
console.log('👀 Watching for changes...\n');

// Start the development server
const devProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

// Handle process exit
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  devProcess.kill('SIGINT');
  process.exit(0);
});

devProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`\n❌ Development server exited with code ${code}`);
  }
  process.exit(code);
});