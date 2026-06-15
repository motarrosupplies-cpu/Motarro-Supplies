# Setup Local Environment for Blog CRUD

Since you're using Vercel for deployment, you need to set up local environment variables for development.

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project (the one with URL: hkervihhlhktjdxcekhi.supabase.co)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (should be: https://hkervihhlhktjdxcekhi.supabase.co)
   - **anon/public key** (starts with eyJ...)

## Step 2: Create Local Environment File

Create a file named `.env.local` in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hkervihhlhktjdxcekhi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

Replace `your_actual_anon_key_here` with the anon key you copied from Supabase.

## Step 3: Restart Development Server

After creating the `.env.local` file:

1. Stop your current dev server (Ctrl+C)
2. Run `npm run dev` again
3. The server should start without the environment variable error

## Step 4: Test Blog CRUD

1. Go to http://localhost:3001/admin/blog
2. Try creating, editing, or deleting a blog post
3. You should now see toast notifications for success/failure

## Alternative: Use Vercel CLI

If you prefer, you can use Vercel CLI to pull your environment variables:

```bash
npm install -g vercel
vercel env pull .env.local
```

This will automatically create the `.env.local` file with your Vercel environment variables.
