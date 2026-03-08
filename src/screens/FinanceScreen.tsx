import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Wallet, TrendingDown, ShoppingBag, Utensils, Car, GraduationCap, Film, X, TrendingUp, ArrowUpCircle, ArrowDownCircle, PieChart as PieChartIcon, BarChart as BarChartIcon, DollarSign, Briefcase } from 'lucide-react';
import { FINANCE_CATEGORIES } from '../constants';
import { FinanceRecord } from '../types';
import { toast } from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const CATEGORY_ICONS: Record<string, any> = {
  Food: Utensils,
  Transport: Car,
  Education: GraduationCap,
  Shopping: ShoppingBag,
  Entertainment: Film,
  Income: ArrowUpCircle,
  Investment: Briefcase,
};

const COLORS = ['#10b981', '#ef4444', '#6366f1', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function FinanceScreen() {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeType, setActiveType] = useState<'income' | 'expense' | 'investment'>('expense');
  const [newRecord, setNewRecord] = useState({ amount: '', category: 'Food', description: '', date: new Date().toISOString().split('T')[0] });
  const [showInitialBalanceModal, setShowInitialBalanceModal] = useState(false);
  const [initialBalanceInput, setInitialBalanceInput] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recordsRes, summaryRes] = await Promise.all([
        fetch('/api/finance'),
        fetch('/api/finance/summary')
      ]);
      const recordsData = await recordsRes.json();
      const summaryData = await summaryRes.json();
      setRecords(recordsData);
      setSummary(summaryData);

      if (summaryData.initial_balance === 0 && summaryData.current_balance === 0 && recordsData.length === 0) {
        setShowInitialBalanceModal(true);
      }
    } catch (error) {
      toast.error('Failed to load finance data');
    }
  };

  const handleSetInitialBalance = async () => {
    if (!initialBalanceInput) return;
    try {
      const res = await fetch('/api/finance/initial-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(initialBalanceInput) }),
      });
      if (res.ok) {
        toast.success('Initial balance set!');
        setShowInitialBalanceModal(false);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to set initial balance');
    }
  };

  const handleAddRecord = async () => {
    if (!newRecord.amount) return;
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRecord,
          type: activeType,
          amount: parseFloat(newRecord.amount)
        }),
      });
      if (res.ok) {
        toast.success(`${activeType.charAt(0).toUpperCase() + activeType.slice(1)} recorded!`);
        setIsAdding(false);
        setNewRecord({ amount: '', category: activeType === 'income' ? 'Salary' : activeType === 'investment' ? 'Stocks' : 'Food', description: '', date: new Date().toISOString().split('T')[0] });
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to save record');
    }
  };

  const chartData = records.reduce((acc: any[], r) => {
    if (r.type === 'expense') {
      const existing = acc.find(item => item.name === r.category);
      if (existing) {
        existing.value += r.amount;
      } else {
        acc.push({ name: r.category, value: r.amount });
      }
    }
    return acc;
  }, []);

  const monthlyData = [
    { name: 'Income', value: summary?.total_income || 0 },
    { name: 'Expense', value: summary?.total_expenses || 0 },
    { name: 'Investment', value: summary?.total_investments || 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 md:p-12 space-y-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Finance</h1>
          <p className="text-slate-500 font-medium">Master your wealth.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setActiveType('income'); setIsAdding(true); }}
            className="px-6 py-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-sm hover:bg-emerald-500/20 transition-all flex items-center gap-2"
          >
            <ArrowUpCircle className="w-4 h-4" /> Add Income
          </button>
          <button 
            onClick={() => { setActiveType('expense'); setIsAdding(true); }}
            className="px-6 py-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-sm hover:bg-rose-500/20 transition-all flex items-center gap-2"
          >
            <ArrowDownCircle className="w-4 h-4" /> Add Expense
          </button>
          <button 
            onClick={() => { setActiveType('investment'); setIsAdding(true); }}
            className="px-6 py-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-sm hover:bg-indigo-500/20 transition-all flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4" /> Add Invest
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-white/5 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Current Balance</p>
            <h2 className="text-3xl font-black tracking-tighter">₹{summary?.current_balance?.toLocaleString() || '0'}</h2>
          </div>
        </div>
        <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-white/5 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total Income</p>
            <h2 className="text-3xl font-black tracking-tighter text-emerald-400">₹{summary?.total_income?.toLocaleString() || '0'}</h2>
          </div>
        </div>
        <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-white/5 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total Expenses</p>
            <h2 className="text-3xl font-black tracking-tighter text-rose-400">₹{summary?.total_expenses?.toLocaleString() || '0'}</h2>
          </div>
        </div>
        <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-white/5 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total Investments</p>
            <h2 className="text-3xl font-black tracking-tighter text-indigo-400">₹{summary?.total_investments?.toLocaleString() || '0'}</h2>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="p-8 rounded-[3rem] bg-slate-900 border border-white/5 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black flex items-center gap-3">
              <PieChartIcon className="w-6 h-6 text-indigo-400" /> Expense Breakdown
            </h3>
          </div>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '1rem', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 italic">No expense data available</div>
            )}
          </div>
        </div>

        <div className="p-8 rounded-[3rem] bg-slate-900 border border-white/5 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black flex items-center gap-3">
              <BarChartIcon className="w-6 h-6 text-emerald-400" /> Financial Overview
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '1rem', color: '#fff' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {monthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#ef4444' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-6">
        <h3 className="text-2xl font-black tracking-tight">Recent Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.map((record) => {
            const Icon = CATEGORY_ICONS[record.category] || Wallet;
            const isNegative = record.type === 'expense' || record.type === 'investment';
            return (
              <div key={record.id} className="p-6 rounded-[2rem] bg-slate-900 border border-white/5 flex items-center gap-4 hover:border-white/10 transition-all">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  record.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 
                  record.type === 'investment' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">{record.description || record.category}</p>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span>{record.category}</span>
                    <span>•</span>
                    <span>{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className={`text-xl font-black ${isNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isNegative ? '-' : '+'}₹{record.amount.toLocaleString()}
                </p>
              </div>
            );
          })}
          {records.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4">
              <Wallet className="w-16 h-16 mx-auto text-slate-800" />
              <p className="text-slate-500 font-medium italic">No transactions recorded yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Initial Balance Modal */}
      <AnimatePresence>
        {showInitialBalanceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 z-[200] flex items-center justify-center p-6 backdrop-blur-md"
          >
            <div className="w-full max-w-md bg-slate-900 rounded-[3rem] p-10 space-y-8 border border-white/10 shadow-2xl text-center">
              <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto">
                <DollarSign className="w-10 h-10 text-indigo-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black">Setup Finance</h2>
                <p className="text-slate-400">What is your current bank balance? We'll use this as your starting point.</p>
              </div>
              <div className="space-y-6">
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-500">₹</span>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    autoFocus
                    value={initialBalanceInput}
                    onChange={(e) => setInitialBalanceInput(e.target.value)}
                    className="w-full bg-slate-800 border border-white/5 rounded-2xl p-6 pl-12 text-3xl font-black focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <button 
                  onClick={handleSetInitialBalance}
                  className="w-full bg-indigo-500 py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/20"
                >
                  Start Tracking
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Record Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 z-[150] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              className="w-full max-w-lg bg-slate-900 rounded-[3rem] p-10 space-y-8 border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight capitalize">Add {activeType}</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-500">₹</span>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    autoFocus
                    value={newRecord.amount}
                    onChange={(e) => setNewRecord({...newRecord, amount: e.target.value})}
                    className="w-full bg-slate-800 border border-white/5 rounded-2xl p-6 pl-12 text-4xl font-black focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Description</label>
                  <input 
                    type="text" 
                    placeholder={activeType === 'income' ? 'e.g. Monthly Salary' : activeType === 'investment' ? 'e.g. Apple Stocks' : 'e.g. Grocery Shopping'}
                    value={newRecord.description}
                    onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                    className="w-full bg-slate-800 border border-white/5 rounded-2xl p-5 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Category</label>
                    <select 
                      value={newRecord.category}
                      onChange={(e) => setNewRecord({...newRecord, category: e.target.value})}
                      className="w-full bg-slate-800 border border-white/5 rounded-2xl p-4 font-bold focus:outline-none"
                    >
                      {activeType === 'income' ? (
                        <>
                          <option value="Salary">Salary</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Gift">Gift</option>
                          <option value="Other">Other</option>
                        </>
                      ) : activeType === 'investment' ? (
                        <>
                          <option value="Stocks">Stocks</option>
                          <option value="Crypto">Crypto</option>
                          <option value="Mutual Funds">Mutual Funds</option>
                          <option value="Real Estate">Real Estate</option>
                          <option value="Other">Other</option>
                        </>
                      ) : (
                        FINANCE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)
                      )}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Date</label>
                    <input 
                      type="date" 
                      value={newRecord.date}
                      onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                      className="w-full bg-slate-800 border border-white/5 rounded-2xl p-4 font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAddRecord}
                className={`w-full py-6 rounded-3xl font-black text-lg shadow-xl transition-all ${
                  activeType === 'income' ? 'bg-emerald-500 shadow-emerald-500/20' : 
                  activeType === 'investment' ? 'bg-indigo-500 shadow-indigo-500/20' : 'bg-rose-500 shadow-rose-500/20'
                }`}
              >
                Save Record
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
