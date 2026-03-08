import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Plus, X, Check, ChevronRight, Brain, Trophy, Zap, TrendingUp, Menu } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { NAV_ITEMS } from './constants';
import Dashboard from './screens/Dashboard';
import AlarmScreen from './screens/AlarmScreen';
import TaskScreen from './screens/TaskScreen';
import FinanceScreen from './screens/FinanceScreen';
import ReportScreen from './screens/ReportScreen';
import Onboarding from './screens/Onboarding';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [voiceInput, setVoiceInput] = useState('');
  const [processingVoice, setProcessingVoice] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(user => {
        if (user && user.onboarding_completed) {
          setIsOnboarded(true);
        }
      });
  }, []);

  const handleVoiceCommand = async () => {
    if (!voiceInput.trim()) return;
    setProcessingVoice(true);
    try {
      const res = await fetch('/api/ai/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: voiceInput }),
      });
      const result = await res.json();
      toast.success(`Action: ${result.action} processed!`);
      setVoiceInput('');
      setIsVoiceOpen(false);
    } catch (error) {
      toast.error('Failed to process voice command');
    } finally {
      setProcessingVoice(false);
    }
  };

  if (!isOnboarded) {
    return <Onboarding onComplete={() => setIsOnboarded(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex overflow-hidden">
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      }} />

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-slate-900 border-r border-white/5 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          {isSidebarOpen && <span className="font-bold text-xl tracking-tight">MOCO</span>}
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => setActiveTab(item.path)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                activeTab === item.path ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              <item.icon className="w-6 h-6 shrink-0" />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full p-4 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-colors flex justify-center"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-xl z-30">
          <div className="md:hidden flex items-center gap-3">
            <Brain className="w-8 h-8 text-indigo-500" />
            <span className="font-bold text-xl">MOCO</span>
          </div>
          <div className="hidden md:block">
            <h2 className="text-slate-400 text-sm font-medium uppercase tracking-widest">
              {NAV_ITEMS.find(i => i.path === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-300">System Online</span>
            </div>
            <button 
              onClick={() => setIsVoiceOpen(true)}
              className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content View */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto w-full pb-24 md:pb-8">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && <Dashboard key="dashboard" />}
              {activeTab === 'alarms' && <AlarmScreen key="alarms" />}
              {activeTab === 'tasks' && <TaskScreen key="tasks" />}
              {activeTab === 'finance' && <FinanceScreen key="finance" />}
              {activeTab === 'reports' && <ReportScreen key="reports" />}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-slate-900/90 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-4 z-50">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => setActiveTab(item.path)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === item.path ? 'text-indigo-400' : 'text-slate-500'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>

      {/* Voice Modal */}
      <AnimatePresence>
        {isVoiceOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 z-[100] flex flex-col items-center justify-center p-8 backdrop-blur-sm"
          >
            <button 
              onClick={() => setIsVoiceOpen(false)}
              className="absolute top-8 right-8 text-slate-400 hover:text-white p-2"
            >
              <X className="w-8 h-8" />
            </button>
            
            <motion.div 
              animate={{ 
                boxShadow: ['0 0 0 0px rgba(99, 102, 241, 0)', '0 0 0 40px rgba(99, 102, 241, 0.1)', '0 0 0 0px rgba(99, 102, 241, 0)']
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-32 h-32 rounded-full bg-indigo-500/20 flex items-center justify-center mb-12"
            >
              <Mic className="w-12 h-12 text-indigo-400" />
            </motion.div>

            <h2 className="text-3xl font-bold mb-4 text-center">Listening...</h2>
            <p className="text-slate-400 text-center mb-12 max-w-md">Try saying "Add a task to exercise tomorrow" or "Log expense 500 for food"</p>

            <div className="w-full max-w-lg space-y-4">
              <input
                type="text"
                autoFocus
                value={voiceInput}
                onChange={(e) => setVoiceInput(e.target.value)}
                placeholder="Type command here..."
                className="w-full bg-slate-900 border border-white/10 rounded-3xl px-8 py-5 text-lg focus:outline-none focus:border-indigo-500 transition-all shadow-2xl"
                onKeyDown={(e) => e.key === 'Enter' && handleVoiceCommand()}
              />
              <button
                onClick={handleVoiceCommand}
                disabled={processingVoice}
                className="w-full bg-indigo-500 hover:bg-indigo-600 py-5 rounded-3xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20"
              >
                {processingVoice ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Process Command <ChevronRight className="w-6 h-6" /></>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}} />
    </div>
  );
}

