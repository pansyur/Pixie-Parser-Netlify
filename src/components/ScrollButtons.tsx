import { ArrowUpToLine, ArrowDownToLine } from 'lucide-react';

export default function ScrollButtons() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
      behavior: 'smooth'
    });
  };

  return (
    <div
      className="fixed bottom-6 right-6 flex flex-col gap-3 z-50 opacity-80 hover:opacity-100 transition-opacity"
      aria-label="Scroll controls"
    >
      <button
        type="button"
        onClick={scrollToTop}
        className="p-3 bg-white/90 hover:bg-white backdrop-blur rounded-full shadow-lg border border-pink-100 hover:scale-105 active:scale-95 transition-all text-purple-900 cursor-pointer"
        title="Scroll to Top"
        aria-label="Scroll to top of page"
      >
        <ArrowUpToLine className="w-5 h-5 text-purple-700" />
      </button>
      <button
        type="button"
        onClick={scrollToBottom}
        className="p-3 bg-white/90 hover:bg-white backdrop-blur rounded-full shadow-lg border border-pink-100 hover:scale-105 active:scale-95 transition-all text-purple-900 cursor-pointer"
        title="Scroll to Bottom"
        aria-label="Scroll to bottom of page"
      >
        <ArrowDownToLine className="w-5 h-5 text-purple-700" />
      </button>
    </div>
  );
}
