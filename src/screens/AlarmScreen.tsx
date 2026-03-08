import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, AlarmClock, Music, Brain, X, Check, Volume2 } from 'lucide-react';
import { PUZZLE_TYPES } from '../constants';

export default function AlarmScreen() {
  const [alarms, setAlarms] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAlarm, setNewAlarm] = useState({ time: '07:00', music: 'Morning Bliss', puzzle: 'Math' });
  const [activeAlarm, setActiveAlarm] = useState<any>(null);
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [puzzleQuestion, setPuzzleQuestion] = useState({ q: '12 + 15', a: '27' });

  useEffect(() => {
    fetchAlarms();
  }, []);

  const fetchAlarms = async () => {
    const res = await fetch('/api/alarms');
    const data = await res.json();
    setAlarms(data);
  };

  const handleAddAlarm = async () => {
    await fetch('/api/alarms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        time: newAlarm.time,
        music_source: newAlarm.music,
        puzzle_type: newAlarm.puzzle
      }),
    });
    setIsAdding(false);
    fetchAlarms();
  };

  const triggerAlarm = (alarm: any) => {
    setActiveAlarm(alarm);
    // Simple math puzzle generation
    const n1 = Math.floor(Math.random() * 20) + 1;
    const n2 = Math.floor(Math.random() * 20) + 1;
    setPuzzleQuestion({ q: `${n1} + ${n2}`, a: (n1 + n2).toString() });
  };

  const solvePuzzle = () => {
    if (puzzleAnswer === puzzleQuestion.a) {
      setActiveAlarm(null);
      setPuzzleAnswer('');
      alert('Alarm Dismissed! Good morning, Master.');
    } else {
      alert('Wrong answer! Try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Alarms</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        {alarms.map((alarm) => (
          <div 
            key={alarm.id}
            className="p-6 rounded-[2rem] bg-slate-900 border border-white/5 flex items-center justify-between group"
          >
            <div>
              <p className="text-4xl font-bold tracking-tighter mb-1">{alarm.time}</p>
              <div className="flex gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Music className="w-3 h-3" /> {alarm.music_source}</span>
                <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> {alarm.puzzle_type}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={`w-12 h-6 rounded-full transition-colors relative ${alarm.active ? 'bg-indigo-500' : 'bg-slate-800'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${alarm.active ? 'right-1' : 'left-1'}`} />
              </div>
              <button 
                onClick={() => triggerAlarm(alarm)}
                className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Test Trigger
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Alarm Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/90 z-[70] flex items-end"
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              className="w-full bg-slate-900 rounded-t-[3rem] p-8 space-y-6 border-t border-white/10"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">New Alarm</h2>
                <button onClick={() => setIsAdding(false)}><X className="w-6 h-6 text-slate-500" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Time</label>
                  <input 
                    type="time" 
                    value={newAlarm.time}
                    onChange={(e) => setNewAlarm({...newAlarm, time: e.target.value})}
                    className="w-full bg-slate-800 border border-white/5 rounded-2xl p-4 text-2xl font-bold text-center focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Puzzle Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PUZZLE_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => setNewAlarm({...newAlarm, puzzle: type})}
                        className={`p-3 rounded-xl border transition-all text-sm font-medium ${
                          newAlarm.puzzle === type ? 'bg-indigo-500 border-indigo-500' : 'bg-slate-800 border-white/5 text-slate-400'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAddAlarm}
                className="w-full bg-indigo-500 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/20"
              >
                Save Alarm
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Alarm Triggered Screen */}
      <AnimatePresence>
        {activeAlarm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-indigo-600 z-[80] flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-8"
            >
              <Volume2 className="w-12 h-12 text-white" />
            </motion.div>

            <h1 className="text-6xl font-black mb-4 tracking-tighter">{activeAlarm.time}</h1>
            <p className="text-xl font-bold mb-12 opacity-80 uppercase tracking-widest">Wake Up, Master!</p>

            <div className="w-full bg-white/10 backdrop-blur-md rounded-[2rem] p-8 space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-bold uppercase tracking-widest opacity-60">Solve to Dismiss</p>
                <h2 className="text-4xl font-bold">{puzzleQuestion.q} = ?</h2>
              </div>
              <input 
                type="number"
                value={puzzleAnswer}
                onChange={(e) => setPuzzleAnswer(e.target.value)}
                placeholder="Answer"
                className="w-full bg-white/20 border border-white/20 rounded-2xl p-4 text-2xl font-bold text-center placeholder:text-white/30 focus:outline-none"
              />
              <button 
                onClick={solvePuzzle}
                className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-bold text-lg"
              >
                Dismiss Alarm
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
