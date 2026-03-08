import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, Cell, PieChart, Pie, Legend } from 'recharts';
import { BarChart3, TrendingUp, Calendar, PieChart as PieChartIcon, Brain, Activity, ShieldCheck, Zap, Wallet, ListTodo, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ReportScreen() {
  const [financeSummary, setFinanceSummary] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [financeRes, tasksRes] = await Promise.all([
        fetch('/api/finance/summary'),
        fetch('/api/tasks')
      ]);
      setFinanceSummary(await financeRes.json());
      setTasks(await tasksRes.json());
    } catch (error) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const financeData = [
    { name: 'Income', value: financeSummary?.total_income || 0 },
    { name: 'Expenses', value: financeSummary?.total_expenses || 0 },
    { name: 'Investments', value: financeSummary?.total_investments || 0 },
  ];

  const hasData = totalTasks > 0 || (financeSummary && (financeSummary.total_income > 0 || financeSummary.total_expenses > 0));

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6"
      >
        <div className="w-24 h-24 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center">
          <AlertCircle className="w-12 h-12 text-slate-700" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black">No data available yet</h2>
          <p className="text-slate-500 max-w-xs mx-auto">Start tracking your tasks and finances to see your progress reports here.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 md:p-12 space-y-12"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Reports</h1>
          <p className="text-slate-500 font-medium">Data-driven discipline.</p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-white/5 text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Lifetime
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Productivity Chart */}
        <div className="p-8 rounded-[3rem] bg-slate-900 border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-xl font-black">Task Completion</h3>
            </div>
            <span className="text-2xl font-black text-indigo-400">{completionRate}%</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {totalTasks > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: completedTasks },
                      { name: 'Pending', value: totalTasks - completedTasks }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#6366f1" />
                    <Cell fill="rgba(255,255,255,0.05)" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '1rem', color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 italic">No tasks recorded</div>
            )}
          </div>
        </div>

        {/* Financial Distribution */}
        <div className="p-8 rounded-[3rem] bg-slate-900 border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <PieChartIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-black">Financial Summary</h3>
            </div>
            <span className="text-2xl font-black text-emerald-400">₹{financeSummary?.current_balance?.toLocaleString()}</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financeData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {financeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-6">
        <h3 className="text-2xl font-black tracking-tight">Master's Analysis</h3>
        <div className="p-10 rounded-[3rem] bg-indigo-600/10 border border-indigo-500/20 space-y-4">
          <div className="flex items-center gap-3 text-indigo-400">
            <Brain className="w-8 h-8" />
            <span className="text-xs font-bold uppercase tracking-widest">AI Insights</span>
          </div>
          <p className="text-xl leading-relaxed text-indigo-100/80 font-medium">
            {completionRate > 70 ? (
              `Master, your task completion rate is impressive at ${completionRate}%. Your financial discipline is also showing positive trends with a balance of ₹${financeSummary?.current_balance?.toLocaleString()}. Keep this momentum!`
            ) : (
              `Master, we have room for improvement. Your task completion is at ${completionRate}%. Let's focus on smaller, more achievable goals for the next few days to build back your discipline.`
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
