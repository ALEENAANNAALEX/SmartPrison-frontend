# Supabase Google Authentication Setup Guide

## 1. Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose a project name and database password
4. Wait for the project to be created

## 2. Get Project Credentials
1. Go to your project dashboard
2. Navigate to Settings → API
3. Copy your `Project URL` and `anon public` key

## 3. Update Environment Variables
1. Open the `.env` file in your Prison folder
2. Replace the placeholder values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Create Google OAuth App
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API (or Google Identity API)
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `https://your-project-id.supabase.co/auth/v1/callback`
7. Copy the Client ID and Client Secret

## 5. Configure Google Provider in Supabase
1. In your Supabase dashboard, go to Authentication → Providers
2. Find Google and click to configure
3. Enable the Google provider
4. Enter your Google Client ID and Client Secret
5. Save the configuration

## 6. Configure Redirect URLs
1. In Supabase Authentication → Settings
2. Add these Site URLs:
   - `http://localhost:5173` (for development)
   - Your production domain when you deploy
3. Add these Redirect URLs:
   - `http://localhost:5173/dashboard`
   - Your production domain + `/dashboard`

## 7. Test the Integration
1. Restart your development server: `npm run dev`
2. Go to login or signup page
3. Click "Sign in with Google"
4. You should be redirected to Google OAuth
5. After successful authentication, you'll be redirected to the dashboard

## Features Implemented
- ✅ Google OAuth sign-in/sign-up
- ✅ Automatic user session management
- ✅ Protected routes (Dashboard requires authentication)
- ✅ Logout functionality
- ✅ Auth state persistence across page refreshes
- ✅ Loading states during authentication

## Troubleshooting
- Make sure your `.env` file is in the root of the Prison folder
- Restart the development server after updating `.env`
- Check browser console for any errors
- Verify Google OAuth redirect URLs match exactly
- Ensure Supabase project is active and not paused
