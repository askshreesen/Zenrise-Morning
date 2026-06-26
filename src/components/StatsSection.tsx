import React from 'react';
import { 
  BarChart, TrendingUp, Award, Smile, Coffee, 
  CheckCircle, Target, Hourglass, Zap, ShieldCheck
} from 'lucide-react';
import { Habit, JournalEntry, MoodLog, HealthLog } from '../types';

interface StatsSectionProps {
  habits: Habit[];
  entries: JournalEntry[];
  moods: MoodLog[];
  health: Record<string, HealthLog>;
  streakCount: number;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  habits,
  entries,
  moods,
  health,
  streakCount
}) => {
  // Statistics Calculations
  const totalHabits = habits.length;
  
  // Last 7 days helper
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();

  // Habit completion percent for last 7 days
  const getWeeklyHabitStats = () => {
    if (totalHabits === 0) return [];
    
    return last7Days.map(dateStr => {
      let completed = 0;
      habits.forEach(h => {
        if (h.logs.includes(dateStr)) completed += 1;
      });
      const pct = Math.round((completed / totalHabits) * 100);
      const displayDay = new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short' });
      return { dateStr, displayDay, pct, count: completed };
    });
  };

  const weeklyHabitStats = getWeeklyHabitStats();

  // Mood frequency calculation
  const getMoodCounts = () => {
    const counts = { excellent: 0, happy: 0, neutral: 0, sad: 0, exhausted: 0 };
    moods.forEach(m => {
      if (counts[m.mood] !== undefined) {
        counts[m.mood] += 1;
      }
    });
    return counts;
  };

  const moodCounts = getMoodCounts();
  const totalMoodsLogged = Object.values(moodCounts).reduce((a, b) => a + b, 0);

  // Average mood indicator score (1-5)
  const getAverageMoodScore = () => {
    if (moods.length === 0) return '😐 Neutral';
    
    const weights = { excellent: 5, happy: 4, neutral: 3, sad: 2, exhausted: 1 };
    let totalScore = 0;
    moods.forEach(m => {
      totalScore += weights[m.mood];
    });

    const avg = totalScore / moods.length;
    if (avg >= 4.5) return '😁 Excellent';
    if (avg >= 3.5) return '😊 Happy';
    if (avg >= 2.5) return '😐 Neutral';
    if (avg >= 1.5) return '😔 Sad';
    return '😫 Exhausted';
  };

  // Health Averages
  const getHealthAverages = () => {
    const dates = Object.keys(health);
    if (dates.length === 0) return { sleep: 0, water: 0, exercise: 0 };

    let totalSleep = 0;
    let totalWater = 0;
    let totalExercise = 0;

    dates.forEach(d => {
      totalSleep += health[d].sleep || 0;
      totalWater += health[d].water || 0;
      totalExercise += health[d].exercise || 0;
    });

    return {
      sleep: Math.round((totalSleep / dates.length) * 10) / 10,
      water: Math.round(totalWater / dates.length),
      exercise: Math.round(totalExercise / dates.length)
    };
  };

  const healthAverages = getHealthAverages();

  // Custom Responsive SVG Bar Chart for weekly habits
  const renderWeeklyBarChart = () => {
    if (weeklyHabitStats.length === 0) {
      return (
        <div className="text-center py-10">
          <BarChart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Establish standard habits to build analytics.</p>
        </div>
      );
    }

    const height = 150;
    const width = 450;
    const padding = 30;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;
    const barWidth = 35;
    const gap = (chartWidth - barWidth * weeklyHabitStats.length) / (weeklyHabitStats.length - 1);

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-emerald-500 font-sans">
        {/* Draw background grid lines */}
        {[0, 25, 50, 75, 100].map((gridPct, idx) => {
          const y = padding + chartHeight - (gridPct / 100) * chartHeight;
          return (
            <g key={idx}>
              <line 
                x1={padding} 
                y1={y} 
                x2={width - padding} 
                y2={y} 
                className="stroke-slate-100 dark:stroke-slate-800/80" 
                strokeWidth="1" 
                strokeDasharray="4 4" 
              />
              <text 
                x={padding - 8} 
                y={y + 3} 
                className="fill-slate-400 text-[9px] font-bold text-right"
                textAnchor="end"
              >
                {gridPct}%
              </text>
            </g>
          );
        })}

        {/* Draw bars and labels */}
        {weeklyHabitStats.map((item, idx) => {
          const barHeight = (item.pct / 100) * chartHeight;
          const x = padding + idx * (barWidth + gap);
          const y = padding + chartHeight - barHeight;

          return (
            <g key={item.dateStr} className="group cursor-pointer">
              {/* Animated Column Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 4)} // minor fallback pill height
                rx="4"
                className="fill-emerald-500 hover:fill-emerald-600 dark:fill-emerald-400/85 dark:hover:fill-emerald-400 transition-colors"
              />
              
              {/* Daily labels */}
              <text
                x={x + barWidth / 2}
                y={height - padding + 15}
                className="fill-slate-500 dark:fill-slate-400 text-[10px] font-bold"
                textAnchor="middle"
              >
                {item.displayDay}
              </text>

              {/* Value hover text display */}
              <text
                x={x + barWidth / 2}
                y={y - 6}
                className="fill-slate-700 dark:fill-slate-300 text-[9px] font-bold"
                textAnchor="middle"
              >
                {item.pct}%
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // Custom SVG line chart for mood trend values
  const renderMoodLineChart = () => {
    const weights = { excellent: 5, happy: 4, neutral: 3, sad: 2, exhausted: 1 };
    const loggedMoodsLast7 = last7Days.map(dateStr => {
      const log = moods.find(m => m.date === dateStr);
      const val = log ? weights[log.mood] : null;
      const displayDay = new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short' });
      return { dateStr, displayDay, val };
    });

    const height = 150;
    const width = 450;
    const padding = 30;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;

    const points: string[] = [];
    const stepX = chartWidth / (last7Days.length - 1);

    loggedMoodsLast7.forEach((item, idx) => {
      if (item.val !== null) {
        const x = padding + idx * stepX;
        const y = padding + chartHeight - ((item.val - 1) / 4) * chartHeight; // Normalize weight (1-5) into height scale
        points.push(`${x},${y}`);
      }
    });

    const isDataAvailable = points.length > 0;

    return (
      <div className="space-y-1">
        {isDataAvailable ? (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-sky-500 font-sans">
            {/* Draw Horizontal Grid Lines */}
            {[1, 2, 3, 4, 5].map((level) => {
              const y = padding + chartHeight - ((level - 1) / 4) * chartHeight;
              const emoji = { 1: '😫', 2: '😔', 3: '😐', 4: '😊', 5: '😁' }[level as 1|2|3|4|5];
              return (
                <g key={level}>
                  <line 
                    x1={padding} 
                    y1={y} 
                    x2={width - padding} 
                    y2={y} 
                    className="stroke-slate-100 dark:stroke-slate-800/80" 
                    strokeWidth="1" 
                    strokeDasharray="4 4" 
                  />
                  <text 
                    x={padding - 8} 
                    y={y + 3} 
                    className="text-[10px] text-right"
                    textAnchor="end"
                  >
                    {emoji}
                  </text>
                </g>
              );
            })}

            {/* Render trend line */}
            {points.length > 1 && (
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points.join(' ')}
                className="text-sky-500 dark:text-sky-400"
              />
            )}

            {/* Render dot points */}
            {loggedMoodsLast7.map((item, idx) => {
              if (item.val === null) return null;
              const x = padding + idx * stepX;
              const y = padding + chartHeight - ((item.val - 1) / 4) * chartHeight;

              return (
                <g key={item.dateStr}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4.5"
                    className="fill-sky-500 dark:fill-sky-400 stroke-white dark:stroke-slate-900"
                    strokeWidth="1.5"
                  />
                  <text
                    x={x}
                    y={height - padding + 15}
                    className="fill-slate-500 dark:fill-slate-400 text-[10px] font-bold"
                    textAnchor="middle"
                  >
                    {item.displayDay}
                  </text>
                </g>
              );
            })}
          </svg>
        ) : (
          <div className="text-center py-10">
            <Smile className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Log mood check-ins to build trend reports.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 space-y-6">
      
      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/80 p-5 rounded-3xl shadow-md border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 w-fit rounded-2xl">
            <Zap className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Streak</p>
          <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100">{streakCount} Days</h4>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-5 rounded-3xl shadow-md border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="p-2 bg-rose-50 dark:bg-rose-950/40 w-fit rounded-2xl">
            <Smile className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Mood</p>
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">{getAverageMoodScore()}</h4>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-5 rounded-3xl shadow-md border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="p-2 bg-blue-50 dark:bg-blue-950/40 w-fit rounded-2xl">
            <Coffee className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg Sleep Target</p>
          <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100">{healthAverages.sleep} hrs</h4>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-5 rounded-3xl shadow-md border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="p-2 bg-sky-50 dark:bg-sky-950/40 w-fit rounded-2xl">
            <Target className="w-5 h-5 text-sky-500" />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg Water Log</p>
          <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100">{healthAverages.water} ml</h4>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Weekly Habits Chart */}
        <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 space-y-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Weekly Completion Rate</h3>
            <p className="text-xs text-slate-400">Habits completion percentages over the last 7 days</p>
          </div>
          <div className="pt-2">
            {renderWeeklyBarChart()}
          </div>
        </div>

        {/* Mood Trend Chart */}
        <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 space-y-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Emotional Balance Trend</h3>
            <p className="text-xs text-slate-400">Weekly energetic fluctuations and stability track</p>
          </div>
          <div className="pt-2">
            {renderMoodLineChart()}
          </div>
        </div>

      </div>

      {/* Extra Analytics summaries */}
      <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="space-y-1">
          <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Total Habits Registered</h4>
          <p className="text-2xl font-black text-emerald-500">{totalHabits} Activities</p>
          <p className="text-[10px] text-slate-400 leading-relaxed">Activities actively integrated into your custom routine checklist.</p>
        </div>

        <div className="space-y-1 border-y sm:border-y-0 sm:border-x border-slate-100 dark:border-slate-850 py-4 sm:py-0 sm:px-6">
          <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Reflections Logged</h4>
          <p className="text-2xl font-black text-rose-500">{entries.length} Sessions</p>
          <p className="text-[10px] text-slate-400 leading-relaxed">Gratitude check-ins and free journals registered offline.</p>
        </div>

        <div className="space-y-1 sm:pl-4">
          <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Average Exercise Log</h4>
          <p className="text-2xl font-black text-sky-500">{healthAverages.exercise} Mins</p>
          <p className="text-[10px] text-slate-400 leading-relaxed">Daily physical movement minutes averaged across tracked dates.</p>
        </div>
      </div>

      <div className="text-center text-[10px] font-semibold text-slate-400 flex items-center justify-center gap-1.5 pt-2">
        <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" /> zero tracking • zero cloud latency • private offline engine
      </div>
    </div>
  );
};
