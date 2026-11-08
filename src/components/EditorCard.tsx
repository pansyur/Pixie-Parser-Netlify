import { useState, useRef } from 'react';
import { Trash2, Eraser, Sparkles, FileText, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ParserConfig, getTextStats } from '../lib/pixieParser';
import Modifiers from './Modifiers';

interface EditorCardProps {
  tabName: string;
  mainText: string;
  config: ParserConfig;
  onTabName: (val: string) => void;
  onMainText: (val: string) => void;
  onConfig: (cfg: ParserConfig) => void;
  onParse: () => void;
  onClear: () => void;
  onDeleteTab: () => void;
}

export default function EditorCard({
  tabName,
  mainText,
  config,
  onTabName,
  onMainText,
  onConfig,
  onParse,
  onClear,
  onDeleteTab
}: EditorCardProps) {
  const [isParsing, setIsParsing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stats = getTextStats(mainText);

  const handleParse = () => {
    setIsParsing(true);
    // Fire celebratory pixie confetti from the button position
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#FF6FB5', '#6C4AB6', '#FFD166', '#2EC4B6']
      });
    } catch (_) {}

    onParse();
    setTimeout(() => setIsParsing(false), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to parse immediately
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleParse();
    }
  };

  return (
    <div className="wing-card p-6 md:p-7 relative">
      <div className="sticker" style={{ '--rot': '8deg', top: '-12px', right: '20px' } as any}>
        🌸
      </div>

      {/* Tab Name and Tab Actions */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={tabName}
            onChange={e => onTabName(e.target.value)}
            placeholder="Tab name / Charm label..."
            className="w-full p-3 pl-3.5 text-sm font-bold tracking-tight text-purple-950 placeholder:text-purple-300"
          />
        </div>
        <button
          type="button"
          onClick={onDeleteTab}
          title="Delete this paste tab"
          className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-2xl transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Textarea for Unformatted Content */}
      <div className="relative mb-2">
        <textarea
          ref={textareaRef}
          value={mainText}
          onChange={e => onMainText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-48 md:h-56 p-4 font-mono text-xs md:text-sm leading-relaxed resize-y"
          placeholder="Paste your unformatted content here... (No length limits! Paste megabytes of text with zero restrictions)"
        />
      </div>

      {/* Text info bar */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-4 px-1">
        <div className="flex items-center gap-3">
          <span>{stats.lines} line{stats.lines === 1 ? '' : 's'}</span>
          <span>•</span>
          <span>{stats.words} word{stats.words === 1 ? '' : 's'}</span>
          <span>•</span>
          <span>{stats.chars.toLocaleString()} char{stats.chars === 1 ? '' : 's'}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-slate-400">
          <Info className="w-3 h-3" />
          <span>Press Ctrl+Enter to parse</span>
        </div>
      </div>

      {/* Split controls and action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div className="flex items-center gap-2">
          <select
            value={config.lineCount}
            onChange={e => onConfig({ ...config, lineCount: e.target.value })}
            className="w-full p-3.5 text-xs md:text-sm font-semibold cursor-pointer text-purple-950"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(n => (
              <option key={n} value={n}>
                Split by: {n} Empty Line{n > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleParse}
            disabled={isParsing}
            className="flex-1 py-3.5 px-4 rounded-2xl font-bold text-xs md:text-sm btn-primary flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            <Sparkles className={`w-4 h-4 text-amber-200 ${isParsing ? 'animate-spin' : ''}`} />
            <span>✨ Parse Content</span>
          </button>
          <button
            type="button"
            onClick={onClear}
            title="Clear text and results"
            className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-colors cursor-pointer flex items-center justify-center"
          >
            <Eraser className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modifiers & Filters section */}
      <Modifiers config={config} onConfig={onConfig} />
    </div>
  );
}
