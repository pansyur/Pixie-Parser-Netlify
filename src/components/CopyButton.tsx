import { useState, CSSProperties, ReactNode } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
  doneLabel?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export default function CopyButton({
  text,
  label = 'Copy',
  doneLabel = 'Done',
  className = '',
  style
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard write failed, using textarea fallback:', err);
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`cursor-pointer transition-all duration-150 active:scale-95 flex items-center justify-center gap-1.5 ${className}`}
      style={style}
      title={copied ? doneLabel : label}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-500 animate-in zoom-in-75 duration-150" />
          <span className="text-emerald-600 font-semibold">{doneLabel}</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 opacity-80" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
