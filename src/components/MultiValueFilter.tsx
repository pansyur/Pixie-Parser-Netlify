import { Plus, X } from 'lucide-react';

interface MultiValueFilterProps {
  label: string;
  values: string[];
  logic: 'or' | 'and';
  onValuesChange: (values: string[]) => void;
  onLogicChange: (logic: 'or' | 'and') => void;
  placeholder?: string;
}

export default function MultiValueFilter({
  label,
  values,
  logic,
  onValuesChange,
  onLogicChange,
  placeholder = 'Word / phrase...'
}: MultiValueFilterProps) {
  const vals = values || [];

  const update = (index: number, val: string) => {
    onValuesChange(vals.map((v, i) => (i === index ? val : v)));
  };

  const add = () => {
    onValuesChange([...vals, '']);
  };

  const remove = (index: number) => {
    onValuesChange(vals.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-600">{label}</label>
        <div className="flex rounded-lg overflow-hidden border border-purple-100 shadow-xs">
          <button
            type="button"
            onClick={() => onLogicChange('or')}
            className={`px-2.5 py-1 text-[10px] font-bold transition-colors cursor-pointer ${
              logic === 'or' ? 'text-white' : 'text-slate-500 bg-white hover:bg-slate-50'
            }`}
            style={
              logic === 'or'
                ? { background: 'linear-gradient(135deg, var(--pixie-pink), var(--dusk))' }
                : undefined
            }
          >
            OR
          </button>
          <button
            type="button"
            onClick={() => onLogicChange('and')}
            className={`px-2.5 py-1 text-[10px] font-bold transition-colors cursor-pointer ${
              logic === 'and' ? 'text-white' : 'text-slate-500 bg-white hover:bg-slate-50'
            }`}
            style={
              logic === 'and'
                ? { background: 'linear-gradient(135deg, var(--pixie-pink), var(--dusk))' }
                : undefined
            }
          >
            AND
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {vals.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={v}
              onChange={e => update(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 p-2.5 text-xs font-mono"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
              title="Remove filter"
              aria-label="Remove filter"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="text-[11px] font-bold hover:underline flex items-center gap-1 self-start mt-0.5 cursor-pointer"
        style={{ color: 'var(--pixie-pink)' }}
      >
        <Plus className="w-3.5 h-3.5" /> Add term
      </button>
    </div>
  );
}
