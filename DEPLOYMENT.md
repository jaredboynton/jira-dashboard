# 🚀 Deployment Guide

## Railway Deployment (Recommended)

### Step 1: Prepare Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Enhanced Jira Dashboard"
   ```

2. **Create GitHub Repository**:
   - Go to [github.com/new](https://github.com/new)
   - Repository name: `jira-dashboard`
   - Description: `Enhanced Jira Analytics Dashboard with AI Analysis`
   - Make it public or private (your choice)
   - Click "Create repository"

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/nonymaus/jira-dashboard.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Railway

1. **Go to Railway**: [railway.app](https://railway.app)
2. **Sign up/Login** with GitHub
3. **Create New Project**: Click "New Project"
4. **Deploy from GitHub**: Select "Deploy from GitHub repo"
5. **Select Repository**: Choose `nonymaus/jira-dashboard`
6. **Deploy**: Railway will automatically detect Node.js and deploy

### Step 3: Configure Environment (Optional)

In Railway dashboard:
- Go to your project → Variables
- Add environment variables if needed:
  ```
  NODE_ENV=production
  ```

### Step 4: Access Your App

- Railway will provide a URL like: `https://jira-dashboard-production.up.railway.app`
- Your dashboard will be at: `https://your-app.railway.app/custengg-dashboard-enhanced.html`

## Alternative: Render Deployment

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy on Render

1. **Go to Render**: [render.com](https://render.com)
2. **Create Web Service**: New → Web Service
3. **Connect GitHub**: Select your repository
4. **Configure**:
   - Name: `jira-dashboard`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Deploy**: Click "Create Web Service"

## Alternative: Vercel (Serverless)

**Note**: Requires converting to serverless functions

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

## Post-Deployment Checklist

- ✅ App loads successfully
- ✅ Can enter Jira credentials
- ✅ Can load project data
- ✅ AI chat works with OpenAI API
- ✅ Charts and analytics display
- ✅ Responsive design works

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check package.json dependencies
2. **App Won't Start**: Verify start script in package.json
3. **API Errors**: Check CORS settings and API endpoints
4. **Environment Issues**: Verify PORT environment variable

### Support:

- Check Railway/Render logs for errors
- Verify all dependencies are in package.json
- Test locally first: `npm start`

---

🎉 **Your Jira Dashboard is now live!**
