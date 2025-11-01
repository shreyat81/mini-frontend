# Environment Variables Template for Vercel

## Required Environment Variables

Add these in your Vercel project settings:

### VITE_API_BASE_URL
- **Description**: Backend API URL
- **Value**: `https://your-backend-url.onrender.com` (replace with your actual backend URL)
- **Example**: `https://mini-drive-backend-0hls.onrender.com`

## How to Add in Vercel:

1. Go to your Vercel project dashboard
2. Click on **Settings** tab
3. Click on **Environment Variables** in the sidebar
4. Add the variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: Your backend URL (for example `https://mini-drive-backend-0hls.onrender.com`)
   - **Environment**: Production (and optionally Preview/Development)
5. Click **Save**
6. Redeploy your application

## Important Notes:

- Make sure to use `https://` in the URL (not `http://`)
- Do NOT include a trailing slash at the end
- The backend URL should be your Render deployment URL
- After deploying, update your backend's `CORS_ORIGIN` and `FRONTEND_BASE_URL` environment variables in Render to match your Vercel URL
