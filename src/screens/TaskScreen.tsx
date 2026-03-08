import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, X, Clock, Tag, ChevronRight, ListTodo } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Task } from '../types';

export default function TaskScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', category: 'Coding', time: '10:00', priority: 'Medium' });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
  };

  const handleAddTask = async () => {
    if (!newTask.name) return;
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    });
    setIsAdding(false);
    setNewTask({ name: '', category: 'Coding', time: '10:00', priority: 'Medium' });
    fetchTasks();
  };

  const toggleTask = async (id: number, completed: boolean) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed }),
    });
    fetchTasks();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <motion.div 
            layout
            key={task.id}
            className={`p-4 rounded-3xl border transition-all flex items-center gap-4 ${
              task.completed ? 'bg-slate-900/50 border-white/5 opacity-50' : 'bg-slate-900 border-white/10'
            }`}
          >
            <button 
              onClick={() => toggleTask(task.id, task.completed)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-colors ${
                task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700'
              }`}
            >
              {task.completed && <Check className="w-5 h-5 text-white" />}
            </button>
            <div className="flex-1">
              <p className={`font-bold ${task.completed ? 'line-through text-slate-500' : ''}`}>
                {task.name}
              </p>
              <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {task.time}</span>
                <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {task.category}</span>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
              task.priority === 'High' ? 'bg-red-500/20 text-red-400' : 
              task.priority === 'Medium' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {task.priority}
            </div>
          </motion.div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <ListTodo className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No tasks for today. Add one!</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
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
                <h2 className="text-xl font-bold">New Task</h2>
                <button onClick={() => setIsAdding(false)}><X className="w-6 h-6 text-slate-500" /></button>
              </div>

              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="What needs to be done?"
                  value={newTask.name}
                  onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                  className="w-full bg-slate-800 border border-white/5 rounded-2xl p-4 font-bold focus:outline-none focus:border-indigo-500"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Category</label>
                    <select 
                      value={newTask.category}
                      onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl p-3 text-sm focus:outline-none"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Priority</label>
                    <select 
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl p-3 text-sm focus:outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Time</label>
                  <input 
                    type="time" 
                    value={newTask.time}
                    onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                    className="w-full bg-slate-800 border border-white/5 rounded-xl p-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={handleAddTask}
                className="w-full bg-indigo-500 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/20"
              >
                Create Task
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
