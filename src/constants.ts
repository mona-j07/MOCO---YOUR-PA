import { LayoutDashboard, AlarmClock, ListTodo, Wallet, BarChart3, Mic } from 'lucide-react';

export const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Home', path: 'dashboard' },
  { icon: AlarmClock, label: 'Alarms', path: 'alarms' },
  { icon: ListTodo, label: 'Tasks', path: 'tasks' },
  { icon: Wallet, label: 'Finance', path: 'finance' },
  { icon: BarChart3, label: 'Reports', path: 'reports' },
];

export const CATEGORIES = ['Exercise', 'Study', 'Coding', 'Reading', 'Meditation', 'Planning'];
export const FINANCE_CATEGORIES = ['Food', 'Transport', 'Education', 'Shopping', 'Entertainment'];
export const PUZZLE_TYPES = ['Math', 'Logic', 'Memory', 'Pattern'];
