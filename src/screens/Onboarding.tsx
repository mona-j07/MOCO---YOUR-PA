import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Rocket, Compass, Shield, Target, ChevronRight } from 'lucide-react';

const QUESTIONS = [
  {
    id: 1,
    text: "What motivates you most?",
    options: [
      { label: "Building things", icon: Rocket, type: "Builder" },
      { label: "Exploring new ideas", icon: Compass, type: "Explorer" },
      { label: "Strategic planning", icon: Target, type: "Strategist" },
      { label: "Visionary goals", icon: Brain, type: "Visionary" }
    ]
  },
  {
    id: 2,
    text: "Are you a morning or night person?",
    options: [
      { label: "Early Bird", icon: Shield, type: "Disciplined Performer" },
      { label: "Night Owl", icon: Brain, type: "Explorer" },
      { label: "Flexible", icon: Compass, type: "Strategist" },
      { label: "Depends on project", icon: Rocket, type: "Builder" }
    ]
  }
];

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleSelect = (type: string) => {
    const newAnswers = [...answers, type];
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] h-[800px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden relative flex flex-col p-8">
        
        <div className="mt-12 mb-8">
          <div className="flex gap-2 mb-8">
            {QUESTIONS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-indigo-500' : 'bg-slate-800'}`} 
              />
            ))}
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to MOCO</h1>
          <p className="text-slate-400">Let's personalize your experience.</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 space-y-6"
          >
            <h2 className="text-xl font-medium text-slate-200">{QUESTIONS[step].text}</h2>
            <div className="grid gap-4">
              {QUESTIONS[step].options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleSelect(opt.type)}
                  className="w-full p-6 rounded-3xl bg-slate-800 border border-white/5 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                    <opt.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <span className="font-bold text-lg">{opt.label}</span>
                  <ChevronRight className="w-5 h-5 ml-auto text-slate-600" />
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto pt-8 text-center text-xs text-slate-500">
          Powered by U, The Master
        </div>
      </div>
    </div>
  );
}
