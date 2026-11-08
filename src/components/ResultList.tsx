import { useRef } from 'react';
import { ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import CopyButton from './CopyButton';

const STICKERS = ['🌟', '💫', '🎀', '🦋', '🌸', '✨'];

interface ResultListProps {
  segments: string[];
}

export default function ResultList({ segments }: ResultListProps) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (!segments || segments.length === 0) {
    return (
      <div className="wing-card p-10 text-center flex flex-col items-center justify-center gap-3">
        <div className="text-3xl animate-bounce">🧚‍♀️</div>
        <p className="text-sm font-semibold text-purple-900/60">
          No parsed blocks yet for this charm.
        </p>
        <p className="text-xs text-purple-900/40">
          Paste your text above and tap <strong className="text-pink-500">✨ Parse Content</strong>
        </p>
      </div>
    );
  }

  const allText = segments.join('\n\n');

  return (
    <div className="flex flex-col gap-4">
      {/* Copy All Button */}
      <CopyButton
        text={allText}
        label={`Copy All Blocks (${segments.length})`}
        doneLabel={`All ${segments.length} Blocks Copied!`}
        className="w-full py-4 rounded-2xl font-bold text-sm btn-primary shadow-md flex items-center justify-center gap-2 cursor-pointer"
      />

      {/* Segment Cards */}
      {segments.map((segment, index) => (
        <div
          key={index}
          ref={el => {
            itemRefs.current[index] = el;
          }}
          className="wing-card p-5 md:p-6 flex flex-col gap-3 scroll-mt-6 relative transition-all hover:shadow-lg"
        >
          {/* Sticker on card corner */}
          <div
            className="sticker"
            style={
              {
                '--rot': `${index % 2 === 0 ? 6 : -6}deg`,
                top: '-10px',
                left: '18px',
                fontSize: '1.1rem'
              } as any
            }
          >
            {STICKERS[index % STICKERS.length]}
          </div>

          {/* Block Header */}
          <div className="flex justify-between items-center border-b pb-3 pl-7" style={{ borderColor: '#f0dff0' }}>
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'rgba(75, 46, 131, 0.65)' }}
            >
              Block {index + 1} of {segments.length}
            </span>

            <div className="flex items-center gap-1.5 text-purple-700">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => itemRefs.current[index - 1]?.scrollIntoView({ behavior: 'smooth' })}
                className="p-1.5 rounded-lg hover:bg-pink-100/60 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                title="Scroll to previous block"
                aria-label="Scroll to previous block"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={index === segments.length - 1}
                onClick={() => itemRefs.current[index + 1]?.scrollIntoView({ behavior: 'smooth' })}
                className="p-1.5 rounded-lg hover:bg-pink-100/60 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                title="Scroll to next block"
                aria-label="Scroll to next block"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Block Content */}
          <div className="font-mono text-xs md:text-sm whitespace-pre-wrap break-words leading-relaxed text-slate-800 bg-white/50 p-3.5 rounded-2xl border border-purple-50 select-text">
            {segment}
          </div>

          {/* Block Copy Button */}
          <CopyButton
            text={segment}
            label={`Copy Block ${index + 1}`}
            doneLabel={`Block ${index + 1} Copied!`}
            className="w-full py-3 rounded-2xl font-bold text-xs border border-pink-200 bg-white hover:bg-pink-50 active:scale-98 transition-all cursor-pointer shadow-xs"
            style={{ color: 'var(--dusk-deep)' }}
          />
        </div>
      ))}
    </div>
  );
}
