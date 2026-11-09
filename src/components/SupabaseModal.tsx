import { useState, useEffect } from 'react';
import {
  X,
  Database,
  Check,
  Copy,
  AlertCircle,
  ExternalLink,
  Zap,
  Globe,
  Loader2,
  Trash2
} from 'lucide-react';
import {
  getSupabaseConfig,
  setSupabaseConfig,
  clearSupabaseConfig,
  isSupabaseConfigured,
  SUPABASE_SQL_SCHEMA
} from '../lib/supabase';
import { testSupabaseConnection } from '../lib/api';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export default function SupabaseModal({
  isOpen,
  onClose,
  onConfigChanged
}: SupabaseModalProps) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      setStatus({ type: 'idle', message: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch (_) {}
  };

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setStatus({ type: 'error', message: 'Please enter both Supabase Project URL and Anon Key.' });
      return;
    }

    setTesting(true);
    setStatus({ type: 'idle', message: '' });

    setSupabaseConfig(url, anonKey);
    const result = await testSupabaseConnection();

    setTesting(false);
    if (result.ok) {
      setStatus({
        type: 'success',
        message: 'Connected to Supabase! Cross-device sync is now active.'
      });
      onConfigChanged();
      setTimeout(() => {
        onClose();
      }, 1400);
    } else {
      setStatus({
        type: 'error',
        message: `Connection failed: ${result.error}. Make sure you ran the SQL Schema in your Supabase SQL editor!`
      });
    }
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setStatus({
      type: 'idle',
      message: 'Supabase disconnected. Falling back to local storage.'
    });
    onConfigChanged();
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/45 backdrop-blur-xs overflow-y-auto">
      <div className="wing-card max-w-xl w-full p-6 md:p-8 bg-white/95 shadow-2xl relative my-8">
        <div className="flex items-center justify-between border-b pb-4 mb-4" style={{ borderColor: '#f0dff0' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-purple-950 flex items-center gap-2">
                <span>Supabase Free Cross-Sync</span>
                {isConfigured && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active
                  </span>
                )}
              </h3>
              <p className="text-xs text-purple-900/60 font-medium">
                Real-time multi-device sync with zero content length limits
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-pink-100 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {status.message && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold mb-4 flex items-center gap-2.5 ${
              status.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {status.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleTestAndSave} className="flex flex-col gap-4">
          {/* Step 1: SQL Schema Setup */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950 uppercase tracking-wide">
                <span>Step 1: Run SQL in Supabase</span>
                <span className="text-[10px] lowercase text-purple-600 font-normal">(creates table &amp; RLS)</span>
              </div>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-pink-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Supabase Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-purple-900/70">
              Open your Supabase project's <strong>SQL Editor</strong>, paste this snippet, and click <strong>Run</strong>:
            </p>
            <div className="relative">
              <pre className="p-3 bg-purple-950 text-purple-100 text-[11px] font-mono rounded-xl max-h-28 overflow-y-auto leading-relaxed">
                {SUPABASE_SQL_SCHEMA}
              </pre>
              <button
                type="button"
                onClick={handleCopySql}
                className="absolute top-2 right-2 px-2.5 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 2: Connection Credentials */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white border border-pink-100 shadow-xs">
            <div className="text-xs font-bold text-purple-950 uppercase tracking-wide">
              Step 2: Enter Supabase Credentials
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project URL
              </label>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="w-full p-2.5 text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Public Anon Key
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={e => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full p-2.5 text-xs font-mono"
                required
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Find these in: Project Settings &rarr; API &rarr; Project URL &amp; anon public key</span>
            </div>
          </div>

          {/* Step 3: Vercel / Cloud Deploy Note */}
          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
            <Globe className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>For Vercel deployment:</strong> You can set these environment variables in your Vercel project dashboard (Settings &rarr; Environment Variables):
              <code className="mx-1 px-1 py-0.5 bg-amber-100 rounded text-[11px]">VITE_SUPABASE_URL</code> and{' '}
              <code className="mx-1 px-1 py-0.5 bg-amber-100 rounded text-[11px]">VITE_SUPABASE_ANON_KEY</code>.
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={testing}
              className="flex-1 py-3 px-4 rounded-2xl font-bold text-xs btn-primary flex items-center justify-center gap-2 cursor-pointer"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Testing Connection...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Test &amp; Connect Supabase</span>
                </>
              )}
            </button>

            {isConfigured && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="py-3 px-4 rounded-2xl font-bold text-xs bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Disconnect Supabase and switch back to local storage"
              >
                <Trash2 className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
