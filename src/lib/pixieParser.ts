export interface FindReplaceRule {
  find: string;
  replace: string;
}

export interface ParserConfig {
  lineCount: string;
  breakPos: string;
  breakLines: string;
  breakTarget: string;
  filterContaining: string[];
  filterContainingLogic: 'or' | 'and';
  filterNotContaining: string[];
  filterNotContainingLogic: 'or' | 'and';
  truncateDelimiters: string[];
  truncateDirection: 'after' | 'before';
  lineCutoffTexts: string[];
  lineCutoffDirection: 'after' | 'before';
  frRules: FindReplaceRule[];
}

export const DEFAULT_CONFIG = (): ParserConfig => ({
  lineCount: '5',
  breakPos: 'after',
  breakLines: '1',
  breakTarget: '',
  filterContaining: [],
  filterContainingLogic: 'or',
  filterNotContaining: [],
  filterNotContainingLogic: 'or',
  truncateDelimiters: [],
  truncateDirection: 'after',
  lineCutoffTexts: [],
  lineCutoffDirection: 'after',
  frRules: [{ find: '', replace: '' }]
});

export function parseContent(rawText: string, cfg: ParserConfig): string[] {
  if (!rawText || !rawText.trim()) return [];

  let text = rawText.replace(/\r\n/g, '\n');

  // 1. Find & replace (global)
  (cfg.frRules || []).forEach(rule => {
    if (rule.find) {
      text = text.split(rule.find).join(rule.replace || '');
    }
  });

  // 2. Truncate each line at delimiter (remove delimiter + everything after/before)
  const delims = (cfg.truncateDelimiters || []).filter(Boolean);
  if (delims.length) {
    text = text.split('\n').map(line => {
      let earliest = -1;
      let matchedLen = 0;
      delims.forEach(d => {
        const idx = line.indexOf(d);
        if (idx !== -1 && (earliest === -1 || idx < earliest)) {
          earliest = idx;
          matchedLen = d.length;
        }
      });
      if (earliest === -1) return line;
      return cfg.truncateDirection === 'after'
        ? line.slice(0, earliest)
        : line.slice(earliest + matchedLen);
    }).join('\n');
  }

  // 3. Inject line breaks around target text
  if (cfg.breakTarget) {
    const breaks = '\n'.repeat(Math.max(1, parseInt(cfg.breakLines, 10) || 1));
    const chunks = text.split(cfg.breakTarget);
    text = cfg.breakPos === 'before'
      ? chunks.join(breaks + cfg.breakTarget)
      : chunks.join(cfg.breakTarget + breaks);
  }

  // 4. Split into segments by N+ newlines
  const lineCount = Math.max(1, parseInt(cfg.lineCount, 10) || 5);
  const regex = new RegExp(`\\n{${lineCount},}`);
  const rawSegments = text.split(regex);

  const filterCont = (cfg.filterContaining || []).map(s => s.trim().toLowerCase()).filter(Boolean);
  const filterNotCont = (cfg.filterNotContaining || []).map(s => s.trim().toLowerCase()).filter(Boolean);

  const finalSegments: string[] = [];
  rawSegments.forEach(segment => {
    if (!segment.trim()) return;
    let lines = segment.split('\n');

    // 5. Line cutoff — remove all lines after/before a marker line
    const cutoffMarkers = (cfg.lineCutoffTexts || []).map(s => s.trim().toLowerCase()).filter(Boolean);
    if (cutoffMarkers.length) {
      const markerIdx = lines.findIndex(l => {
        const lower = l.toLowerCase();
        return cutoffMarkers.some(m => lower.includes(m));
      });
      if (markerIdx !== -1) {
        lines = cfg.lineCutoffDirection === 'after'
          ? lines.slice(0, markerIdx + 1)
          : lines.slice(markerIdx);
      }
    }

    // 6. Remove lines containing (AND / OR)
    if (filterCont.length) {
      lines = lines.filter(l => {
        const lower = l.toLowerCase();
        if (cfg.filterContainingLogic === 'and') {
          return !filterCont.every(v => lower.includes(v));
        }
        return !filterCont.some(v => lower.includes(v));
      });
    }

    // 7. Remove lines NOT containing (AND / OR)
    if (filterNotCont.length) {
      lines = lines.filter(l => {
        const lower = l.toLowerCase();
        if (cfg.filterNotContainingLogic === 'and') {
          return filterNotCont.every(v => lower.includes(v));
        }
        return filterNotCont.some(v => lower.includes(v));
      });
    }

    const clean = lines.join('\n').trim();
    if (clean) finalSegments.push(clean);
  });

  return finalSegments;
}

export function getTextStats(text: string) {
  if (!text) {
    return { chars: 0, words: 0, lines: 0 };
  }
  const chars = text.length;
  const lines = text.split('\n').length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return { chars, words, lines };
}
