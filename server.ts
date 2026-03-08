import express from 'express';
import { createServer as createViteServer } from 'vite';
import db, { initDb } from './db.js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  initDb();

  app.use(express.json());

  // --- API Routes ---

  // Tasks
  app.get('/api/tasks', (req, res) => {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
    res.json(tasks);
  });

  app.post('/api/tasks', (req, res) => {
    const { name, category, time, duration, priority } = req.body;
    const info = db.prepare('INSERT INTO tasks (name, category, time, duration, priority) VALUES (?, ?, ?, ?, ?)').run(name, category, time, duration, priority);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch('/api/tasks/:id', (req, res) => {
    const { completed } = req.body;
    db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(completed ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  // Finance
  app.get('/api/finance', (req, res) => {
    const records = db.prepare('SELECT * FROM finance_records ORDER BY date DESC').all();
    res.json(records);
  });

  app.post('/api/finance', (req, res) => {
    const { amount, category, description } = req.body;
    const info = db.prepare('INSERT INTO finance_records (amount, category, description) VALUES (?, ?, ?)').run(amount, category, description);
    res.json({ id: info.lastInsertRowid });
  });

  // Alarms
  app.get('/api/alarms', (req, res) => {
    const alarms = db.prepare('SELECT * FROM alarms').all();
    res.json(alarms);
  });

  app.post('/api/alarms', (req, res) => {
    const { time, music_source, puzzle_type } = req.body;
    const info = db.prepare('INSERT INTO alarms (time, music_source, puzzle_type) VALUES (?, ?, ?)').run(time, music_source, puzzle_type);
    res.json({ id: info.lastInsertRowid });
  });

  // AI Modules
  app.post('/api/ai/motivation', async (req, res) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Generate a short, powerful startup motivation quote for today. Focus on discipline and innovation. Max 20 words.',
      });
      res.json({ quote: response.text });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate quote' });
    }
  });

  app.post('/api/ai/voice-command', async (req, res) => {
    const { text } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Extract structured data from this voice command: "${text}". 
        Possible actions: ADD_TASK, ADD_EXPENSE.
        Return JSON format: { action: string, data: object }.
        Example: "Add a task to study at 7pm" -> { action: "ADD_TASK", data: { name: "study", time: "19:00" } }`,
        config: { responseMimeType: 'application/json' }
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (error) {
      res.status(500).json({ error: 'Failed to process voice command' });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MOCO Server running on http://localhost:${PORT}`);
  });
}

startServer();
