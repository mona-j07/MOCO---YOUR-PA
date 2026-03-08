import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Zap, TrendingUp, Brain, ChevronRight, ListTodo, AlarmClock } from 'lucide-react';

export default function Dashboard() {
  const [quote, setQuote] = useState('Loading motivation...');
  const [stats, setStats] = useState({
    streak: 7,
    tasksCompleted: 12,
    productivityScore: 85
  });

  useEffect(() => {
    fetch('/api/ai/motivation', { method: 'POST' })
      .then(res => res.json())
      .then(data => setQuote(data.quote))
      .catch(() => setQuote('Discipline is the bridge between goals and accomplishment.'));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Hey, Master
          </h1>
          <p className="text-slate-500 text-sm">Ready to conquer the day?</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
          <Brain className="w-6 h-6 text-indigo-400" />
        </div>
      </div>

      {/* Motivation Card */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative p-6 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-700 overflow-hidden shadow-xl shadow-indigo-500/20"
      >
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Zap className="w-24 h-24" />
        </div>
        <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-2 opacity-70">Daily Spark</p>
        <h2 className="text-xl font-medium leading-relaxed italic">
          "{quote}"
        </h2>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-3xl bg-slate-900 border border-white/5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.streak}</p>
            <p className="text-xs text-slate-500">Day Streak</p>
          </div>
        </div>
        <div className="p-4 rounded-3xl bg-slate-900 border border-white/5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.productivityScore}%</p>
            <p className="text-xs text-slate-500">Efficiency</p>
          </div>
        </div>
      </div>

      {/* Next Up */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Next Up</h3>
          <button className="text-xs text-indigo-400 font-bold uppercase tracking-wider">View All</button>
        </div>
        
        <div className="p-4 rounded-3xl bg-slate-900 border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
            <ListTodo className="w-6 h-6 text-slate-400" />
          </div>
          <div className="flex-1">
            <p className="font-bold">Morning Exercise</p>
            <p className="text-xs text-slate-500">Starts in 15 mins</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
            <AlarmClock className="w-6 h-6 text-slate-400" />
          </div>
          <div className="flex-1">
            <p className="font-bold">Deep Work: Python</p>
            <p className="text-xs text-slate-500">Today, 2:00 PM</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </div>
      </div>
    </motion.div>
  );
}
