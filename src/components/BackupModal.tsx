import { useState } from 'react';
import { X, Download, Upload, Check, AlertCircle, FileJson, Copy } from 'lucide-react';
import { PasteTab } from '../lib/api';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: PasteTab[];
  onImport: (tabs: PasteTab[]) => void;
}

export default function BackupModal({
  isOpen,
  onClose,
  tabs,
  onImport
}: BackupModalProps) {
  const [importJson, setImportJson] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });

  if (!isOpen) return null;

  const handleDownload = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tabs, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `pixie-parser-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setStatus({ type: 'success', message: 'Backup file downloaded successfully!' });
    } catch (e) {
      setStatus({ type: 'error', message: 'Download failed.' });
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(tabs, null, 2));
      setStatus({ type: 'success', message: 'JSON copied to clipboard!' });
    } catch (e) {
      setStatus({ type: 'error', message: 'Copy failed.' });
    }
  };

  const handleImportSubmit = () => {
    try {
      if (!importJson.trim()) {
        setStatus({ type: 'error', message: 'Please paste backup JSON into the box.' });
        return;
      }
      const parsed = JSON.parse(importJson);
      let list: PasteTab[] = [];
      if (Array.isArray(parsed)) {
        list = parsed;
      } else if (parsed && Array.isArray(parsed.tabs)) {
        list = parsed.tabs;
      } else {
        throw new Error('Unrecognized backup JSON format');
      }

      if (list.length === 0) {
        throw new Error('No tabs found in JSON');
      }

      onImport(list);
      setStatus({ type: 'success', message: `Imported ${list.length} charm(s) successfully!` });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatus({ type: 'error', message: `Import error: ${err.message || 'Invalid JSON'}` });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        setImportJson(text);
      } catch (err) {
        setStatus({ type: 'error', message: 'Could not read file.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-xs">
      <div className="wing-card max-w-lg w-full p-6 md:p-8 bg-white/95 shadow-2xl relative">
        <div className="flex items-center justify-between border-b pb-4 mb-4" style={{ borderColor: '#f0dff0' }}>
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-pink-500" />
            <h3 className="text-lg font-bold font-display text-purple-950">
              Database Backup &amp; Restore
            </h3>
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
            className={`p-3 rounded-2xl text-xs font-semibold mb-4 flex items-center gap-2 ${
              status.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {status.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{status.message}</span>
          </div>
        )}

        <div className="flex flex-col gap-5">
          {/* Export Section */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-pink-50/60 border border-pink-100">
            <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
              Export Cloud Data
            </h4>
            <p className="text-xs text-purple-800/70">
              Download all your paste tabs and parsed segments as a JSON file or copy to clipboard.
            </p>
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs btn-primary flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download .JSON</span>
              </button>
              <button
                type="button"
                onClick={handleCopyJson}
                className="py-2.5 px-4 rounded-xl font-bold text-xs bg-white hover:bg-slate-50 text-purple-900 border border-pink-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                Restore / Import Data
              </h4>
              <label className="text-[11px] font-bold text-pink-600 hover:underline cursor-pointer flex items-center gap-1">
                <Upload className="w-3 h-3" /> Upload File
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <textarea
              value={importJson}
              onChange={e => setImportJson(e.target.value)}
              placeholder="Paste backup JSON here to restore..."
              className="w-full h-28 p-3 text-xs font-mono rounded-xl bg-white border border-purple-100 resize-none"
            />
            <button
              type="button"
              onClick={handleImportSubmit}
              className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-purple-900 hover:bg-purple-800 text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Restore Tabs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
