export interface Task {
  id: number;
  name: string;
  category: string;
  time: string;
  duration: string;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
}

export interface FinanceRecord {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Alarm {
  id: number;
  time: string;
  music_source: string;
  puzzle_type: string;
  active: boolean;
}

export type PersonalityType = 'Builder' | 'Explorer' | 'Strategist' | 'Visionary' | 'Disciplined Performer';
