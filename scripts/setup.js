#!/usr/bin/env node

const fs = require('fs').promises;
const fsSync = require('fs');
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Setting up Wasel project...\n');

// Performance monitoring
const startTime = Date.now();
let lastStepTime = startTime;

// Progress tracking
let completedSteps = 0;
const totalSteps = 6;

function logProgress(step, message) {
  completedSteps++;
  const duration = Date.now() - lastStepTime;
  console.log(`[${completedSteps}/${totalSteps}] ${step}: ${message} (${duration}ms)`);
  lastStepTime = Date.now();
}

// Async Node version check
async function checkNodeVersion() {
  const nodeVersion = process.version;
  console.log(`📦 Node.js version: ${nodeVersion}`);

  if (parseInt(nodeVersion.slice(1)) < 18) {
    console.error('❌ Node.js 18+ is required');
    process.exit(1);
  }
  logProgress('Node.js Check', 'Compatible version found');
}

// Async dependency installation with progress
function installDependencies() {
  return new Promise((resolve, reject) => {
    console.log('📥 Installing dependencies...');
    const installStart = Date.now();

    const install = spawn('npm', ['install'], {
      stdio: ['pipe', 'pipe', 'inherit'],
      shell: true
    });

    let output = '';

    install.stdout.on('data', (data) => {
      output += data.toString();
      // Show progress for large installations
      if (output.includes('packages from')) {
        console.log('📦 Installing packages...');
      }
    });

    install.on('close', (code) => {
      const duration = Date.now() - installStart;
      if (code === 0) {
        logProgress('Dependencies', `Installed successfully (${duration}ms)`);
        resolve();
      } else {
        reject(new Error(`Installation failed with code ${code}`));
      }
    });

    install.on('error', (error) => {
      reject(new Error(`Installation error: ${error.message}`));
    });
  });
}

// Async environment setup
async function setupEnvironment() {
  try {
    await fs.access('.env');
    logProgress('Environment', 'File already exists');
    return;
  } catch {
    console.log('⚙️  Setting up environment...');
    try {
      await fs.access('.env.example');
      await fs.copyFile('.env.example', '.env');
      logProgress('Environment', 'Created from template');
    } catch {
      await fs.writeFile('.env', 'VITE_SUPABASE_URL=\nVITE_SUPABASE_ANON_KEY=\nVITE_SUPABASE_PROJECT_ID=\n');
      logProgress('Environment', 'Created template file');
    }
  }
}

// Async directory creation
async function createDirectories() {
  const dirs = ['dist', 'logs', 'uploads', 'public', 'src/assets'];
  const createPromises = dirs.map(async (dir) => {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
      console.log(`📁 Created ${dir} directory`);
    }
  });

  await Promise.all(createPromises);
  logProgress('Directories', `Created ${dirs.length} directories`);
}

// Health check after setup
async function runHealthCheck() {
  console.log('🏥 Running post-setup health check...');

  const checks = [
    { name: 'node_modules', check: () => fsSync.existsSync('node_modules') },
    { name: '.env file', check: () => fsSync.existsSync('.env') },
    { name: 'package.json', check: () => fsSync.existsSync('package.json') },
    { name: 'src directory', check: () => fsSync.existsSync('src') }
  ];

  let passed = 0;
  for (const { name, check } of checks) {
    if (check()) {
      passed++;
    } else {
      console.log(`❌ Missing: ${name}`);
    }
  }

  logProgress('Health Check', `${passed}/${checks.length} checks passed`);
  return passed === checks.length;
}

// Main setup process
async function runSetup() {
  try {
    await checkNodeVersion();
    await installDependencies();
    await setupEnvironment();
    await createDirectories();

    const healthPassed = await runHealthCheck();

    const totalDuration = Date.now() - startTime;
    console.log(`\n🎉 Setup completed successfully in ${totalDuration}ms!`);

    if (healthPassed) {
      console.log('✅ All health checks passed');
    } else {
      console.log('⚠️  Some health checks failed - you may need to fix issues manually');
    }

    console.log('\n💡 Next steps:');
    console.log('   1. Update .env with your Supabase credentials');
    console.log('   2. Run "npm run dev" to start development');
    console.log('   3. Visit http://localhost:3000');

    if (totalDuration > 60000) { // 1 minute
      console.log('\n💡 Tip: Setup took longer than expected. Consider using faster internet or npm cache.');
    }

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`\n❌ Setup failed after ${totalDuration}ms:`, error.message);
    process.exit(1);
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

// Run the optimized setup
runSetup();