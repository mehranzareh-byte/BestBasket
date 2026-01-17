# 🚀 How to Run BestBasket Locally

## Quick Start (If Already Set Up)

If you've already configured Supabase, just run:

```bash
npm run dev
```

Then open **http://localhost:3000** in your browser!

---

## Full Setup (First Time)

### 1. Install Dependencies
```bash
npm install
```

### 2. Verify Environment File

Check if `.env.local` exists and has your Supabase credentials:

```bash
# Windows PowerShell
Get-Content .env.local

# Mac/Linux
cat .env.local
```

You should see:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**If `.env.local` is missing or incomplete:**
- See [QUICK_START.md](./QUICK_START.md) for setup instructions

### 3. Start Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in X seconds
```

### 4. Open in Browser

Navigate to: **http://localhost:3000**

---

## What You'll See

1. **Grocery List Tab** - Create your shopping list
2. **Stores Tab** - View recommendations with map (if Google Maps API key is set)
3. **Scan Bill Tab** - Upload receipts for OCR
4. **Feedback Tab** - Submit feedback

---

## Optional: Google Maps Setup

To enable the map view:

1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
   ```
3. Restart dev server: `npm run dev`

See [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md) for details.

---

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
npm run dev -- -p 3001
```

### "Module not found" Error
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Supabase Connection Error
- Verify `.env.local` has correct credentials
- Check Supabase project is active
- Ensure database schema is set up (run `supabase-schema.sql`)

### App Not Loading
- Check terminal for errors
- Verify Node.js version (need 18+): `node --version`
- Clear browser cache and hard refresh (Ctrl+Shift+R)

---

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## Hot Reload

The dev server has hot reload enabled:
- Changes to files automatically refresh the browser
- No need to restart the server
- Fast refresh for React components

---

**That's it! Your app should be running at http://localhost:3000** 🎉
