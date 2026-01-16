# 🚀 Quick Start Guide - Get BestBasket Running in 10 Minutes

## Step 1: Install Dependencies ✅
```bash
npm install
```
**Status: DONE!** ✅

## Step 2: Set Up Supabase (5 minutes)

### A. Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign up"
3. Sign up with GitHub (easiest) or email
4. Create a new organization (if prompted)

### B. Create a New Project
1. Click "New Project"
2. Fill in:
   - **Name**: BestBasket (or any name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
3. Click "Create new project"
4. **Wait 2-3 minutes** for project to be ready

### C. Set Up Database Schema
1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New query**
3. Open `supabase-schema.sql` from this project
4. Copy **ALL** the contents
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### D. Get Your API Keys
1. In Supabase dashboard, click **Settings** (gear icon, bottom left)
2. Click **API**
3. You'll see:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
   - **service_role secret** key (long string, keep this SECRET!)

## Step 3: Create Environment File

Create a file named `.env.local` in the project root:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env.local
```

**Mac/Linux:**
```bash
cp .env.example .env.local
```

Then edit `.env.local` and replace with your Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Step 5: Test the App

1. **Grocery List Tab**: Add some items (e.g., "Milk", "Bread", "Eggs")
2. **Stores Tab**: See store recommendations (uses mock data initially)
3. **Scan Bill Tab**: Try uploading a receipt image
4. **Feedback Tab**: Submit some feedback

## 🎉 You're Done!

Your app is running locally. Next step: Deploy to production!

---

## Need Help?

- **Supabase setup issues?** Check [SETUP.md](./SETUP.md)
- **Want to deploy?** See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Full documentation?** See [README.md](./README.md)
