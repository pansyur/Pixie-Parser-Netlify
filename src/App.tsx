import { useState, useEffect, useCallback, useRef } from 'react';
import { parseContent, DEFAULT_CONFIG } from './lib/pixieParser';
import {
  PasteTab,
  fetchTabsFromCloud,
  saveTabToCloud,
  createTabInCloud,
  deleteTabFromCloud,
  reorderTabsInCloud,
  saveLocalTabs,
  subscribeToSupabaseTabs
} from './lib/api';
import { isSupabaseConfigured } from './lib/supabase';

import Floaters from './components/Floaters';
import Header, { SyncState } from './components/Header';
import TabBar from './components/TabBar';
import EditorCard from './components/EditorCard';
import ResultList from './components/ResultList';
import ScrollButtons from './components/ScrollButtons';
import BackupModal from './components/BackupModal';
import SupabaseModal from './components/SupabaseModal';

export default function App() {
  const [tabs, setTabs] = useState<PasteTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseLive, setIsSupabaseLive] = useState(isSupabaseConfigured());
  const [sync, setSync] = useState<{ state: SyncState; msg: string }>({
    state: 'ready',
    msg: isSupabaseConfigured() ? 'Supabase Connected' : 'Cloud Ready'
  });
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState(false);

  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const tabsRef = useRef<PasteTab[]>([]);
  const activeIdRef = useRef<string | null>(null);

  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  useEffect(() => {
    activeIdRef.current = activeTabId;
  }, [activeTabId]);

  const updateSync = (state: SyncState, msg: string) => setSync({ state, msg });
  const activeTab = tabs.find(t => t.id === activeTabId);

  // Save active tab to cloud (Supabase or server)
  const saveActiveTab = useCallback(async () => {
    const id = activeIdRef.current;
    const tab = tabsRef.current.find(t => t.id === id);
    if (!tab) return;

    try {
      await saveTabToCloud(tab);
      const isSupa = isSupabaseConfigured();
      updateSync('saved', isSupa ? 'Supabase Synced' : 'Cloud Synced');
    } catch (err) {
      console.error('Error saving tab:', err);
      updateSync('error', 'Sync Failed');
    }
  }, []);

  // Debounced auto-save
  const scheduleSave = useCallback(() => {
    if (!activeIdRef.current) return;
    updateSync('saving', 'Saving...');
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    saveTimer.current = setTimeout(saveActiveTab, 600);
  }, [saveActiveTab]);

  // Load tabs from cloud database
  const loadTabs = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    const isSupa = isSupabaseConfigured();
    setIsSupabaseLive(isSupa);
    updateSync('saving', isSupa ? 'Connecting Supabase...' : 'Loading Cloud DB...');

    try {
      const fetchedTabs = await fetchTabsFromCloud();
      setTabs(fetchedTabs);
      if (fetchedTabs.length > 0) {
        // Keep current active tab if still present, otherwise default to first
        setActiveTabId(prev => {
          if (prev && fetchedTabs.some(t => t.id === prev)) return prev;
          return fetchedTabs[0].id;
        });
      }
      updateSync('ready', isSupa ? 'Supabase Realtime' : 'Cloud Synced');
    } catch (err) {
      console.error('Error loading tabs:', err);
      updateSync('error', 'Load Failed');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTabs(true);
  }, [loadTabs]);

  // Subscribe to Supabase Realtime cross-device updates
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const unsubscribe = subscribeToSupabaseTabs(() => {
      // Remote changes detected from another device/tab! Reload tabs seamlessly
      loadTabs(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isSupabaseLive, loadTabs]);

  // Keyboard shortcut: Ctrl+S to save immediately
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveActiveTab();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [saveActiveTab]);

  const updateActiveTab = (patch: Partial<PasteTab>) => {
    setTabs(prev =>
      prev.map(t => (t.id === activeIdRef.current ? { ...t, ...patch } : t))
    );
  };

  const onTabName = (val: string) => {
    updateActiveTab({ name: val });
    scheduleSave();
  };

  const onMainText = (val: string) => {
    updateActiveTab({ mainText: val });
    scheduleSave();
  };

  const onConfig = (newConfig: any) => {
    updateActiveTab({ config: newConfig });
    scheduleSave();
  };

  const onParse = () => {
    const tab = tabsRef.current.find(t => t.id === activeIdRef.current);
    if (!tab) return;

    const segments = parseContent(tab.mainText, tab.config);
    updateActiveTab({ segments });

    updateSync('saving', 'Saving parsed content...');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(saveActiveTab, 250);
  };

  const onClear = () => {
    updateActiveTab({ mainText: '', segments: [] });
    scheduleSave();
  };

  const createNewTab = async () => {
    updateSync('saving', 'Creating Charm...');
    try {
      const count = tabsRef.current.length + 1;
      const newTab = await createTabInCloud({
        name: `Charm ${count}`,
        mainText: '',
        segments: [],
        config: DEFAULT_CONFIG(),
        position: tabsRef.current.length
      });
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
      updateSync('saved', 'Charm Created');
    } catch (err) {
      console.error(err);
      updateSync('error', 'Creation Failed');
    }
  };

  const deleteTab = async () => {
    if (!activeIdRef.current) return;
    const tabToDelete = tabsRef.current.find(t => t.id === activeIdRef.current);
    const confirmName = tabToDelete?.name || 'this tab';

    if (!window.confirm(`Are you sure you want to delete "${confirmName}"? This cannot be undone.`)) {
      return;
    }

    updateSync('saving', 'Deleting...');
    try {
      await deleteTabFromCloud(activeIdRef.current);
      const remaining = tabsRef.current.filter(t => t.id !== activeIdRef.current);
      setTabs(remaining);
      setActiveTabId(remaining.length > 0 ? remaining[0].id : null);
      updateSync('saved', 'Tab Deleted');
    } catch (err) {
      console.error(err);
      updateSync('error', 'Delete Failed');
    }
  };

  const moveTab = async (tabId: string, direction: 'left' | 'right') => {
    const currentIndex = tabs.findIndex(t => t.id === tabId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= tabs.length) return;

    const newTabs = [...tabs];
    const [moved] = newTabs.splice(currentIndex, 1);
    newTabs.splice(targetIndex, 0, moved);

    // Re-index
    newTabs.forEach((t, i) => {
      t.position = i;
    });

    setTabs(newTabs);
    try {
      await reorderTabsInCloud(newTabs.map(t => t.id));
      updateSync('saved', 'Order Saved');
    } catch (err) {
      console.warn('Could not save reordered tabs:', err);
    }
  };

  const handleImportBackup = (importedTabs: PasteTab[]) => {
    const formatted = importedTabs.map((t, idx) => ({
      ...t,
      id: t.id || `tab_${Date.now()}_${idx}`,
      config: t.config || DEFAULT_CONFIG(),
      position: idx
    }));

    setTabs(formatted);
    saveLocalTabs(formatted);
    if (formatted.length > 0) {
      setActiveTabId(formatted[0].id);
    }

    formatted.forEach(t => saveTabToCloud(t).catch(console.error));
    updateSync('saved', 'Imported & Synced');
  };

  const handleSupabaseConfigChanged = () => {
    setIsSupabaseLive(isSupabaseConfigured());
    loadTabs(false);
  };

  const overallStats = {
    totalTabs: tabs.length,
    totalChars: tabs.reduce((acc, t) => acc + (t.mainText ? t.mainText.length : 0), 0),
    totalSegments: tabs.reduce((acc, t) => acc + (t.segments ? t.segments.length : 0), 0)
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-purple-900/60 font-display">
          Opening Pixie Workshop... ✨
        </p>
      </div>
    );
  }

  return (
    <>
      <Floaters />
      <div className="relative z-10 max-w-2xl mx-auto flex flex-col gap-6 p-4 md:p-8 min-h-screen">
        <Header
          sync={sync}
          isSupabaseLive={isSupabaseLive}
          onOpenSupabase={() => setIsSupabaseOpen(true)}
          onOpenBackup={() => setIsBackupOpen(true)}
          stats={overallStats}
        />

        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSelect={setActiveTabId}
          onNew={createNewTab}
          onMoveTab={moveTab}
        />

        {activeTab ? (
          <>
            <EditorCard
              tabName={activeTab.name}
              mainText={activeTab.mainText}
              config={activeTab.config}
              onTabName={onTabName}
              onMainText={onMainText}
              onConfig={onConfig}
              onParse={onParse}
              onClear={onClear}
              onDeleteTab={deleteTab}
            />

            <div className="flex flex-col gap-4 pb-24">
              <ResultList segments={activeTab.segments} />
            </div>
          </>
        ) : (
          <div className="wing-card p-10 text-center flex flex-col items-center gap-3">
            <span className="text-4xl animate-bounce">✨</span>
            <p className="text-sm font-bold text-purple-900">No Charms on the Bracelet</p>
            <p className="text-xs text-purple-700/60">
              Create a paste tab to begin parsing and syncing your content!
            </p>
            <button
              type="button"
              onClick={createNewTab}
              className="mt-2 py-3 px-6 rounded-2xl font-bold text-xs btn-primary cursor-pointer"
            >
              + Create First Charm
            </button>
          </div>
        )}
      </div>

      <ScrollButtons />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        tabs={tabs}
        onImport={handleImportBackup}
      />

      <SupabaseModal
        isOpen={isSupabaseOpen}
        onClose={() => setIsSupabaseOpen(false)}
        onConfigChanged={handleSupabaseConfigChanged}
      />
    </>
  );
}
