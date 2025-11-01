#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 Setting up Wasel project...\n');

try {
  // Check Node version
  const nodeVersion = process.version;
  console.log(`📦 Node.js version: ${nodeVersion}`);
  
  if (parseInt(nodeVersion.slice(1)) < 18) {
    console.error('❌ Node.js 18+ is required');
    process.exit(1);
  }

  // Install dependencies
  console.log('📥 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    throw error;
  }

  // Setup environment
  if (!fs.existsSync('.env')) {
    console.log('⚙️  Setting up environment...');
    try {
      if (fs.existsSync('.env.example')) {
        fs.copyFileSync('.env.example', '.env');
        console.log('✅ Environment file created\n');
      } else {
        fs.writeFileSync('.env', 'VITE_SUPABASE_URL=\nVITE_SUPABASE_ANON_KEY=\nVITE_SUPABASE_PROJECT_ID=\n');
        console.log('✅ Environment template created\n');
      }
    } catch (error) {
      console.error('❌ Failed to create environment file:', error.message);
    }
  }

  // Create necessary directories
  const dirs = ['dist', 'logs', 'uploads'];
  dirs.forEach(dir => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created ${dir} directory`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not create ${dir} directory:`, error.message);
    }
  });

  console.log('\n🎉 Setup completed successfully!');
  console.log('💡 Next steps:');
  console.log('   1. Update .env with your Supabase credentials');
  console.log('   2. Run "npm run dev" to start development');
  console.log('   3. Visit http://localhost:3000');

} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
}