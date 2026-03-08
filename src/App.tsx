import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Plus, X, Check, ChevronRight, Brain, Trophy, Zap, TrendingUp, Menu, Clock, AlertCircle, Send, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { NAV_ITEMS } from './constants';
import Dashboard from './screens/Dashboard';
import AlarmScreen from './screens/AlarmScreen';
import TaskScreen from './screens/TaskScreen';
import FinanceScreen from './screens/FinanceScreen';
import ReportScreen from './screens/ReportScreen';
import ReminderScreen from './screens/ReminderScreen';
import NoteScreen from './screens/NoteScreen';
import Onboarding from './screens/Onboarding';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [processingCommand, setProcessingCommand] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTimeSynced, setIsTimeSynced] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<any>(null);
  const [permissions, setPermissions] = useState({ mic: 'prompt', audio: 'prompt' });
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    // Check permissions
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as any }).then(result => {
        setPermissions(prev => ({ ...prev, mic: result.state }));
        result.onchange = () => setPermissions(prev => ({ ...prev, mic: result.state }));
      });
    }
  }, []);

  const requestPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissions(prev => ({ ...prev, mic: 'granted' }));
      // Audio permission is usually granted with mic or handled by user interaction
      setIsTimeSynced(true);
      setShowPermissionModal(false);
      
      // Initialize global audio context if needed or just play a silent sound to unlock
      const audio = new Audio();
      audio.play().catch(() => {}); 
    } catch (err) {
      setPermissions(prev => ({ ...prev, mic: 'denied' }));
      toast.error('Microphone access denied. Voice commands will not work.');
    }
  };

  useEffect(() => {
    if (isOnboarded && !isTimeSynced) {
      setShowPermissionModal(true);
    }
  }, [isOnboarded, isTimeSynced]);

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(user => {
        if (user && user.onboarding_completed) {
          setIsOnboarded(true);
        }
      });

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCommand = async (text: string) => {
    if (!text.trim()) return;
    setProcessingCommand(true);
    try {
      const res = await fetch('/api/ai/process-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          localTime: currentTime.toISOString()
        }),
      });
      const result = await res.json();
      if (result.confidence > 0.3) {
        setPendingCommand(result);
      } else {
        toast.error("I'm not sure what you mean. Could you rephrase?");
      }
      setCommandInput('');
    } catch (error) {
      toast.error('Failed to process command');
    } finally {
      setProcessingCommand(false);
    }
  };

  const confirmCommand = async () => {
    if (!pendingCommand) return;
    const { action, data } = pendingCommand;
    
    let endpoint = '';
    switch (action) {
      case 'ADD_TASK': endpoint = '/api/tasks'; break;
      case 'ADD_EXPENSE': endpoint = '/api/finance'; break;
      case 'SET_ALARM': endpoint = '/api/alarms'; break;
      case 'ADD_REMINDER': endpoint = '/api/reminders'; break;
      case 'ADD_NOTE': endpoint = '/api/notes'; break;
      default: toast.error('Unknown action'); return;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success(`${action.replace('ADD_', '').replace('SET_', '')} added successfully!`);
        setPendingCommand(null);
        setIsVoiceOpen(false);
      }
    } catch (error) {
      toast.error('Failed to save data');
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

      {/* Permission & Time Sync Modal */}
      <AnimatePresence>
        {showPermissionModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 z-[200] flex items-center justify-center p-6 backdrop-blur-md"
          >
            <div className="w-full max-w-md bg-slate-900 rounded-[3rem] p-10 space-y-8 border border-white/10 shadow-2xl text-center">
              <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto">
                <Clock className="w-10 h-10 text-indigo-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black">Welcome to MOCO</h2>
                <p className="text-slate-400">To provide the best experience, we need to sync your time and request permissions for voice commands and alarms.</p>
                <div className="p-4 bg-slate-800/50 rounded-2xl text-left space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Microphone Access</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${permissions.mic === 'granted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {permissions.mic === 'granted' ? 'Granted' : 'Required'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Audio Playback</span>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">Ready</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Current Device Time</p>
                  <p className="text-4xl font-black text-white">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <button 
                  onClick={requestPermissions}
                  className="w-full bg-indigo-500 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 text-lg"
                >
                  Sync & Grant Permissions
                </button>
                {permissions.mic === 'denied' && (
                  <p className="text-xs text-rose-400">Microphone is blocked. Please enable it in your browser settings to use voice features.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-black text-white">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <button 
              onClick={() => setIsVoiceOpen(true)}
              className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20"
            >
              <Mic className="w-6 h-6" />
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
              {activeTab === 'reminders' && <ReminderScreen key="reminders" />}
              {activeTab === 'notes' && <NoteScreen key="notes" />}
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

      {/* Command Input Modal (Voice/Text) */}
      <AnimatePresence>
        {isVoiceOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 z-[150] flex flex-col items-center justify-center p-8 backdrop-blur-sm"
          >
            <button 
              onClick={() => { setIsVoiceOpen(false); setPendingCommand(null); }}
              className="absolute top-8 right-8 text-slate-400 hover:text-white p-2"
            >
              <X className="w-8 h-8" />
            </button>
            
            {!pendingCommand ? (
              <>
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    boxShadow: ['0 0 0 0px rgba(99, 102, 241, 0)', '0 0 0 40px rgba(99, 102, 241, 0.1)', '0 0 0 0px rgba(99, 102, 241, 0)']
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-32 h-32 rounded-full bg-indigo-500/20 flex items-center justify-center mb-12"
                >
                  <Mic className="w-12 h-12 text-indigo-400" />
                </motion.div>

                <h2 className="text-3xl font-black mb-4 text-center">How can I help?</h2>
                <p className="text-slate-400 text-center mb-12 max-w-md">Try: "Add task Study at 7 PM" or "Add expense 50 for lunch"</p>

                <div className="w-full max-w-lg space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      value={commandInput}
                      onChange={(e) => setCommandInput(e.target.value)}
                      placeholder="Type your command..."
                      className="w-full bg-slate-900 border border-white/10 rounded-[2rem] px-8 py-6 text-lg focus:outline-none focus:border-indigo-500 transition-all shadow-2xl"
                      onKeyDown={(e) => e.key === 'Enter' && handleCommand(commandInput)}
                    />
                    <button 
                      onClick={() => handleCommand(commandInput)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center"
                    >
                      {processingCommand ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-xl bg-slate-900 rounded-[3rem] p-10 space-y-8 border border-white/10 shadow-2xl"
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">Confirm Action</h2>
                    <p className="text-slate-500 text-sm">I've parsed your command. Is this correct?</p>
                  </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-slate-800/50 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Action</span>
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">{pendingCommand.action}</span>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(pendingCommand.data).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm text-slate-400 capitalize">{key.replace('_', ' ')}</span>
                        <span className="text-sm font-bold text-white">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={confirmCommand}
                    className="flex-1 bg-indigo-500 py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/20"
                  >
                    Confirm & Save
                  </button>
                  <button 
                    onClick={() => setPendingCommand(null)}
                    className="flex-1 bg-slate-800 py-5 rounded-2xl font-black text-lg text-slate-400"
                  >
                    Edit
                  </button>
                </div>
              </motion.div>
            )}
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


