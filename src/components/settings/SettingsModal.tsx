import React, { useRef } from 'react';
import {
  X,
  Volume2,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import type { UserSettings, Habit, HabitLog, UserStats } from '../../types';
import { exportDataAsJson } from '../../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  habits: Habit[];
  logs: HabitLog[];
  stats: UserStats;
  onImportData: (data: { habits: Habit[]; logs: HabitLog[]; stats?: UserStats; settings?: UserSettings }) => void;
  onLoadDemoData: () => void;
  onResetAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  habits,
  logs,
  stats,
  onImportData,
  onLoadDemoData,
  onResetAllData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportDataAsJson(habits, logs, stats, settings);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.habits && Array.isArray(parsed.habits)) {
          onImportData(parsed);
          alert('Successfully imported backup data!');
          onClose();
        } else {
          alert('Invalid backup file format. Expected a Dopamine JSON backup.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Settings & Backup</h3>
              <p className="text-[11px] text-slate-400">Manage audio, targets, and data storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Dopamine Feedback Toggles */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Dopamine Feedback Loops
            </h4>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="font-bold text-slate-200">Audio Feedback</p>
                  <p className="text-[11px] text-slate-400">Synthesized acoustic bells & chimes on completion</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
              />
            </div>

            {/* Confetti Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="font-bold text-slate-200">Celebration Confetti</p>
                  <p className="text-[11px] text-slate-400">Particle bursts when completing habits</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.confettiEnabled}
                onChange={(e) => onUpdateSettings({ confettiEnabled: e.target.checked })}
                className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
              />
            </div>

            {/* Target Percentage */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-200">Streak Completion Target</p>
                  <p className="text-[11px] text-slate-400">Minimum daily completion % required to maintain a streak</p>
                </div>
                <span className="font-mono font-bold text-violet-400 text-sm">
                  {settings.dailyGoalPercentage}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={settings.dailyGoalPercentage}
                onChange={(e) => onUpdateSettings({ dailyGoalPercentage: parseInt(e.target.value) })}
                className="w-full accent-violet-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Backup and Data Export / Import */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Data & Cloudless Backup (100% Private)
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-all active:scale-95"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                Export JSON
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-all active:scale-95"
              >
                <Upload className="w-4 h-4 text-violet-400" />
                Import JSON
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>

            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              All data is stored directly in your local browser storage.
            </p>
          </div>

          {/* Demo Data & Danger Zone */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Demo Simulation & Reset
            </h4>

            <button
              onClick={() => {
                if (confirm('Load 4 weeks of rich demo data? This will populate habits, completions, streaks, and badges to let you explore the full dashboard.')) {
                  onLoadDemoData();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 font-semibold border border-violet-500/30 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Load Rich Demo History (Instant Showcase)
            </button>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to erase all habits and check-in history? This cannot be undone.')) {
                  onResetAllData();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Reset All Data
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
