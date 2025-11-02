#!/usr/bin/env node

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

console.log('🔧 Fixing all TypeScript issues...\n');

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

// Batch processing
const BATCH_SIZE = 5;

async function processFilesBatch(files, processor) {
  const batches = [];
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    batches.push(files.slice(i, i + BATCH_SIZE));
  }

  for (const batch of batches) {
    await Promise.all(batch.map(processor));
  }
}

const fixes = [
  {
    name: 'Add missing type declarations',
    fix: () => {
      // Create missing type files
      const typeFiles = [
        {
          path: 'src/types/global.d.ts',
          content: `declare global {
  interface Window {
    Notification: typeof Notification;
  }
}

export {};`
        },
        {
          path: 'src/types/components.ts',
          content: `export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface NavigationProps {
  onNavigate: (page: string) => void;
}

export interface UserStats {
  totalTrips: number;
  totalEarnings: number;
  averageRating: number;
  preferredRoutes: string[];
  travelPatterns: any[];
}`
        }
      ];

      typeFiles.forEach(({ path: filePath, content }) => {
        const fullPath = path.join(process.cwd(), filePath);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(fullPath, content);
      });

      return 'Created missing type declarations';
    }
  },
  {
    name: 'Fix import paths',
    fix: async () => {
      const srcDir = path.join(process.cwd(), 'src');
      const files = await getAllTsxFiles(srcDir);
      let fixedCount = 0;

      // Precompiled regex patterns for performance
      const fixes = [
        [/from ['"]\.\/utils\/supabase\/client['"];/g, "from './supabase/client';"],
        [/from ['"]\.\/services\/api['"];/g, "from '../services/api';"],
        [/from ['"]\.\/utils\/logger['"];/g, "from '../utils/logger';"],
        [/from ['"]\.\/types\/database['"];/g, "from '../types/database';"],
      ];

      // Process files in batches
      await processFilesBatch(files, async (filePath) => {
        try {
          let content = await readFileCached(filePath);
          let modified = false;

          fixes.forEach(([pattern, replacement]) => {
            if (pattern.test(content)) {
              content = content.replace(pattern, replacement);
              modified = true;
            }
          });

          if (modified) {
            await writeFileCached(filePath, content);
            fixedCount++;
          }
        } catch (error) {
          console.warn(`Warning: Could not process ${filePath}:`, error.message);
        }
      });

      return `Fixed imports in ${fixedCount} files`;
    }
  },
  {
    name: 'Add missing exports',
    fix: () => {
      // Ensure all components have proper exports
      const componentFiles = [
        'src/components/PersonalizedInsights.tsx',
        'src/components/RealTimeWidgets.tsx',
        'src/components/SmartDashboard.tsx'
      ];

      componentFiles.forEach(filePath => {
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) {
          let content = fs.readFileSync(fullPath, 'utf8');
          
          // Ensure default export
          if (!content.includes('export default') && !content.includes('export {')) {
            const componentName = path.basename(filePath, '.tsx');
            content = content.replace(
              new RegExp(`function ${componentName}`),
              `export default function ${componentName}`
            );
            fs.writeFileSync(fullPath, content);
          }
        }
      });

      return 'Added missing exports';
    }
  },
  {
    name: 'Fix any types',
    fix: () => {
      const srcDir = path.join(process.cwd(), 'src');
      const files = getAllTsxFiles(srcDir);
      let fixedCount = 0;

      files.forEach(filePath => {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Fix common any types
        const anyFixes = [
          [/: any\[\]/g, ': unknown[]'],
          [/useState<any>/g, 'useState<unknown>'],
          [/\(.*\): any =>/g, (match) => match.replace(': any', ': unknown')],
        ];

        anyFixes.forEach(([pattern, replacement]) => {
          if (pattern.test(content)) {
            content = content.replace(pattern, replacement);
            modified = true;
          }
        });

        if (modified) {
          fs.writeFileSync(filePath, content);
          fixedCount++;
        }
      });

      return `Fixed any types in ${fixedCount} files`;
    }
  }
];

// Async file traversal
async function getAllTsxFiles(dir) {
  const files = [];

  async function traverse(currentDir) {
    try {
      const items = await fs.readdir(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          await traverse(fullPath);
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
  }

  await traverse(dir);
  return files;
}

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
    console.log(`\n${allFixed ? '🎉' : '⚠️'} TypeScript fixes ${allFixed ? 'COMPLETED' : 'COMPLETED WITH WARNINGS'} (${totalDuration}ms total)`);

    if (totalDuration > 10000) { // 10 seconds
      console.log('\n⚠️  TypeScript fixes took longer than expected. Consider checking file permissions.');
    }

  } catch (error) {
    console.error('\n❌ Critical error during TypeScript fixes:', error.message);
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