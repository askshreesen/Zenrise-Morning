import React, { useState } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, CheckCircle, Heart, 
  Smile, ShieldAlert, Award, Coffee, BookOpen, Clock
} from 'lucide-react';
import { Habit, JournalEntry, MoodLog, HealthLog, MoodType } from '../types';

interface CalendarSectionProps {
  habits: Habit[];
  entries: JournalEntry[];
  moods: MoodLog[];
  health: Record<string, HealthLog>;
  toggleHabitLog: (id: string, date: string) => void;
  updateMood: (date: string, mood: MoodType, note: string) => void;
  updateHealth: (date: string, data: Partial<HealthLog>) => void;
}

export const CalendarSection: React.FC<CalendarSectionProps> = ({
  habits,
  entries,
  moods,
  health,
  toggleHabitLog,
  updateMood,
  updateHealth
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDaysInMonth = () => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // day of week of 1st day (0-6)
    const totalDays = new Date(year, month + 1, 0).getDate(); // days in month

    const days = [];
    // Padding days from previous month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInMonth();
  const monthLabel = currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // Get data for selected details modal
  const getSelectedDayDetails = () => {
    if (!selectedDateStr) return null;
    
    const mood = moods.find(m => m.date === selectedDateStr);
    const journal = entries.find(e => e.date === selectedDateStr);
    const healthData = health[selectedDateStr] || {
      date: selectedDateStr,
      water: 0,
      sleep: 0,
      exercise: 0,
      meditation: 0,
      steps: 0,
      screenTime: 0
    };

    const completedHabits = habits.filter(h => h.logs.includes(selectedDateStr));
    const missingHabits = habits.filter(h => !h.logs.includes(selectedDateStr));

    return { mood, journal, healthData, completedHabits, missingHabits };
  };

  const dayDetails = getSelectedDayDetails();

  return (
    <div className="max-w-5xl mx-auto px-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Grid (Left, occupies 2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Interactive Calendar</h3>
              <p className="text-xs text-slate-400">Click any day to launch a daily check-in report</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-black text-slate-700 dark:text-slate-200 min-w-[100px] text-center">{monthLabel}</span>
              <button onClick={handleNextMonth} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <span key={day}>{day}</span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2 select-none">
              {days.map((dateObj, idx) => {
                if (!dateObj) {
                  return <div key={`empty-${idx}`} className="h-16 bg-slate-50/20 dark:bg-slate-950/10 rounded-2xl" />;
                }

                const dateStr = dateObj.toISOString().split('T')[0];
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const isSelected = dateStr === selectedDateStr;

                // Log indicators
                const dayMood = moods.find(m => m.date === dateStr);
                const hasJournal = entries.some(e => e.date === dateStr);
                const completedHabitsCount = habits.filter(h => h.logs.includes(dateStr)).length;

                const moodEmoji = dayMood ? {
                  excellent: '😁',
                  happy: '😊',
                  neutral: '😐',
                  sad: '😔',
                  exhausted: '😫'
                }[dayMood.mood] : null;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`h-16 rounded-2xl border p-1.5 flex flex-col justify-between items-center transition relative ${
                      isToday
                        ? 'bg-emerald-500/10 border-emerald-400 text-emerald-800 dark:text-emerald-300'
                        : isSelected
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-emerald-500 dark:border-emerald-500 text-white'
                          : 'bg-slate-50/60 dark:bg-slate-800/40 border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold">{dateObj.getDate()}</span>

                    {/* Small icons/dot metrics */}
                    <div className="flex gap-1 items-center">
                      {moodEmoji && (
                        <span className="text-xs" title={`Mood: ${dayMood?.mood}`}>{moodEmoji}</span>
                      )}
                      
                      {completedHabitsCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title={`${completedHabitsCount} habits complete`} />
                      )}

                      {hasJournal && (
                        <span className="w-2 h-2 rounded-full bg-rose-400" title="Journal written" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day Check-in Details Modal Panel (Right, occupies 1 column) */}
        <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col justify-between min-h-[350px]">
          {dayDetails ? (
            <div className="space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Check-in Report</span>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                  {new Date(selectedDateStr!).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
              </div>

              {/* Mood overview */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5 text-emerald-500" /> Daily Mood Log
                </h4>
                {dayDetails.mood ? (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {{
                          excellent: '😁',
                          happy: '😊',
                          neutral: '😐',
                          sad: '😔',
                          exhausted: '😫'
                        }[dayDetails.mood.mood]}
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 capitalize">{dayDetails.mood.mood} energy</h5>
                        {dayDetails.mood.note && <p className="text-[11px] text-slate-400 mt-0.5">{dayDetails.mood.note}</p>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-1.5 pt-1">
                    {(['excellent', 'happy', 'neutral', 'sad', 'exhausted'] as MoodType[]).map(m => (
                      <button
                        key={m}
                        onClick={() => updateMood(selectedDateStr!, m, '')}
                        className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:scale-110 rounded-xl transition-transform text-base"
                        title={m}
                      >
                        {{ excellent: '😁', happy: '😊', neutral: '😐', sad: '😔', exhausted: '😫' }[m]}
                      </button>
                    ))}
                    <span className="text-[10px] text-slate-400 italic self-center ml-1">Log mood</span>
                  </div>
                )}
              </div>

              {/* Habits Checklist status */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-500" /> Routine Habits
                </h4>

                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {dayDetails.completedHabits.map(h => (
                    <div key={h.id} className="flex justify-between items-center p-2 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-950/30 rounded-xl">
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {h.icon} {h.name}
                      </span>
                      <button
                        onClick={() => toggleHabitLog(h.id, selectedDateStr!)}
                        className="p-1 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {dayDetails.missingHabits.map(h => (
                    <div key={h.id} className="flex justify-between items-center p-2 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <span className="text-[11px] font-medium text-slate-400">
                        {h.icon} {h.name}
                      </span>
                      <button
                        onClick={() => toggleHabitLog(h.id, selectedDateStr!)}
                        className="p-1 text-slate-300 hover:text-emerald-500 rounded-lg transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {habits.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic">No habits tracking active.</p>
                  )}
                </div>
              </div>

              {/* Journal / gratitude check */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> Reflection Logs
                </h4>
                {dayDetails.journal ? (
                  <div className="p-3 bg-rose-50/20 dark:bg-rose-950/10 rounded-2xl border border-rose-100/40 dark:border-rose-950/20">
                    <h5 className="text-[11px] font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-rose-500 text-rose-500" /> {dayDetails.journal.title}
                    </h5>
                    {dayDetails.journal.gratitudeAnswers.some(a => a.trim()) && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-300 mt-1 leading-relaxed italic line-clamp-2">
                        "Grateful for: {dayDetails.journal.gratitudeAnswers.filter(a => a.trim()).join(', ')}"
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No reflection written for this date.</p>
                )}
              </div>

              {/* Health Tracker check */}
              <div className="space-y-2 border-t border-slate-50 dark:border-slate-850 pt-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Coffee className="w-3.5 h-3.5 text-emerald-500" /> Vital Hydration & Sleep
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-center">
                    <span className="text-[9px] font-extrabold text-slate-400 block uppercase">Sleep</span>
                    <div className="flex justify-center items-center gap-1 mt-0.5">
                      <input
                        type="number"
                        value={dayDetails.healthData.sleep}
                        min="0"
                        max="24"
                        onChange={(e) => updateHealth(selectedDateStr!, { sleep: parseFloat(e.target.value) || 0 })}
                        className="w-10 bg-transparent text-xs font-bold text-center text-slate-800 dark:text-slate-100"
                      />
                      <span className="text-[9px] text-slate-400 font-bold">hrs</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-center">
                    <span className="text-[9px] font-extrabold text-slate-400 block uppercase">Water</span>
                    <div className="flex justify-center items-center gap-1 mt-0.5">
                      <input
                        type="number"
                        value={dayDetails.healthData.water}
                        min="0"
                        step="100"
                        onChange={(e) => updateHealth(selectedDateStr!, { water: parseInt(e.target.value) || 0 })}
                        className="w-12 bg-transparent text-xs font-bold text-center text-slate-800 dark:text-slate-100"
                      />
                      <span className="text-[9px] text-slate-400 font-bold">ml</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 flex flex-col justify-center items-center my-auto space-y-3">
              <Calendar className="w-12 h-12 text-slate-200 dark:text-slate-800" />
              <div>
                <h4 className="text-sm font-extrabold text-slate-500">No Report Selected</h4>
                <p className="text-xs text-slate-400 max-w-[200px] mx-auto mt-1">Select any date from the grid to view check-ins and logs.</p>
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 dark:border-slate-850 pt-4 text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-500" /> auto-updated local database
          </div>
        </div>
      </div>
    </div>
  );
};
