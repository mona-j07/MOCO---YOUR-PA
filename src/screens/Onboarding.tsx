import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Rocket, Compass, Shield, Target, ChevronRight, User, Sparkles, Zap, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';

const QUESTIONS = [
  {
    id: 'name',
    text: "What should I call you?",
    type: 'input',
    placeholder: "Your name, Master..."
  },
  {
    id: 'goal',
    text: "What is your main goal?",
    options: [
      { label: "Productivity", icon: Zap, value: "Productivity" },
      { label: "Fitness", icon: Heart, value: "Fitness" },
      { label: "Learning", icon: Brain, value: "Learning" },
      { label: "Finance", icon: Target, value: "Finance" },
      { label: "Discipline", icon: Shield, value: "Discipline" }
    ]
  },
  {
    id: 'motivation',
    text: "What motivates you most?",
    options: [
      { label: "Building things", icon: Rocket, type: "Builder" },
      { label: "Exploring new ideas", icon: Compass, type: "Explorer" },
      { label: "Strategic planning", icon: Target, type: "Strategist" },
      { label: "Visionary goals", icon: Brain, type: "Visionary" }
    ]
  },
  {
    id: 'routine',
    text: "Are you a morning or night person?",
    options: [
      { label: "Early Bird", icon: Shield, type: "Disciplined Performer" },
      { label: "Night Owl", icon: Brain, type: "Explorer" },
      { label: "Flexible", icon: Compass, type: "Strategist" }
    ]
  }
];

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<any>({
    name: '',
    goal: '',
    motivation: '',
    routine: ''
  });
  const [loading, setLoading] = useState(false);

  const handleNext = async (value?: string) => {
    const currentQuestion = QUESTIONS[step];
    const updatedData = { ...formData };
    
    if (value) {
      updatedData[currentQuestion.id] = value;
      setFormData(updatedData);
    }

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        const res = await fetch('/api/user/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: updatedData.name,
            personality: updatedData.motivation,
            goals: updatedData.goal
          }),
        });
        if (res.ok) {
          toast.success(`Welcome, ${updatedData.name}!`);
          onComplete();
        }
      } catch (error) {
        toast.error('Failed to save onboarding data');
      } finally {
        setLoading(false);
      }
    }
  };

  const currentQ = QUESTIONS[step];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden relative flex flex-col p-12 md:p-20">
        
        <div className="mb-12">
          <div className="flex gap-3 mb-12">
            {QUESTIONS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`} 
              />
            ))}
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">Personalization Protocol</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">MOCO Initialization</h1>
          <p className="text-slate-400 text-lg">Let's configure your AI productivity environment.</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 space-y-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100">{currentQ.text}</h2>
            
            {currentQ.type === 'input' ? (
              <div className="space-y-6">
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 w-6 h-6" />
                  <input
                    type="text"
                    autoFocus
                    placeholder={currentQ.placeholder}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-white/5 rounded-[2rem] p-6 pl-16 text-xl font-bold focus:outline-none focus:border-indigo-500 transition-all shadow-xl"
                    onKeyDown={(e) => e.key === 'Enter' && formData.name && handleNext()}
                  />
                </div>
                <button
                  onClick={() => handleNext()}
                  disabled={!formData.name}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 py-6 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20"
                >
                  Continue <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQ.options?.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleNext(opt.value || opt.type)}
                    className="w-full p-8 rounded-[2.5rem] bg-slate-800 border border-white/5 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all flex items-center gap-6 group text-left"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors shrink-0">
                      <opt.icon className="w-8 h-8 text-indigo-400" />
                    </div>
                    <span className="font-bold text-xl">{opt.label}</span>
                    <ChevronRight className="w-6 h-6 ml-auto text-slate-600 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 pt-8 text-center text-xs font-bold uppercase tracking-widest text-slate-600 border-t border-white/5">
          Powered by U, The Master
        </div>
      </div>
    </div>
  );
}

