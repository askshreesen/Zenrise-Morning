import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Volume2, Wind, Music, Eye, 
  Sparkles, Award, ShieldAlert, Heart, RefreshCw, Layers, ChevronRight
} from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

const BREATH_MODES = [
  { name: 'Box Breathing', inhale: 4, hold1: 4, exhale: 4, hold2: 4, desc: 'Popularized by Navy SEALs for rapid stress reduction and intense mental focus.' },
  { name: '4-7-8 Breathing', inhale: 4, hold1: 7, exhale: 8, hold2: 0, desc: 'Natural tranquilizer for the nervous system, excellent for calming racing thoughts.' },
  { name: 'Calm Breathing', inhale: 5, hold1: 2, exhale: 5, hold2: 2, desc: 'Symmetrical breathing that aligns heart rate variability and deep calm.' },
  { name: 'Relax Breathing', inhale: 4, hold1: 0, exhale: 6, hold2: 0, desc: 'Extended exhalation technique to activate the body\'s parasympathetic response.' }
];

const YOGA_POSES = [
  {
    name: "Lotus Pose (Padmasana)",
    desc: "A classic seated meditation posture that opens the hips and encourages quiet focus.",
    instructions: [
      "Sit flat on the floor with legs straight in front.",
      "Bend right knee, placing the foot high on the left thigh.",
      "Bend left knee, crossing the foot over top onto the right thigh.",
      "Rest hands on your knees, palms facing up, index fingers touching thumbs."
    ],
    duration: "3-5 mins",
    svg: (
      <svg viewBox="0 0 100 100" className="w-40 h-40 mx-auto text-emerald-500 fill-none stroke-current stroke-2">
        <circle cx="50" cy="25" r="8" />
        <path d="M50,33 L50,65" />
        {/* Lotus legs folded */}
        <path d="M25,75 Q50,85 75,75" />
        <path d="M20,70 Q40,65 50,75" />
        <path d="M80,70 Q60,65 50,75" />
        {/* Arms resting */}
        <path d="M50,38 L30,55 L25,70" />
        <path d="M50,38 L70,55 L75,70" />
      </svg>
    )
  },
  {
    name: "Tree Pose (Vrikshasana)",
    desc: "A standing balancing pose that builds focus, patience, and stability of mind.",
    instructions: [
      "Stand straight with weight distributed evenly on both feet.",
      "Shift weight onto your left leg, bending the right knee.",
      "Place your right foot high on the inner left thigh (avoiding the knee).",
      "Bring hands together in prayer position (Anjali Mudra) at chest center."
    ],
    duration: "1 min per leg",
    svg: (
      <svg viewBox="0 0 100 100" className="w-40 h-40 mx-auto text-emerald-500 fill-none stroke-current stroke-2">
        <circle cx="50" cy="20" r="7" />
        <path d="M50,27 L50,65" />
        {/* Standing leg */}
        <path d="M50,65 L50,90" />
        {/* Bent leg */}
        <path d="M50,50 L35,60 L50,70" />
        {/* Prayer arms */}
        <path d="M50,35 L40,43 L50,48" />
        <path d="M50,35 L60,43 L50,48" />
      </svg>
    )
  },
  {
    name: "Warrior Pose (Virabhadrasana)",
    desc: "An energetic pose that promotes physical courage, stamina, and stability.",
    instructions: [
      "Step feet wide apart (about 3-4 feet).",
      "Turn your right foot out 90 degrees and left foot in slightly.",
      "Bend right knee so it is aligned above the right ankle.",
      "Extend arms out horizontally, parallel to the floor, gazing over the right hand."
    ],
    duration: "30-60 secs",
    svg: (
      <svg viewBox="0 0 100 100" className="w-40 h-40 mx-auto text-emerald-500 fill-none stroke-current stroke-2">
        <circle cx="50" cy="18" r="6" />
        <path d="M50,24 L50,55" />
        {/* Wide stable legs */}
        <path d="M50,55 L35,85" />
        <path d="M50,55 L70,75 L85,85" />
        {/* Extended arms */}
        <path d="M20,32 L80,32" />
      </svg>
    )
  },
  {
    name: "Mountain Pose (Tadasana)",
    desc: "The foundational active standing posture promoting correct alignment and solid ground.",
    instructions: [
      "Stand with big toes touching, heels slightly apart.",
      "Relax shoulders, draw shoulder blades down the back, chest open.",
      "Arms hang down at sides, fingers fully extended, palms facing forward.",
      "Lift crown of the head toward the ceiling, grounding your feet firmly."
    ],
    duration: "2-3 mins",
    svg: (
      <svg viewBox="0 0 100 100" className="w-40 h-40 mx-auto text-emerald-500 fill-none stroke-current stroke-2">
        <circle cx="50" cy="18" r="7" />
        <path d="M50,25 L50,65" />
        {/* Standing straight legs */}
        <path d="M47,65 L47,90" />
        <path d="M53,65 L53,90" />
        {/* Arms slightly outward */}
        <path d="M50,30 L38,55" />
        <path d="M50,30 L62,55" />
      </svg>
    )
  }
];

