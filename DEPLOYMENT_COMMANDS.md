# 🚀 DEPLOYMENT COMMAND REFERENCE

## Quick Deploy to Vercel

### Option 1: Using Vercel Web Dashboard (Easiest)
```
1. Visit: https://vercel.com/dashboard
2. Click: "New Project"
3. Import: Your GitHub repository
4. Configure:
   - Framework: Other
   - Build Command: npm run build
   - Output Directory: dist
5. Add Environment Variables (see below)
6. Click: "Deploy"
```

### Option 2: Using Vercel CLI
```powershell
# Install Vercel CLI (one time)
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to project
cd "C:\Users\HP\Desktop\react project\undeploide one"

# Deploy to production
vercel --prod
```

---

## Environment Variables to Set

Add these in Vercel Project Settings → Environment Variables:

```
VITE_API_BASE_URL=http://housingms.runasp.net
VITE_OAUTH_SERVER_URL=http://housingms.runasp.net
VITE_FRONTEND_FORGE_API_KEY=<YOUR_API_KEY>
VITE_FRONTEND_FORGE_API_URL=https://forge.butterfly-effect.dev
VITE_APP_ID=housing-app
```

---

## Pre-Deployment Checklist

- [ ] Review PRODUCTION_APPROVED.md
- [ ] Verify all tests pass locally: `npm run build`
- [ ] Environment variables set in Vercel
- [ ] GitHub repository updated and pushed
- [ ] Ready to deploy

---

## Post-Deployment Verification

1. Wait for Vercel build to complete (2-3 minutes)
2. Visit your Vercel deployment URL
3. Open browser Developer Tools (F12)
4. Check console for errors (should be empty)
5. Test navigation and API calls
6. Verify responsive design

---

## Status

✅ **READY TO DEPLOY**

All systems operational. Proceed with confidence.
