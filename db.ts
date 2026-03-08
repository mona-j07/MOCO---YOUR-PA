import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('moco.db');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      personality TEXT,
      onboarding_completed BOOLEAN DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT,
      time TEXT,
      duration TEXT,
      priority TEXT,
      completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS voice_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      task_id INTEGER,
      FOREIGN KEY(task_id) REFERENCES tasks(id)
    );

    CREATE TABLE IF NOT EXISTS finance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL, -- income, expense, investment
      amount REAL NOT NULL,
      category TEXT,
      description TEXT,
      date TEXT DEFAULT CURRENT_DATE
    );

    CREATE TABLE IF NOT EXISTS user_finance (
      user_id INTEGER PRIMARY KEY,
      initial_balance REAL DEFAULT 0,
      current_balance REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS alarms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time TEXT NOT NULL,
      name TEXT,
      music_source TEXT,
      puzzle_type TEXT,
      difficulty TEXT,
      repeat TEXT,
      active BOOLEAN DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      time TEXT,
      completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS app_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_name TEXT,
      duration_minutes INTEGER,
      date TEXT DEFAULT CURRENT_DATE
    );
  `);

  // Migration: Add 'name' column to 'alarms' if it's missing (legacy 'label' support)
  try {
    db.prepare("ALTER TABLE alarms ADD COLUMN name TEXT").run();
  } catch (e: any) {}
  
  try {
    db.prepare("ALTER TABLE alarms ADD COLUMN difficulty TEXT").run();
  } catch (e: any) {}

  try {
    db.prepare("ALTER TABLE alarms ADD COLUMN repeat TEXT").run();
  } catch (e: any) {}

  try {
    db.prepare("ALTER TABLE finance_records ADD COLUMN type TEXT NOT NULL DEFAULT 'expense'").run();
  } catch (e: any) {}
}

export default db;
