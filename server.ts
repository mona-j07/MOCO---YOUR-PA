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
    const { completed, name, category, time, duration, priority, date, description } = req.body;
    if (completed !== undefined) {
      db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(completed ? 1 : 0, req.params.id);
    } else {
      db.prepare('UPDATE tasks SET name = ?, category = ?, time = ?, duration = ?, priority = ? WHERE id = ?')
        .run(name, category, time, duration, priority, req.params.id);
    }
    res.json({ success: true });
  });

  app.delete('/api/tasks/:id', (req, res) => {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Finance
  app.get('/api/finance/summary', (req, res) => {
    const userFinance = db.prepare('SELECT * FROM user_finance WHERE user_id = 1').get();
    const records = db.prepare('SELECT type, SUM(amount) as total FROM finance_records GROUP BY type').all();
    
    const summary = {
      initial_balance: userFinance?.initial_balance || 0,
      current_balance: userFinance?.current_balance || 0,
      total_income: records.find(r => r.type === 'income')?.total || 0,
      total_expenses: records.find(r => r.type === 'expense')?.total || 0,
      total_investments: records.find(r => r.type === 'investment')?.total || 0,
    };
    res.json(summary);
  });

  app.post('/api/finance/initial-balance', (req, res) => {
    const { amount } = req.body;
    const existing = db.prepare('SELECT * FROM user_finance WHERE user_id = 1').get();
    if (existing) {
      db.prepare('UPDATE user_finance SET initial_balance = ?, current_balance = current_balance + (? - initial_balance) WHERE user_id = 1').run(amount, amount);
    } else {
      db.prepare('INSERT INTO user_finance (user_id, initial_balance, current_balance) VALUES (1, ?, ?)').run(amount, amount);
    }
    res.json({ success: true });
  });

  app.get('/api/finance', (req, res) => {
    const records = db.prepare('SELECT * FROM finance_records ORDER BY date DESC').all();
    res.json(records);
  });

  app.post('/api/finance', (req, res) => {
    const { amount, category, description, type, date } = req.body;
    const info = db.prepare('INSERT INTO finance_records (amount, category, description, type, date) VALUES (?, ?, ?, ?, ?)').run(amount, category, description, type, date || new Date().toISOString().split('T')[0]);
    
    // Update current balance
    if (type === 'income') {
      db.prepare('UPDATE user_finance SET current_balance = current_balance + ? WHERE user_id = 1').run(amount);
    } else if (type === 'expense' || type === 'investment') {
      db.prepare('UPDATE user_finance SET current_balance = current_balance - ? WHERE user_id = 1').run(amount);
    }
    
    res.json({ id: info.lastInsertRowid });
  });

  // Alarms
  app.get('/api/alarms', (req, res) => {
    const alarms = db.prepare('SELECT * FROM alarms').all();
    res.json(alarms);
  });

  app.post('/api/alarms', (req, res) => {
    const { time, name, music_source, puzzle_type, difficulty, repeat } = req.body;
    const info = db.prepare('INSERT INTO alarms (time, name, music_source, puzzle_type, difficulty, repeat) VALUES (?, ?, ?, ?, ?, ?)').run(time, name, music_source, puzzle_type, difficulty, repeat);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch('/api/alarms/:id/toggle', (req, res) => {
    const { active } = req.body;
    db.prepare('UPDATE alarms SET active = ? WHERE id = ?').run(active ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  // Reminders
  app.get('/api/reminders', (req, res) => {
    const reminders = db.prepare('SELECT * FROM reminders ORDER BY created_at DESC').all();
    res.json(reminders);
  });

  app.post('/api/reminders', (req, res) => {
    const { text, time } = req.body;
    const info = db.prepare('INSERT INTO reminders (text, time) VALUES (?, ?)').run(text, time);
    res.json({ id: info.lastInsertRowid });
  });

  // Notes
  app.get('/api/notes', (req, res) => {
    const notes = db.prepare('SELECT * FROM notes ORDER BY created_at DESC').all();
    res.json(notes);
  });

  app.post('/api/notes', (req, res) => {
    const { title, content } = req.body;
    const info = db.prepare('INSERT INTO notes (title, content) VALUES (?, ?)').run(title, content);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch('/api/notes/:id', (req, res) => {
    const { title, content } = req.body;
    db.prepare('UPDATE notes SET title = ?, content = ? WHERE id = ?').run(title, content, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/notes/:id', (req, res) => {
    db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // User / Onboarding
  app.get('/api/user', (req, res) => {
    const user = db.prepare('SELECT * FROM users LIMIT 1').get();
    res.json(user || null);
  });

  app.post('/api/user/onboarding', (req, res) => {
    const { name, personality, goals } = req.body;
    // Clear existing users for this demo
    db.prepare('DELETE FROM users').run();
    const info = db.prepare('INSERT INTO users (name, personality, onboarding_completed) VALUES (?, ?, 1)').run(name, personality);
    res.json({ id: info.lastInsertRowid });
  });

  // AI Modules - Unified Command Processor
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

  app.post('/api/ai/process-command', async (req, res) => {
    const { text, localTime } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a command parser for a productivity app called MOCO.
        Extract structured data from this command: "${text}".
        
        Supported Actions:
        - ADD_TASK: { name: string, category: string, time?: string, duration?: string, priority?: string }
        - ADD_EXPENSE: { amount: number, category: string, description: string }
        - ADD_REMINDER: { text: string, time?: string }
        - ADD_NOTE: { title?: string, content: string }
        - SET_ALARM: { time: string, name?: string, music_source?: string, puzzle_type?: string, difficulty?: string, repeat?: string }

        Current User Local Time: ${localTime || new Date().toISOString()}

        Return ONLY a JSON object: { action: string, data: object, confidence: number }.
        If the action is ambiguous, return confidence < 0.5.`,
        config: { responseMimeType: 'application/json' }
      });
      const result = JSON.parse(response.text || '{}');
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to process command' });
    }
  });

  // Legacy endpoint for backward compatibility
  app.post('/api/ai/voice-command', async (req, res) => {
    const { text, localTime } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a command parser for a productivity app called MOCO.
        Extract structured data from this command: "${text}".
        
        Supported Actions:
        - ADD_TASK: { name: string, category: string, time?: string, duration?: string, priority?: string }
        - ADD_EXPENSE: { amount: number, category: string, description: string }
        - ADD_REMINDER: { text: string, time?: string }
        - ADD_NOTE: { title?: string, content: string }
        - SET_ALARM: { time: string, name?: string, music_source?: string, puzzle_type?: string, difficulty?: string, repeat?: string }

        Current User Local Time: ${localTime || new Date().toISOString()}

        Return ONLY a JSON object: { action: string, data: object, confidence: number }.
        If the action is ambiguous, return confidence < 0.5.`,
        config: { responseMimeType: 'application/json' }
      });
      const result = JSON.parse(response.text || '{}');
      res.json(result);
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
