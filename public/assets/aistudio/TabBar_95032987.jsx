import { Sparkles } from 'lucide-react';

export default function TabBar({ tabs, activeTabId, onSelect, onNew }) {
  return (
    <div className="wing-card p-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.length === 0 ? (
          <span className="text-xs text-slate-400 px-2">No tabs yet — create one below ✨</span>
        ) : (
          tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              className={`tab-pill px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${tab.id === activeTabId ? 'active' : ''}`}
            >
              <Sparkles className="w-3 h-3" /> {tab.name}
            </button>
          ))
        )}
      </div>
      <button
        onClick={onNew}
        className="mt-3 w-full py-2.5 rounded-2xl font-bold text-xs border border-dashed"
        style={{ borderColor: 'var(--pixie-pink)', color: 'var(--dusk-deep)' }}
      >
        + New Paste Tab
      </button>
    </div>
  );
}