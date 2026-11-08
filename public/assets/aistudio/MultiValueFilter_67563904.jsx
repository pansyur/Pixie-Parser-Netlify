import { Plus, X } from 'lucide-react';

export default function MultiValueFilter({ label, values, logic, onValuesChange, onLogicChange, placeholder }) {
  const update = (i, val) => onValuesChange(values.map((v, idx) => idx === i ? val : v));
  const add = () => onValuesChange([...(values || []), '']);
  const remove = (i) => onValuesChange((values || []).filter((_, idx) => idx !== i));
  const vals = values || [];

  const btn = (val, label) => ({
    onClick: () => onLogicChange(val),
    className: `px-2.5 py-1 text-[10px] font-bold ${logic === val ? 'text-white' : 'text-slate-400'}`,
    style: logic === val ? { background: 'linear-gradient(135deg,var(--pixie-pink),var(--dusk))' } : { background: '#fff' }
  });

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-500">{label}</label>
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: '#f0dff0' }}>
          <button type="button" {...btn('or', 'OR')}>OR</button>
          <button type="button" {...btn('and', 'AND')}>AND</button>
        </div>
      </div>
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