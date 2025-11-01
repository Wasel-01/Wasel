#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing all TypeScript issues...\n');

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
    fix: () => {
      const srcDir = path.join(process.cwd(), 'src');
      const files = getAllTsxFiles(srcDir);
      let fixedCount = 0;

      files.forEach(filePath => {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Fix common import issues
        const fixes = [
          [/from ['"]\.\/utils\/supabase\/client['"];/g, "from './supabase/client';"],
          [/from ['"]\.\/services\/api['"];/g, "from '../services/api';"],
          [/from ['"]\.\/utils\/logger['"];/g, "from '../utils/logger';"],
          [/from ['"]\.\/types\/database['"];/g, "from '../types/database';"],
        ];

        fixes.forEach(([pattern, replacement]) => {
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

function getAllTsxFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}

let allFixed = true;

fixes.forEach(({ name, fix }) => {
  try {
    const result = fix();
    console.log(`✅ ${name}: ${result}`);
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    allFixed = false;
  }
});

console.log(`\n${allFixed ? '🎉' : '⚠️'} TypeScript fixes ${allFixed ? 'COMPLETED' : 'COMPLETED WITH WARNINGS'}`);