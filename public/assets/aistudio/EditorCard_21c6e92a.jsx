import { Trash2, Eraser } from 'lucide-react';
import Modifiers from './Modifiers';

export default function EditorCard({ tabName, mainText, config, onTabName, onMainText, onConfig, onParse, onClear, onDeleteTab }) {
  return (
    <div className="wing-card p-6">
      <div className="sticker" style={{ '--rot': '8deg', top: '-12px', right: '20px' }}>🌸</div>
      <div className="flex items-center gap-2 mb-3">
        <input type="text" value={tabName} onChange={e => onTabName(e.target.value)} placeholder="Tab name..." className="flex-1 p-3 text-sm font-bold" />
        <button onClick={onDeleteTab} title="Delete this tab" className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-100">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <textarea value={mainText} onChange={e => onMainText(e.target.value)} className="w-full h-40 p-5 font-mono text-sm mb-4" placeholder="Paste your unformatted content here..." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <select value={config.lineCount} onChange={e => onConfig({ ...config, lineCount: e.target.value })} className="p-3.5 text-sm font-medium">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <option key={n} value={n}>Split by: {n} Line{n > 1 ? 's' : ''}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button onClick={onParse} className="flex-1 py-3.5 rounded-2xl font-bold text-sm btn-primary">✨ Parse Content</button>
          <button onClick={onClear} className="px-5 py-3.5 bg-slate-100 text-slate-500 rounded-2xl font-bold">
            <Eraser className="w-5 h-5" />
          </button>
        </div>
      </div>
      <Modifiers config={config} onConfig={onConfig} />
    </div>
  );
}