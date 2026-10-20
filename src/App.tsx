import { useState, useEffect } from 'react';
import type { Habit, HabitLog, UserStats, UserSettings, Badge } from './types';
import {
  loadHabits,
  saveHabits,
  loadLogs,
  saveLogs,
  loadStats,
  saveStats,
  loadSettings,
  saveSettings,
  generateDemoData,
  clearAllData,
  DEFAULT_STATS,
} from './utils/storage';
import { getTodayKey } from './utils/dates';
import { calculateOverallStreak } from './utils/analytics';
import { evaluateBadges, getLevelFromXP } from './utils/gamification';
import { sounds } from './utils/audio';
import {
  fireSingleHabitConfetti,
  fireCelebrationConfetti,
  fireStreakFlameConfetti,
} from './utils/confetti';

import { Header } from './components/common/Header';
import { DailyView } from './components/habits/DailyView';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { BadgesView } from './components/gamification/BadgesView';
import { HabitModal } from './components/habits/HabitModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { Trophy, X } from 'lucide-react';

export function App() {
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  const [logs, setLogs] = useState<HabitLog[]>(() => loadLogs());
  const [stats, setStats] = useState<UserStats>(() => loadStats());
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());

  const [currentTab, setCurrentTab] = useState<'daily' | 'analytics' | 'badges'>('daily');
  const [currentDateKey, setCurrentDateKey] = useState<string>(() => getTodayKey());

  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [unlockedBadgeNotification, setUnlockedBadgeNotification] = useState<Badge | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Recalculate streak and badges on habit completion
  const updateStreaksAndBadges = (
    currentHabits: Habit[],
    currentLogs: HabitLog[],
    currentStats: UserStats
  ) => {
    const { currentStreak, bestStreak, perfectDaysCount } = calculateOverallStreak(
      currentHabits,
      currentLogs,
      settings.dailyGoalPercentage
    );

    const prevLevel = getLevelFromXP(currentStats.xp).level;
    const { badges, newlyUnlocked } = evaluateBadges(
      currentHabits,
      currentLogs,
      {
        ...currentStats,
        currentOverallStreak: currentStreak,
        bestOverallStreak: Math.max(currentStats.bestOverallStreak, bestStreak),
      },
      perfectDaysCount
    );

    let xpGainedFromBadges = 0;
    const updatedUnlockedBadgeIds = [...currentStats.unlockedBadgeIds];

    newlyUnlocked.forEach((b) => {
      if (!updatedUnlockedBadgeIds.includes(b.id)) {
        updatedUnlockedBadgeIds.push(b.id);
        xpGainedFromBadges += b.xpReward;
        setUnlockedBadgeNotification(b);
        if (settings.soundEnabled) sounds.playBadgeUnlock();
        if (settings.confettiEnabled) fireCelebrationConfetti();
      }
    });

    const totalXP = currentStats.xp + xpGainedFromBadges;
    const newLevelInfo = getLevelFromXP(totalXP);

    if (newLevelInfo.level > prevLevel && prevLevel > 0) {
      if (settings.soundEnabled) sounds.playLevelUp();
      if (settings.confettiEnabled) fireCelebrationConfetti();
    }

    const updatedStats: UserStats = {
      ...currentStats,
      xp: totalXP,
      level: newLevelInfo.level,
      levelTitle: newLevelInfo.title,
      currentOverallStreak: currentStreak,
      bestOverallStreak: Math.max(currentStats.bestOverallStreak, bestStreak),
      unlockedBadgeIds: updatedUnlockedBadgeIds,
    };

    setStats(updatedStats);
    return { badges, updatedStats };
  };

  // Toggle Habit completion
  const handleToggleComplete = (habitId: string, completed: boolean, value?: number) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const existingLogIdx = logs.findIndex(
      (l) => l.habitId === habitId && l.date === currentDateKey
    );

    let updatedLogs = [...logs];
    const targetVal = value !== undefined ? value : completed ? habit.targetValue : 0;

    if (existingLogIdx >= 0) {
      updatedLogs[existingLogIdx] = {
        ...updatedLogs[existingLogIdx],
        completed,
        currentValue: targetVal,
        completedAt: completed ? new Date().toISOString() : undefined,
      };
    } else {
      updatedLogs.push({
        habitId,
        date: currentDateKey,
        completed,
        currentValue: targetVal,
        completedAt: completed ? new Date().toISOString() : undefined,
      });
    }

    setLogs(updatedLogs);

    // Audio & Confetti feedback
    if (completed) {
      if (settings.soundEnabled) sounds.playCheck();
      if (settings.confettiEnabled) fireSingleHabitConfetti();

      // Check if user reached streak milestone or all habits completed for today
      const todayLogs = updatedLogs.filter((l) => l.date === currentDateKey && l.completed);
      const todayScheduled = habits.filter((h) => !h.archived);
      if (todayLogs.length === todayScheduled.length && todayScheduled.length >= 2) {
        if (settings.confettiEnabled) fireCelebrationConfetti();
      }
    } else {
      if (settings.soundEnabled) sounds.playUncheck();
    }

    // Update XP: +25 XP on check, -25 XP on uncheck
    const xpChange = completed ? 25 : -25;
    const newTotalCompletions = completed
      ? stats.totalCompletions + 1
      : Math.max(0, stats.totalCompletions - 1);

    const updatedStats: UserStats = {
      ...stats,
      xp: Math.max(0, stats.xp + xpChange),
      totalCompletions: newTotalCompletions,
    };

    updateStreaksAndBadges(habits, updatedLogs, updatedStats);
  };

  // Update counter value (e.g. 5 glasses of water)
  const handleUpdateValue = (habitId: string, newValue: number) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const isCompleted = newValue >= habit.targetValue;
    handleToggleComplete(habitId, isCompleted, newValue);
  };

  // Save reflection note
  const handleSaveNote = (habitId: string, note: string) => {
    const existingLogIdx = logs.findIndex(
      (l) => l.habitId === habitId && l.date === currentDateKey
    );

    let updatedLogs = [...logs];
    if (existingLogIdx >= 0) {
      updatedLogs[existingLogIdx] = {
        ...updatedLogs[existingLogIdx],
        note,
      };
    } else {
      updatedLogs.push({
        habitId,
        date: currentDateKey,
        completed: false,
        currentValue: 0,
        note,
      });
    }
    setLogs(updatedLogs);
  };

  // Add / Edit habit
  const handleSaveHabit = (habitData: Partial<Habit>) => {
    if (editingHabit) {
      const updated = habits.map((h) => (h.id === editingHabit.id ? { ...h, ...habitData } : h));
      setHabits(updated);
      setEditingHabit(null);
    } else {
      const newHabit: Habit = {
        id: `habit-${Date.now()}`,
        title: habitData.title || 'Untitled Habit',
        description: habitData.description,
        category: habitData.category || 'health',
        color: habitData.color || '#8b5cf6',
        icon: habitData.icon || 'Sparkles',
        timeOfDay: habitData.timeOfDay || 'morning',
        frequency: habitData.frequency || { type: 'daily', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
        targetValue: habitData.targetValue || 1,
        unit: habitData.unit || 'time',
        createdAt: new Date().toISOString(),
        priority: habitData.priority || 'medium',
      };
      const updated = [newHabit, ...habits];
      setHabits(updated);

      // Reward XP for creating habit
      const updatedStats = {
        ...stats,
        xp: stats.xp + 50,
      };
      setStats(updatedStats);
      if (settings.soundEnabled) sounds.playStreak();
      if (settings.confettiEnabled) fireStreakFlameConfetti();
    }
  };

  // Delete habit
  const handleDeleteHabit = (habitId: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      setHabits(habits.filter((h) => h.id !== habitId));
      setLogs(logs.filter((l) => l.habitId !== habitId));
    }
  };

  // Settings & Data actions
  const handleImportData = (data: {
    habits: Habit[];
    logs: HabitLog[];
    stats?: UserStats;
    settings?: UserSettings;
  }) => {
    setHabits(data.habits);
    setLogs(data.logs);
    if (data.stats) setStats(data.stats);
    if (data.settings) setSettings(data.settings);
  };

  const handleLoadDemoData = () => {
    const { habits: dHabits, logs: dLogs, stats: dStats } = generateDemoData();
    setHabits(dHabits);
    setLogs(dLogs);
    setStats(dStats);
    if (settings.confettiEnabled) fireCelebrationConfetti();
    if (settings.soundEnabled) sounds.playLevelUp();
  };

  const handleResetAllData = () => {
    clearAllData();
    setHabits([]);
    setLogs([]);
    setStats(DEFAULT_STATS);
  };

  // Calculate today stats for header
  const todayKey = getTodayKey();
  const todayScheduled = habits.filter((h) => !h.archived);
  const todayCompleted = logs.filter((l) => l.date === todayKey && l.completed);

  // Evaluate current badges list
  const { badges } = evaluateBadges(habits, logs, stats, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* App Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        stats={stats}
        settings={settings}
        onToggleSound={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
        onOpenNewHabitModal={() => {
          setEditingHabit(null);
          setIsHabitModalOpen(true);
        }}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        todayCompletedCount={todayCompleted.length}
        todayTotalCount={todayScheduled.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'daily' && (
          <DailyView
            currentDateKey={currentDateKey}
            setCurrentDateKey={setCurrentDateKey}
            habits={habits}
            logs={logs}
            onToggleComplete={handleToggleComplete}
            onUpdateValue={handleUpdateValue}
            onSaveNote={handleSaveNote}
            onEditHabit={(h) => {
              setEditingHabit(h);
              setIsHabitModalOpen(true);
            }}
            onDeleteHabit={handleDeleteHabit}
            onOpenNewHabitModal={() => {
              setEditingHabit(null);
              setIsHabitModalOpen(true);
            }}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsDashboard habits={habits} logs={logs} stats={stats} />
        )}

        {currentTab === 'badges' && <BadgesView badges={badges} stats={stats} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <p>
          Dopamine Habit Tracker • Designed for neuroplastic consistency and intrinsic reward loops
        </p>
      </footer>

      {/* Habit Create / Edit Modal */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        initialHabit={editingHabit}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(newSet) => setSettings({ ...settings, ...newSet })}
        habits={habits}
        logs={logs}
        stats={stats}
        onImportData={handleImportData}
        onLoadDemoData={handleLoadDemoData}
        onResetAllData={handleResetAllData}
      />

      {/* Badge Unlock Celebration Banner Toast */}
      {unlockedBadgeNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 p-0.5 rounded-2xl shadow-2xl animate-bounce-short">
          <div className="bg-slate-950 p-4 rounded-[14px] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Trophy className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  New Badge Unlocked!
                </span>
                <h4 className="text-sm font-bold text-white">
                  {unlockedBadgeNotification.title}
                </h4>
                <p className="text-[11px] text-slate-400">
                  +{unlockedBadgeNotification.xpReward} XP awarded
                </p>
              </div>
            </div>
            <button
              onClick={() => setUnlockedBadgeNotification(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
