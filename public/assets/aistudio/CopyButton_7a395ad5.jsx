import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({ text, label = 'Copy', doneLabel = 'Done', className = '', style }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle} className={className} style={style}>
      {copied ? <><Check className="w-4 h-4" /> {doneLabel}</> : <><Copy className="w-4 h-4" /> {label}</>}
    </button>
  );
}