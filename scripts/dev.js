#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

console.log('🚀 Starting Wasel development server...\n');

// Performance monitoring
const startTime = Date.now();

// Quick environment check (async)
async function checkEnvironment() {
  try {
    await fs.access('.env');
    return true;
  } catch {
    console.log('⚠️  .env file not found. Creating from template...');
    try {
      await fs.copyFile('.env.example', '.env');
      console.log('✅ Created .env file. Please update with your credentials.\n');
      return true;
    } catch {
      console.log('⚠️  No .env.example found. Please create .env manually.\n');
      return false;
    }
  }
}

// Fast dependency check
function checkDependencies() {
  const nodeModulesExists = fsSync.existsSync('node_modules');
  const packageExists = fsSync.existsSync('package.json');

  if (!packageExists) {
    console.error('❌ package.json not found. Run npm init first.');
    process.exit(1);
  }

  if (!nodeModulesExists) {
    console.log('📦 Installing dependencies (first run)...');
    const install = spawn('npm', ['install'], {
      stdio: 'inherit',
      shell: true
    });

    return new Promise((resolve, reject) => {
      install.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Dependencies installed\n');
          resolve();
        } else {
          reject(new Error('Failed to install dependencies'));
        }
      });
    });
  }

  return Promise.resolve();
}

// Optimized dev server startup
async function startDevServer() {
  const envCheckStart = Date.now();
  const envReady = await checkEnvironment();
  console.log(`⏱️  Environment check completed in ${Date.now() - envCheckStart}ms`);

  const depCheckStart = Date.now();
  await checkDependencies();
  console.log(`⏱️  Dependency check completed in ${Date.now() - depCheckStart}ms`);

  console.log('🔥 Starting Vite development server...');
  const serverStart = Date.now();

  // Use optimized Vite flags for faster startup
  const devServer = spawn('vite', ['--host', '--port', '3000'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      VITE_DEV_MODE: 'true'
    }
  });

  // Monitor server startup
  let serverReady = false;
  const startupTimeout = setTimeout(() => {
    if (!serverReady) {
      console.log('⚠️  Server taking longer than expected to start...');
    }
  }, 5000);

  devServer.on('close', (code) => {
    clearTimeout(startupTimeout);
    const uptime = Date.now() - serverStart;
    console.log(`\n🛑 Development server stopped with code ${code} (uptime: ${uptime}ms)`);
  });

  devServer.on('error', (error) => {
    clearTimeout(startupTimeout);
    console.error('\n❌ Development server error:', error.message);
    process.exit(1);
  });

  // Listen for server ready signal
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development server...');
    devServer.kill('SIGINT');
    process.exit(0);
  });

  // Performance logging
  const totalStartupTime = Date.now() - startTime;
  console.log(`\n🚀 Server startup completed in ${totalStartupTime}ms`);

  if (totalStartupTime > 10000) { // 10 seconds
    console.log('💡 Tip: Consider using a faster machine or optimizing dependencies for quicker startup');
  }
}

// Handle uncaught errors gracefully
process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught error:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ Unhandled rejection:', reason);
  process.exit(1);
});

// Start the optimized development server
startDevServer().catch((error) => {
  console.error('\n❌ Failed to start development server:', error.message);
  process.exit(1);
});