import React, { useState } from 'react';
import { 
  Check, Plus, Trash2, Calendar, LayoutGrid, Award, 
  HelpCircle, ChevronLeft, ChevronRight, Activity, Smile, Heart
} from 'lucide-react';
import { Habit, JournalEntry, MoodLog } from '../types';

interface HabitSectionProps {
  habits: Habit[];
  entries: JournalEntry[];
  moods: MoodLog[];
  addHabit: (name: string, icon: string) => void;
  deleteHabit: (id: string) => void;
  toggleHabitLog: (id: string, date: string) => void;
  streakCount: number;
}

const PRESET_HABITS = [
  { name: "Wake Early", icon: "🌅" },
  { name: "Meditation", icon: "🧘" },
  { name: "Exercise", icon: "🏃" },
  { name: "Reading", icon: "📚" },
  { name: "Coding", icon: "💻" },
  { name: "Yoga", icon: "🤸" },
  { name: "Water Intake", icon: "🥛" }
];

export const HabitSection: React.FC<HabitSectionProps> = ({
  habits,
  entries,
  moods,
  addHabit,
  deleteHabit,
  toggleHabitLog,
  streakCount
}) => {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly' | 'heatmap'>('weekly');
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState('🌅');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Week configuration helper
  const getWeekDays = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek); // Set to Sunday of current week

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    addHabit(newHabitName.trim(), newHabitIcon);
    setNewHabitName('');
  };

  const formatDateISO = (d: Date) => {
    return d.toISOString().split('T')[0];
  };

  // --- GitHub Heatmap Generation ---
  // Renders a grid representing the last 365 days grouped into 53 weeks.
  const renderHeatmap = () => {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364); // 365 days ago
    
    // Adjust startDate to the nearest Sunday to keep columns uniform
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    const datesArray: Date[] = [];
    const totalDaysToShow = 371; // 53 weeks * 7 days = 371 days
    for (let i = 0; i < totalDaysToShow; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      datesArray.push(d);
    }

    // Helper to calculate score of active metrics for a date
    const getIntensityClass = (dateISO: string) => {
      let score = 0;
      // Add points for each completed habit log
      habits.forEach(h => {
        if (h.logs.includes(dateISO)) score += 1;
      });
      // Add points for journal entry or gratitude logged
      const journal = entries.find(e => e.date === dateISO);
      if (journal) {
        score += 2;
        if (journal.gratitudeAnswers.some(a => a.trim())) score += 1;
      }
      // Add point for logged mood
      if (moods.some(m => m.date === dateISO)) score += 1;

      if (score === 0) return 'bg-slate-100 dark:bg-slate-800/60';
      if (score <= 2) return 'bg-emerald-200 dark:bg-emerald-900/40 text-white';
      if (score <= 4) return 'bg-emerald-400 dark:bg-emerald-700/60 text-white';
      if (score <= 6) return 'bg-emerald-600 dark:bg-emerald-500 text-white';
      return 'bg-emerald-800 dark:bg-emerald-400 text-white';
    };

    // Group datesArray into weeks (arrays of 7 days)
    const weeks: Date[][] = [];
    for (let i = 0; i < datesArray.length; i += 7) {
      weeks.push(datesArray.slice(i, i + 7));
    }

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
      <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-x-auto space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Yearly Consistency Graph</h3>
            <p className="text-xs text-slate-400">Track habit completion and reflections over the past 365 days</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
            <span>Less</span>
            <span className="w-2.5 h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded"></span>
            <span className="w-2.5 h-2.5 bg-emerald-200 dark:bg-emerald-900/40 rounded"></span>
            <span className="w-2.5 h-2.5 bg-emerald-400 dark:bg-emerald-700/60 rounded"></span>
            <span className="w-2.5 h-2.5 bg-emerald-600 dark:bg-emerald-500 rounded"></span>
            <span className="w-2.5 h-2.5 bg-emerald-800 dark:bg-emerald-400 rounded"></span>
            <span>More</span>
          </div>
        </div>

        <div className="flex gap-2.5 pt-2 select-none min-w-[700px]">
          {/* Day rows labels */}
          <div className="grid grid-rows-7 gap-1 pr-1.5 text-[10px] text-slate-400 font-bold justify-end h-32 pt-5">
            {dayLabels.map((lbl, idx) => (
              <span key={idx} className={idx % 2 === 0 ? 'invisible' : 'visible'}>{lbl}</span>
            ))}
          </div>

          <div className="flex-1 space-y-1">
            {/* Months indicators row */}
            <div className="flex justify-between text-[9px] text-slate-400 font-bold px-1 pb-1">
              {monthLabels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-flow-col auto-cols-max gap-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="grid grid-rows-7 gap-1">
                  {week.map((dateObj, dIdx) => {
                    const dateISO = formatDateISO(dateObj);
                    const colorClass = getIntensityClass(dateISO);
                    const formattedDisplay = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                    
                    return (
                      <div
                        key={dIdx}
                        className={`w-[11px] h-[11px] rounded-[2.5px] transition-colors cursor-pointer group relative ${colorClass}`}
                      >
                        {/* Tooltip */}
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-850 text-white text-[9px] font-bold rounded-lg shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                          {formattedDisplay}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Monthly habit calendar matrix builder ---
  const renderMonthlyGrid = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const daysArray = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(selectedYear, selectedMonth, i);
      daysArray.push(d);
    }

    const monthName = new Date(selectedYear, selectedMonth, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const handlePrevMonth = () => {
      setSelectedMonth(prev => prev === 0 ? 11 : prev - 1);
      if (selectedMonth === 0) setSelectedYear(prev => prev - 1);
    };

    const handleNextMonth = () => {
      setSelectedMonth(prev => prev === 11 ? 0 : prev + 1);
      if (selectedMonth === 11) setSelectedYear(prev => prev + 1);
    };

    return (
      <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Monthly Habit Logs</h3>
            <p className="text-xs text-slate-400">Log completions by choosing days on the grid</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500">
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{monthName}</span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500">
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-10">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Create habits to access your monthly grid tracker!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {habits.map(habit => (
              <div key={habit.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="text-sm">{habit.icon}</span> {habit.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {habit.logs.filter(l => l.startsWith(`${selectedYear}-${String(selectedMonth+1).padStart(2,'0')}`)).length} completions
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {daysArray.map((dateObj) => {
                    const dateISO = formatDateISO(dateObj);
                    const isCompleted = habit.logs.includes(dateISO);
                    const isFuture = dateObj > new Date();

                    return (
                      <button
                        key={dateISO}
                        onClick={() => toggleHabitLog(habit.id, dateISO)}
                        disabled={isFuture}
                        className={`w-7 h-7 rounded-lg border text-[10px] font-bold transition flex items-center justify-center ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200/50 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 disabled:opacity-40'
                        }`}
                        title={dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      >
                        {dateObj.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 space-y-6">
      {/* Sub Menu */}
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex gap-2">
          {(['weekly', 'monthly', 'heatmap'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
                viewMode === mode
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {mode === 'weekly' && 'Weekly Track'}
              {mode === 'monthly' && 'Monthly Grid'}
              {mode === 'heatmap' && 'Consistency Map'}
            </button>
          ))}
        </div>
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
          🔥 Streak: {streakCount} Days
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Habits Checklist & Creator (Left side, occupies 2 cols if Weekly or Heatmap) */}
        <div className="lg:col-span-2 space-y-6">
          {viewMode === 'weekly' && (
            <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Weekly Habits Matrix</h3>
                  <p className="text-xs text-slate-400">Complete actions daily to keep streaks roaring</p>
                </div>
                <LayoutGrid className="w-5 h-5 text-emerald-500 animate-pulse" />
              </div>

              {habits.length === 0 ? (
                <div className="text-center py-10">
                  <Award className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-500">No custom habits configured</h4>
                  <p className="text-xs text-slate-400 mt-1">Use preset prompts on the right to start!</p>
                </div>
              ) : (
                <div className="space-y-4 overflow-x-auto min-w-[500px] pb-2">
                  {/* Days labels row */}
                  <div className="grid grid-cols-8 gap-3 border-b border-slate-50 dark:border-slate-850 pb-2 font-bold text-[10px] text-slate-400 text-center">
                    <span className="text-left font-extrabold text-slate-500">HABIT</span>
                    {weekDays.map(day => (
                      <span key={day.toISOString()} className={day.toDateString() === new Date().toDateString() ? 'text-emerald-500 font-extrabold' : ''}>
                        {day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                      </span>
                    ))}
                  </div>

                  {/* Habit rows */}
                  {habits.map(habit => (
                    <div key={habit.id} className="grid grid-cols-8 gap-3 items-center text-center">
                      <div className="flex items-center justify-between text-left pr-2">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate" title={habit.name}>
                          <span className="mr-1">{habit.icon}</span> {habit.name}
                        </span>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="p-1 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {weekDays.map(day => {
                        const dateISO = formatDateISO(day);
                        const isCompleted = habit.logs.includes(dateISO);
                        const isFuture = day > new Date();

                        return (
                          <button
                            key={dateISO}
                            onClick={() => toggleHabitLog(habit.id, dateISO)}
                            disabled={isFuture}
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center mx-auto transition ${
                              isCompleted
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200/50 dark:border-slate-700 text-transparent hover:text-slate-300 hover:border-slate-300 disabled:opacity-40'
                            }`}
                          >
                            <Check className="w-4.5 h-4.5 stroke-[3.5]" />
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {viewMode === 'monthly' && renderMonthlyGrid()}
          {viewMode === 'heatmap' && renderHeatmap()}
        </div>

        {/* Preset Habits and Creation Form (Right Column) */}
        <div className="space-y-6">
          {/* Preset templates */}
          <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-500" /> Fast-Add Preset Habits
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {PRESET_HABITS.map(p => {
                const alreadyExists = habits.some(h => h.name.toLowerCase() === p.name.toLowerCase());
                return (
                  <button
                    key={p.name}
                    disabled={alreadyExists}
                    onClick={() => addHabit(p.name, p.icon)}
                    className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-left transition hover:border-emerald-300 disabled:opacity-50"
                  >
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="text-sm">{p.icon}</span> {p.name}
                    </span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold px-2.5 py-1 rounded-xl">
                      {alreadyExists ? 'Added' : '+ Add'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom builder */}
          <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-500" /> Create Custom Habit
            </h3>

            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Habit Emoji</label>
                <div className="flex gap-2">
                  {['🌅', '🧘', '🏃', '📚', '💻', '🤸', '🥛', '🍎', '💤', '✍️'].map(emo => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setNewHabitIcon(emo)}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm transition-transform ${
                        newHabitIcon === emo ? 'bg-slate-800 dark:bg-emerald-500 text-white scale-110' : 'bg-slate-50 border-slate-200/60 text-slate-600 hover:scale-105'
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Habit Name</label>
                <input
                  type="text"
                  placeholder="e.g., Read 10 Pages, Cook Healthy..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold rounded-2xl transition shadow-md"
              >
                Create Habit Routine
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
