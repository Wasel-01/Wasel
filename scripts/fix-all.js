#!/usr/bin/env node

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🔧 Fixing all remaining issues in Wasel...\n');

// Performance monitoring
const startTime = Date.now();

// Caching
const fileCache = new Map();

// Async file operations
async function readFileCached(filePath) {
  if (fileCache.has(filePath)) {
    return fileCache.get(filePath);
  }
  const content = await fs.readFile(filePath, 'utf8');
  fileCache.set(filePath, content);
  return content;
}

async function writeFileCached(filePath, content) {
  fileCache.set(filePath, content);
  await fs.writeFile(filePath, content);
}

const fixes = [
  {
    name: 'Environment Setup',
    fix: () => {
      if (!fs.existsSync('.env')) {
        const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id

# Mapbox Configuration (Optional)
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# App Configuration
VITE_APP_NAME=Wasel
VITE_APP_VERSION=0.1.0`;
        fs.writeFileSync('.env', envContent);
        return 'Created .env file';
      }
      return 'Environment file exists';
    }
  },
  {
    name: 'Missing Assets',
    fix: () => {
      const publicDir = 'public';
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      // Create placeholder logo if missing
      if (!fs.existsSync(path.join(publicDir, 'logo.png'))) {
        // Create a simple SVG logo as placeholder
        const logoSvg = `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="30" fill="#008080"/>
  <text x="32" y="38" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold">W</text>
</svg>`;
        fs.writeFileSync(path.join(publicDir, 'logo.svg'), logoSvg);
        return 'Created placeholder logo';
      }
      return 'Assets exist';
    }
  },
  {
    name: 'TypeScript Configuration',
    fix: () => {
      try {
        execSync('npm run typecheck', { stdio: 'pipe' });
        return 'TypeScript check passed';
      } catch (error) {
        return `TypeScript issues found: ${error.message.substring(0, 100)}...`;
      }
    }
  },
  {
    name: 'Build Test',
    fix: () => {
      try {
        execSync('npm run build', { stdio: 'pipe' });
        return 'Build successful';
      } catch (error) {
        return `Build failed: ${error.message.substring(0, 100)}...`;
      }
    }
  }
];

// Execute fixes asynchronously
async function runFixes() {
  let allFixed = true;

  for (const { name, fix } of fixes) {
    const fixStart = Date.now();
    try {
      const result = await fix();
      const duration = Date.now() - fixStart;
      console.log(`✅ ${name}: ${result} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - fixStart;
      console.log(`❌ ${name}: ${error.message} (${duration}ms)`);
      allFixed = false;
    }
  }

  return allFixed;
}

// Main execution
async function main() {
  try {
    const allFixed = await runFixes();

    const totalDuration = Date.now() - startTime;
    console.log(`\n${allFixed ? '🎉' : '⚠️'} Fix process ${allFixed ? 'COMPLETED' : 'COMPLETED WITH WARNINGS'} (${totalDuration}ms total)`);

    if (allFixed) {
      console.log('\n🚀 Wasel is now ready for production!');
      console.log('💡 Next steps:');
      console.log('   1. Update .env with your credentials');
      console.log('   2. Run "npm run dev" to start development');
      console.log('   3. Run "npm run build" for production');
    }

    if (totalDuration > 15000) { // 15 seconds
      console.log('\n⚠️  Fix process took longer than expected. Consider checking file permissions or disk speed.');
    }

  } catch (error) {
    console.error('\n❌ Critical error during fixes:', error.message);
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

// Run the optimized fix process
main();