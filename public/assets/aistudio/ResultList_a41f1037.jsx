import { useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import CopyButton from './CopyButton';

const STICKERS = ['🌟', '💫', '🎀', '🦋'];

export default function ResultList({ segments }) {
  const refs = useRef([]);

  if (!segments || segments.length === 0) {
    return (
      <div className="text-center text-sm text-slate-400 py-12">
        No parsed blocks yet.<br />
        <span className="font-bold">Paste text and click Parse Content ✨</span>
      </div>
    );
  }

  return (
    <>
      <CopyButton
        text={segments.join('\n\n')}
        label={`Copy All Blocks (${segments.length})`}
        doneLabel="All Copied!"
        className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 btn-primary"
      />
      {segments.map((segment, index) => (
        <div key={index} ref={el => refs.current[index] = el} className="wing-card p-5 flex flex-col gap-3 scroll-mt-6 relative">
          <div className="sticker" style={{ '--rot': `${index % 2 ? 6 : -6}deg`, top: '-10px', left: '16px', fontSize: '1rem' }}>
            {STICKERS[index % 4]}
          </div>
          <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: '#f0dff0' }}>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(75,46,131,0.5)' }}>
              Block {index + 1} of {segments.length}
            </span>
            <div className="flex gap-2 text-slate-400">
              <button disabled={index === 0} onClick={() => refs.current[index - 1]?.scrollIntoView({ behavior: 'smooth' })} className="nav-btn disabled:opacity-30">
                <ChevronUp className="w-4 h-4" />
              </button>
              <button disabled={index === segments.length - 1} onClick={() => refs.current[index + 1]?.scrollIntoView({ behavior: 'smooth' })} className="nav-btn disabled:opacity-30">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="font-mono text-sm whitespace-pre-wrap break-words">{segment}</div>
          <CopyButton
            text={segment}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm border"
            style={{ borderColor: '#f0dff0', color: 'var(--dusk-deep)' }}
          />
        </div>
      ))}
    </>
  );
}