# Quick Setup Guide

Follow these steps to get BestBasket running locally:

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready (takes ~2 minutes)
4. Go to SQL Editor in the Supabase dashboard
5. Copy and paste the entire contents of `supabase-schema.sql`
6. Click "Run" to execute the SQL

## 3. Get Supabase Credentials

1. In Supabase dashboard, go to **Settings** > **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string)
   - **service_role secret** key (long string, keep this secret!)

## 4. Create Environment File

Create a file named `.env.local` in the root directory:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Then edit `.env.local` and add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 5. Run the Development Server

```bash
npm run dev
```

## 6. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## Testing the App

1. **Grocery List**: Add items to your list
2. **Store Recommendations**: Click "Stores" tab to see recommendations (uses mock data initially)
3. **Bill Scanner**: Upload a receipt image to test OCR
4. **Feedback**: Submit feedback to test the AI suggestion system

## Troubleshooting

### "Module not found" errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`

### Supabase connection errors
- Verify your `.env.local` file has correct values
- Check that your Supabase project is active
- Ensure you ran the SQL schema in Supabase

### OCR not working
- Tesseract.js downloads models on first use (may take a minute)
- Ensure you're using a modern browser (Chrome, Firefox, Edge)

## Next Steps

- See [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy to production
- See [README.md](./README.md) for full documentation

Happy coding! 🛒
