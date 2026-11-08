import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'pixie_supabase_url';
const STORAGE_KEY_KEY = 'pixie_supabase_anon_key';

export const SUPABASE_SQL_SCHEMA = `-- 🧚‍♀️ Pixie Parser — Supabase Setup (No Login Needed, Free Cloud DB, No Limits)

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

-- 4. Enable Supabase Realtime for instant cross-device sync
alter publication supabase_realtime add table paste_tabs;
`;

export function getSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  let localUrl = '';
  let localKey = '';
  try {
    localUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
    localKey = localStorage.getItem(STORAGE_KEY_KEY) || '';
  } catch (_) {}

  return {
    url: (localUrl || envUrl || '').trim(),
    anonKey: (localKey || envKey || '').trim()
  };
}

export function setSupabaseConfig(url: string, anonKey: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  } catch (_) {}
}

export function clearSupabaseConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
  } catch (_) {}
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http') && anonKey.length > 20);
}

let supabaseInstance: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) {
    supabaseInstance = null;
    return null;
  }

  if (supabaseInstance && lastUsedUrl === url && lastUsedKey === anonKey) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    lastUsedUrl = url;
    lastUsedKey = anonKey;
    return supabaseInstance;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    supabaseInstance = null;
    return null;
  }
}
