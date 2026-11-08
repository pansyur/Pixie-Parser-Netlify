import { Cloud, Check, Loader2, AlertCircle, Database, Zap } from 'lucide-react';

export type SyncState = 'ready' | 'saving' | 'saved' | 'error';

interface HeaderProps {
  sync: {
    state: SyncState;
    msg: string;
  };
  isSupabaseLive: boolean;
  onOpenSupabase: () => void;
  onOpenBackup: () => void;
  stats?: {
    totalTabs: number;
    totalChars: number;
    totalSegments: number;
  };
}

const SYNC_STYLES: Record<SyncState, { dot: string; text: string; icon: typeof Cloud }> = {
  saving: {
    dot: 'bg-amber-400 animate-pulse',
    text: 'bg-amber-50 text-amber-700 border border-amber-200',
    icon: Loader2
  },
  saved: {
    dot: 'bg-emerald-400',
    text: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    icon: Check
  },
  error: {
    dot: 'bg-rose-400',
    text: 'bg-rose-50 text-rose-700 border border-rose-200',
    icon: AlertCircle
  },
  ready: {
    dot: 'bg-purple-300',
    text: 'bg-purple-50 text-purple-700 border border-purple-200',
    icon: Cloud
  }
};

export default function Header({
  sync,
  isSupabaseLive,
  onOpenSupabase,
  onOpenBackup,
  stats
}: HeaderProps) {
  const currentSync = SYNC_STYLES[sync.state] || SYNC_STYLES.ready;
  const SyncIcon = currentSync.icon;

  return (
    <header className="wing-card p-6 md:p-7 relative overflow-visible">
      {/* Whimsical Stickers */}
      <div className="sticker" style={{ '--rot': '-10deg', top: '-14px', left: '18px' } as any}>
        🧚‍♀️
      </div>
      <div className="sticker" style={{ '--rot': '12deg', top: '-10px', right: '24px', animationDelay: '.6s' } as any}>
        ✨
      </div>
      <div className="sticker" style={{ '--rot': '-6deg', bottom: '-12px', right: '60px', animationDelay: '1.2s' } as any}>
        🦋
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <h1 className="text-3xl md:text-4xl font-display font-semibold pixie-title tracking-tight">
            Pixie Parser
          </h1>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-100/80 text-pink-700 border border-pink-200 uppercase tracking-wider">
            Netlify Ready
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Supabase Status Button */}
          <button
            type="button"
            onClick={onOpenSupabase}
            className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border ${
              isSupabaseLive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100/80'
                : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-200 hover:border-emerald-300'
            }`}
            title="Configure Supabase Free Realtime Sync"
          >
            <Zap className={`w-3.5 h-3.5 ${isSupabaseLive ? 'text-emerald-500 fill-emerald-500 animate-pulse' : 'text-emerald-600'}`} />
            <span>{isSupabaseLive ? 'Supabase Live' : 'Connect Supabase'}</span>
          </button>

          {/* Sync status indicator */}
          <div
            className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xs transition-colors ${currentSync.text}`}
            title="Database Sync Status"
          >
            <span className={`status-dot ${currentSync.dot}`}></span>
            <SyncIcon className={`w-3.5 h-3.5 ${sync.state === 'saving' ? 'animate-spin' : ''}`} />
            <span>{sync.msg || 'Ready'}</span>
          </div>

          {/* Backup Button */}
          <button
            type="button"
            onClick={onOpenBackup}
            className="p-1.5 px-3 text-xs font-bold rounded-full bg-white hover:bg-pink-50 border border-pink-200 text-purple-900 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:border-pink-300"
            title="Backup & Restore pastes"
          >
            <Database className="w-3.5 h-3.5 text-pink-500" />
            <span className="hidden sm:inline">Backup</span>
          </button>
        </div>
      </div>

      <p className="text-sm font-medium pr-12" style={{ color: 'rgba(75, 46, 131, 0.8)' }}>
        Every paste, its own charm on the bracelet. Free real-time cross-device sync via Supabase, Cloudflare deployable, with no login and zero content length limits.
      </p>

      {stats && stats.totalChars > 0 && (
        <div className="mt-3 pt-3 border-t border-purple-100/60 flex items-center gap-4 text-xs font-semibold text-purple-900/70">
          <span>🌸 {stats.totalTabs} Charm{stats.totalTabs === 1 ? '' : 's'}</span>
          <span>📝 {stats.totalChars.toLocaleString()} Characters</span>
          <span>✨ {stats.totalSegments} Blocks Parsed</span>
        </div>
      )}
    </header>
  );
}
