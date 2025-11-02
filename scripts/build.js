#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const os = require('os');

console.log('🚀 Starting Wasel build process...\n');

// Performance monitoring
const startTime = Date.now();
let lastStepTime = startTime;

// Performance logging function
function logStep(step, startTime) {
  const duration = Date.now() - startTime;
  console.log(`⏱️  ${step} completed in ${duration}ms`);
  return Date.now();
}

// Check if .env file exists (async)
async function setupEnvironment() {
  try {
    await fs.access('.env');
  } catch {
    console.log('⚠️  .env file not found. Creating from template...');
    try {
      await fs.copyFile('.env.example', '.env');
      console.log('✅ Created .env file. Please update with your credentials.\n');
    } catch {
      console.log('⚠️  No .env.example found. Continuing without environment file.\n');
    }
  }
}

// Parallel type check and build preparation
async function runBuildProcess() {
  const buildStart = Date.now();

  // Setup environment
  await setupEnvironment();
  lastStepTime = logStep('Environment setup', lastStepTime);

  // Run type check and build in parallel where possible
  console.log('🔍 Running TypeScript type check...');
  const typeCheckPromise = new Promise((resolve, reject) => {
    const typeCheck = spawn('npm', ['run', 'typecheck'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    let output = '';
    let errorOutput = '';

    typeCheck.stdout.on('data', (data) => {
      output += data.toString();
    });

    typeCheck.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    typeCheck.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Type check failed: ${errorOutput}`));
      }
    });
  });

  try {
    await typeCheckPromise;
    lastStepTime = logStep('TypeScript type check', lastStepTime);
    console.log('✅ Type check passed\n');
  } catch (error) {
    console.error('❌ Type check failed:', error.message);
    process.exit(1);
  }

  // Build with performance monitoring
  console.log('🏗️  Building application...');
  const buildStartTime = Date.now();

  const buildPromise = new Promise((resolve, reject) => {
    const build = spawn('vite', ['build'], {
      stdio: ['pipe', 'inherit', 'inherit'],
      shell: true
    });

    build.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error('Build failed'));
      }
    });
  });

  try {
    await buildPromise;
    lastStepTime = logStep('Application build', lastStepTime);
    console.log('✅ Build completed\n');
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }

  // Fast build output check (async)
  const distPath = path.join(__dirname, '..', 'dist');
  try {
    const files = await fs.readdir(distPath);
    console.log(`📦 Build output (${files.length} files):`);
    // Limit output for performance
    files.slice(0, 10).forEach(file => console.log(`   - ${file}`));
    if (files.length > 10) {
      console.log(`   ... and ${files.length - 10} more files`);
    }
  } catch (error) {
    console.warn('⚠️  Could not check build output:', error.message);
  }

  const totalDuration = Date.now() - buildStart;
  console.log(`\n🎉 Build process completed successfully in ${totalDuration}ms!`);
  console.log('💡 Run "npm run preview" to test the production build');

  // Performance check
  if (totalDuration > 30000) { // 30 seconds
    console.log('\n⚠️  Build took longer than 30 seconds. Consider optimization.');
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught error:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ Unhandled rejection:', reason);
  process.exit(1);
});

// Run the optimized build process
runBuildProcess().catch((error) => {
  console.error('\n❌ Build process failed:', error.message);
  process.exit(1);
});