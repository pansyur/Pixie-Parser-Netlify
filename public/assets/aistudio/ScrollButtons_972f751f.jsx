import { ArrowUpToLine, ArrowDownToLine } from 'lucide-react';

export default function ScrollButtons() {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50 opacity-70 hover:opacity-100 transition-opacity">
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="p-3 bg-white rounded-full shadow-lg" style={{ color: 'var(--dusk-deep)' }} title="Top">
        <ArrowUpToLine className="w-5 h-5" />
      </button>
      <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="p-3 bg-white rounded-full shadow-lg" style={{ color: 'var(--dusk-deep)' }} title="Bottom">
        <ArrowDownToLine className="w-5 h-5" />
      </button>
    </div>
  );
}