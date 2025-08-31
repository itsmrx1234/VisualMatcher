#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

console.log('🚀 Building Visual Product Matcher...\n');

try {
  // Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  if (existsSync('dist')) {
    execSync("npx rimraf dist",
 { stdio: 'inherit' });
  }
  if (existsSync('client/dist')) {
    execSync('npx rimraf client/dist', { stdio: 'inherit' });
  }

  // Build client (React frontend)
  console.log('⚛️  Building React frontend...');
  execSync('npx vite build --config vite.local.config.ts', { stdio: 'inherit' });

  // Build server (Express backend)
  console.log('🔧 Building Express backend...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });

  // Copy uploads directory if it exists
  if (existsSync('server/uploads')) {
    console.log('📁 Copying uploads directory...');
    mkdirSync('dist', { recursive: true });
    execSync('cp -r server/uploads dist/', { stdio: 'inherit' });
  }

  console.log('\n✅ Build completed successfully!');
  console.log('🎯 Ready to start with: npm start');

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}