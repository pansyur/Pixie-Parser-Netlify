const SYNC_STYLES = {
  saving: { dot: 'bg-amber-500 animate-pulse', text: 'bg-amber-50 text-amber-600' },
  saved: { dot: 'bg-emerald-500', text: 'bg-emerald-50 text-emerald-600' },
  error: { dot: 'bg-red-500', text: 'bg-red-50 text-red-600' },
  ready: { dot: 'bg-slate-300', text: 'bg-slate-100 text-slate-400' }
};

export default function Header({ sync }) {
  const s = SYNC_STYLES[sync.state] || SYNC_STYLES.ready;
  return (
    <div className="wing-card p-6">
      <div className="sticker" style={{ '--rot': '-10deg', top: '-14px', left: '18px' }}>🧚♀️</div>
      <div className="sticker" style={{ '--rot': '12deg', top: '-10px', right: '24px', animationDelay: '.6s' }}>✨</div>
      <div className="sticker" style={{ '--rot': '-6deg', bottom: '-12px', right: '60px', animationDelay: '1.2s' }}>🦋</div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-display font-semibold pixie-title">Pixie Parser</h1>
        <div className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${s.text}`}>
          <span className={`status-dot ${s.dot}`}></span> {sync.msg || 'Ready'}
        </div>
      </div>
      <p className="text-sm" style={{ color: 'rgba(75,46,131,0.7)' }}>
        Every paste, its own charm on the bracelet — synced live across your devices.
      </p>
    </div>
  );
}