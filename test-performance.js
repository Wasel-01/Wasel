const fs = require('fs');
const path = require('path');

console.log('⚡ Wasel Performance Analysis\n');
console.log('='.repeat(60));

// 1. Check bundle sizes
console.log('\n📦 Bundle Size Analysis:');
const distPath = path.join(__dirname, 'dist', 'assets');

if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const cssFiles = files.filter(f => f.endsWith('.css'));
  
  let totalSize = 0;
  const fileSizes = [];
  
  jsFiles.forEach(file => {
    const stats = fs.statSync(path.join(distPath, file));
    const sizeKB = (stats.size / 1024).toFixed(2);
    totalSize += stats.size;
    fileSizes.push({ file, size: sizeKB, type: 'JS' });
  });
  
  cssFiles.forEach(file => {
    const stats = fs.statSync(path.join(distPath, file));
    const sizeKB = (stats.size / 1024).toFixed(2);
    totalSize += stats.size;
    fileSizes.push({ file, size: sizeKB, type: 'CSS' });
  });
  
  // Sort by size
  fileSizes.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
  
  console.log(`\nTotal Files: ${files.length}`);
  console.log(`Total Size: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log(`\nLargest Files:`);
  
  fileSizes.slice(0, 10).forEach(({ file, size, type }) => {
    const status = parseFloat(size) > 200 ? '⚠️' : '✅';
    console.log(`${status} ${type.padEnd(4)} ${size.padStart(8)} KB - ${file}`);
  });
  
  // Performance recommendations
  console.log('\n📊 Performance Score:');
  const avgSize = totalSize / files.length / 1024;
  const largestFile = Math.max(...fileSizes.map(f => parseFloat(f.size)));
  
  let score = 100;
  if (totalSize / 1024 > 1000) score -= 20;
  if (largestFile > 300) score -= 15;
  if (avgSize > 50) score -= 10;
  
  console.log(`Score: ${score}/100`);
  
  if (score >= 80) {
    console.log('✅ Excellent - Bundle size optimized');
  } else if (score >= 60) {
    console.log('⚠️  Good - Some optimization possible');
  } else {
    console.log('❌ Needs improvement - Bundle too large');
  }
} else {
  console.log('❌ No build found. Run: npm run build');
}

// 2. Check for performance issues in code
console.log('\n\n🔍 Code Performance Check:');

const srcPath = path.join(__dirname, 'src');
const issues = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.relative(srcPath, filePath);
  
  // Check for console.log in production
  if (content.includes('console.log') && !content.includes('// @ts-nocheck')) {
    issues.push({ file: fileName, issue: 'console.log found', severity: 'low' });
  }
  
  // Check for large inline data
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.length > 500) {
      issues.push({ file: fileName, issue: `Long line ${i + 1} (${line.length} chars)`, severity: 'medium' });
    }
  });
  
  // Check for missing React.memo on components
  if (fileName.includes('components/') && content.includes('export default function') && !content.includes('memo')) {
    issues.push({ file: fileName, issue: 'Component not memoized', severity: 'low' });
  }
  
  // Check for useEffect without dependencies
  if (content.includes('useEffect') && content.includes('useEffect(')) {
    const matches = content.match(/useEffect\([^)]+\)/g);
    if (matches) {
      matches.forEach(match => {
        if (!match.includes('[') && !match.includes(']')) {
          issues.push({ file: fileName, issue: 'useEffect missing dependencies', severity: 'high' });
        }
      });
    }
  }
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
      scanDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      scanFile(filePath);
    }
  });
}

scanDirectory(srcPath);

// Group by severity
const high = issues.filter(i => i.severity === 'high');
const medium = issues.filter(i => i.severity === 'medium');
const low = issues.filter(i => i.severity === 'low');

console.log(`\nFound ${issues.length} potential issues:`);
console.log(`  🔴 High: ${high.length}`);
console.log(`  🟡 Medium: ${medium.length}`);
console.log(`  🟢 Low: ${low.length}`);

if (high.length > 0) {
  console.log('\n🔴 High Priority Issues:');
  high.slice(0, 5).forEach(({ file, issue }) => {
    console.log(`  - ${file}: ${issue}`);
  });
}

// 3. Performance recommendations
console.log('\n\n💡 Performance Recommendations:');
console.log('='.repeat(60));

const recommendations = [
  '✅ Use React.lazy() for code splitting',
  '✅ Implement caching for API calls',
  '✅ Add debouncing to search inputs',
  '✅ Optimize images (use WebP format)',
  '✅ Enable gzip compression on server',
  '✅ Use React.memo for expensive components',
  '✅ Implement virtual scrolling for long lists',
  '✅ Lazy load images below the fold',
  '✅ Minimize bundle size with tree shaking',
  '✅ Use service workers for offline support'
];

recommendations.forEach(rec => console.log(rec));

// 4. Target metrics
console.log('\n\n🎯 Target Performance Metrics:');
console.log('='.repeat(60));
console.log('Initial Load:     < 2 seconds');
console.log('Time to Interactive: < 3 seconds');
console.log('Button Response:  < 100ms');
console.log('API Calls:        < 500ms');
console.log('Page Navigation:  < 200ms');
console.log('Bundle Size:      < 500KB (gzipped)');

console.log('\n' + '='.repeat(60));
console.log('✅ Performance analysis complete!\n');
