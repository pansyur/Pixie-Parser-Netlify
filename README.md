# 🧚‍♀️ Pixie Parser

A whimsical, high-performance multi-paste workshop and text segmenter with **free real-time cross-device sync powered by Supabase**, deployable directly to **Vercel**, with **no login required** and **zero content length limits**.

---

## ▲ Vercel Deployment

Pixie Parser is fully configured for Vercel with zero-config Vite auto-detection and custom `vercel.json` rewrite routing for client-side SPAs.

### Method 1: Deploy with Vercel & Git (Recommended)

1. **Push your code to GitHub, GitLab, or Bitbucket**.
2. Log into the [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** &rarr; **"Project"**.
3. Import your repository. Vercel automatically detects Vite:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. *(Optional)* Under **Environment Variables**, add your Supabase credentials:
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your-anon-public-key`
   *(You can also connect Supabase directly within the web app at runtime using the "Connect Supabase" button!)*
5. Click **"Deploy"**! Vercel will build and assign you a global, edge-cached `.vercel.app` domain.

---

### Method 2: Deploy via Vercel CLI

You can also deploy in seconds directly from your terminal:

```bash
# 1. Deploy preview build
npx vercel

# 2. Deploy directly to production
npx vercel --prod
```

The included `vercel.json` automatically takes care of routing all SPA paths to `index.html` and setting optimal caching headers on immutable assets.

---

## 🗄️ Supabase Free Cross-Device Database

Pixie Parser syncs your paste tabs live across phones, laptops, and browsers using Supabase's free PostgreSQL database and Realtime channels.

### 1. Run the SQL Schema in Supabase

In your [Supabase Dashboard](https://supabase.com/dashboard) &rarr; **SQL Editor**, run the following script:

```sql
-- 1. Create the paste_tabs table
create table if not exists paste_tabs (
  id text primary key,
  name text not null default 'Charm 1',
  main_text text default '',
  segments jsonb default '[]'::jsonb,
  config jsonb default '{}'::jsonb,
  position integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table paste_tabs enable row level security;

-- 3. Public Anonymous Access Policies (No login needed)
drop policy if exists "Public read access" on paste_tabs;
create policy "Public read access" on paste_tabs for select using (true);

drop policy if exists "Public insert access" on paste_tabs;
create policy "Public insert access" on paste_tabs for insert with check (true);

drop policy if exists "Public update access" on paste_tabs;
create policy "Public update access" on paste_tabs for update using (true);

drop policy if exists "Public delete access" on paste_tabs;
create policy "Public delete access" on paste_tabs for delete using (true);

-- 4. Enable Supabase Realtime for instant cross-device updates
alter publication supabase_realtime add table paste_tabs;
```

### 2. Connect Your App

You can connect in either of two ways:
- **In-App**: Click the **Connect Supabase** button in the header and paste your **Project URL** and **Public Anon Key**.
- **Environment Variables**: Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel Project Settings (Settings &rarr; Environment Variables) or `.env.local`.

---

## ✨ Features

- **Vercel Edge Optimized**: Pre-configured `vercel.json` with client-side SPA fallback and static asset caching.
- **No Login Required**: Jump right in without creating an account or verifying email.
- **No Content Length Limits**: PostgreSQL `text` columns allow storing megabytes of text without 1MB document limitations.
- **Live Real-time Cross-Device Sync**: Changes on one device update immediately on all other devices via Supabase Realtime subscriptions.
- **Multiple Charms (Tabs)**: Organize pastes by tab, rename them, reorder them, and track block counts.
- **Powerful Text Modifiers**:
  - Split by $N$ empty lines.
  - Inject custom line breaks around keywords.
  - Truncate lines at delimiters (multi-term support).
  - Marker line cutoffs (before/after marker line).
  - Include / exclude line filters with **OR / AND** logic.
  - Multi-rule Find & Replace.
- **Result Navigation & Copying**:
  - Copy All Blocks or copy individual blocks with one tap.
  - Up / Down smooth scroll navigation between blocks.
  - Floating scroll-to-top and scroll-to-bottom buttons.
- **Backup & Restore**: Export all charms to a `.json` backup file or clipboard, and restore anytime.
