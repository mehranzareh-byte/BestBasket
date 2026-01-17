# Google Maps API Setup Guide

To enable the map view feature in BestBasket, you need to set up a Google Maps API key.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click "Select a project" → "New Project"
4. Enter project name: "BestBasket" (or any name)
5. Click "Create"

## Step 2: Enable Maps JavaScript API

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Maps JavaScript API"
3. Click on it and click **"Enable"**

## Step 3: Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"API Key"**
3. Copy the API key (you'll see it in a popup)

## Step 4: Restrict API Key (Recommended for Production)

1. Click **"Restrict Key"** in the popup (or edit the key later)
2. Under **"Application restrictions"**:
   - Select **"HTTP referrers (web sites)"**
   - Add your domains:
     - `localhost:3000/*` (for local development)
     - `*.vercel.app/*` (for Vercel deployments)
     - Your custom domain if you have one
3. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Choose **"Maps JavaScript API"**
4. Click **"Save"**

## Step 5: Add to Environment Variables

### Local Development
Add to `.env.local`:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Vercel Deployment
1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add:
   - Key: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - Value: Your API key
4. Redeploy your application

## Free Tier Limits

Google Maps Platform offers:
- **$200 free credit per month**
- This covers approximately:
  - 28,000 map loads per month
  - Or 100,000 static map requests
  - Or 40,000 directions requests

For most small to medium apps, this is more than enough!

## Troubleshooting

### Map not showing
- Verify API key is correct
- Check browser console for errors
- Ensure Maps JavaScript API is enabled
- Verify API key restrictions allow your domain

### "This page can't load Google Maps correctly"
- Check API key restrictions
- Ensure your domain is in the allowed referrers list
- Verify billing is enabled (even with free tier)

### Billing Setup
Even with free tier, you need to enable billing:
1. Go to **APIs & Services** → **Billing**
2. Link a billing account (won't be charged if you stay within free tier)
3. Free $200 credit is applied automatically

## Alternative: Use Mapbox (Free Tier Available)

If you prefer not to use Google Maps, you can integrate Mapbox instead:
- Free tier: 50,000 map loads/month
- No credit card required for free tier
- Similar functionality

---

**Note**: The map feature will gracefully degrade if no API key is provided - users will see a message instead of the map.
