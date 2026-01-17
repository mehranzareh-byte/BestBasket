# 🔑 How to Get Google Maps API Key - Quick Guide

## Step-by-Step Instructions

### Step 1: Go to Google Cloud Console
👉 **https://console.cloud.google.com/**

Sign in with your Google account (Gmail account works)

---

### Step 2: Create a New Project

1. Click **"Select a project"** (top bar)
2. Click **"New Project"**
3. Enter project name: **"BestBasket"** (or any name)
4. Click **"Create"**
5. Wait a few seconds, then select your new project

---

### Step 3: Enable Maps JavaScript API

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for: **"Maps JavaScript API"**
3. Click on **"Maps JavaScript API"**
4. Click the big blue **"Enable"** button
5. Wait for it to enable (takes a few seconds)

---

### Step 4: Create API Key

1. Go to **"APIs & Services"** → **"Credentials"** (left sidebar)
2. Click **"Create Credentials"** (top bar)
3. Select **"API Key"**
4. **Copy the API key** that appears in the popup
   - It looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - ⚠️ **Save this key!** You'll need it

---

### Step 5: (Optional but Recommended) Restrict the Key

**For Security**, restrict your API key:

1. In the popup, click **"Restrict Key"**
   - Or go back to Credentials and click your key to edit

2. **Application restrictions:**
   - Select **"HTTP referrers (web sites)"**
   - Click **"Add an item"**
   - Add these (one at a time):
     ```
     localhost:3000/*
     *.vercel.app/*
     ```
   - Add your custom domain if you have one

3. **API restrictions:**
   - Select **"Restrict key"**
   - Check **"Maps JavaScript API"** only
   - Uncheck others

4. Click **"Save"**

---

### Step 6: Enable Billing (Required for Free Tier)

Even though it's free, Google requires billing to be enabled:

1. Go to **"APIs & Services"** → **"Billing"**
2. Click **"Link a billing account"**
3. Create a billing account (you'll need a credit card)
4. **Don't worry!** You get $200 free credit/month
5. Most apps never exceed the free tier

**Free Tier Includes:**
- $200 credit per month
- ~28,000 map loads/month
- More than enough for most apps!

---

### Step 7: Add Key to Your App

**For Local Development:**

1. Open `.env.local` in your project
2. Add this line:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
3. Replace with your actual API key
4. Save the file
5. Restart dev server: `npm run dev`

**For Vercel (Production):**

1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Click **"Add New"**
4. Key: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
5. Value: Your API key
6. Click **"Save"**
7. Redeploy your app

---

## ✅ That's It!

Your map should now work! The API key is free to use within the $200/month credit limit.

---

## 🔒 Security Tips

- ✅ **Always restrict your API key** (Step 5)
- ✅ **Never commit `.env.local` to Git** (it's already in `.gitignore`)
- ✅ **Use different keys for dev and production** (optional but recommended)
- ✅ **Monitor usage** in Google Cloud Console

---

## 💰 Cost Information

- **Free tier**: $200 credit/month
- **After free tier**: $7 per 1,000 map loads
- **Typical small app**: Uses <$10/month (well within free tier)

---

## 🆘 Troubleshooting

### "This page can't load Google Maps correctly"
- ✅ Check API key is correct
- ✅ Verify Maps JavaScript API is enabled
- ✅ Check API key restrictions allow your domain
- ✅ Ensure billing is enabled

### Map not showing
- ✅ Check browser console (F12) for errors
- ✅ Verify API key in `.env.local`
- ✅ Restart dev server after adding key
- ✅ Check API key restrictions

### Billing required error
- ✅ Enable billing (Step 6)
- ✅ Won't charge if you stay within free tier

---

## 📚 More Help

- **Google Maps Platform**: https://developers.google.com/maps
- **Pricing**: https://mapsplatform.google.com/pricing/
- **Documentation**: https://developers.google.com/maps/documentation

---

**Need help?** Check the browser console (F12) for specific error messages!
