import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, X, Clock, Tag, ChevronRight, ListTodo, Edit2, Trash2, Calendar, FileText } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Task } from '../types';
import { toast } from 'react-hot-toast';

export default function TaskScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [newTask, setNewTask] = useState({ 
    name: '', 
    category: 'Coding', 
    time: '10:00', 
    duration: '60', 
    priority: 'Medium',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

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
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    });
    if (res.ok) {
      toast.success('Task added successfully');
      setIsAdding(false);
      setNewTask({ 
        name: '', 
        category: 'Coding', 
        time: '10:00', 
        duration: '60', 
        priority: 'Medium',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      fetchTasks();
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask.name) return;
    const res = await fetch(`/api/tasks/${editingTask.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingTask),
    });
    if (res.ok) {
      toast.success('Task updated successfully');
      setIsEditing(false);
      setEditingTask(null);
      fetchTasks();
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      toast.success('Task deleted successfully');
      fetchTasks();
    }
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
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {task.time} ({task.duration}m)</span>
                <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {task.category}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                task.priority === 'High' ? 'bg-red-500/20 text-red-400' : 
                task.priority === 'Medium' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {task.priority}
              </div>
              <button 
                onClick={() => { setEditingTask(task); setIsEditing(true); }}
                className="p-2 text-slate-500 hover:text-white transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDeleteTask(task.id)}
                className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
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

      {/* Add/Edit Task Modal */}
      <AnimatePresence>
        {(isAdding || isEditing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 z-[100] flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              className="w-full max-w-lg bg-slate-900 rounded-[2rem] p-8 space-y-6 border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{isEditing ? 'Edit Task' : 'New Task'}</h2>
                <button onClick={() => { setIsAdding(false); setIsEditing(false); setEditingTask(null); }}><X className="w-6 h-6 text-slate-500" /></button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Task Name</label>
                  <input 
                    type="text" 
                    placeholder="What needs to be done?"
                    value={isEditing ? editingTask.name : newTask.name}
                    onChange={(e) => isEditing ? setEditingTask({...editingTask, name: e.target.value}) : setNewTask({...newTask, name: e.target.value})}
                    className="w-full bg-slate-800 border border-white/5 rounded-2xl p-4 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Category</label>
                    <select 
                      value={isEditing ? editingTask.category : newTask.category}
                      onChange={(e) => isEditing ? setEditingTask({...editingTask, category: e.target.value}) : setNewTask({...newTask, category: e.target.value})}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl p-3 text-sm focus:outline-none"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Priority</label>
                    <select 
                      value={isEditing ? editingTask.priority : newTask.priority}
                      onChange={(e) => isEditing ? setEditingTask({...editingTask, priority: e.target.value as any}) : setNewTask({...newTask, priority: e.target.value as any})}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl p-3 text-sm focus:outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Time</label>
                    <input 
                      type="time" 
                      value={isEditing ? editingTask.time : newTask.time}
                      onChange={(e) => isEditing ? setEditingTask({...editingTask, time: e.target.value}) : setNewTask({...newTask, time: e.target.value})}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl p-3 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Duration (min)</label>
                    <input 
                      type="number" 
                      value={isEditing ? editingTask.duration : newTask.duration}
                      onChange={(e) => isEditing ? setEditingTask({...editingTask, duration: e.target.value}) : setNewTask({...newTask, duration: e.target.value})}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl p-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="date" 
                      value={isEditing ? editingTask.date : newTask.date}
                      onChange={(e) => isEditing ? setEditingTask({...editingTask, date: e.target.value}) : setNewTask({...newTask, date: e.target.value})}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl p-3 pl-12 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Description</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                    <textarea 
                      placeholder="Add more details..."
                      value={isEditing ? editingTask.description : newTask.description}
                      onChange={(e) => isEditing ? setEditingTask({...editingTask, description: e.target.value}) : setNewTask({...newTask, description: e.target.value})}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl p-4 pl-12 text-sm focus:outline-none min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={isEditing ? handleUpdateTask : handleAddTask}
                className="w-full bg-indigo-500 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/20"
              >
                {isEditing ? 'Save Changes' : 'Create Task'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
