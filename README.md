# 🧚‍♀️ Pixie Parser

A whimsical, high-performance multi-paste workshop and text segmenter with **free real-time cross-device sync powered by Supabase**, deployable directly to **Netlify** (and Cloudflare Pages), with **no login required** and **zero content length limits**.

---

## 🚀 Netlify Deployment

Pixie Parser is configured with zero-config Netlify settings (`netlify.toml` and `public/_redirects` for Single Page Application routing and caching).

### Method 1: Deploy with Netlify & Git (Recommended)

1. **Push this repo to GitHub / GitLab / Bitbucket**.
2. Log into [Netlify Dashboard](https://app.netlify.com/) and click **"Add new site"** &rarr; **"Import an existing project"**.
3. Select your repository. Netlify will auto-detect the configuration from `netlify.toml`:
   - **Base directory**: `.` (root)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. *(Optional)* Under **Environment variables**, add:
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your-anon-public-key`
   *(You can also connect Supabase directly in the running web app at any time!)*
5. Click **"Deploy site"**! Your app will be live with full client-side routing and edge CDN distribution.

---

### Method 2: Deploy via Netlify CLI

You can deploy directly from your local terminal using the Netlify CLI:

```bash
# 1. Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# 2. Build the production bundle
npm run build

# 3. Deploy to production
netlify deploy --prod --dir=dist
```

Or for a quick one-off preview deploy without installing globally:
```bash
npx netlify deploy --dir=dist
```

---

## ⚡ Cloudflare Pages Deployment (Alternative)

If you also wish to deploy to Cloudflare Pages:

1. Push this repository to **GitHub**.
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) &rarr; **Workers & Pages** &rarr; **Create application** &rarr; **Pages** &rarr; **Connect to Git**.
3. Configure build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Click **Save and Deploy**. (The repository already includes `wrangler.toml` and `public/_redirects`).

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
- **Environment Variables**: Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Netlify Dashboard (Site configuration &rarr; Environment variables) or `.env.local`.

---

## ✨ Features

- **Netlify & Edge Optimized**: Pre-configured `netlify.toml` with SPA 200 rewrite rules and asset caching headers.
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