export const WellnessSection: React.FC = () => {
  const [subTab, setSubTab] = useState<'audio' | 'breathing' | 'yoga' | 'timer'>('timer');

  // --- Audio Mixer State ---
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [activeSounds, setActiveSounds] = useState<Record<string, { enabled: boolean; volume: number }>>({
    rain: { enabled: false, volume: 0.4 },
    ocean: { enabled: false, volume: 0.3 },
    wind: { enabled: false, volume: 0.2 },
    birds: { enabled: false, volume: 0.3 },
    forest: { enabled: false, volume: 0.2 },
    bells: { enabled: false, volume: 0.4 }
  });

  const handleToggleSound = (soundId: string) => {
    const updated = !activeSounds[soundId].enabled;
    setActiveSounds(prev => ({
      ...prev,
      [soundId]: { ...prev[soundId], enabled: updated }
    }));
    audioSynth.toggleSound(soundId, updated, activeSounds[soundId].volume);
  };

  const handleSoundVolume = (soundId: string, vol: number) => {
    setActiveSounds(prev => ({
      ...prev,
      [soundId]: { ...prev[soundId], volume: vol }
    }));
    audioSynth.setSoundVolume(soundId, vol);
  };

  const handleMasterVolume = (vol: number) => {
    setMasterVolume(vol);
    audioSynth.setGlobalVolume(vol);
  };

  const handleStopAllSounds = () => {
    const fresh = { ...activeSounds };
    Object.keys(fresh).forEach(k => {
      fresh[k].enabled = false;
    });
    setActiveSounds(fresh);
    audioSynth.stopAll();
  };

  useEffect(() => {
    return () => {
      // Clean up procedural sound synthesis on unmount to avoid ghost audio
      audioSynth.stopAll();
    };
  }, []);

  // --- Pomodoro & Meditation Timer combined system ---
  const [timerType, setTimerType] = useState<'pomodoro' | 'shortBreak' | 'longBreak' | 'meditation'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState({ p: 0, m: 0 });
  const [customMinutes, setCustomMinutes] = useState(25);
  
  const timerId = useRef<number | null>(null);

  const resetTimer = (type = timerType) => {
    setTimerRunning(false);
    if (timerId.current) clearInterval(timerId.current);
    
    let duration = 25 * 60;
    if (type === 'shortBreak') duration = 5 * 60;
    else if (type === 'longBreak') duration = 15 * 60;
    else if (type === 'meditation') duration = 15 * 60; // default 15 min meditation

    setTimeLeft(duration);
    setTimerType(type);
  };

  useEffect(() => {
    if (timerRunning) {
      timerId.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            if (timerId.current) clearInterval(timerId.current);
            // Trigger procedural temple bell to chime on timer completion!
            audioSynth.toggleSound('bells', true, 0.8);
            setTimeout(() => {
              audioSynth.toggleSound('bells', false);
            }, 6000);

            // Increment session counts
            if (timerType === 'pomodoro') setSessionCount(s => ({ ...s, p: s.p + 1 }));
            if (timerType === 'meditation') setSessionCount(s => ({ ...s, m: s.m + 1 }));

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerId.current) clearInterval(timerId.current);
    }

    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, [timerRunning, timerType]);

  const handleApplyCustomTimer = (mins: number) => {
    setCustomMinutes(mins);
    setTimerRunning(false);
    setTimeLeft(mins * 60);
  };

  const formatTimerDisplay = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // --- Breathing Guide State ---
  const [activeBreathModeIdx, setActiveBreathModeIdx] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathSeconds, setBreathSeconds] = useState(0);
  const [isBreathingRunning, setIsBreathingRunning] = useState(false);
  
  const currentBreathMode = BREATH_MODES[activeBreathModeIdx];

  useEffect(() => {
    let interval: number;

    if (isBreathingRunning) {
      interval = window.setInterval(() => {
        setBreathSeconds(prevSec => {
          const nextSec = prevSec + 1;
          
          // Work out current phases based on limits
          const limitInhale = currentBreathMode.inhale;
          const limitHold1 = limitInhale + currentBreathMode.hold1;
          const limitExhale = limitHold1 + currentBreathMode.exhale;
          const limitHold2 = limitExhale + currentBreathMode.hold2;

          if (nextSec < limitInhale) {
            setBreathPhase('Inhale');
            return nextSec;
          } else if (nextSec < limitHold1) {
            setBreathPhase('Hold');
            return nextSec;
          } else if (nextSec < limitExhale) {
            setBreathPhase('Exhale');
            return nextSec;
          } else if (nextSec < limitHold2) {
            setBreathPhase('Rest');
            return nextSec;
          } else {
            setBreathPhase('Inhale');
            return 0; // reset loop cycle
          }
        });
      }, 1000);
    } else {
      setBreathSeconds(0);
      setBreathPhase('Inhale');
    }

    return () => clearInterval(interval);
  }, [isBreathingRunning, activeBreathModeIdx]);

  // --- Yoga Pose State ---
  const [activeYogaIdx, setActiveYogaIdx] = useState(0);
  const currentYogaPose = YOGA_POSES[activeYogaIdx];

  return (
    <div className="max-w-5xl mx-auto px-4 space-y-6">
      {/* Tab select */}
      <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        {[
          { id: 'timer', label: '⏳ Timer & Focus', icon: <Layers className="w-4 h-4" /> },
          { id: 'breathing', label: '🌬️ Breathing Guide', icon: <Wind className="w-4 h-4" /> },
          { id: 'yoga', label: '🤸 Yoga Studio', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'audio', label: '🎵 Soundscapes', icon: <Music className="w-4 h-4" /> }
        ].map(tb => (
          <button
            key={tb.id}
            onClick={() => setSubTab(tb.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
              subTab === tb.id
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {subTab === 'timer' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main timer display */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900/80 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
            {/* Timer quick choices */}
            <div className="flex flex-wrap gap-1.5 mb-8 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-850">
              {[
                { id: 'pomodoro', lbl: 'Focus (25m)' },
                { id: 'shortBreak', lbl: 'Short Rest (5m)' },
                { id: 'longBreak', lbl: 'Long Rest (15m)' },
                { id: 'meditation', lbl: 'Meditation (15m)' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => resetTimer(opt.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                    timerType === opt.id
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {opt.lbl}
                </button>
              ))}
            </div>

            {/* Visual timer countdown */}
            <div className="relative w-52 h-52 flex items-center justify-center mb-8">
              <svg className="w-full h-full -rotate-90">
                <circle cx="104" cy="104" r="90" className="stroke-slate-50 dark:stroke-slate-800" strokeWidth="6" fill="transparent" />
                <motion.circle
                  cx="104"
                  cy="104"
                  r="90"
                  className="stroke-emerald-500 dark:stroke-emerald-400"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 90}
                  animate={{
                    strokeDashoffset: 2 * Math.PI * 90 * (1 - timeLeft / (
                      timerType === 'pomodoro' ? 25 * 60 : 
                      timerType === 'shortBreak' ? 5 * 60 : 15 * 60
                    ))
                  }}
                  transition={{ ease: 'linear' }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-mono font-extrabold text-slate-800 dark:text-slate-50">
                  {formatTimerDisplay(timeLeft)}
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mt-1">
                  {timerType === 'pomodoro' ? 'Focus Session' : timerType === 'meditation' ? 'Inner Peace' : 'Rest Break'}
                </span>
              </div>
            </div>

            {/* Timer controls */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center gap-1.5"
              >
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {timerRunning ? 'Pause' : 'Start Focus'}
              </button>
              <button
                onClick={() => resetTimer()}
                className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Custom inputs */}
            <div className="flex items-center gap-2 border-t border-slate-50 dark:border-slate-850 pt-5 w-full justify-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Set Custom:</span>
              <input
                type="number"
                value={customMinutes}
                onChange={(e) => handleApplyCustomTimer(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-lg text-xs font-bold text-center text-slate-800 dark:text-slate-100"
              />
              <span className="text-xs text-slate-400 font-medium">Minutes</span>
            </div>
          </div>

          {/* Stats & Tips sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-500" /> Focus Achievements
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl font-bold text-emerald-700">
                    🍅 {sessionCount.p}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Pomodoros Logged</h4>
                    <p className="text-[10px] text-slate-400">Successfully locked focus blocks</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-xl font-bold text-rose-700">
                    🧘 {sessionCount.m}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Meditations Completed</h4>
                    <p className="text-[10px] text-slate-400">Sessions of quiet mental centering</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 p-6 rounded-3xl border border-teal-100 dark:border-teal-950/40">
              <h4 className="text-xs font-extrabold text-teal-800 dark:text-teal-300 flex items-center gap-1 mb-2">
                💡 Scientific Insight
              </h4>
              <p className="text-[11px] text-teal-900/80 dark:text-teal-300/80 leading-relaxed font-medium">
                Sustaining high mental output requires structured rhythmic pacing. The Pomodoro technique (25 min focus, 5 min recovery) prevents cognitive fatigue and aligns actions with our natural attention cycles.
              </p>
            </div>
          </div>
        </div>
      )}

      {subTab === 'breathing' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active breathing animation circle */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900/80 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
            
            {/* Visual breathing guide expanding circle using framer-motion */}
            <div className="relative w-60 h-60 flex items-center justify-center mb-8">
              {/* Outer pulsing ring */}
              <AnimatePresence>
                {isBreathingRunning && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ 
                      scale: breathPhase === 'Inhale' ? 1.4 : breathPhase === 'Hold' ? 1.4 : breathPhase === 'Exhale' ? 0.8 : 0.8,
                      opacity: breathPhase === 'Inhale' ? 0.3 : breathPhase === 'Hold' ? 0.45 : breathPhase === 'Exhale' ? 0.15 : 0.1
                    }}
                    transition={{ duration: breathPhase === 'Inhale' ? currentBreathMode.inhale : breathPhase === 'Hold' ? currentBreathMode.hold1 : currentBreathMode.exhale, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full bg-emerald-300/40 dark:bg-emerald-500/20"
                  />
                )}
              </AnimatePresence>

              {/* Main inner core */}
              <motion.div
                animate={{
                  scale: isBreathingRunning && breathPhase === 'Inhale' ? 1.25 : isBreathingRunning && (breathPhase === 'Hold' || breathPhase === 'Rest') ? 1.25 : 0.85
                }}
                transition={{ 
                  duration: isBreathingRunning && breathPhase === 'Inhale' ? currentBreathMode.inhale : isBreathingRunning && breathPhase === 'Exhale' ? currentBreathMode.exhale : 1,
                  ease: 'easeInOut' 
                }}
                className="w-36 h-36 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex flex-col items-center justify-center shadow-xl z-10"
              >
                <span className="text-xl font-black tracking-wide">
                  {isBreathingRunning ? breathPhase : 'Ready'}
                </span>
                {isBreathingRunning && (
                  <span className="text-[10px] font-bold tracking-widest uppercase opacity-80 mt-1">
                    {breathSeconds}s
                  </span>
                )}
              </motion.div>
            </div>

            {/* Breathing controls */}
            <button
              onClick={() => setIsBreathingRunning(!isBreathingRunning)}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-extrabold rounded-2xl shadow-md transition-all flex items-center gap-1.5"
            >
              {isBreathingRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isBreathingRunning ? 'Pause Breathing Cycle' : 'Begin Breathing Session'}
            </button>
          </div>

          {/* Breathing modes lists */}
          <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 border-b border-slate-150 pb-2.5">
              Select Breathing Mode
            </h3>
            
            <div className="grid grid-cols-1 gap-2.5">
              {BREATH_MODES.map((mode, idx) => (
                <button
                  key={mode.name}
                  onClick={() => {
                    setActiveBreathModeIdx(idx);
                    setIsBreathingRunning(false);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    activeBreathModeIdx === idx
                      ? 'bg-emerald-50/60 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Wind className="w-4 h-4 text-emerald-500" /> {mode.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                    {mode.desc}
                  </p>
                  <div className="flex gap-2 pt-2 text-[9px] font-bold text-slate-400">
                    <span>In: {mode.inhale}s</span>
                    {mode.hold1 > 0 && <span>• Hold: {mode.hold1}s</span>}
                    <span>• Out: {mode.exhale}s</span>
                    {mode.hold2 > 0 && <span>• Rest: {mode.hold2}s</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {subTab === 'yoga' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Yoga pose instruction card */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900/80 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 flex items-center justify-center">
              {currentYogaPose.svg}
            </div>

            <div className="space-y-4">
              <div>
                <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  ⏱️ {currentYogaPose.duration}
                </span>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-1">{currentYogaPose.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{currentYogaPose.desc}</p>
              </div>

              <div className="space-y-2 border-t border-slate-50 dark:border-slate-850 pt-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Instructions:</h4>
                <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                  {currentYogaPose.instructions.map((inst, idx) => (
                    <li key={idx}>{inst}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Yoga poses selector */}
          <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 border-b border-slate-150 pb-2.5">
              Choose Pose
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {YOGA_POSES.map((pose, idx) => (
                <button
                  key={pose.name}
                  onClick={() => setActiveYogaIdx(idx)}
                  className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                    activeYogaIdx === idx
                      ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800 text-slate-800'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{pose.name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {subTab === 'audio' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Sound Mixer Controls */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900/80 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">Ambient Studio</h3>
                <p className="text-xs text-slate-400">Layer procedural nature channels to block distracting noises</p>
              </div>
              <button
                onClick={handleStopAllSounds}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-100 transition shadow-sm"
              >
                Mute All Channels
              </button>
            </div>

            {/* Master volume controller */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
              <Volume2 className="w-5 h-5 text-emerald-500" />
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>Master Volume</span>
                  <span>{Math.round(masterVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={masterVolume}
                  onChange={(e) => handleMasterVolume(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1 rounded-full bg-slate-200 dark:bg-slate-700"
                />
              </div>
            </div>

            {/* Grid of procedural individual channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'rain', label: '💧 Heavy Rain', desc: 'Soothing pink-noise heavy downpour' },
                { id: 'ocean', label: '🌊 Ocean Waves', desc: 'Rhythmic sea waves rising and falling' },
                { id: 'wind', label: '🌬️ Whistling Wind', desc: 'Predictable high-Q wind gusts' },
                { id: 'birds', label: '🐦 Bird Chirps', desc: 'Randomized procedural sweet bird chirping' },
                { id: 'forest', label: '🍃 Forest Rustle', desc: 'High-frequency leaves with deep wind' },
                { id: 'bells', label: '🔔 Temple Bells', desc: 'Metallic partial ring-decays' }
              ].map(sound => {
                const conf = activeSounds[sound.id];
                return (
                  <div
                    key={sound.id}
                    className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                      conf.enabled
                        ? 'bg-emerald-50/40 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-100">{sound.label}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{sound.desc}</p>
                      </div>
                      <button
                        onClick={() => handleToggleSound(sound.id)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
                          conf.enabled
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                        }`}
                      >
                        {conf.enabled ? 'On' : 'Off'}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                        <span>Channel Volume</span>
                        <span>{Math.round(conf.volume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={conf.volume}
                        disabled={!conf.enabled}
                        onChange={(e) => handleSoundVolume(sound.id, parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-1 rounded-full cursor-pointer disabled:opacity-30 bg-slate-200 dark:bg-slate-700"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mixing instructions */}
          <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 border-b border-slate-150 pb-2.5 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-500" /> offline Audio Engine
            </h3>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Unlike traditional players, our sound waves are created **procedurally in real-time** inside your web browser using mathematical noise formulations and physical synth oscillators.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-2">
              This delivers seamless infinite loops, utilizes virtually zero memory, requires absolutely no internet downloads, and runs 100% offline perfectly.
            </p>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex gap-3 mt-4">
              <ShieldAlert className="w-8 h-8 text-emerald-500 shrink-0" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Absolute Privacy</h4>
                <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed">
                  Audio synthesis takes place directly on your browser canvas. No tracks are fetched from external servers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
