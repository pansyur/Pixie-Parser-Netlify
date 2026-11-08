import { ParserConfig, DEFAULT_CONFIG } from './pixieParser';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface PasteTab {
  id: string;
  name: string;
  mainText: string;
  segments: string[];
  config: ParserConfig;
  position: number;
  updatedAt?: string;
}

const LOCAL_STORAGE_KEY = 'pixie_parser_tabs_v1';

export function getLocalTabs(): PasteTab[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => a.position - b.position);
      }
    }
  } catch (e) {
    console.warn('Could not read from localStorage:', e);
  }
  return [];
}

export function saveLocalTabs(tabs: PasteTab[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tabs));
  } catch (e) {
    console.warn('Could not write to localStorage:', e);
  }
}

// Convert Supabase row to PasteTab
function rowToPasteTab(row: any): PasteTab {
  return {
    id: String(row.id),
    name: row.name || 'Untitled Charm',
    mainText: row.main_text ?? row.mainText ?? '',
    segments: Array.isArray(row.segments)
      ? row.segments
      : typeof row.segments === 'string'
      ? JSON.parse(row.segments || '[]')
      : [],
    config:
      typeof row.config === 'object' && row.config !== null
        ? { ...DEFAULT_CONFIG(), ...row.config }
        : typeof row.config === 'string'
        ? { ...DEFAULT_CONFIG(), ...JSON.parse(row.config || '{}') }
        : DEFAULT_CONFIG(),
    position: typeof row.position === 'number' ? row.position : 0,
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

// Convert PasteTab to Supabase row
function tabToSupabaseRow(tab: PasteTab) {
  return {
    id: tab.id,
    name: tab.name,
    main_text: tab.mainText || '',
    segments: tab.segments || [],
    config: tab.config || DEFAULT_CONFIG(),
    position: tab.position ?? 0,
    updated_at: new Date().toISOString()
  };
}

export async function testSupabaseConnection(): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: 'Supabase credentials not configured' };
  }
  try {
    const { error } = await supabase.from('paste_tabs').select('id').limit(1);
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Connection failed' };
  }
}

export async function fetchTabsFromCloud(): Promise<PasteTab[]> {
  const supabase = getSupabaseClient();

  // 1. Try Supabase first if configured
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('paste_tabs')
        .select('*')
        .order('position', { ascending: true });

      if (!error && Array.isArray(data)) {
        if (data.length > 0) {
          const mapped = data.map(rowToPasteTab);
          saveLocalTabs(mapped);
          return mapped;
        } else {
          // Empty table: seed first default charm
          const defaultTab: PasteTab = {
            id: `tab_${Date.now()}_default`,
            name: 'Charm 1',
            mainText: `Welcome to Pixie Parser! ✨🧚‍♀️
Every paste has its own charm on the bracelet.

Paste your unformatted content into this box.
Configure line splitting, delimiters, filters, or find & replace.
Your content syncs automatically to your free Supabase cloud database with no size limits!

Try parsing this sample text by clicking "✨ Parse Content" below!

--- Block 2 Starts Here ---
Pixie Parser splits content by empty lines or your chosen delimiter count.
It can also inject extra breaks around target keywords!

--- Block 3 Starts Here ---
Copy single blocks with one tap, or grab everything at once with "Copy All Blocks".
Enjoy smooth, fairy-dusted text processing! 🌸`,
            segments: [],
            config: DEFAULT_CONFIG(),
            position: 0,
            updatedAt: new Date().toISOString()
          };
          await supabase.from('paste_tabs').insert([tabToSupabaseRow(defaultTab)]);
          saveLocalTabs([defaultTab]);
          return [defaultTab];
        }
      }
    } catch (err) {
      console.warn('Supabase fetch error, falling back:', err);
    }
  }

  // 2. Try Local Server API (/api/tabs) if available
  try {
    const res = await fetch('/api/tabs');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data.tabs) && data.tabs.length > 0) {
        saveLocalTabs(data.tabs);
        return data.tabs;
      }
    }
  } catch (_) {}

  // 3. Fallback to Local Storage
  const local = getLocalTabs();
  if (local.length > 0) return local;

  // 4. Initial Default
  const initialDefault: PasteTab = {
    id: 'tab_default_1',
    name: 'Charm 1',
    mainText: '',
    segments: [],
    config: DEFAULT_CONFIG(),
    position: 0
  };
  saveLocalTabs([initialDefault]);
  return [initialDefault];
}

export async function saveTabToCloud(tab: PasteTab): Promise<PasteTab> {
  // Always update local cache immediately
  const local = getLocalTabs();
  const idx = local.findIndex(t => t.id === tab.id);
  if (idx >= 0) {
    local[idx] = tab;
  } else {
    local.push(tab);
  }
  saveLocalTabs(local);

  const supabase = getSupabaseClient();
  if (supabase) {
    const row = tabToSupabaseRow(tab);
    const { error } = await supabase.from('paste_tabs').upsert(row);
    if (error) {
      throw new Error(`Supabase save error: ${error.message}`);
    }
    return tab;
  }

  // Fallback to Express backend if running
  try {
    const res = await fetch(`/api/tabs/${tab.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tab)
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (_) {}

  return tab;
}

export async function createTabInCloud(tab: Partial<PasteTab>): Promise<PasteTab> {
  const newTab: PasteTab = {
    id: tab.id || `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: tab.name || 'New Charm',
    mainText: tab.mainText || '',
    segments: tab.segments || [],
    config: tab.config || DEFAULT_CONFIG(),
    position: typeof tab.position === 'number' ? tab.position : 0,
    updatedAt: new Date().toISOString()
  };

  const local = getLocalTabs();
  local.push(newTab);
  saveLocalTabs(local);

  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from('paste_tabs').insert([tabToSupabaseRow(newTab)]);
    if (error) {
      throw new Error(`Supabase create error: ${error.message}`);
    }
    return newTab;
  }

  // Fallback to Express backend
  try {
    const res = await fetch('/api/tabs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTab)
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (_) {}

  return newTab;
}

export async function deleteTabFromCloud(id: string): Promise<void> {
  const local = getLocalTabs().filter(t => t.id !== id);
  saveLocalTabs(local);

  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from('paste_tabs').delete().eq('id', id);
    if (error) {
      throw new Error(`Supabase delete error: ${error.message}`);
    }
    return;
  }

  try {
    await fetch(`/api/tabs/${id}`, { method: 'DELETE' });
  } catch (_) {}
}

export async function reorderTabsInCloud(order: string[]): Promise<void> {
  const local = getLocalTabs();
  const map = new Map(local.map(t => [t.id, t]));
  const reordered: PasteTab[] = [];
  order.forEach((id, i) => {
    const t = map.get(id);
    if (t) {
      t.position = i;
      reordered.push(t);
    }
  });
  saveLocalTabs(reordered);

  const supabase = getSupabaseClient();
  if (supabase) {
    const updates = reordered.map(t => ({
      id: t.id,
      position: t.position
    }));
    for (const item of updates) {
      await supabase.from('paste_tabs').update({ position: item.position }).eq('id', item.id);
    }
    return;
  }

  try {
    await fetch('/api/tabs/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order })
    });
  } catch (_) {}
}

// Real-time listener for cross-device sync via Supabase
export function subscribeToSupabaseTabs(onTabsChange: () => void): (() => void) | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const channel: RealtimeChannel = supabase
      .channel('public:paste_tabs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'paste_tabs' },
        () => {
          onTabsChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription error:', err);
    return null;
  }
}
