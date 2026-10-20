import React from 'react';
import { Flame, Plus, BarChart3, CheckSquare, Award, Settings, Volume2, VolumeX, Sparkles } from 'lucide-react';
import type { UserStats, UserSettings } from '../../types';
import { getLevelFromXP } from '../../utils/gamification';

interface HeaderProps {
  currentTab: 'daily' | 'analytics' | 'badges';
  setCurrentTab: (tab: 'daily' | 'analytics' | 'badges') => void;
  stats: UserStats;
  settings: UserSettings;
  onToggleSound: () => void;
  onOpenNewHabitModal: () => void;
  onOpenSettingsModal: () => void;
  todayCompletedCount: number;
  todayTotalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  stats,
  settings,
  onToggleSound,
  onOpenNewHabitModal,
  onOpenSettingsModal,
  todayCompletedCount,
  todayTotalCount,
}) => {
  const levelInfo = getLevelFromXP(stats.xp);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-cyan-400 p-[2px] shadow-lg shadow-violet-500/25">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-400 animate-pulse-subtle" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  DOPAMINE
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Tracker
                </span>
              </div>
              <p className="hidden sm:block text-xs text-slate-400">Rewiring habits through momentum</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentTab('daily')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'daily'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span className="hidden md:inline">Today's Habits</span>
              <span className="md:hidden">Today</span>
              {todayTotalCount > 0 && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  currentTab === 'daily' ? 'bg-violet-800 text-violet-100' : 'bg-slate-800 text-slate-300'
                }`}>
                  {todayCompletedCount}/{todayTotalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('analytics')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'analytics'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setCurrentTab('badges')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'badges'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Badges</span>
            </button>
          </nav>

          {/* Right Status & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Counter */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                stats.currentOverallStreak > 0
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-sm shadow-amber-500/10'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
              }`}
              title={`Current overall streak: ${stats.currentOverallStreak} days (Best: ${stats.bestOverallStreak} days)`}
            >
              <Flame className={`w-4 h-4 ${stats.currentOverallStreak > 0 ? 'text-amber-500 fill-amber-500 animate-pulse' : 'text-slate-500'}`} />
              <span>{stats.currentOverallStreak} <span className="hidden sm:inline font-normal text-xs text-slate-400">streak</span></span>
            </div>

            {/* Level Badge */}
            <div
              onClick={() => setCurrentTab('badges')}
              className="cursor-pointer hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-violet-500/50 transition-all text-xs"
              title={`Level ${levelInfo.level}: ${levelInfo.title} (${stats.xp} XP)`}
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center font-black text-[11px] text-white">
                {levelInfo.level}
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-200 leading-tight truncate max-w-[120px]">{levelInfo.title}</div>
                <div className="text-[10px] text-violet-400 font-mono">{stats.xp} XP</div>
              </div>
            </div>

            {/* Sound Mute/Unmute */}
            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
              title={settings.soundEnabled ? 'Sound is ON (Click to mute)' : 'Sound is MUTED (Click to turn on)'}
              aria-label="Toggle Sound"
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Settings & Backup */}
            <button
              onClick={onOpenSettingsModal}
              className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
              title="Settings & Data Backup"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Add Habit Button */}
            <button
              onClick={onOpenNewHabitModal}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">New Habit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gamification Level XP Progress Strip */}
      <div className="w-full bg-slate-950/80 h-1.5 relative overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 transition-all duration-700 ease-out"
          style={{ width: `${levelInfo.progress}%` }}
        />
      </div>
    </header>
  );
};
