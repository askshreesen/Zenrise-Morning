import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, CheckSquare, BookOpen, Calendar, 
  Activity, Settings, Sparkles, Heart, BellOff, Volume2, VolumeX
} from 'lucide-react';

import { DashboardState, Habit, Goal, JournalEntry, MoodLog, HealthLog, MoodType } from './types';
import { QUOTES, DEFAULT_AFFIRMATIONS } from './data/quotes';

import { Dashboard } from './components/Dashboard';
import { JournalSection } from './components/JournalSection';
import { HabitSection } from './components/HabitSection';
import { WellnessSection } from './components/WellnessSection';
import { CalendarSection } from './components/CalendarSection';
import { SettingsSection } from './components/SettingsSection';
import { ParticlesBackground } from './components/ParticlesBackground';
import { audioSynth } from './utils/audioSynth';

const LOCAL_STORAGE_KEY = 'morning_dashboard_pro_state_v1';

const INITIAL_STATE: DashboardState = {
  habits: [
    { id: 'hab-1', name: 'Wake Early', icon: '🌅', createdAt: new Date().toISOString(), logs: [] },
    { id: 'hab-2', name: 'Meditation', icon: '🧘', createdAt: new Date().toISOString(), logs: [] },
    { id: 'hab-3', name: 'Hydration Intake', icon: '🥛', createdAt: new Date().toISOString(), logs: [] }
  ],
  goals: [],
  entries: [],
  moods: [],
  health: {},
  theme: 'sunrise',
  particleEffect: 'clouds',
  fontSize: 'sm',
  reducedMotion: false,
  favoriteQuotes: [],
  favoriteAffirmations: [],
  customAffirmations: [],
  weatherCity: 'New York'
};

