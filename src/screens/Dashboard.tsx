import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Zap, TrendingUp, Brain, ChevronRight, ListTodo, AlarmClock, Clock } from 'lucide-react';

export default function Dashboard() {
  const [quote, setQuote] = useState('Loading motivation...');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    streak: 7,
    tasksCompleted: 12,
    productivityScore: 85
  });

  useEffect(() => {
    // Real-time clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Fetch user for personalization
    fetch('/api/user')
      .then(res => res.json())
      .then(data => setUser(data));

    // Fetch motivation
    fetch('/api/ai/motivation', { method: 'POST' })
      .then(res => res.json())
      .then(data => setQuote(data.quote))
      .catch(() => setQuote('Discipline is the bridge between goals and accomplishment.'));

    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 md:p-12 space-y-12"
    >
      {/* Header & Clock */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent tracking-tighter">
            Hey, {user?.name || 'Master'}
          </h1>
          <p className="text-slate-500 text-lg mt-2">
            {user?.personality ? `Your ${user.personality} spirit is strong today.` : 'Ready to conquer the day?'}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-3 text-indigo-400 mb-1">
            <Clock className="w-5 h-5" />
            <span className="font-bold uppercase tracking-widest text-sm">Local Time</span>
          </div>
          <p className="text-5xl font-black tracking-tighter">{timeString}</p>
          <p className="text-slate-500 font-medium">{dateString}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Motivation Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="lg:col-span-2 relative p-10 rounded-[3rem] bg-gradient-to-br from-indigo-600 to-purple-700 overflow-hidden shadow-2xl shadow-indigo-500/20 group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Zap className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest mb-4 opacity-70 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Daily Spark
            </p>
            <h2 className="text-2xl md:text-4xl font-medium leading-tight italic">
              "{quote}"
            </h2>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4">
          <div className="p-6 rounded-[2rem] bg-slate-900 border border-white/5 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center shrink-0">
              <Trophy className="w-7 h-7 text-orange-400" />
            </div>
            <div>
              <p className="text-3xl font-black">{stats.streak}</p>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Day Streak</p>
            </div>
          </div>
          <div className="p-6 rounded-[2rem] bg-slate-900 border border-white/5 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <p className="text-3xl font-black">{stats.productivityScore}%</p>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Efficiency</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-2xl tracking-tight">Today's Focus</h3>
            <button className="text-xs text-indigo-400 font-bold uppercase tracking-widest hover:text-indigo-300 transition-colors">View Schedule</button>
          </div>
          
          <div className="space-y-4">
            <div className="p-6 rounded-[2.5rem] bg-slate-900 border border-white/5 flex items-center gap-6 hover:bg-slate-800/50 transition-colors cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                <ListTodo className="w-7 h-7 text-slate-400 group-hover:text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">Morning Exercise</p>
                <p className="text-sm text-slate-500">Suggested: 15 min stretching</p>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-700 group-hover:text-indigo-500 transition-colors" />
            </div>

            <div className="p-6 rounded-[2.5rem] bg-slate-900 border border-white/5 flex items-center gap-6 hover:bg-slate-800/50 transition-colors cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                <AlarmClock className="w-7 h-7 text-slate-400 group-hover:text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">Deep Work: Python</p>
                <p className="text-sm text-slate-500">Scheduled for 2:00 PM</p>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-700 group-hover:text-indigo-500 transition-colors" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="font-black text-2xl tracking-tight">Personalized Tips</h3>
          <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/20 space-y-4">
            <div className="flex items-center gap-3 text-indigo-400">
              <Brain className="w-6 h-6" />
              <span className="font-bold uppercase tracking-widest text-sm">AI Mentor</span>
            </div>
            <p className="text-lg leading-relaxed text-indigo-100/80">
              Based on your goal for <span className="text-white font-bold">Discipline</span>, I recommend starting your day with a 5-minute reflection. It helps prime your brain for focus.
            </p>
            <button className="flex items-center gap-2 text-indigo-400 font-bold text-sm hover:gap-3 transition-all">
              Learn more <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

