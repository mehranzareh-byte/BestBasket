# 🚀 Deploy BestBasket to Production - Step by Step

Your app works locally! Now let's get it live on the internet for free.

## Step 1: Verify Database Setup (2 minutes)

Before deploying, make sure your Supabase database is set up:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Click "SQL Editor"** (left sidebar)
4. **Check if tables exist**:
   - Click "Table Editor" (left sidebar)
   - You should see tables like: `profiles`, `grocery_lists`, `stores`, `bills`, `feedback`
   
   **If tables don't exist:**
   - Go back to SQL Editor
   - Copy ALL contents from `supabase-schema.sql` in this project
   - Paste and click "Run"

✅ **Database ready?** Move to Step 2!

---

## Step 2: Push Code to GitHub (5 minutes)

### A. Initialize Git (if not done)
```bash
git init
git add .
git commit -m "Initial commit - BestBasket app"
```

### B. Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `BestBasket` (or any name)
3. Description: "Smart grocery shopping app"
4. Choose: **Public** (or Private if you prefer)
5. **DON'T** initialize with README (we already have one)
6. Click **"Create repository"**

### C. Push to GitHub
GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/YOUR_USERNAME/BestBasket.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username!**

✅ **Code on GitHub?** Move to Step 3!

---

## Step 3: Deploy to Vercel (5 minutes)

### A. Create Vercel Account
1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (easiest)
4. Authorize Vercel to access your GitHub

### B. Import Your Project
1. Click **"Add New..."** → **"Project"**
2. Find your **BestBasket** repository
3. Click **"Import"**

### C. Configure Project
Vercel will auto-detect Next.js. You need to:

1. **Framework Preset**: Next.js (should be auto-selected)
2. **Root Directory**: `./` (default)
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)

### D. Add Environment Variables
**IMPORTANT:** Add these before deploying!

Click **"Environment Variables"** and add:

```
NEXT_PUBLIC_SUPABASE_URL
```
Value: Your Supabase URL (from Supabase Settings → API)

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Value: Your Supabase anon key (from Supabase Settings → API)

```
SUPABASE_SERVICE_ROLE_KEY
```
Value: Your Supabase service_role key (from Supabase Settings → API)

```
NEXT_PUBLIC_APP_URL
```
Value: Leave empty for now (Vercel will provide URL)

### E. Deploy!
1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. **Your app is live!** 🎉

You'll get a URL like: `https://bestbasket.vercel.app`

---

## Step 4: Test Your Live App (2 minutes)

1. **Open your Vercel URL** in a browser
2. **Test all features**:
   - ✅ Create grocery list
   - ✅ View store recommendations
   - ✅ Try bill scanning
   - ✅ Submit feedback

3. **Check for errors**:
   - Open browser console (F12)
   - Look for any red errors
   - If you see Supabase errors, verify environment variables in Vercel

---

## Step 5: Update App URL (Optional)

After deployment, update the app URL in Supabase:

1. Go to Vercel dashboard
2. Copy your app URL (e.g., `https://bestbasket.vercel.app`)
3. Go to Supabase → Settings → API
4. Add your Vercel URL to "Site URL" (if needed for auth features)

---

## 🎉 Congratulations!

Your BestBasket app is now:
- ✅ Live on the internet
- ✅ Accessible from anywhere
- ✅ Free hosting (Vercel free tier)
- ✅ Free database (Supabase free tier)
- ✅ Ready for users!

---

## 🔗 Quick Links

- **Your Live App**: Check Vercel dashboard for URL
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard

## 📱 Share Your App

Share your Vercel URL with friends and family to test!

---

## 🆘 Troubleshooting

### Build fails on Vercel
- Check environment variables are set correctly
- Verify Supabase keys are correct
- Check build logs in Vercel dashboard

### App loads but shows errors
- Check browser console for errors
- Verify Supabase database tables exist
- Check environment variables in Vercel

### Database connection errors
- Verify Supabase project is active
- Check RLS policies are set (should be from SQL schema)
- Verify API keys are correct

---

**Need help?** Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide for more details.
