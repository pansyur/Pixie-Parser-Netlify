import { Plus, X } from 'lucide-react';

export default function MultiInput({ label, values, onValuesChange, placeholder }) {
  const vals = values && values.length ? values : [''];
  const update = (i, val) => onValuesChange(vals.map((v, idx) => idx === i ? val : v));
  const add = () => onValuesChange([...vals, '']);
  const remove = (i) => {
    const next = vals.filter((_, idx) => idx !== i);
    onValuesChange(next.length ? next : ['']);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-500">{label}</label>}
      {vals.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input type="text" value={v} onChange={e => update(i, e.target.value)} placeholder={placeholder} className="flex-1 p-3 text-xs" />
          <button type="button" onClick={() => remove(i)} className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-[10px] font-bold hover:underline flex items-center gap-1 self-start" style={{ color: 'var(--pixie-pink)' }}>
        <Plus className="w-3 h-3" /> Add term
      </button>
    </div>
  );
}