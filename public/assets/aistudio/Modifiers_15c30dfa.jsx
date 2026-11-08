import { Plus, X } from 'lucide-react';
import MultiValueFilter from './MultiValueFilter';
import MultiInput from './MultiInput';

export default function Modifiers({ config, onConfig }) {
  const set = (patch) => onConfig({ ...config, ...patch });
  const frRules = config.frRules && config.frRules.length ? config.frRules : [{ find: '', replace: '' }];

  const updateRule = (i, patch) => set({ frRules: frRules.map((r, idx) => idx === i ? { ...r, ...patch } : r) });
  const addRule = () => set({ frRules: [...frRules, { find: '', replace: '' }] });
  const removeRule = (i) => {
    const next = frRules.filter((_, idx) => idx !== i);
    set({ frRules: next.length ? next : [{ find: '', replace: '' }] });
  };

  const reset = () => set({
    breakTarget: '', breakLines: '1', breakPos: 'after',
    filterContaining: [], filterContainingLogic: 'or',
    filterNotContaining: [], filterNotContainingLogic: 'or',
    truncateDelimiters: [], truncateDirection: 'after',
    lineCutoffTexts: [], lineCutoffDirection: 'after',
    frRules: [{ find: '', replace: '' }]
  });

  return (
    <div className="pt-4 border-t border-dashed flex flex-col gap-4" style={{ borderColor: '#f0dff0' }}>
      <div className="flex items-center justify-between mt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(75,46,131,0.6)' }}>Modifiers &amp; Filters</h2>
        <button onClick={reset} className="text-[10px] font-bold hover:underline" style={{ color: 'var(--pixie-pink)' }}>Reset Filters</button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-500">Inject Line Breaks Around Target Text:</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <select value={config.breakPos} onChange={e => set({ breakPos: e.target.value })} className="p-3 text-xs font-medium">
            <option value="before">Before Text</option>
            <option value="after">After Text</option>
          </select>
          <input type="number" min="1" max="20" value={config.breakLines} onChange={e => set({ breakLines: e.target.value })} className="p-3 text-xs" />
          <input type="text" value={config.breakTarget} onChange={e => set({ breakTarget: e.target.value })} className="p-3 text-xs" placeholder="Specific text string..." />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-500">Truncate each line at delimiter (removes delimiter + everything after/before):</label>
        <select value={config.truncateDirection} onChange={e => set({ truncateDirection: e.target.value })} className="p-3 text-xs font-medium">
          <option value="after">Remove after delimiter</option>
          <option value="before">Remove before delimiter</option>
        </select>
        <MultiInput
          label="Delimiters (truncates at the earliest one found per line):"
          values={config.truncateDelimiters || []}
          onValuesChange={v => set({ truncateDelimiters: v })}
          placeholder="e.g. |"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-500">Remove all lines after / before a marker line:</label>
        <select value={config.lineCutoffDirection} onChange={e => set({ lineCutoffDirection: e.target.value })} className="p-3 text-xs font-medium">
          <option value="after">Remove lines AFTER marker</option>
          <option value="before">Remove lines BEFORE marker</option>
        </select>
        <MultiInput
          label="Marker texts (cuts at the first line matching any):"
          values={config.lineCutoffTexts || []}
          onValuesChange={v => set({ lineCutoffTexts: v })}
          placeholder="Marker text in the line..."
        />
      </div>

      <MultiValueFilter
        label="Remove lines CONTAINING:"
        values={config.filterContaining || []}
        logic={config.filterContainingLogic || 'or'}
        onValuesChange={v => set({ filterContaining: v })}
        onLogicChange={v => set({ filterContainingLogic: v })}
        placeholder="Word / phrase..."
      />
      <MultiValueFilter
        label="Remove lines NOT containing:"
        values={config.filterNotContaining || []}
        logic={config.filterNotContainingLogic || 'or'}
        onValuesChange={v => set({ filterNotContaining: v })}
        onLogicChange={v => set({ filterNotContainingLogic: v })}
        placeholder="Word / phrase..."
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-500">Find &amp; Replace (blank "Replace" = remove):</label>
          <button type="button" onClick={addRule} className="text-[10px] font-bold hover:underline flex items-center gap-1" style={{ color: 'var(--pixie-pink)' }}>
            <Plus className="w-3 h-3" /> Add Rule
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {frRules.map((rule, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-center">
              <input type="text" value={rule.find} onChange={e => updateRule(i, { find: e.target.value })} className="p-3 text-xs" placeholder="Find text..." />
              <input type="text" value={rule.replace} onChange={e => updateRule(i, { replace: e.target.value })} className="p-3 text-xs" placeholder="Replace with... (blank = remove)" />
              <button type="button" onClick={() => removeRule(i)} className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}