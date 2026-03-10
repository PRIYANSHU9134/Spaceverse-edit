# Spaceverse Deployment Guide

This guide explains how to deploy the Spaceverse application using MongoDB Atlas for the database and Netlify for hosting the frontend.

## Prerequisites

1. MongoDB Atlas account
2. Netlify account
3. Node.js installed locally

## Part 1: Setting up MongoDB Atlas

### Step 1: Create a MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in or create an account
3. Create a new cluster:
   - Select the free tier (M0 Sandbox) for development
   - Choose a cloud provider and region near you
   - Leave other settings as default
   - Click "Create Cluster"

### Step 2: Configure Database Access

1. In the left sidebar, go to "Database Access" under "Security"
2. Click "Add New Database User"
3. Create a user with:
   - Username: `spaceverse_user`
   - Password: Create a strong password
   - Permissions: "Atlas Admin" (for simplicity) or customize as needed
4. Click "Add User"

### Step 3: Configure Network Access

1. In the left sidebar, go to "Network Access" under "Security"
2. Click "Add IP Address"
3. For development, you can select "Allow Access From Anywhere" (0.0.0.0/0)
4. For production, add specific IP addresses for better security
5. Click "Confirm"

### Step 4: Get Your Connection String

1. In the left sidebar, go to "Clusters"
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Copy the connection string
5. Replace `<username>` and `<password>` with your database user credentials
6. Your connection string should look like:
   ```
   mongodb+srv://spaceverse_user:<password>@cluster0.xxxxx.mongodb.net/spaceverse?retryWrites=true&w=majority
   ```

## Part 2: Updating the Application for MongoDB Atlas

### Step 1: Update Environment Variables

In your `.env` file, comment out the local MongoDB URI and uncomment the Atlas one:

```env
# Local MongoDB (currently active)
# MONGODB_URI=mongodb://localhost:27017/spaceverse

# AI Service URL
AI_SERVICE_URL=http://localhost:8001

# Session Secret
SESSION_SECRET=spaceverse-secret-key-2024

# MongoDB Atlas - Uncomment and replace with your actual connection string when ready for deployment
MONGODB_URI=mongodb+srv://spaceverse_user:<password>@cluster0.xxxxx.mongodb.net/spaceverse?retryWrites=true&w=majority
```

### Step 2: Test the Connection

1. Make sure your MongoDB Atlas cluster is running
2. Start your application locally:
   ```bash
   npm start
   ```
3. Verify that the application connects to MongoDB Atlas by checking the console logs

## Part 3: Deploying to Netlify

### Step 1: Prepare Your Frontend Files

1. Ensure all your HTML, CSS, JavaScript, and asset files are in the `views` and `public` directories
2. Make sure your application works correctly with relative paths

### Step 2: Create a Build Script (if needed)

If your application requires a build step, create a build script in your `package.json`:

```json
{
  "scripts": {
    "build": "your-build-command-here"
  }
}
```

### Step 3: Deploy to Netlify

1. Go to [Netlify](https://www.netlify.com/) and sign in
2. Click "New site from Git" or drag and drop your project folder
3. If using Git:
   - Connect your GitHub/GitLab/Bitbucket account
   - Select your repository
   - Configure build settings:
     - Build command: `npm run build` (or leave empty if no build step)
     - Publish directory: Point to your frontend files (typically `views` or a build output directory)
4. Set environment variables in Netlify:
   - Go to Site settings > Build & deploy > Environment
   - Add the following variables:
     ```
     MONGODB_URI=mongodb+srv://spaceverse_user:<password>@cluster0.xxxxx.mongodb.net/spaceverse?retryWrites=true&w=majority
     AI_SERVICE_URL=your-ai-service-url-if-applicable
     SESSION_SECRET=your-session-secret
     ```
5. Click "Deploy site"

### Step 4: Configure API Redirects

Since Netlify hosts static files and your backend API runs separately, you'll need to set up redirects:

Create a `_redirects` file in your publish directory with:

```
/api/*  http://your-backend-api-url/api/:splat  200
```

Alternatively, you can use Netlify Functions to host your API or use a separate backend hosting service.

## Part 4: Deploying the Backend (Node.js Server)

Since Netlify primarily hosts static sites, you'll need to deploy your Node.js backend separately. Options include:

### Option 1: Heroku (Recommended for simplicity)

1. Create a Heroku account at [heroku.com](https://www.heroku.com/)
2. Install the Heroku CLI
3. In your project directory:
   ```bash
   heroku login
   heroku create your-app-name
   git add .
   git commit -m "Prepare for Heroku deployment"
   git push heroku main
   ```
4. Set environment variables in Heroku:
   ```bash
   heroku config:set MONGODB_URI="mongodb+srv://spaceverse_user:<password>@cluster0.xxxxx.mongodb.net/spaceverse?retryWrites=true&w=majority"
   heroku config:set AI_SERVICE_URL="your-ai-service-url"
   heroku config:set SESSION_SECRET="your-session-secret"
   ```

### Option 2: Render

1. Go to [render.com](https://render.com/) and sign up
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the build command to `npm install`
5. Set the start command to `node app-enhanced.js`
6. Add environment variables in the dashboard

### Option 3: Railway

1. Go to [railway.app](https://railway.app/) and sign up
2. Create a new project
3. Deploy your repository
4. Set environment variables in the dashboard

## Part 5: Connecting Frontend to Backend

Update your frontend JavaScript files to point to your deployed backend URL instead of localhost:

Replace:
```javascript
const API_BASE_URL = 'http://localhost:5000';
```

With:
```javascript
const API_BASE_URL = 'https://your-deployed-backend-url.herokuapp.com'; // or your Render/Railway URL
```

## Troubleshooting

### MongoDB Connection Issues

1. Double-check your connection string
2. Ensure your IP is whitelisted in MongoDB Atlas Network Access
3. Verify your database user credentials
4. Check that your cluster is in a running state

### Authentication Issues

1. Make sure SESSION_SECRET is set consistently between frontend and backend
2. Check that cookies are being sent properly between frontend and backend
3. Ensure CORS settings allow requests from your frontend domain

### Missing Environment Variables

1. Verify all required environment variables are set in your deployment platform
2. Check for typos in variable names
3. Ensure sensitive information is not hardcoded

## Conclusion

Your Spaceverse application should now be successfully deployed with:
- MongoDB Atlas for database hosting
- Netlify for frontend hosting
- Heroku/Render/Railway for backend API hosting

Remember to update all API endpoints in your frontend code to point to your deployed backend URL rather than localhost.