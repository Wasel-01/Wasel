# Deployment Guide

## Quick Deploy Options

### 1. Netlify (Recommended)
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### 2. Vercel
```bash
npm install -g vercel
npm run build
vercel --prod
```

### 3. GitHub Pages
- Push to GitHub repository
- Enable GitHub Pages in repository settings
- GitHub Actions will auto-deploy on push to main

### 4. Manual Build
```bash
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