# 🚀 Deployment Steps - Quick Reference

## ✅ What's Done
- ✅ Code committed to git
- ✅ App working locally
- ✅ All features implemented

## 📋 Next Steps (Follow in Order)

### 1️⃣ Push to GitHub (if not already done)
```bash
git push origin main
```

**If you get an error about no remote:**
- Create a repo at https://github.com/new
- Then run: `git remote add origin https://github.com/YOUR_USERNAME/BestBasket.git`
- Then: `git push -u origin main`

### 2️⃣ Verify Supabase Database
- Go to https://supabase.com/dashboard
- Open your project
- Click "Table Editor"
- **Verify tables exist**: `profiles`, `grocery_lists`, `stores`, `bills`, `feedback`
- **If missing**: Run `supabase-schema.sql` in SQL Editor

### 3️⃣ Deploy to Vercel

**A. Sign up/Login**
- Go to https://vercel.com
- Click "Sign Up" → "Continue with GitHub"

**B. Import Project**
- Click "Add New..." → "Project"
- Find "BestBasket" → Click "Import"

**C. Add Environment Variables** ⚠️ IMPORTANT!
Before clicking Deploy, add these 4 variables:

1. `NEXT_PUBLIC_SUPABASE_URL`
   - Value: From Supabase → Settings → API → Project URL

2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: From Supabase → Settings → API → anon public key

3. `SUPABASE_SERVICE_ROLE_KEY`
   - Value: From Supabase → Settings → API → service_role secret key

4. `NEXT_PUBLIC_APP_URL`
   - Value: Leave empty (Vercel will provide URL after deploy)

**D. Deploy**
- Click "Deploy"
- Wait 2-3 minutes
- **Done!** 🎉

### 4️⃣ Test Your Live App
- Open the Vercel URL (e.g., `https://bestbasket.vercel.app`)
- Test all features
- Check browser console for errors

---

## 🎯 Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Supabase database tables exist
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Environment variables added (4 variables)
- [ ] Deployment successful
- [ ] Live app tested

---

## 📚 Detailed Guides

- **Full deployment guide**: See [DEPLOY_NOW.md](./DEPLOY_NOW.md)
- **Troubleshooting**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🆘 Common Issues

**"Build failed"**
→ Check environment variables are set correctly

**"Database error"**
→ Verify Supabase tables exist and keys are correct

**"Module not found"**
→ Check build logs in Vercel dashboard

---

**Ready to deploy?** Follow the steps above! 🚀
