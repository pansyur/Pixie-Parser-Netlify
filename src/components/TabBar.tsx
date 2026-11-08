import { Sparkles, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { PasteTab } from '../lib/api';

interface TabBarProps {
  tabs: PasteTab[];
  activeTabId: string | null;
  onSelect: (tabId: string) => void;
  onNew: () => void;
  onMoveTab?: (tabId: string, direction: 'left' | 'right') => void;
}

export default function TabBar({
  tabs,
  activeTabId,
  onSelect,
  onNew,
  onMoveTab
}: TabBarProps) {
  const activeIndex = tabs.findIndex(t => t.id === activeTabId);

  return (
    <div className="wing-card p-4 relative">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-900/60">
          Charms ({tabs.length})
        </span>

        {onMoveTab && activeIndex >= 0 && tabs.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={activeIndex === 0}
              onClick={() => activeTabId && onMoveTab(activeTabId, 'left')}
              className="p-1 rounded-lg text-purple-700 hover:bg-pink-100/60 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
              title="Move tab left"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={activeIndex === tabs.length - 1}
              onClick={() => activeTabId && onMoveTab(activeTabId, 'right')}
              className="p-1 rounded-lg text-purple-700 hover:bg-pink-100/60 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
              title="Move tab right"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        {tabs.length === 0 ? (
          <span className="text-xs text-slate-400 px-2 py-1">
            No tabs yet — click below to create your first charm ✨
          </span>
        ) : (
          tabs.map(tab => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelect(tab.id)}
                className={`tab-pill px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer select-none transition-all ${
                  isActive ? 'active scale-102 ring-2 ring-purple-300/40' : ''
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isActive ? 'text-amber-200 animate-pulse' : 'text-purple-400'}`} />
                <span>{tab.name || 'Untitled Tab'}</span>
                {tab.segments && tab.segments.length > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-pink-100 text-purple-800'
                    }`}
                  >
                    {tab.segments.length}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      <button
        type="button"
        onClick={onNew}
        className="mt-3 w-full py-2.5 rounded-2xl font-bold text-xs border border-dashed flex items-center justify-center gap-1.5 hover:bg-pink-50/50 active:scale-99 transition-all cursor-pointer"
        style={{ borderColor: 'var(--pixie-pink)', color: 'var(--dusk-deep)' }}
      >
        <Plus className="w-3.5 h-3.5 text-pink-500" />
        <span>+ New Paste Tab</span>
      </button>
    </div>
  );
}
