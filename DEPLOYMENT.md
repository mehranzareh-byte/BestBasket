# Deployment Guide for BestBasket

This guide will help you deploy BestBasket to a free hosting platform.

## Option 1: Vercel (Recommended - Easiest)

Vercel offers free hosting for Next.js apps with automatic deployments from GitHub.

### Steps:

1. **Prepare your code**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub**
   - Create a new repository on GitHub
   - Push your code:
     ```bash
     git remote add origin <your-github-repo-url>
     git branch -M main
     git push -u origin main
     ```

3. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login (use GitHub for easy integration)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: Next.js (auto-detected)
     - Root Directory: `./` (default)
     - Build Command: `npm run build` (default)
     - Output Directory: `.next` (default)
   - Add Environment Variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key (optional)
     ```
   - Click "Deploy"

4. **Your app is live!**
   - Vercel will provide a URL like: `https://bestbasket.vercel.app`
   - Custom domains can be added for free

### Setting up Supabase:

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for free
   - Create a new project

2. **Run Database Schema**
   - In Supabase dashboard, go to SQL Editor
   - Copy and paste contents of `supabase-schema.sql`
   - Click "Run"

3. **Get API Keys**
   - Go to Settings > API
   - Copy:
     - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

4. **Add to Vercel Environment Variables**
   - Go to your Vercel project settings
   - Add the environment variables
   - Redeploy if needed

## Option 2: Netlify

Similar to Vercel, Netlify also offers free Next.js hosting.

1. **Push to GitHub** (same as above)

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login with GitHub
   - Click "Add new site" > "Import an existing project"
   - Select your repository
   - Build settings (auto-detected):
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Add environment variables (same as Vercel)
   - Click "Deploy site"

## Option 3: Railway

Railway offers free tier with PostgreSQL included.

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Next.js
   - Add environment variables
   - Deploy

3. **Add PostgreSQL** (if not using Supabase)
   - In Railway dashboard, click "New" > "Database" > "PostgreSQL"
   - Railway provides connection string automatically

## Post-Deployment Checklist

- [ ] Database schema is set up in Supabase
- [ ] Environment variables are configured
- [ ] App is accessible via the provided URL
- [ ] Test grocery list creation
- [ ] Test store recommendations
- [ ] Test bill scanning
- [ ] Test feedback submission
- [ ] Check mobile responsiveness

## Custom Domain (Optional)

### Vercel:
1. Go to project settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Netlify:
1. Go to Domain settings
2. Add custom domain
3. Configure DNS

## Monitoring & Analytics

Consider adding:
- **Vercel Analytics**: Built-in, free tier available
- **Sentry**: Error tracking (free tier)
- **Google Analytics**: User analytics

## Troubleshooting

### Build Errors:
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check environment variables are set

### Database Connection Issues:
- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Verify RLS policies are set correctly

### OCR Not Working:
- Tesseract.js runs in browser, no server setup needed
- For better accuracy, consider server-side OCR (Google Vision API, AWS Textract)

## Scaling Considerations

As your app grows:
- **Database**: Supabase free tier → paid plans for more storage
- **Hosting**: Vercel free tier → Pro plan for more bandwidth
- **ML Model**: Consider dedicated ML service (AWS SageMaker, Google AI Platform)
- **CDN**: Vercel/Netlify include CDN automatically

## Security Notes

- Never commit `.env` files
- Use environment variables for all secrets
- Enable Supabase Row Level Security (RLS)
- Regularly update dependencies
- Use HTTPS (automatic with Vercel/Netlify)

---

Your app is now live and ready for users! 🎉
