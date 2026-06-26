import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Clock, Sun, CloudSun, Cloud, CloudRain, Sparkles, 
  CheckCircle, Plus, Trash2, ShieldCheck, Heart, MapPin, Check
} from 'lucide-react';
import { Goal, Habit, Quote } from '../types';

interface DashboardProps {
  habits: Habit[];
  goals: Goal[];
  addGoal: (text: string) => void;
  toggleGoal: (id: string) => void;
  deleteGoal: (id: string) => void;
  weatherCity: string;
  updateWeatherCity: (city: string) => void;
  favoriteQuotes: number[];
  toggleFavoriteQuote: (id: number) => void;
  activeQuote: Quote;
  triggerRandomQuote: () => void;
  onNavigate: (tab: string) => void;
  streakCount: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  habits,
  goals,
  addGoal,
  toggleGoal,
  deleteGoal,
  weatherCity,
  updateWeatherCity,
  favoriteQuotes,
  toggleFavoriteQuote,
  activeQuote,
  triggerRandomQuote,
  onNavigate,
  streakCount,
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [newGoal, setNewGoal] = useState('');
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [tempCity, setTempCity] = useState(weatherCity);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('F');

  // Simulated Weather conditions based on string hash
  const getWeatherInfo = (city: string) => {
    let hash = 0;
    for (let i = 0; i < city.length; i++) {
      hash = city.charCodeAt(i) + ((hash << 5) - hash);
    }
    const tempBase = Math.abs(hash % 30) + 50; // 50 to 80 F
    const weatherIndex = Math.abs(hash % 4);
    const conditions = ['Sunny', 'Partly Cloudy', 'Overcast', 'Light Rain'];
    const icons = [<Sun className="w-8 h-8 text-amber-400 animate-pulse" />, 
                   <CloudSun className="w-8 h-8 text-sky-300" />, 
                   <Cloud className="w-8 h-8 text-slate-400" />, 
                   <CloudRain className="w-8 h-8 text-blue-400" />];
    
    const condition = conditions[weatherIndex];
    const icon = icons[weatherIndex];
    const tempF = Math.round(tempBase);
    const tempC = Math.round(((tempBase - 32) * 5) / 9);

    return { condition, icon, tempF, tempC };
  };

  const weather = getWeatherInfo(weatherCity);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getGreeting = (date: Date) => {
    const hr = date.getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayGoals = goals.filter(g => g.date === todayStr);
  const completedGoalsCount = todayGoals.filter(g => g.completed).length;

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    addGoal(newGoal.trim());
    setNewGoal('');
  };

  const handleCitySave = () => {
    if (tempCity.trim()) {
      updateWeatherCity(tempCity.trim());
      setIsEditingCity(false);
    }
  };

  // Calculate habit progress for today
  const todayHabitsCount = habits.length;
  const completedTodayHabits = habits.filter(h => h.logs.includes(todayStr)).length;
  const habitPercentage = todayHabitsCount > 0 ? Math.round((completedTodayHabits / todayHabitsCount) * 100) : 0;

