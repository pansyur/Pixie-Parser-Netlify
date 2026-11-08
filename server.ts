import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';

const app = express();
const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'tabs.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
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
  frRules: Array<{ find: string; replace: string }>;
}

export interface PasteTab {
  id: string;
  name: string;
  mainText: string;
  segments: string[];
  config: ParserConfig;
  position: number;
  updatedAt: string;
}

const defaultDefaultConfig: ParserConfig = {
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
};

const initialTabs: PasteTab[] = [
  {
    id: 'tab_default_1',
    name: 'Charm 1',
    mainText: `Welcome to Pixie Parser! ✨🧚‍♀️
Every paste has its own charm on the bracelet.

Paste your unformatted content into this box.
Configure line splitting, delimiters, filters, or find & replace.
Your content syncs automatically to the cloud database with no size limits!

Try parsing this sample text by clicking "✨ Parse Content" below!

--- Block 2 Starts Here ---
Pixie Parser splits content by empty lines or your chosen delimiter count.
It can also inject extra breaks around target keywords!

--- Block 3 Starts Here ---
Copy single blocks with one tap, or grab everything at once with "Copy All Blocks".
Enjoy smooth, fairy-dusted text processing! 🌸`,
    segments: [],
    config: defaultDefaultConfig,
    position: 0,
    updatedAt: new Date().toISOString()
  }
];

// Helper to read DB safely
async function readDb(): Promise<PasteTab[]> {
  try {
    if (!fs.existsSync(DB_FILE)) {
      await writeDb(initialTabs);
      return initialTabs;
    }
    const data = await fsPromises.readFile(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => a.position - b.position);
    }
    return initialTabs;
  } catch (err) {
    console.error('Error reading DB, restoring initial data:', err);
    return initialTabs;
  }
}

// Helper to write DB atomically
async function writeDb(tabs: PasteTab[]): Promise<void> {
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  await fsPromises.writeFile(tempFile, JSON.stringify(tabs, null, 2), 'utf-8');
  await fsPromises.rename(tempFile, DB_FILE);
}

// Increase body parser limits up to 100MB so there are no content length limits
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'pixie-parser-db', timestamp: new Date().toISOString() });
});

// GET all tabs
app.get('/api/tabs', async (_req: Request, res: Response) => {
  try {
    const tabs = await readDb();
    res.json({ tabs });
  } catch (error) {
    console.error('GET /api/tabs error:', error);
    res.status(500).json({ error: 'Failed to retrieve tabs' });
  }
});

// POST create tab
app.post('/api/tabs', async (req: Request, res: Response) => {
  try {
    const tabs = await readDb();
    const newTab: PasteTab = {
      id: req.body.id || `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: req.body.name || `Charm ${tabs.length + 1}`,
      mainText: req.body.mainText || '',
      segments: Array.isArray(req.body.segments) ? req.body.segments : [],
      config: req.body.config || defaultDefaultConfig,
      position: typeof req.body.position === 'number' ? req.body.position : tabs.length,
      updatedAt: new Date().toISOString()
    };

    tabs.push(newTab);
    tabs.sort((a, b) => a.position - b.position);
    await writeDb(tabs);
    res.status(201).json(newTab);
  } catch (error) {
    console.error('POST /api/tabs error:', error);
    res.status(500).json({ error: 'Failed to create tab' });
  }
});

// PUT update tab
app.put('/api/tabs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tabs = await readDb();
    const index = tabs.findIndex(t => t.id === id);

    if (index === -1) {
      // If tab doesn't exist, upsert it
      const newTab: PasteTab = {
        id,
        name: req.body.name || 'Untitled Charm',
        mainText: req.body.mainText || '',
        segments: Array.isArray(req.body.segments) ? req.body.segments : [],
        config: req.body.config || defaultDefaultConfig,
        position: typeof req.body.position === 'number' ? req.body.position : tabs.length,
        updatedAt: new Date().toISOString()
      };
      tabs.push(newTab);
      await writeDb(tabs);
      return res.json(newTab);
    }

    const updatedTab: PasteTab = {
      ...tabs[index],
      name: req.body.name !== undefined ? req.body.name : tabs[index].name,
      mainText: req.body.mainText !== undefined ? req.body.mainText : tabs[index].mainText,
      segments: req.body.segments !== undefined ? req.body.segments : tabs[index].segments,
      config: req.body.config !== undefined ? req.body.config : tabs[index].config,
      position: req.body.position !== undefined ? req.body.position : tabs[index].position,
      updatedAt: new Date().toISOString()
    };

    tabs[index] = updatedTab;
    await writeDb(tabs);
    res.json(updatedTab);
  } catch (error) {
    console.error('PUT /api/tabs/:id error:', error);
    res.status(500).json({ error: 'Failed to update tab' });
  }
});

// DELETE tab
app.delete('/api/tabs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let tabs = await readDb();
    tabs = tabs.filter(t => t.id !== id);

    // Re-index positions
    tabs.forEach((t, i) => {
      t.position = i;
    });

    await writeDb(tabs);
    res.json({ success: true, count: tabs.length });
  } catch (error) {
    console.error('DELETE /api/tabs/:id error:', error);
    res.status(500).json({ error: 'Failed to delete tab' });
  }
});

// POST reorder tabs
app.post('/api/tabs/reorder', async (req: Request, res: Response) => {
  try {
    const { order } = req.body; // array of tab IDs
    if (!Array.isArray(order)) {
      return res.status(400).json({ error: 'Order must be an array of tab IDs' });
    }

    const tabs = await readDb();
    const tabMap = new Map(tabs.map(t => [t.id, t]));
    const reordered: PasteTab[] = [];

    order.forEach((id, index) => {
      const tab = tabMap.get(id);
      if (tab) {
        tab.position = index;
        reordered.push(tab);
        tabMap.delete(id);
      }
    });

    // Append any leftover tabs
    tabMap.forEach(tab => {
      tab.position = reordered.length;
      reordered.push(tab);
    });

    await writeDb(reordered);
    res.json({ success: true, tabs: reordered });
  } catch (error) {
    console.error('POST /api/tabs/reorder error:', error);
    res.status(500).json({ error: 'Failed to reorder tabs' });
  }
});

// Export all data
app.get('/api/backup/export', async (_req: Request, res: Response) => {
  try {
    const tabs = await readDb();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="pixie-parser-backup-${Date.now()}.json"`);
    res.json({
      app: 'Pixie Parser',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      tabs
    });
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
});

// Import data
app.post('/api/backup/import', async (req: Request, res: Response) => {
  try {
    const { tabs } = req.body;
    if (!Array.isArray(tabs)) {
      return res.status(400).json({ error: 'Invalid backup format' });
    }
    await writeDb(tabs);
    res.json({ success: true, count: tabs.length });
  } catch (error) {
    res.status(500).json({ error: 'Import failed' });
  }
});

// Frontend Vite Middleware Setup
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🧚‍♀️ Pixie Parser cloud server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
