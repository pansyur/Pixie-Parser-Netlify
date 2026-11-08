import { Plus, X } from 'lucide-react';

interface MultiInputProps {
  label?: string;
  values: string[];
  onValuesChange: (values: string[]) => void;
  placeholder?: string;
}

export default function MultiInput({
  label,
  values,
  onValuesChange,
  placeholder = 'Add term...'
}: MultiInputProps) {
  const vals = values && values.length > 0 ? values : [''];

  const update = (index: number, val: string) => {
    const next = vals.map((v, i) => (i === index ? val : v));
    onValuesChange(next);
  };

  const add = () => {
    onValuesChange([...vals, '']);
  };

  const remove = (index: number) => {
    const next = vals.filter((_, i) => i !== index);
    onValuesChange(next.length ? next : ['']);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-600">{label}</label>}
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
              title="Remove term"
              aria-label="Remove term"
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
