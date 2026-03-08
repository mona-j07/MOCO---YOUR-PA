import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Plus, X, Check, ChevronRight, Brain, Trophy, Zap, TrendingUp } from 'lucide-react';
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

  useEffect(() => {
    const onboarded = localStorage.getItem('moco_onboarded');
    if (onboarded) setIsOnboarded(true);
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
      console.log('Voice Command Result:', result);
      // Handle action (e.g., add task)
      alert(`Action: ${result.action}\nData: ${JSON.stringify(result.data)}`);
      setVoiceInput('');
      setIsVoiceOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingVoice(false);
    }
  };

  if (!isOnboarded) {
    return <Onboarding onComplete={() => {
      setIsOnboarded(true);
      localStorage.setItem('moco_onboarded', 'true');
    }} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
      {/* Mobile Frame */}
      <div className="w-full max-w-[400px] h-[800px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden relative flex flex-col">
        
        {/* Status Bar */}
        <div className="h-12 flex items-center justify-between px-8 pt-4">
          <span className="text-sm font-bold">9:41</span>
          <div className="flex gap-2">
            <div className="w-4 h-4 rounded-full bg-white/20" />
            <div className="w-4 h-4 rounded-full bg-white/20" />
            <div className="w-8 h-4 rounded-full bg-white/20" />
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 overflow-y-auto pb-24 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <Dashboard key="dashboard" />}
            {activeTab === 'alarms' && <AlarmScreen key="alarms" />}
            {activeTab === 'tasks' && <TaskScreen key="tasks" />}
            {activeTab === 'finance' && <FinanceScreen key="finance" />}
            {activeTab === 'reports' && <ReportScreen key="reports" />}
          </AnimatePresence>
        </div>

        {/* Voice Button (Floating) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsVoiceOpen(true)}
          className="absolute bottom-28 right-6 w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 z-40"
        >
          <Mic className="w-6 h-6" />
        </motion.button>

        {/* Navigation Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 z-50">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => setActiveTab(item.path)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === item.path ? 'text-indigo-400' : 'text-slate-500'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
              {activeTab === item.path && (
                <motion.div
                  layoutId="nav-indicator"
                  className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5"
                />
              )}
            </button>
          ))}
        </div>

        {/* Voice Modal */}
        <AnimatePresence>
          {isVoiceOpen && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute inset-0 bg-slate-950/95 z-[60] flex flex-col items-center justify-center p-8"
            >
              <button 
                onClick={() => setIsVoiceOpen(false)}
                className="absolute top-8 right-8 text-slate-400 hover:text-white"
              >
                <X className="w-8 h-8" />
              </button>
              
              <div className="w-32 h-32 rounded-full bg-indigo-500/20 flex items-center justify-center mb-8 relative">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-full bg-indigo-500/10"
                />
                <Mic className="w-12 h-12 text-indigo-400" />
              </div>

              <h2 className="text-2xl font-bold mb-2 text-center">How can I help?</h2>
              <p className="text-slate-400 text-center mb-8">"Add a task to study Python at 7 PM"</p>

              <div className="w-full space-y-4">
                <input
                  type="text"
                  value={voiceInput}
                  onChange={(e) => setVoiceInput(e.target.value)}
                  placeholder="Type or speak command..."
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleVoiceCommand()}
                />
                <button
                  onClick={handleVoiceCommand}
                  disabled={processingVoice}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 py-4 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {processingVoice ? 'Processing...' : 'Send Command'}
                  {!processingVoice && <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}} />
    </div>
  );
}
