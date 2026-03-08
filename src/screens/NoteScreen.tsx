import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StickyNote, Plus, X, Search, Trash2, Edit3 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function NoteScreen() {
  const [notes, setNotes] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      setNotes(data);
    } catch (error) {
      toast.error('Failed to load notes');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.content) {
      toast.error('Please enter note content');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });
      if (res.ok) {
        toast.success('Note saved!');
        setIsAdding(false);
        setNewNote({ title: '', content: '' });
        fetchNotes();
      }
    } catch (error) {
      toast.error('Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote.content) {
      toast.error('Please enter note content');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/notes/${editingNote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingNote),
      });
      if (res.ok) {
        toast.success('Note updated!');
        setIsEditing(false);
        setEditingNote(null);
        fetchNotes();
      }
    } catch (error) {
      toast.error('Failed to update note');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Note deleted!');
        fetchNotes();
      }
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 md:p-12 space-y-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Notes</h1>
          <p className="text-slate-500 font-medium">Capture your brilliance.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-xl shadow-indigo-500/20 hover:scale-110 transition-transform shrink-0"
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <motion.div 
            layout
            key={note.id}
            className="p-8 rounded-[2.5rem] bg-slate-900 border border-white/5 flex flex-col gap-4 group hover:border-indigo-500/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <StickyNote className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => { setEditingNote(note); setIsEditing(true); }}
                  className="p-2 text-slate-600 hover:text-white transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteNote(note.id)}
                  className="p-2 text-slate-600 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              {note.title && <h3 className="text-xl font-black mb-2">{note.title}</h3>}
              <p className="text-slate-400 leading-relaxed line-clamp-4">{note.content}</p>
            </div>
            <div className="pt-4 mt-auto border-t border-white/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-600">
              <span>{new Date(note.created_at).toLocaleDateString()}</span>
            </div>
          </motion.div>
        ))}
        {filteredNotes.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
            <StickyNote className="w-16 h-16 mx-auto text-slate-800" />
            <p className="text-slate-500 font-medium italic">
              {searchQuery ? 'No notes match your search.' : 'Your mind is clear. Start capturing ideas.'}
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {(isAdding || isEditing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 z-[100] flex items-center justify-center p-6 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-slate-900 rounded-[3rem] p-10 space-y-8 border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight">{isEditing ? 'Edit Note' : 'New Note'}</h2>
                <button onClick={() => { setIsAdding(false); setIsEditing(false); setEditingNote(null); }} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Title (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Project Ideas"
                    value={isEditing ? editingNote.title : newNote.title}
                    onChange={(e) => isEditing ? setEditingNote({...editingNote, title: e.target.value}) : setNewNote({...newNote, title: e.target.value})}
                    className="w-full bg-slate-800 border border-white/5 rounded-2xl p-5 font-bold focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Content</label>
                  <textarea 
                    rows={6}
                    placeholder="Start typing..."
                    value={isEditing ? editingNote.content : newNote.content}
                    onChange={(e) => isEditing ? setEditingNote({...editingNote, content: e.target.value}) : setNewNote({...newNote, content: e.target.value})}
                    className="w-full bg-slate-800 border border-white/5 rounded-2xl p-5 font-medium focus:outline-none focus:border-indigo-500 transition-all resize-none"
                  />
                </div>
              </div>

              <button 
                onClick={isEditing ? handleUpdateNote : handleAddNote}
                disabled={loading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 py-6 rounded-3xl font-black text-lg shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3"
              >
                {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Note'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