  // Total morning readiness score based on habits + goals completed
  const totalItems = todayGoals.length + habits.length;
  const completedItems = completedGoalsCount + completedTodayHabits;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-2">
      {/* Clock and Greeting Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-xl relative overflow-hidden">
        {/* Dynamic Sunrise SVG animation in the background */}
        <div className="absolute right-0 bottom-0 w-64 h-32 pointer-events-none opacity-20">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            {/* Sunrise Arc */}
            <circle cx="100" cy="110" r="80" fill="url(#sunGlow)" />
            {/* Rays */}
            <line x1="100" y1="30" x2="100" y2="10" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="50" y1="50" x2="35" y2="35" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="150" y1="50" x2="165" y2="35" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 3" />
            <defs>
              <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
                <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <div className="md:col-span-2 space-y-2 z-10">
          <span className="text-xs font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Start Your Day Mindfully
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            {getGreeting(time)}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">Aspirant</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {formatDate(time)}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full flex items-center gap-1 border border-emerald-100 dark:border-emerald-900/30">
              🔥 {streakCount} Day Streak
            </span>
            <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-semibold rounded-full flex items-center gap-1 border border-teal-100 dark:border-teal-900/30">
              💪 {progressPercentage}% Readiness
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end z-10">
          <div className="text-4xl md:text-5xl font-mono font-extrabold tracking-widest text-slate-800 dark:text-slate-50 bg-slate-900/5 dark:bg-white/5 py-3 px-5 rounded-2xl border border-black/5 dark:border-white/5 shadow-inner">
            {formatTime(time)}
          </div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1 font-semibold">Local Time</p>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Readiness Ring & Weather */}
        <div className="space-y-6">
          {/* Readiness Circle */}
          <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4 self-start">Daily Completion Ring</h3>
            
            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Outer circle track */}
              <svg className="w-full h-full -rotate-90">
                <circle 
                  cx="80" 
                  cy="80" 
                  r="65" 
                  className="stroke-slate-100 dark:stroke-slate-800" 
                  strokeWidth="10" 
                  fill="transparent" 
                />
                <motion.circle 
                  cx="80" 
                  cy="80" 
                  r="65" 
                  className="stroke-emerald-500 dark:stroke-emerald-400" 
                  strokeWidth="10" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 65}
                  initial={{ strokeDashoffset: 2 * Math.PI * 65 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 65 * (1 - progressPercentage / 100) }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{progressPercentage}%</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Ready</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-5 leading-relaxed">
              {completedItems} of {totalItems} routines completed today. Finish habits and goals to fill your daily ring!
            </p>
            <button 
              onClick={() => onNavigate('habits')}
              className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              Check Habits <Check className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Weather Simulator */}
          <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 relative">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Morning Ambient</h3>
              <button 
                onClick={() => setTempUnit(prev => prev === 'C' ? 'F' : 'C')}
                className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                °{tempUnit}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/20 dark:to-orange-950/30 rounded-2xl">
                {weather.icon}
              </div>
              <div className="space-y-0.5">
                {isEditingCity ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <input 
                      type="text" 
                      value={tempCity}
                      onChange={(e) => setTempCity(e.target.value)}
                      className="w-24 px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                    <button 
                      onClick={handleCitySave}
                      className="p-1 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 cursor-pointer hover:text-emerald-500 dark:hover:text-emerald-400 group" onClick={() => setIsEditingCity(true)}>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500" /> {weatherCity}
                    </span>
                  </div>
                )}
                <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100">
                  {tempUnit === 'F' ? `${weather.tempF}°F` : `${weather.tempC}°C`}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{weather.condition}</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-4 leading-relaxed italic border-t border-slate-100 dark:border-slate-800 pt-2.5">
              "Rise and shine. The morning breeze carries a fresh opportunity to design a purposeful day."
            </p>
          </div>
        </div>

        {/* Center/Right: Top 3 Goals & Daily Motivation */}
        <div className="md:col-span-2 space-y-6">
          {/* Motivation Quote Box */}
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 dark:from-teal-900/80 dark:to-emerald-950/80 p-6 rounded-3xl shadow-lg border border-teal-400/20 text-white relative overflow-hidden flex flex-col justify-between min-h-[170px]">
            <div className="absolute right-3 top-3 opacity-10">
              <Sparkles className="w-24 h-24" />
            </div>
            
            <div className="space-y-3 z-10">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {activeQuote.category}
                </span>
                <button 
                  onClick={() => toggleFavoriteQuote(activeQuote.id)}
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                >
                  <Heart className={`w-4 h-4 ${favoriteQuotes.includes(activeQuote.id) ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                </button>
              </div>
              <p className="text-base font-medium leading-relaxed italic">
                "{activeQuote.text}"
              </p>
            </div>

            <div className="flex justify-between items-center mt-4 border-t border-white/15 pt-3 z-10">
              <span className="text-xs opacity-80">— {activeQuote.author}</span>
              <button 
                onClick={triggerRandomQuote}
                className="text-[11px] font-bold bg-white text-emerald-800 px-3 py-1.5 rounded-xl hover:bg-emerald-50 transition shadow-sm"
              >
                Next Quote 💫
              </button>
            </div>
          </div>

          {/* Goals/Priorities Card */}
          <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">Top 3 Priorities</h3>
                <p className="text-xs text-slate-400">Identify the most impactful tasks for today</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                {completedGoalsCount}/3 Done
              </span>
            </div>

            <form onSubmit={handleGoalSubmit} className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder={todayGoals.length >= 3 ? "Top 3 targets set! Focus on execution." : "Add a high priority task..."}
                disabled={todayGoals.length >= 3}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={todayGoals.length >= 3}
                className="px-4 bg-slate-800 hover:bg-slate-900 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>

            <div className="space-y-2.5">
              {todayGoals.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                  <CheckCircle className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No priorities defined yet. Fill your morning targets!</p>
                </div>
              ) : (
                todayGoals.map(g => (
                  <div 
                    key={g.id}
                    className={`flex justify-between items-center p-3 rounded-2xl border transition ${
                      g.completed 
                        ? 'bg-slate-50/60 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/40 opacity-70' 
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/60 shadow-sm hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => toggleGoal(g.id)}
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${
                          g.completed 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400'
                        }`}
                      >
                        {g.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <span className={`text-xs font-semibold ${g.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                        {g.text}
                      </span>
                    </div>
                    <button 
                      onClick={() => deleteGoal(g.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex gap-4 text-[10px] text-slate-400 font-semibold border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> offline private secure</span>
              <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500" /> practice gratitude</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
