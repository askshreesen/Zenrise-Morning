import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Heart, Search, Calendar, Save, Trash2, 
  ChevronRight, Smile, Download, Tag, Plus, Check, Edit2
} from 'lucide-react';
import { JournalEntry, MoodType } from '../types';

interface JournalSectionProps {
  entries: JournalEntry[];
  addEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  updateEntry: (id: string, entry: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;
}

const GRATITUDE_PROMPTS = [
  "What made you smile today?",
  "Who helped you today, or who are you grateful for?",
  "What simple pleasure or moment did you appreciate today?",
  "What valuable lesson did you learn from a challenge today?"
];

export const JournalSection: React.FC<JournalSectionProps> = ({
  entries,
  addEntry,
  updateEntry,
  deleteEntry
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'history'>('write');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [gratitudeAnswers, setGratitudeAnswers] = useState<string[]>(['', '', '', '']);
  const [selectedMood, setSelectedMood] = useState<MoodType | ''>('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'Saved' | 'Saving...' | ''>('');

  // Handle auto-saving on text change
  useEffect(() => {
    if (activeTab !== 'write') return;
    
    // Check if there is actual content to save
    const hasContent = title.trim() || content.trim() || gratitudeAnswers.some(a => a.trim()) || selectedMood;
    if (!hasContent) return;

    setAutoSaveStatus('Saving...');
    const timer = setTimeout(() => {
      handleSave();
      setAutoSaveStatus('Saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timer);
  }, [title, content, gratitudeAnswers, selectedMood, tags, date]);

  // Load entry if date changes or if history entry selected
  useEffect(() => {
    const existing = entries.find(e => e.date === date);
    if (existing) {
      setSelectedEntryId(existing.id);
      setTitle(existing.title);
      setContent(existing.content);
      setSelectedMood(existing.mood || '');
      setTags(existing.tags || []);
      
      // Pad gratitude answers to matching prompt size
      const answers = [...existing.gratitudeAnswers];
      while (answers.length < GRATITUDE_PROMPTS.length) {
        answers.push('');
      }
      setGratitudeAnswers(answers);
    } else {
      // Clear for new entry
      setSelectedEntryId(null);
      setTitle('');
      setContent('');
      setGratitudeAnswers(['', '', '', '']);
      setSelectedMood('');
      setTags([]);
    }
  }, [date, entries]);

  const handleSave = () => {
    const entryData = {
      date,
      title: title || 'My Daily Reflection',
      content,
      gratitudeAnswers,
      tags,
      mood: selectedMood,
    };

    if (selectedEntryId) {
      updateEntry(selectedEntryId, entryData);
    } else {
      addEntry(entryData);
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleExportJSON = (entry: JournalEntry) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entry, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `morning_journal_${entry.date}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleLoadEntryToEdit = (entry: JournalEntry) => {
    setDate(entry.date);
    setActiveTab('write');
  };

  const filteredEntries = entries.filter(e => {
    const query = searchQuery.toLowerCase();
    return (
      e.title.toLowerCase().includes(query) ||
      e.content.toLowerCase().includes(query) ||
      e.tags.some(t => t.toLowerCase().includes(query)) ||
      e.gratitudeAnswers.some(a => a.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 space-y-6">
      {/* Tabs Menu */}
      <div className="flex border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('write')}
          className={`flex items-center gap-2 pb-3.5 px-5 text-sm font-bold border-b-2 transition ${
            activeTab === 'write'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Reflection Editor
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 pb-3.5 px-5 text-sm font-bold border-b-2 transition ${
            activeTab === 'history'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Search className="w-4 h-4" /> Journal History ({entries.length})
        </button>
      </div>

      {activeTab === 'write' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Writing Area (Editor) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {autoSaveStatus && (
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800">
                    ⚡ {autoSaveStatus}
                  </span>
                )}
              </div>

              {/* Gratitude Prompt Questions */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 border-b border-rose-100 dark:border-rose-950/20 pb-2">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Morning Gratitude Journal</h3>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {GRATITUDE_PROMPTS.map((prompt, idx) => (
                    <div key={idx} className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Smile className="w-3 h-3 text-rose-400" /> {prompt}
                      </label>
                      <input
                        type="text"
                        value={gratitudeAnswers[idx] || ''}
                        onChange={(e) => {
                          const newAns = [...gratitudeAnswers];
                          newAns[idx] = e.target.value;
                          setGratitudeAnswers(newAns);
                        }}
                        placeholder="Type your reflection..."
                        className="w-full px-4 py-2.5 bg-rose-50/20 dark:bg-slate-800/40 border border-rose-100/60 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rose-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Free Writing Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Daily Free Journal</h3>
                </div>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give today's entry a title (e.g., A fresh start, Calm and focused...)"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder="Write your thoughts freely. Markdown is supported natively! (e.g., use **bold** or *italics*)"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-slate-400">Auto-saves local draft offline securely</span>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-md transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Reflection
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (Mood & Metadata/Tags) */}
          <div className="space-y-6">
            {/* Today's Mood Selector */}
            <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-emerald-500" /> How is your energy?
              </h3>

              <div className="grid grid-cols-5 gap-2">
                {(['excellent', 'happy', 'neutral', 'sad', 'exhausted'] as MoodType[]).map((m) => {
                  const data = {
                    excellent: { emoji: '😁', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/50' },
                    happy: { emoji: '😊', color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900/50' },
                    neutral: { emoji: '😐', color: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-850/40 dark:text-slate-300 dark:border-slate-700' },
                    sad: { emoji: '😔', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900/50' },
                    exhausted: { emoji: '😫', color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/50' }
                  }[m];

                  const isSelected = selectedMood === m;

                  return (
                    <button
                      key={m}
                      onClick={() => setSelectedMood(m)}
                      className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${
                        isSelected 
                          ? `${data.color} ring-2 ring-slate-800 dark:ring-white scale-105`
                          : 'bg-slate-50 dark:bg-slate-800 border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <span className="text-xl mb-1">{data.emoji}</span>
                      <span className="text-[9px] font-bold capitalize">{m}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags section */}
            <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-emerald-500" /> Reflection Tags
              </h3>

              <form onSubmit={handleAddTag} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag (e.g. calm, creative)"
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="p-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl hover:bg-slate-900 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              <div className="flex flex-wrap gap-1.5">
                {tags.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No tags added yet.</span>
                ) : (
                  tags.map(t => (
                    <span
                      key={t}
                      className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1"
                    >
                      #{t}
                      <button
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-rose-500 font-extrabold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History tab */
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/80 p-5 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search past journals, gratitude notes, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              />
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Showing {filteredEntries.length} of {entries.length} reflections
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEntries.length === 0 ? (
              <div className="md:col-span-2 text-center py-12 bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-100 dark:border-slate-800">
                <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">No reflections found</h4>
                <p className="text-xs text-slate-400">Try modifying your query or start writing your first entry!</p>
              </div>
            ) : (
              filteredEntries.map(entry => {
                const moodEmoji = {
                  excellent: '😁',
                  happy: '😊',
                  neutral: '😐',
                  sad: '😔',
                  exhausted: '😫',
                  '': '✨'
                }[entry.mood || ''];

                return (
                  <div
                    key={entry.id}
                    className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-md border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-slate-700 transition flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-0.5">
                            {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <span>{moodEmoji}</span> {entry.title}
                          </h4>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleExportJSON(entry)}
                            title="Export reflection JSON"
                            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleLoadEntryToEdit(entry)}
                            title="Edit entry"
                            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-sky-500 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            title="Delete entry"
                            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Gratitude summary */}
                      {entry.gratitudeAnswers.some(a => a.trim()) && (
                        <div className="p-3 bg-rose-50/20 dark:bg-rose-950/10 rounded-2xl border border-rose-100/40 dark:border-rose-950/20 space-y-1.5">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-rose-500 flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-rose-500" /> Gratitude Log
                          </span>
                          <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                            {entry.gratitudeAnswers.map((ans, aIdx) => ans.trim() && (
                              <li key={aIdx} className="leading-relaxed">
                                <span className="font-semibold text-slate-400">{GRATITUDE_PROMPTS[aIdx]}:</span> "{ans}"
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Free journal content snapshot */}
                      {entry.content.trim() && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                            Daily Journal Log
                          </span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 whitespace-pre-wrap">
                            {entry.content}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Tags block */}
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-4 mt-4 border-t border-slate-50 dark:border-slate-800">
                        {entry.tags.map(t => (
                          <span
                            key={t}
                            className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-bold rounded-full"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
