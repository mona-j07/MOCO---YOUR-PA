import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, AlarmClock, Music, Brain, X, Check, Volume2, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PUZZLE_TYPES } from '../constants';

export default function AlarmScreen() {
  const [alarms, setAlarms] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAlarm, setNewAlarm] = useState({ 
    time: '07:00', 
    name: 'Morning Wakeup',
    music: 'Morning Bliss', 
    puzzle: 'Math',
    difficulty: 'Medium'
  });
  const [activeAlarm, setActiveAlarm] = useState<any>(null);
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [puzzleQuestion, setPuzzleQuestion] = useState({ q: '12 + 15', a: '27' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlarms();
  }, []);

  const fetchAlarms = async () => {
    try {
      const res = await fetch('/api/alarms');
      const data = await res.json();
      setAlarms(data);
    } catch (error) {
      toast.error('Failed to load alarms');
    }
  };

  const handleAddAlarm = async () => {
    if (!newAlarm.time || !newAlarm.name) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/alarms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time: newAlarm.time,
          name: newAlarm.name,
          music_source: newAlarm.music,
          puzzle_type: newAlarm.puzzle,
          difficulty: newAlarm.difficulty
        }),
      });
      if (res.ok) {
        toast.success('Alarm created successfully!');
        setIsAdding(false);
        fetchAlarms();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error('Failed to create alarm');
    } finally {
      setLoading(false);
    }
  };

  const triggerAlarm = (alarm: any) => {
    setActiveAlarm(alarm);
    const n1 = Math.floor(Math.random() * (alarm.difficulty === 'High' ? 50 : 20)) + 1;
    const n2 = Math.floor(Math.random() * (alarm.difficulty === 'High' ? 50 : 20)) + 1;
    setPuzzleQuestion({ q: `${n1} + ${n2}`, a: (n1 + n2).toString() });
  };

  const solvePuzzle = () => {
    if (puzzleAnswer === puzzleQuestion.a) {
      setActiveAlarm(null);
      setPuzzleAnswer('');
      toast.success('Good morning, Master!', { icon: '☀️' });
    } else {
      toast.error('Incorrect. Try again to wake up!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 md:p-12 space-y-12"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Alarms</h1>
          <p className="text-slate-500 font-medium">Wake up with discipline.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-xl shadow-indigo-500/20 hover:scale-110 transition-transform"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {alarms.map((alarm) => (
          <motion.div 
            layout
            key={alarm.id}
            className="p-8 rounded-[3rem] bg-slate-900 border border-white/5 flex flex-col justify-between group hover:border-indigo-500/30 transition-all"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-1">{alarm.name}</h3>
                <p className="text-5xl font-black tracking-tighter">{alarm.time}</p>
              </div>
              <div className={`w-14 h-7 rounded-full transition-colors relative cursor-pointer ${alarm.active ? 'bg-indigo-500' : 'bg-slate-800'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${alarm.active ? 'right-1' : 'left-1'}`} />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <span className="flex items-center gap-1.5"><Music className="w-3.5 h-3.5" /> {alarm.music_source}</span>
                <span className="flex items-center gap-1.5"><Brain className="w-3.5 h-3.5" /> {alarm.difficulty}</span>
              </div>
              <button 
                onClick={() => triggerAlarm(alarm)}
                className="p-2 rounded-xl bg-white/5 text-indigo-400 hover:bg-indigo-500/10 transition-colors"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
        {alarms.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
            <AlarmClock className="w-16 h-16 mx-auto text-slate-800" />
            <p className="text-slate-500 font-medium italic">No alarms set. Time to start your routine.</p>
          </div>
        )}
      </div>

      {/* Add Alarm Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 z-[100] flex items-center justify-center p-6 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-xl bg-slate-900 rounded-[3rem] p-10 space-y-8 border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight">New Alarm</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Time</label>
                    <input 
                      type="time" 
                      value={newAlarm.time}
                      onChange={(e) => setNewAlarm({...newAlarm, time: e.target.value})}
                      className="w-full bg-slate-800 border border-white/5 rounded-2xl p-5 text-3xl font-black text-center focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Alarm Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Work"
                      value={newAlarm.name}
                      onChange={(e) => setNewAlarm({...newAlarm, name: e.target.value})}
                      className="w-full bg-slate-800 border border-white/5 rounded-2xl p-5 font-bold focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Music Source</label>
                    <select 
                      value={newAlarm.music}
                      onChange={(e) => setNewAlarm({...newAlarm, music: e.target.value})}
                      className="w-full bg-slate-800 border border-white/5 rounded-2xl p-5 font-bold focus:outline-none appearance-none"
                    >
                      <option>Morning Bliss</option>
                      <option>Zen Garden</option>
                      <option>Techno Beat</option>
                      <option>Nature Sounds</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Difficulty</label>
                    <div className="flex gap-2">
                      {['Easy', 'Medium', 'High'].map(d => (
                        <button
                          key={d}
                          onClick={() => setNewAlarm({...newAlarm, difficulty: d})}
                          className={`flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                            newAlarm.difficulty === d ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAddAlarm}
                disabled={loading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 py-6 rounded-3xl font-black text-lg shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3"
              >
                {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Alarm'}
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
            className="fixed inset-0 bg-indigo-600 z-[200] flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mb-12 shadow-2xl"
            >
              <Volume2 className="w-16 h-16 text-white" />
            </motion.div>

            <h1 className="text-8xl font-black mb-4 tracking-tighter text-white drop-shadow-2xl">{activeAlarm.time}</h1>
            <p className="text-2xl font-bold mb-16 text-indigo-100 uppercase tracking-[0.2em]">{activeAlarm.name}</p>

            <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-[3rem] p-10 space-y-8 border border-white/20 shadow-2xl">
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-white/60 mb-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Security Protocol Active</span>
                </div>
                <h2 className="text-5xl font-black text-white">{puzzleQuestion.q} = ?</h2>
              </div>
              <input 
                type="number"
                autoFocus
                value={puzzleAnswer}
                onChange={(e) => setPuzzleAnswer(e.target.value)}
                placeholder="Answer"
                className="w-full bg-white/20 border border-white/30 rounded-3xl p-6 text-4xl font-black text-center text-white placeholder:text-white/20 focus:outline-none focus:bg-white/30 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && solvePuzzle()}
              />
              <button 
                onClick={solvePuzzle}
                className="w-full bg-white text-indigo-600 py-6 rounded-3xl font-black text-xl shadow-2xl hover:scale-105 transition-transform"
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

