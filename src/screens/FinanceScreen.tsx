import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Wallet, TrendingDown, ShoppingBag, Utensils, Car, GraduationCap, Film, X } from 'lucide-react';
import { FINANCE_CATEGORIES } from '../constants';
import { FinanceRecord } from '../types';

const CATEGORY_ICONS: Record<string, any> = {
  Food: Utensils,
  Transport: Car,
  Education: GraduationCap,
  Shopping: ShoppingBag,
  Entertainment: Film,
};

export default function FinanceScreen() {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newRecord, setNewRecord] = useState({ amount: '', category: 'Food', description: '' });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const res = await fetch('/api/finance');
    const data = await res.json();
    setRecords(data);
  };

  const handleAddRecord = async () => {
    if (!newRecord.amount) return;
    await fetch('/api/finance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newRecord,
        amount: parseFloat(newRecord.amount)
      }),
    });
    setIsAdding(false);
    setNewRecord({ amount: '', category: 'Food', description: '' });
    fetchRecords();
  };

  const totalSpent = records.reduce((acc, r) => acc + r.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 space-y-8"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Finance</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Balance Card */}
      <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-20">
          <Wallet className="w-24 h-24" />
        </div>
        <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Total Spent Today</p>
        <h2 className="text-4xl font-black tracking-tighter">₹{totalSpent.toLocaleString()}</h2>
        <div className="mt-6 flex items-center gap-2 text-emerald-100 text-xs font-medium">
          <div className="px-2 py-1 rounded-lg bg-white/20">
            <TrendingDown className="w-3 h-3 inline mr-1" /> 12% vs yesterday
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Recent Spending</h3>
        <div className="space-y-3">
          {records.map((record) => {
            const Icon = CATEGORY_ICONS[record.category] || Wallet;
            return (
              <div key={record.id} className="p-4 rounded-3xl bg-slate-900 border border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">{record.description || record.category}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{record.category}</p>
                </div>
                <p className="font-black text-red-400">-₹{record.amount}</p>
              </div>
            );
          })}
          {records.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p>No expenses recorded today.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Record Modal */}
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
                <h2 className="text-xl font-bold">Add Expense</h2>
                <button onClick={() => setIsAdding(false)}><X className="w-6 h-6 text-slate-500" /></button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-500">₹</span>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={newRecord.amount}
                    onChange={(e) => setNewRecord({...newRecord, amount: e.target.value})}
                    className="w-full bg-slate-800 border border-white/5 rounded-2xl p-6 pl-12 text-3xl font-black focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                
                <input 
                  type="text" 
                  placeholder="What did you buy?"
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                  className="w-full bg-slate-800 border border-white/5 rounded-2xl p-4 font-bold focus:outline-none focus:border-emerald-500"
                />

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {FINANCE_CATEGORIES.map(c => (
                      <button
                        key={c}
                        onClick={() => setNewRecord({...newRecord, category: c})}
                        className={`p-3 rounded-xl border transition-all text-[10px] font-bold uppercase ${
                          newRecord.category === c ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-800 border-white/5 text-slate-400'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAddRecord}
                className="w-full bg-emerald-500 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/20"
              >
                Save Expense
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
