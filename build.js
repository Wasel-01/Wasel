const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building Wasel application...');

try {
  // Use npx to run vite build
  execSync('npx vite build', { stdio: 'inherit', cwd: __dirname });
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Build files are in the dist/ directory');
  
  // Check if dist directory exists
  if (fs.existsSync(path.join(__dirname, 'dist'))) {
    console.log('🚀 Ready for deployment!');
  }
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}