# Vercel Deployment Guide for Mini Drive Frontend

## Prerequisites
- ✅ Backend deployed on Render
- ✅ Backend URL available (e.g., `https://mini-drive-api.onrender.com`)
- ✅ GitHub repository for frontend code

## Deployment Steps

### 1. Push Code to GitHub

If you haven't already created a frontend repository:

```bash
cd mini-drive-frontend
git init
git add .
git commit -m "Initial commit - Mini Drive Frontend"
git branch -M main
git remote add origin https://github.com/yourusername/mini-drive-frontend.git
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `mini-drive-frontend` repository
4. Configure project:
   - **Framework Preset**: Vite ✅ (Auto-detected)
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build` ✅ (Auto-detected)
   - **Output Directory**: `dist` ✅ (Auto-detected)
   - **Install Command**: `npm install` ✅ (Auto-detected)

5. **Add Environment Variables**:
   Click "Environment Variables" and add:
   ```
   Name: VITE_API_BASE_URL
   Value: https://your-backend-url.onrender.com
   ```
   (Replace with your actual Render backend URL)

6. Click **"Deploy"**

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from frontend directory)
cd mini-drive-frontend
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? mini-drive-frontend
# - In which directory? ./ (current directory)
# - Override settings? No

# Add environment variable
vercel env add VITE_API_BASE_URL
# Enter value: https://your-backend-url.onrender.com
# Select environments: Production, Preview, Development

# Deploy to production
vercel --prod
```

### 3. Get Your Frontend URL

After deployment, Vercel will give you a URL like:
```
https://mini-drive-frontend.vercel.app
```
or with your custom domain if configured.

### 4. Update Backend CORS Settings

**IMPORTANT**: Update your backend environment variables in Render:

1. Go to your Render dashboard
2. Select your Mini Drive backend service
3. Go to **Environment** tab
4. Update these variables:
   ```
   CORS_ORIGIN=https://mini-drive-frontend.vercel.app
   FRONTEND_BASE_URL=https://mini-drive-frontend.vercel.app
   ```
   (Replace with your actual Vercel URL)
5. Click **"Save Changes"**
6. Your backend will automatically redeploy

### 5. Test Your Deployment

1. Visit your Vercel URL
2. Try to sign up with a new account
3. Login with credentials
4. Upload a file
5. Test file download
6. Check admin panel (if admin user)

## Troubleshooting

### CORS Errors
**Symptom**: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"

**Solution**:
- Ensure `CORS_ORIGIN` in backend includes your Vercel URL
- Check that you're using `https://` (not `http://`)
- Verify no trailing slash in CORS_ORIGIN

### API Connection Failed
**Symptom**: "Failed to fetch" or network errors

**Solution**:
- Check `VITE_API_BASE_URL` is set correctly in Vercel
- Verify backend is running on Render
- Check backend logs in Render dashboard
- Use browser DevTools Network tab to inspect requests

### Blank Page After Deployment
**Symptom**: White/blank page on Vercel

**Solution**:
- Check browser console for errors (F12)
- Verify build completed successfully in Vercel deployment logs
- Check that `dist` folder is being generated correctly
- Ensure all environment variables are set

### Environment Variable Not Working
**Symptom**: Still connecting to localhost

**Solution**:
- Redeploy after adding environment variables
- Clear browser cache
- Check variable name starts with `VITE_` prefix
- Verify value doesn't have trailing spaces or quotes

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:
- **Push to `main` branch** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

## Custom Domain (Optional)

1. Go to your Vercel project
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update backend `CORS_ORIGIN` with your custom domain

## Build Configuration

Your frontend is configured with:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

## Performance Optimization

Vercel automatically provides:
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ HTTP/2
- ✅ Brotli compression
- ✅ Smart caching
- ✅ Edge network

## Monitoring

View deployment status and logs:
1. Go to Vercel dashboard
2. Select your project
3. Click on a deployment
4. View build logs and runtime logs

## Rollback

If something goes wrong:
1. Go to Vercel dashboard
2. Find previous successful deployment
3. Click three dots → "Promote to Production"

## Environment-Specific Deployments

- **Production**: `main` branch → `https://your-app.vercel.app`
- **Staging**: Create `staging` branch, set different API URL
- **Preview**: Any branch/PR gets automatic preview URL

## Cost

- **Free tier includes**:
  - 100 GB bandwidth/month
  - Unlimited websites
  - Automatic HTTPS
  - Serverless functions
  - Perfect for this project!

## Next Steps After Deployment

1. ✅ Test all features thoroughly
2. ✅ Update documentation with production URLs
3. ✅ Set up custom domain (optional)
4. ✅ Configure analytics (optional)
5. ✅ Set up error monitoring (optional, e.g., Sentry)
6. ✅ Share with users! 🎉

## Support

If you encounter issues:
- Check Vercel deployment logs
- Check browser console (F12)
- Check Render backend logs
- Review `VERCEL_ENV_GUIDE.md` for environment variable setup

---

**Your frontend should now be live and accessible worldwide!** 🚀
