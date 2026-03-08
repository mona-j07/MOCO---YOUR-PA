import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Plus, X, Clock, Trash2, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReminderScreen() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newReminder, setNewReminder] = useState({ text: '', time: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await fetch('/api/reminders');
      const data = await res.json();
      setReminders(data);
    } catch (error) {
      toast.error('Failed to load reminders');
    }
  };

  const handleAddReminder = async () => {
    if (!newReminder.text) {
      toast.error('Please enter reminder text');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReminder),
      });
      if (res.ok) {
        toast.success('Reminder set!');
        setIsAdding(false);
        setNewReminder({ text: '', time: '' });
        fetchReminders();
      }
    } catch (error) {
      toast.error('Failed to set reminder');
    } finally {
      setLoading(false);
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
          <h1 className="text-4xl font-black tracking-tighter">Reminders</h1>
          <p className="text-slate-500 font-medium">Never miss a beat.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-xl shadow-indigo-500/20 hover:scale-110 transition-transform"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reminders.map((reminder) => (
          <motion.div 
            layout
            key={reminder.id}
            className="p-8 rounded-[2.5rem] bg-slate-900 border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <Bell className="w-7 h-7 text-indigo-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{reminder.text}</p>
                {reminder.time && (
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                    <Clock className="w-3.5 h-3.5" /> {reminder.time}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {reminders.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
            <Bell className="w-16 h-16 mx-auto text-slate-800" />
            <p className="text-slate-500 font-medium italic">No reminders yet. Stay ahead of your schedule.</p>
          </div>
        )}
      </div>

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
              className="w-full max-w-lg bg-slate-900 rounded-[3rem] p-10 space-y-8 border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight">New Reminder</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">What should I remind you?</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Call Mom"
                    value={newReminder.text}
                    onChange={(e) => setNewReminder({...newReminder, text: e.target.value})}
                    className="w-full bg-slate-800 border border-white/5 rounded-2xl p-5 font-bold focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Time (Optional)</label>
                  <input 
                    type="time" 
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                    className="w-full bg-slate-800 border border-white/5 rounded-2xl p-5 font-bold focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={handleAddReminder}
                disabled={loading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 py-6 rounded-3xl font-black text-lg shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3"
              >
                {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Set Reminder'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
