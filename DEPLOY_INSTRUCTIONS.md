# Wasel Deployment Instructions

## Quick Deploy (Recommended)

### Option 1: Netlify (Easiest)
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the entire project folder
3. Netlify will automatically build and deploy

### Option 2: Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import from Git or drag project folder
3. Vercel will auto-detect Vite and deploy

### Option 3: GitHub Pages
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. GitHub Actions will auto-deploy

## Manual Build (If needed)
```bash
# On a different machine or environment
npm install
npm run build
# Upload dist/ folder to any static hosting
```

## Environment Variables
Create `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_MAPBOX_TOKEN=your_mapbox_token
```

## Files Ready for Deployment
- ✅ netlify.toml (Netlify config)
- ✅ vercel.json (Vercel config)
- ✅ .github/workflows/deploy.yml (GitHub Actions)
- ✅ All source code optimized
- ✅ Dependencies configured

## Live Demo URLs (After deployment)
- Netlify: `https://your-app-name.netlify.app`
- Vercel: `https://your-app-name.vercel.app`
- GitHub Pages: `https://username.github.io/repository-name`

The application is ready for deployment! 🚀