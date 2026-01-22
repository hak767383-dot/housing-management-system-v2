# 🚀 Quick Start Guide - Housing Management System

## Development

```powershell
# Install dependencies (one time)
npm install

# Start dev server
npm run dev

# View at: http://localhost:5173
```

## Production

```powershell
# Build for production
npm run build

# Preview build locally
npm run preview

# Check for TypeScript errors
npm run check

# Format code
npm run format
```

## Deployment to Vercel

```powershell
# 1. Commit changes
git add -A
git commit -m "Your message"
git push origin main

# 2. Deploy via Vercel CLI
npm install -g vercel
vercel

# OR deploy via web UI at https://vercel.com/dashboard
```

## Environment Variables

### Development (.env.development)
```env
VITE_API_BASE_URL=http://localhost:5173/api
VITE_OAUTH_SERVER_URL=http://localhost:5173
VITE_APP_ID=housing-app
```

### Production (.env.production)
```env
VITE_API_BASE_URL=http://housingms.runasp.net
VITE_OAUTH_SERVER_URL=http://housingms.runasp.net
VITE_APP_ID=housing-app
```

## Troubleshooting

### Port 5173 in use?
```powershell
npm run dev -- --port 5174
```

### npm install fails?
```powershell
Remove-Item node_modules -Recurse -Force
npm install
```

### Build fails?
```powershell
npm run check        # Check TypeScript first
npm run build        # Full build with error details
```

## Build Output
- Output: `dist/` folder
- Index: `dist/index.html`
- CSS: ~19 kB (gzipped)
- JS: ~178 kB (gzipped)

## Project Stack
- **Frontend**: React 19 + TypeScript 5.9
- **Build Tool**: Vite 7.3.1
- **Styling**: TailwindCSS 4 + shadcn/ui
- **API**: Axios (proxies to housingms.runasp.net)
- **State**: React Query + Context
- **Routing**: Wouter
- **Forms**: React Hook Form + Zod
- **Deployment**: Vercel

## Documentation
- Detailed deployment steps: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- Complete summary: [DEVOPS_COMPLETE_SUMMARY.md](./DEVOPS_COMPLETE_SUMMARY.md)
- Project analysis: [DIAGNOSTIC_REPORT.md](./DIAGNOSTIC_REPORT.md)
- Issues found: [ISSUES_SUMMARY.md](./ISSUES_SUMMARY.md)

---

**Status**: ✅ Ready for production  
**Last Updated**: January 22, 2026
