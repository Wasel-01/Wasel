#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Wasel development server...\n');

// Check environment
try {
  if (!fs.existsSync('.env')) {
    console.log('⚠️  .env file not found. Creating from template...');
    if (fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', '.env');
      console.log('✅ Created .env file. Please update with your credentials.\n');
    } else {
      console.log('⚠️  No .env.example found. Please create .env manually.\n');
    }
  }
} catch (error) {
  console.error('Error setting up environment:', error.message);
}

// Start dev server
console.log('🔥 Starting Vite development server...');
const devServer = spawn('vite', [], { 
  stdio: 'inherit',
  shell: true 
});

devServer.on('close', (code) => {
  console.log(`\n🛑 Development server stopped with code ${code}`);
});

devServer.on('error', (error) => {
  console.error('\n❌ Development server error:', error.message);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  devServer.kill('SIGINT');
  process.exit(0);
});