export default function App() {
  const [state, setState] = useState<DashboardState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeQuoteIdx, setActiveQuoteIdx] = useState<number>(0);
  const [isMuted, setIsMuted] = useState(false);

  // Load state from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure standard object merges
        setState(prev => ({
          ...prev,
          ...parsed,
          habits: parsed.habits || prev.habits,
          goals: parsed.goals || prev.goals,
          entries: parsed.entries || prev.entries,
          moods: parsed.moods || prev.moods,
          health: parsed.health || prev.health,
          favoriteQuotes: parsed.favoriteQuotes || [],
          favoriteAffirmations: parsed.favoriteAffirmations || [],
          customAffirmations: parsed.customAffirmations || []
        }));
      } catch (e) {
        console.error('Error loading Morning Dashboard state', e);
      }
    }
    // Randomize initial quote index
    setActiveQuoteIdx(Math.floor(Math.random() * QUOTES.length));
  }, []);

  // Save state to LocalStorage on modifications
  const saveState = (updatedState: DashboardState) => {
    setState(updatedState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedState));
  };

  // Helper selectors / state mutators
  const activeQuote = useMemo(() => {
    return QUOTES[activeQuoteIdx] || QUOTES[0];
  }, [activeQuoteIdx]);

  const triggerRandomQuote = () => {
    setActiveQuoteIdx(Math.floor(Math.random() * QUOTES.length));
  };

  // Goal functions
  const addGoal = (text: string) => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      text,
      completed: false,
      date: new Date().toISOString().split('T')[0]
    };
    saveState({
      ...state,
      goals: [...state.goals, newGoal]
    });
  };

  const toggleGoal = (id: string) => {
    saveState({
      ...state,
      goals: state.goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g)
    });
  };

  const deleteGoal = (id: string) => {
    saveState({
      ...state,
      goals: state.goals.filter(g => g.id !== id)
    });
  };

  // Habit functions
  const addHabit = (name: string, icon: string) => {
    const newHabit: Habit = {
      id: `hab-${Date.now()}`,
      name,
      icon,
      createdAt: new Date().toISOString(),
      logs: []
    };
    saveState({
      ...state,
      habits: [...state.habits, newHabit]
    });
  };

  const deleteHabit = (id: string) => {
    saveState({
      ...state,
      habits: state.habits.filter(h => h.id !== id)
    });
  };

  const toggleHabitLog = (id: string, dateStr: string) => {
    saveState({
      ...state,
      habits: state.habits.map(h => {
        if (h.id === id) {
          const hasLogged = h.logs.includes(dateStr);
          return {
            ...h,
            logs: hasLogged ? h.logs.filter(d => d !== dateStr) : [...h.logs, dateStr]
          };
        }
        return h;
      })
    });
  };

  // Journal reflections
  const addEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: `entry-${Date.now()}`
    };
    saveState({
      ...state,
      entries: [...state.entries.filter(e => e.date !== entry.date), newEntry]
    });
  };

  const updateEntry = (id: string, entryUpdates: Partial<JournalEntry>) => {
    saveState({
      ...state,
      entries: state.entries.map(e => e.id === id ? { ...e, ...entryUpdates } : e)
    });
  };

  const deleteEntry = (id: string) => {
    saveState({
      ...state,
      entries: state.entries.filter(e => e.id !== id)
    });
  };

  // Mood logs
  const updateMood = (date: string, mood: MoodType, note = '') => {
    const existing = state.moods.find(m => m.date === date);
    let updatedMoods;
    if (existing) {
      updatedMoods = state.moods.map(m => m.date === date ? { ...m, mood, note } : m);
    } else {
      updatedMoods = [...state.moods, { id: `mood-${Date.now()}`, date, mood, note }];
    }
    saveState({
      ...state,
      moods: updatedMoods
    });
  };

  // Health log checks
  const updateHealth = (date: string, healthDataUpdates: Partial<HealthLog>) => {
    const existing = state.health[date] || {
      date,
      water: 0,
      sleep: 0,
      exercise: 0,
      meditation: 0,
      steps: 0,
      screenTime: 0
    };

    saveState({
      ...state,
      health: {
        ...state.health,
        [date]: { ...existing, ...healthDataUpdates }
      }
    });
  };

  // Weather configuration
  const updateWeatherCity = (city: string) => {
    saveState({
      ...state,
      weatherCity: city
    });
  };

  // Favorite quotes toggle
  const toggleFavoriteQuote = (id: number) => {
    const isFav = state.favoriteQuotes.includes(id);
    saveState({
      ...state,
      favoriteQuotes: isFav ? state.favoriteQuotes.filter(qId => qId !== id) : [...state.favoriteQuotes, id]
    });
  };

  // Theme & Particle effect triggers
  const setTheme = (theme: string) => saveState({ ...state, theme });
  const setParticleEffect = (particleEffect: string) => saveState({ ...state, particleEffect });
  const setFontSize = (fontSize: 'sm' | 'md' | 'lg') => saveState({ ...state, fontSize });
  const setReducedMotion = (reducedMotion: boolean) => saveState({ ...state, reducedMotion });

  // Backup Import & Export handlers
  const exportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "morning_dashboard_pro_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importBackup = (jsonData: any) => {
    saveState({
      ...state,
      ...jsonData
    });
  };

  const resetAllData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setState(INITIAL_STATE);
  };

  // Calculated continuous daily habits completion streak
  const streakCount = useMemo(() => {
    // Collect all unique completion dates across all habits
    const allLoggedDates = new Set<string>();
    state.habits.forEach(h => {
      h.logs.forEach(log => allLoggedDates.add(log));
    });

    const sortedDates = Array.from(allLoggedDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    if (sortedDates.length === 0) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // If neither today nor yesterday has any entries, streak is inactive
    if (!allLoggedDates.has(todayStr) && !allLoggedDates.has(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    const checkDate = new Date();
    // Start scanning backwards from today or yesterday
    if (!allLoggedDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const checkStr = checkDate.toISOString().split('T')[0];
      if (allLoggedDates.has(checkStr)) {
        streak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [state.habits]);

  // Master Theme Gradients mapping
  const getThemeClass = (themeId: string) => {
    switch (themeId) {
      case 'sunrise':
        return 'bg-gradient-to-br from-[#fef3c7] via-[#fff1f2] to-[#ffedd5] dark:from-slate-950 dark:via-orange-950/20 dark:to-slate-950 text-slate-800 dark:text-slate-100';
      case 'forest':
        return 'bg-gradient-to-br from-[#ecfdf5] via-[#f5f5f4] to-[#f0fdf4] dark:from-slate-950 dark:via-emerald-950/25 dark:to-slate-950 text-slate-800 dark:text-slate-100';
      case 'ocean':
        return 'bg-gradient-to-br from-[#f0f9ff] via-[#f5f3ff] to-[#f0fdfa] dark:from-slate-950 dark:via-sky-950/30 dark:to-slate-950 text-slate-800 dark:text-slate-100';
      case 'galaxy':
        return 'bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#311042] text-slate-100 dark:text-slate-100';
      case 'zen':
        return 'bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100';
      case 'aurora':
        return 'bg-gradient-to-br from-[#f0fdfa] via-[#f0fdf4] to-[#f8fafc] dark:from-slate-950 dark:via-teal-950/35 dark:to-slate-950 text-slate-800 dark:text-slate-100';
      case 'rainbow':
      default:
        return 'bg-gradient-to-br from-[#f5f3ff] via-[#fff1f2] to-[#ecfdf5] dark:from-slate-950 dark:via-indigo-950/25 dark:to-slate-950 text-slate-800 dark:text-slate-100';
    }
  };

  // Keyboard shortcut routing
  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        if (e.key.toLowerCase() === 'd') {
          e.preventDefault();
          setActiveTab('dashboard');
        } else if (e.key.toLowerCase() === 'h') {
          e.preventDefault();
          setActiveTab('habits');
        } else if (e.key.toLowerCase() === 'm') {
          e.preventDefault();
          // Toggle synthesizer mute state
          setIsMuted(prev => {
            const nextMuted = !prev;
            if (nextMuted) {
              audioSynth.stopAll();
            }
            return nextMuted;
          });
        }
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, []);

  // Set font size configurations on body
  const getFontSizeClass = (sz: 'sm' | 'md' | 'lg') => {
    if (sz === 'md') return 'text-[13px]';
    if (sz === 'lg') return 'text-sm';
    return 'text-xs';
  };

  return (
    <div className={`min-h-screen relative flex ${getThemeClass(state.theme)} ${getFontSizeClass(state.fontSize)} overflow-x-hidden select-none`}>
      {/* Dynamic 60fps Canvas Particle overlays */}
      <ParticlesBackground 
        theme={state.theme} 
        effect={state.particleEffect} 
        reducedMotion={state.reducedMotion} 
      />

      {/* Floating Side Rail Navigation (Human, minimal layout, zero bloat) */}
      <aside className="w-20 md:w-64 bg-white/70 dark:bg-slate-950/65 backdrop-blur-xl border-r border-black/5 dark:border-white/5 flex flex-col justify-between items-center py-6 px-3 z-10 relative shadow-2xl shrink-0">
        <div className="w-full flex flex-col items-center gap-8">
          {/* Main Logo Branding (Literal, humble, beautiful branding) */}
          <div className="flex items-center gap-3 md:px-3 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-7 h-7 stroke-[2.5]" />
            <h2 className="hidden md:block text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-50">
              Morning Pro
            </h2>
          </div>

          {/* Nav list */}
          <nav className="w-full space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
              { id: 'habits', label: 'Habits & Routine', icon: <CheckSquare className="w-5 h-5" /> },
              { id: 'journal', label: 'Reflection Journal', icon: <BookOpen className="w-5 h-5" /> },
              { id: 'calendar', label: 'Calendar Grid', icon: <Calendar className="w-5 h-5" /> },
              { id: 'wellness', label: 'Wellness Studio', icon: <Activity className="w-5 h-5" /> },
              { id: 'settings', label: 'Custom Settings', icon: <Settings className="w-5 h-5" /> }
            ].map(nav => {
              const isSelected = activeTab === nav.id;
              return (
                <button
                  key={nav.id}
                  onClick={() => setActiveTab(nav.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-extrabold transition-all group ${
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <div className="shrink-0">{nav.icon}</div>
                  <span className="hidden md:block text-[11px] uppercase tracking-wider">{nav.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Global Volume Mute Trigger & info */}
        <div className="w-full flex flex-col items-center gap-4">
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (!isMuted) audioSynth.stopAll();
            }}
            className="p-3 bg-slate-100 dark:bg-slate-900/80 rounded-2xl hover:scale-105 transition hover:bg-slate-200 dark:hover:bg-slate-850"
            title={isMuted ? "Unmute synth engine" : "Mute all ambient audio"}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-emerald-500" />}
          </button>
          
          <div className="hidden md:flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
            <Heart className="w-3.5 h-3.5 text-rose-500" /> local private secure
          </div>
        </div>
      </aside>

      {/* Main Screen Scroll Container */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto z-10 relative">
        <header className="px-8 py-5 flex justify-end items-center gap-4 shrink-0 border-b border-black/5 dark:border-white/5 bg-white/10 dark:bg-black/5 backdrop-blur-md">
          {/* Visual health streak indicators */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-1 font-extrabold text-[11px] text-slate-600 dark:text-slate-300">
              <span className="text-sm">🔥</span> {streakCount} Days
            </div>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex items-center gap-1 font-extrabold text-[11px] text-slate-600 dark:text-slate-300 capitalize">
              <span className="text-sm">🎨</span> {state.theme}
            </div>
          </div>
        </header>

        {/* Dynamic section injection */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === 'dashboard' && (
            <Dashboard 
              habits={state.habits}
              goals={state.goals}
              addGoal={addGoal}
              toggleGoal={toggleGoal}
              deleteGoal={deleteGoal}
              weatherCity={state.weatherCity}
              updateWeatherCity={updateWeatherCity}
              favoriteQuotes={state.favoriteQuotes}
              toggleFavoriteQuote={toggleFavoriteQuote}
              activeQuote={activeQuote}
              triggerRandomQuote={triggerRandomQuote}
              onNavigate={setActiveTab}
              streakCount={streakCount}
            />
          )}

          {activeTab === 'habits' && (
            <HabitSection 
              habits={state.habits}
              entries={state.entries}
              moods={state.moods}
              addHabit={addHabit}
              deleteHabit={deleteHabit}
              toggleHabitLog={toggleHabitLog}
              streakCount={streakCount}
            />
          )}

          {activeTab === 'journal' && (
            <JournalSection 
              entries={state.entries}
              addEntry={addEntry}
              updateEntry={updateEntry}
              deleteEntry={deleteEntry}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarSection 
              habits={state.habits}
              entries={state.entries}
              moods={state.moods}
              health={state.health}
              toggleHabitLog={toggleHabitLog}
              updateMood={updateMood}
              updateHealth={updateHealth}
            />
          )}

          {activeTab === 'wellness' && (
            <WellnessSection />
          )}

          {activeTab === 'settings' && (
            <SettingsSection 
              state={state}
              setTheme={setTheme}
              setParticleEffect={setParticleEffect}
              setFontSize={setFontSize}
              setReducedMotion={setReducedMotion}
              updateWeatherCity={updateWeatherCity}
              exportBackup={exportBackup}
              importBackup={importBackup}
              resetAllData={resetAllData}
            />
          )}
        </div>
      </main>
    </div>
  );
}
