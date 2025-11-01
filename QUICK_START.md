# 🚀 Wasel Quick Start Guide

## Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

## 1. Setup Project
```bash
# Clone and setup
git clone <repository-url>
cd Wasel
npm run setup
```

## 2. Configure Environment
Edit `.env` file with your credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

## 3. Start Development
```bash
npm run dev
```
Visit: http://localhost:3000

## 4. Build for Production
```bash
npm run build
npm run preview
```

## 🛠️ Available Scripts
- `npm run setup` - Initial project setup
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Check TypeScript types

## 🔧 Troubleshooting
1. **Port 3000 in use**: Change port in `vite.config.js`
2. **Supabase errors**: Check `.env` credentials
3. **Build fails**: Run `npm run typecheck` first

## 📚 Documentation
- [Feature Specification](src/FEATURE_SPEC.md)
- [Developer Guide](src/DEVELOPER_GUIDE.md)
- [Backend Setup](src/BACKEND_SETUP_GUIDE.md)

## 🚀 Deployment
Ready for deployment to:
- Vercel
- Netlify  
- AWS Amplify
- Any static hosting

Run `npm run build` and deploy the `dist` folder.