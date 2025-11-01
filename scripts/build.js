#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Wasel build process...\n');

// Check if .env file exists
try {
  if (!fs.existsSync('.env')) {
    console.log('⚠️  .env file not found. Creating from template...');
    if (fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', '.env');
      console.log('✅ Created .env file. Please update with your credentials.\n');
    } else {
      console.log('⚠️  No .env.example found. Continuing without environment file.\n');
    }
  }
} catch (error) {
  console.warn('Warning: Could not setup environment file:', error.message);
}

try {
  // Type check
  console.log('🔍 Running TypeScript type check...');
  execSync('npm run typecheck', { stdio: 'inherit' });
  console.log('✅ Type check passed\n');

  // Build
  console.log('🏗️  Building application...');
  execSync('vite build', { stdio: 'inherit' });
  console.log('✅ Build completed\n');

  // Check build output
  const distPath = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    console.log(`📦 Build output (${files.length} files):`);
    files.forEach(file => console.log(`   - ${file}`));
  }

  console.log('\n🎉 Build process completed successfully!');
  console.log('💡 Run "npm run preview" to test the production build');

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}