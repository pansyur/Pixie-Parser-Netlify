import { useState } from 'react';
import { Plus, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { ParserConfig } from '../lib/pixieParser';
import MultiValueFilter from './MultiValueFilter';
import MultiInput from './MultiInput';

interface ModifiersProps {
  config: ParserConfig;
  onConfig: (config: ParserConfig) => void;
}

export default function Modifiers({ config, onConfig }: ModifiersProps) {
  const [isOpen, setIsOpen] = useState(true);

  const set = (patch: Partial<ParserConfig>) => onConfig({ ...config, ...patch });
  const frRules = config.frRules && config.frRules.length > 0 ? config.frRules : [{ find: '', replace: '' }];

  const updateRule = (i: number, patch: Partial<{ find: string; replace: string }>) => {
    set({
      frRules: frRules.map((r, idx) => (idx === i ? { ...r, ...patch } : r))
    });
  };

  const addRule = () => {
    set({ frRules: [...frRules, { find: '', replace: '' }] });
  };

  const removeRule = (i: number) => {
    const next = frRules.filter((_, idx) => idx !== i);
    set({ frRules: next.length > 0 ? next : [{ find: '', replace: '' }] });
  };

  const reset = () => {
    set({
      breakTarget: '',
      breakLines: '1',
      breakPos: 'after',
      filterContaining: [],
      filterContainingLogic: 'or',
      filterNotContaining: [],
      filterNotContainingLogic: 'or',
      truncateDelimiters: [],
      truncateDirection: 'after',
      lineCutoffTexts: [],
      lineCutoffDirection: 'after',
      frRules: [{ find: '', replace: '' }]
    });
  };

  // Count active modifiers to show badge
  const activeCount = [
    config.breakTarget ? 1 : 0,
    (config.truncateDelimiters || []).filter(Boolean).length > 0 ? 1 : 0,
    (config.lineCutoffTexts || []).filter(Boolean).length > 0 ? 1 : 0,
    (config.filterContaining || []).filter(Boolean).length > 0 ? 1 : 0,
    (config.filterNotContaining || []).filter(Boolean).length > 0 ? 1 : 0,
    (config.frRules || []).filter(r => r.find).length > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="pt-4 border-t border-dashed flex flex-col gap-4" style={{ borderColor: '#f0dff0' }}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:opacity-80 transition-opacity cursor-pointer"
          style={{ color: 'var(--dusk-deep)' }}
        >
          <span>Modifiers &amp; Filters</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-pink-100 text-pink-700 font-extrabold">
              {activeCount} active
            </span>
          )}
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={reset}
          className="text-[11px] font-bold hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          style={{ color: 'var(--pixie-pink)' }}
          title="Reset all filter options"
        >
          <RotateCcw className="w-3 h-3" /> Reset Filters
        </button>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          {/* Inject Line Breaks Around Target Text */}
          <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-white/60 border border-purple-50">
            <label className="text-xs font-semibold text-slate-600">
              Inject Line Breaks Around Target Text:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={config.breakPos}
                onChange={e => set({ breakPos: e.target.value })}
                className="p-2.5 text-xs font-medium cursor-pointer"
              >
                <option value="after">After Text</option>
                <option value="before">Before Text</option>
              </select>
              <div className="flex items-center gap-1.5 bg-white px-2 py-1 border border-pink-100 rounded-2xl">
                <span className="text-[11px] text-slate-400">Breaks:</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={config.breakLines}
                  onChange={e => set({ breakLines: e.target.value })}
                  className="w-full p-1.5 text-xs border-none font-mono"
                />
              </div>
              <input
                type="text"
                value={config.breakTarget}
                onChange={e => set({ breakTarget: e.target.value })}
                className="p-2.5 text-xs font-mono"
                placeholder="Specific target text string..."
              />
            </div>
          </div>

          {/* Truncate Line at Delimiter */}
          <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-white/60 border border-purple-50">
            <label className="text-xs font-semibold text-slate-600">
              Truncate each line at delimiter:
            </label>
            <div className="mb-2">
              <select
                value={config.truncateDirection}
                onChange={e => set({ truncateDirection: e.target.value as 'after' | 'before' })}
                className="w-full p-2.5 text-xs font-medium cursor-pointer"
              >
                <option value="after">Remove delimiter + everything AFTER it</option>
                <option value="before">Remove delimiter + everything BEFORE it</option>
              </select>
            </div>
            <MultiInput
              label="Delimiters (cuts at earliest found per line):"
              values={config.truncateDelimiters || []}
              onValuesChange={v => set({ truncateDelimiters: v })}
              placeholder="e.g. | or // or #"
            />
          </div>

          {/* Marker Line Cutoff */}
          <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-white/60 border border-purple-50">
            <label className="text-xs font-semibold text-slate-600">
              Marker Cutoff (removes whole lines after / before a marker):
            </label>
            <div className="mb-2">
              <select
                value={config.lineCutoffDirection}
                onChange={e => set({ lineCutoffDirection: e.target.value as 'after' | 'before' })}
                className="w-full p-2.5 text-xs font-medium cursor-pointer"
              >
                <option value="after">Remove lines AFTER marker line</option>
                <option value="before">Remove lines BEFORE marker line</option>
              </select>
            </div>
            <MultiInput
              label="Marker texts (cuts at first line matching any):"
              values={config.lineCutoffTexts || []}
              onValuesChange={v => set({ lineCutoffTexts: v })}
              placeholder="e.g. --- END --- or Notes:"
            />
          </div>

          {/* Filter Lines Containing */}
          <div className="p-3 rounded-2xl bg-white/60 border border-purple-50">
            <MultiValueFilter
              label="Remove lines CONTAINING:"
              values={config.filterContaining || []}
              logic={config.filterContainingLogic || 'or'}
              onValuesChange={v => set({ filterContaining: v })}
              onLogicChange={v => set({ filterContainingLogic: v })}
              placeholder="Word or phrase to filter out..."
            />
          </div>

          {/* Filter Lines NOT Containing */}
          <div className="p-3 rounded-2xl bg-white/60 border border-purple-50">
            <MultiValueFilter
              label="Remove lines NOT containing:"
              values={config.filterNotContaining || []}
              logic={config.filterNotContainingLogic || 'or'}
              onValuesChange={v => set({ filterNotContaining: v })}
              onLogicChange={v => set({ filterNotContainingLogic: v })}
              placeholder="Keep lines only containing..."
            />
          </div>

          {/* Find & Replace Rules */}
          <div className="flex flex-col gap-2 p-3 rounded-2xl bg-white/60 border border-purple-50">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600">
                Find &amp; Replace (leave Replace blank to delete):
              </label>
              <button
                type="button"
                onClick={addRule}
                className="text-[11px] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                style={{ color: 'var(--pixie-pink)' }}
              >
                <Plus className="w-3.5 h-3.5" /> Add Rule
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {frRules.map((rule, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <input
                    type="text"
                    value={rule.find}
                    onChange={e => updateRule(i, { find: e.target.value })}
                    className="p-2.5 text-xs font-mono"
                    placeholder="Find text..."
                  />
                  <input
                    type="text"
                    value={rule.replace}
                    onChange={e => updateRule(i, { replace: e.target.value })}
                    className="p-2.5 text-xs font-mono"
                    placeholder="Replace with... (blank = remove)"
                  />
                  <button
                    type="button"
                    onClick={() => removeRule(i)}
                    className="p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors cursor-pointer self-stretch sm:self-auto flex items-center justify-center"
                    title="Remove rule"
                    aria-label="Remove rule"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
