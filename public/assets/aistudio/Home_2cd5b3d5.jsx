const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useCallback, useRef } from 'react';

import { parseContent, DEFAULT_CONFIG } from '@/lib/pixieParser';
import Floaters from '@/components/pixie/Floaters';
import Header from '@/components/pixie/Header';
import TabBar from '@/components/pixie/TabBar';
import EditorCard from '@/components/pixie/EditorCard';
import ResultList from '@/components/pixie/ResultList';
import ScrollButtons from '@/components/pixie/ScrollButtons';

function rowToTab(row) {
  let segments = [];
  let config = DEFAULT_CONFIG();
  try { segments = row.segments ? JSON.parse(row.segments) : []; } catch (e) {}
  try { config = row.config ? { ...DEFAULT_CONFIG(), ...JSON.parse(row.config) } : DEFAULT_CONFIG(); } catch (e) {}
  return {
    id: row.id,
    name: row.name || 'Untitled Tab',
    mainText: row.mainText || '',
    segments, config,
    position: row.position || 0
  };
}

function tabToPayload(tab) {
  return {
    name: tab.name,
    mainText: tab.mainText,
    segments: JSON.stringify(tab.segments || []),
    config: JSON.stringify(tab.config || DEFAULT_CONFIG()),
    position: tab.position || 0
  };
}

export default function Home() {
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sync, setSync] = useState({ state: 'ready', msg: 'Ready' });
  const saveTimer = useRef(null);
  const tabsRef = useRef([]);
  const activeIdRef = useRef(null);

  useEffect(() => { tabsRef.current = tabs; }, [tabs]);
  useEffect(() => { activeIdRef.current = activeTabId; }, [activeTabId]);

  const updateSync = (state, msg) => setSync({ state, msg });
  const activeTab = tabs.find(t => t.id === activeTabId);

  const saveActiveTab = useCallback(async () => {
    const id = activeIdRef.current;
    const tab = tabsRef.current.find(t => t.id === id);
    if (!tab) return;
    try {
      await db.entities.PasteTab.update(tab.id, tabToPayload(tab));
      updateSync('saved', 'Saved');
    } catch (err) {
      console.error(err);
      updateSync('error', 'Save failed');
    }
  }, []);

  const scheduleSave = useCallback(() => {
    if (!activeIdRef.current) return;
    updateSync('saving', 'Saving...');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(saveActiveTab, 700);
  }, [saveActiveTab]);

  const loadTabs = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await db.entities.PasteTab.list('position', 200);
      let mapped = rows.map(rowToTab).sort((a, b) => a.position - b.position);
      if (mapped.length === 0) {
        const row = await db.entities.PasteTab.create({
          name: 'Charm 1', mainText: '', segments: '[]',
          config: JSON.stringify(DEFAULT_CONFIG()), position: 0
        });
        mapped = [rowToTab(row)];
      }
      setTabs(mapped);
      setActiveTabId(mapped[0].id);
      updateSync('ready', 'Ready');
    } catch (err) {
      console.error(err);
      updateSync('error', 'Load failed');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadTabs(); }, [loadTabs]);

  const updateActiveTab = (patch) => {
    setTabs(prev => prev.map(t => t.id === activeIdRef.current ? { ...t, ...patch } : t));
  };

  const onTabName = (val) => { updateActiveTab({ name: val }); scheduleSave(); };
  const onMainText = (val) => { updateActiveTab({ mainText: val }); scheduleSave(); };
  const onConfig = (newConfig) => { updateActiveTab({ config: newConfig }); scheduleSave(); };

  const onParse = () => {
    const tab = tabsRef.current.find(t => t.id === activeIdRef.current);
    if (!tab) return;
    const segments = parseContent(tab.mainText, tab.config);
    updateActiveTab({ segments });
    updateSync('saving', 'Saving...');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(saveActiveTab, 300);
  };

  const onClear = () => {
    updateActiveTab({ mainText: '', segments: [] });
    scheduleSave();
  };

  const createNewTab = async () => {
    updateSync('saving', 'Creating...');
    try {
      const row = await db.entities.PasteTab.create({
        name: `Charm ${tabsRef.current.length + 1}`,
        mainText: '', segments: '[]',
        config: JSON.stringify(DEFAULT_CONFIG()),
        position: tabsRef.current.length
      });
      const newTab = rowToTab(row);
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
      updateSync('saved', 'Tab created');
    } catch (err) {
      console.error(err);
      updateSync('error', 'Create failed');
    }
  };

  const deleteTab = async () => {
    if (!activeIdRef.current) return;
    if (!confirm('Delete this paste tab? This cannot be undone.')) return;
    updateSync('saving', 'Deleting...');
    try {
      await db.entities.PasteTab.delete(activeIdRef.current);
      const remaining = tabsRef.current.filter(t => t.id !== activeIdRef.current);
      setTabs(remaining);
      setActiveTabId(remaining.length > 0 ? remaining[0].id : null);
      updateSync('saved', 'Tab deleted');
    } catch (err) {
      console.error(err);
      updateSync('error', 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Floaters />
      <div className="relative z-10 max-w-2xl mx-auto flex flex-col gap-6 p-4 md:p-8">
        <Header sync={sync} />
        <TabBar tabs={tabs} activeTabId={activeTabId} onSelect={setActiveTabId} onNew={createNewTab} />
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
          <div className="wing-card p-8 text-center text-sm text-slate-400">
            No tabs yet. Create one to start parsing! ✨
          </div>
        )}
      </div>
      <ScrollButtons />
    </>
  );
}