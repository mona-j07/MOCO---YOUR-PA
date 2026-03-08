import React from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp, Calendar, PieChart } from 'lucide-react';

const PRODUCTIVITY_DATA = [
  { day: 'Mon', score: 65 },
  { day: 'Tue', score: 78 },
  { day: 'Wed', score: 90 },
  { day: 'Thu', score: 85 },
  { day: 'Fri', score: 95 },
  { day: 'Sat', score: 70 },
  { day: 'Sun', score: 60 },
];

const SPENDING_DATA = [
  { day: 'Mon', amount: 400 },
  { day: 'Tue', amount: 200 },
  { day: 'Wed', amount: 800 },
  { day: 'Thu', amount: 150 },
  { day: 'Fri', amount: 1200 },
  { day: 'Sat', amount: 3000 },
  { day: 'Sun', amount: 500 },
];

export default function ReportScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 space-y-8"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="px-3 py-1 rounded-full bg-slate-800 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Calendar className="w-3 h-3" /> This Week
        </div>
      </div>

      {/* Productivity Chart */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <h3 className="font-bold">Productivity Score</h3>
        </div>
        <div className="h-48 w-full bg-slate-900 rounded-3xl p-4 border border-white/5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PRODUCTIVITY_DATA}>
              <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spending Chart */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <PieChart className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="font-bold">Spending Trends</h3>
        </div>
        <div className="h-48 w-full bg-slate-900 rounded-3xl p-4 border border-white/5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SPENDING_DATA}>
              <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">AI Insights</h3>
        <div className="p-6 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <Brain className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Master's Analysis</span>
          </div>
          <p className="text-sm leading-relaxed text-indigo-100/80">
            Your productivity peaked on Friday. You tend to spend more on weekends. 
            Consider moving your "Deep Work" sessions to Wednesday for maximum efficiency.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function Brain(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 8.105 4 4 0 0 0 5.327 2.7c.347.08.707.12 1.076.12h1.2c.369 0 .729-.04 1.076-.12a4 4 0 0 0 5.327-2.7 4 4 0 0 0 .52-8.105 4 4 0 0 0-2.526-5.77A3 3 0 1 0 12 5" />
      <path d="M9 13a4.5 4.5 0 0 0 3-4" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4" />
      <path d="M12 13V8" />
    </svg>
  );
}
