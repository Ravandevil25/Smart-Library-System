# Deploying Library Management System on Vercel

This guide will walk you through deploying your Library Management System on Vercel. Since this is a full-stack application with a backend that uses Socket.IO and MongoDB, we'll deploy the frontend on Vercel and provide options for the backend.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Deployment Options](#deployment-options)
4. [Option 1: Frontend on Vercel + Backend on Separate Service](#option-1-frontend-on-vercel--backend-on-separate-service-recommended)
5. [Option 2: Full Stack on Vercel (Monorepo)](#option-2-full-stack-on-vercel-monorepo)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

## Overview

Your Library Management System consists of:
- **Frontend**: React + Vite + TypeScript (can be deployed directly to Vercel)
- **Backend**: Express + TypeScript + MongoDB + Socket.IO (requires special consideration)

**Note**: Vercel's serverless functions have limitations with:
- Long-running connections (Socket.IO)
- Persistent MongoDB connections
- File uploads and static file serving

Therefore, we recommend deploying the backend separately on services like:
- Railway
- Render
- Heroku
- DigitalOcean App Platform
- AWS/GCP/Azure

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier available)
2. [Vercel CLI](https://vercel.com/docs/cli) installed globally:
   ```bash
   npm i -g vercel
   ```
3. MongoDB Atlas account (or your MongoDB connection string)
4. Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Options

### Option 1: Frontend on Vercel + Backend on Separate Service (Recommended)

This is the recommended approach as it provides better performance and reliability for your backend.

#### Step 1: Deploy Backend First

Deploy your backend to a service that supports Node.js applications:

**Using Railway:**
1. Go to [Railway](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Select the `backend` folder as the root
5. Add environment variables (see [Environment Variables](#environment-variables))
6. Deploy

**Using Render:**
1. Go to [Render](https://render.com)
2. Create a new Web Service
3. Connect your repository
4. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables
6. Deploy

#### Step 2: Deploy Frontend to Vercel

**Method A: Using Vercel Dashboard (Easiest)**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   VITE_SOCKET_URL=https://your-backend-url.com
   ```

6. Click **"Deploy"**

**Method B: Using Vercel CLI**

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - Project name? (Enter a name or press Enter)
   - Directory? `./`
   - Override settings? **No**

5. Set environment variables:
   ```bash
   vercel env add VITE_API_URL
   # Enter: https://your-backend-url.com/api
   
   vercel env add VITE_SOCKET_URL
   # Enter: https://your-backend-url.com
   ```

6. Redeploy to apply environment variables:
   ```bash
   vercel --prod
   ```

### Option 2: Full Stack on Vercel (Monorepo)

If you want to deploy both frontend and backend on Vercel, you'll need to:

1. Convert backend routes to Vercel serverless functions
2. Handle Socket.IO limitations (consider using Vercel's Edge Functions or external Socket.IO service)
3. Configure `vercel.json` for routing

**Note**: This approach requires significant refactoring and may not support all features (especially Socket.IO real-time features).

## Environment Variables

### Frontend Environment Variables (Vercel)

Add these in Vercel Dashboard → Your Project → Settings → Environment Variables:

```
VITE_API_URL=https://your-backend-url.com/api
VITE_SOCKET_URL=https://your-backend-url.com
```

### Backend Environment Variables (Your Backend Service)

Add these in your backend hosting service:

```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library-management?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
FRONTEND_URL=https://your-vercel-frontend-url.vercel.app
GEMINI_API_KEY=your-gemini-api-key
```

**Important Security Notes:**
- Never commit `.env` or `config.env` files to Git
- Use strong, unique values for `JWT_SECRET` in production
- Use MongoDB Atlas connection string with proper authentication
- Enable CORS on your backend to allow requests from your Vercel frontend URL

## Post-Deployment

### 1. Update Backend CORS Configuration

Make sure your backend allows requests from your Vercel frontend URL. Update `backend/src/server.ts`:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### 2. Update MongoDB Atlas Whitelist

1. Go to MongoDB Atlas Dashboard
2. Navigate to **Network Access**
3. Add your backend server's IP address, or use `0.0.0.0/0` for development (not recommended for production)

### 3. Test Your Deployment

1. Visit your Vercel frontend URL
2. Test user registration/login
3. Test QR code scanning
4. Test book borrowing
5. Verify Socket.IO real-time features work

### 4. Set Up Custom Domain (Optional)

1. In Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `FRONTEND_URL` in backend environment variables

## Troubleshooting

### Frontend Issues

**Build Fails:**
- Check that all dependencies are in `package.json`
- Ensure TypeScript compilation passes: `npm run build` locally
- Check Vercel build logs for specific errors

**API Calls Fail:**
- Verify `VITE_API_URL` is set correctly in Vercel environment variables
- Check browser console for CORS errors
- Ensure backend is running and accessible

**Socket.IO Connection Fails:**
- Verify `VITE_SOCKET_URL` is set correctly
- Check that backend Socket.IO server is running
- Ensure WebSocket connections are allowed by your backend hosting service

### Backend Issues

**MongoDB Connection Fails:**
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas network whitelist
- Ensure MongoDB Atlas cluster is running

**CORS Errors:**
- Update CORS configuration to include your Vercel frontend URL
- Check that `FRONTEND_URL` environment variable is set correctly

**Socket.IO Not Working:**
- Some hosting services require special configuration for WebSockets
- Check your hosting service's documentation for WebSocket support
- Consider using a dedicated Socket.IO service if needed

### Common Errors

**"Module not found" errors:**
- Ensure all dependencies are listed in `package.json`
- Run `npm install` locally to verify dependencies

**"Cannot find module" errors:**
- Check that build output directory matches Vercel configuration
- Verify TypeScript compilation is successful

**Environment variables not working:**
- Remember that Vite requires `VITE_` prefix for environment variables
- Redeploy after adding new environment variables
- Check that variables are set for the correct environment (Production, Preview, Development)

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)

## Quick Deploy Checklist

- [ ] Backend deployed and accessible
- [ ] Backend environment variables configured
- [ ] MongoDB Atlas configured and accessible
- [ ] Frontend environment variables set in Vercel
- [ ] CORS configured on backend
- [ ] Build passes locally (`npm run build` in frontend)
- [ ] Test registration/login
- [ ] Test core features (scanning, borrowing)
- [ ] Verify Socket.IO real-time features
- [ ] Set up custom domain (optional)

---

**Need Help?** Check the [Vercel Community](https://github.com/vercel/vercel/discussions) or your backend hosting service's support channels.

