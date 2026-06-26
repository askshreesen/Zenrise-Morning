import React, { useRef } from 'react';
import { 
  Download, Upload, RefreshCw, Palette, Settings, Sparkles, 
  HelpCircle, EyeOff, CheckCircle, Flame, ShieldAlert, Monitor
} from 'lucide-react';
import { DashboardState } from '../types';

interface SettingsSectionProps {
  state: DashboardState;
  setTheme: (theme: string) => void;
  setParticleEffect: (effect: string) => void;
  setFontSize: (size: 'sm' | 'md' | 'lg') => void;
  setReducedMotion: (reduced: boolean) => void;
  updateWeatherCity: (city: string) => void;
  exportBackup: () => void;
  importBackup: (jsonData: any) => void;
  resetAllData: () => void;
}

const THEMES = [
  { id: 'rainbow', name: 'Rainbow Calm', desc: 'Prismatic, inspiring, multicolored palette' },
  { id: 'sunrise', name: 'Golden Sunrise', desc: 'Soft warmth, orange and amber gradients' },
  { id: 'forest', name: 'Earthy Forest', desc: 'Fresh deep organic greens and woodland soils' },
  { id: 'ocean', name: 'Abyssal Ocean', desc: 'Relaxed dynamic deep blue ocean depth' },
  { id: 'galaxy', name: 'Mystic Galaxy', desc: 'Space cosmic violet, indigo, and dark navy' },
  { id: 'zen', name: 'Minimal Zen', desc: 'Soft slate off-white paired with gentle grey' },
  { id: 'aurora', name: 'Teal Aurora', desc: 'Nordic auroral green and teal curtains' }
];

const EFFECTS = [
  { id: 'none', name: 'Disable Particles' },
  { id: 'clouds', name: '☁️ Floating Clouds' },
  { id: 'petals', name: '🌸 Lotus Petals' },
  { id: 'sparkles', name: '✨ Glimmering Sparkles' },
  { id: 'fireflies', name: '🔋 Forest Fireflies' },
  { id: 'aurora', name: '🌌 Northern Auroras' },
  { id: 'rainbow', name: '🌈 Arching Rainbows' },
  { id: 'confetti', name: '🎉 Falling Confetti' }
];

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  state,
  setTheme,
  setParticleEffect,
  setFontSize,
  setReducedMotion,
  updateWeatherCity,
  exportBackup,
  importBackup,
  resetAllData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        importBackup(json);
        alert('Morning Backup imported successfully!');
      } catch (err) {
        alert('Invalid backup file. Please make sure the JSON structure is intact.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Settings: Themes & Visuals (2 Cols) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Themes Panel */}
          <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Palette className="w-4.5 h-4.5 text-emerald-500" /> Morning Color Theme
              </h3>
              <p className="text-xs text-slate-400">Choose a high-contrast layout colorset representing your morning vibe</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEMES.map(theme => {
                const isActive = state.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setTheme(theme.id)}
                    className={`p-4 rounded-2xl border text-left transition ${
                      isActive
                        ? 'bg-emerald-50/50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 hover:border-slate-300 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 capitalize">{theme.name}</span>
                      {isActive && <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950/20" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{theme.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Overlay Particles */}
          <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-emerald-500" /> Dynamic Canvas Particles
              </h3>
              <p className="text-xs text-slate-400">Layer interactive background elements optimized for gorgeous 60fps renders</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {EFFECTS.map(eff => {
                const isActive = state.particleEffect === eff.id;
                return (
                  <button
                    key={eff.id}
                    onClick={() => setParticleEffect(eff.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {eff.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sizing & Accessibilities */}
          <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Monitor className="w-4.5 h-4.5 text-emerald-500" /> Accessibility & Motion
              </h3>
              <p className="text-xs text-slate-400">Optimize size alignments and reduce CPU frame rates on legacy computers</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Relative Font Size</label>
                <div className="flex gap-2">
                  {(['sm', 'md', 'lg'] as const).map(sz => (
                    <button
                      key={sz}
                      onClick={() => setFontSize(sz)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold capitalize transition ${
                        state.fontSize === sz
                          ? 'bg-slate-800 dark:bg-emerald-500 text-white'
                          : 'bg-slate-50 border-slate-150 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {sz === 'sm' ? 'Standard' : sz === 'md' ? 'Comfortable' : 'Larger'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Motion Optimization</label>
                <button
                  onClick={() => setReducedMotion(!state.reducedMotion)}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    state.reducedMotion
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'bg-slate-50 border-slate-150 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <EyeOff className="w-4 h-4" /> {state.reducedMotion ? 'Reduced Motion Enabled' : 'Use Full 60fps Animations'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Local database backup & utilities (1 col) */}
        <div className="space-y-6">
          
          {/* Backup Utilities */}
          <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 border-b border-slate-150 pb-2.5 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-500" /> Database Backup
            </h3>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your entire data (logs, habit streaks, check-ins, journal entries) resides purely inside your browser. No files travel over networks.
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={exportBackup}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Export Backup (JSON)
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Upload className="w-4 h-4" /> Import Backup file
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 border-b border-slate-150 pb-2.5 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-500" /> Shortcut Cheat Sheet
            </h3>

            <div className="space-y-2.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-850 pb-1.5">
                <span>Navigate Dashboard</span>
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-sans font-bold">Ctrl + D</kbd>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-850 pb-1.5">
                <span>Quick Check-in Logs</span>
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-sans font-bold">Ctrl + H</kbd>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-850 pb-1.5">
                <span>Mute Synth audio</span>
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-sans font-bold">Ctrl + M</kbd>
              </div>
            </div>
          </div>

          {/* Distructive Actions */}
          <div className="bg-rose-50/20 dark:bg-rose-950/10 p-6 rounded-3xl border border-rose-100/40 dark:border-rose-950/20 space-y-3">
            <h4 className="text-xs font-extrabold text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-500" /> Danger Zone
            </h4>
            <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80 leading-relaxed">
              Purges all registered check-ins, journal entries, and habit records forever. This process is fully irreversible. Export a backup before continuing.
            </p>
            <button
              onClick={() => {
                if (confirm('Are you absolutely sure you want to reset all data? This cannot be undone.')) {
                  resetAllData();
                  alert('Data purged successfully.');
                }
              }}
              className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition shadow-md"
            >
              Reset All Offline Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
