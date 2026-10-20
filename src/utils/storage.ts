import type { Habit, HabitLog, UserStats, UserSettings } from '../types';
import { formatDateKey } from './dates';

const STORAGE_KEYS = {
  HABITS: 'dopamine_habits_v1',
  LOGS: 'dopamine_logs_v1',
  STATS: 'dopamine_stats_v1',
  SETTINGS: 'dopamine_settings_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  confettiEnabled: true,
  dailyGoalPercentage: 80,
  name: 'Habit Hero',
};

export const DEFAULT_STATS: UserStats = {
  xp: 175,
  level: 1,
  levelTitle: 'Curious Spark',
  currentOverallStreak: 0,
  bestOverallStreak: 0,
  totalCompletions: 0,
  unlockedBadgeIds: [],
};

// Initial default habits for brand new users
export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit-1',
    title: 'Hydrate & Morning Sunlight',
    description: 'Drink 500ml of water and get 10 mins of natural sunlight to kickstart cortisol and dopamine.',
    category: 'health',
    color: '#06b6d4', // cyan
    icon: 'Sun',
    timeOfDay: 'morning',
    frequency: { type: 'daily', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
    targetValue: 1,
    unit: 'time',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    priority: 'high',
  },
  {
    id: 'habit-2',
    title: '90-Minute Deep Work Session',
    description: 'Focused distraction-free flow state block on my highest priority project.',
    category: 'productivity',
    color: '#8b5cf6', // violet
    icon: 'Brain',
    timeOfDay: 'morning',
    frequency: { type: 'weekly_days', daysOfWeek: [1, 2, 3, 4, 5] }, // Mon-Fri
    targetValue: 90,
    unit: 'mins',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    priority: 'high',
  },
  {
    id: 'habit-3',
    title: 'Physical Workout / Movement',
    description: 'Resistance training, running, or high intensity cardio.',
    category: 'fitness',
    color: '#10b981', // emerald
    icon: 'Dumbbell',
    timeOfDay: 'afternoon',
    frequency: { type: 'daily', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
    targetValue: 45,
    unit: 'mins',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    priority: 'medium',
  },
  {
    id: 'habit-4',
    title: 'Read Non-Fiction Book',
    description: 'Expanding mental models and learning new concepts.',
    category: 'learning',
    color: '#f59e0b', // amber
    icon: 'BookOpen',
    timeOfDay: 'evening',
    frequency: { type: 'daily', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
    targetValue: 15,
    unit: 'pages',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    priority: 'medium',
  },
  {
    id: 'habit-5',
    title: 'Screen-Free Wind Down & Sleep Prep',
    description: 'No blue light 45 mins before sleep. Journal or stretch.',
    category: 'mind',
    color: '#ec4899', // pink
    icon: 'Moon',
    timeOfDay: 'evening',
    frequency: { type: 'daily', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
    targetValue: 1,
    unit: 'time',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    priority: 'low',
  },
];

export function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) {
      saveHabits(DEFAULT_HABITS);
      return DEFAULT_HABITS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load habits:', e);
    return DEFAULT_HABITS;
  }
}

export function saveHabits(habits: Habit[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error('Failed to save habits:', e);
  }
}

export function loadLogs(): HabitLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load logs:', e);
    return [];
  }
}

export function saveLogs(logs: HabitLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save logs:', e);
  }
}

export function loadStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) return DEFAULT_STATS;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load stats:', e);
    return DEFAULT_STATS;
  }
}

export function saveStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

// Generate realistic mock history (past 28 days) for instant rich demo analytics
export function generateDemoData(): { habits: Habit[]; logs: HabitLog[]; stats: UserStats } {
  const habits: Habit[] = [...DEFAULT_HABITS];
  const logs: HabitLog[] = [];
  const today = new Date();

  let totalCompleted = 0;

  for (let i = 28; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateKey = formatDateKey(d);
    const dayOfWeek = d.getDay();

    habits.forEach((h, hIdx) => {
      // Check if scheduled
      if (h.frequency.type === 'weekly_days' && !h.frequency.daysOfWeek.includes(dayOfWeek)) {
        return;
      }

      // Simulated completion rate: ~82% probability
      // Habit 1 has high consistency (~90%), habit 3 has ~75%
      const prob = 0.75 + (hIdx % 2 === 0 ? 0.15 : -0.05);
      const isCompleted = Math.random() < prob;

      if (isCompleted) {
        totalCompleted++;
        logs.push({
          habitId: h.id,
          date: dateKey,
          completed: true,
          currentValue: h.targetValue,
          completedAt: new Date(d.getTime() + 1000 * 3600 * (8 + hIdx * 2)).toISOString(),
        });
      }
    });
  }

  const xp = totalCompleted * 25 + 350; // completions + bonuses
  const stats: UserStats = {
    xp,
    level: 4,
    levelTitle: 'Consistency Builder',
    currentOverallStreak: 6,
    bestOverallStreak: 12,
    totalCompletions: totalCompleted,
    unlockedBadgeIds: ['first_step', 'streak_3', 'streak_7', 'morning_ritual', 'checkins_25', 'polymath'],
  };

  saveHabits(habits);
  saveLogs(logs);
  saveStats(stats);

  return { habits, logs, stats };
}

// Export data as JSON download
export function exportDataAsJson(habits: Habit[], logs: HabitLog[], stats: UserStats, settings: UserSettings): void {
  const backup = {
    app: 'Dopamine Habit Tracker',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    habits,
    logs,
    stats,
    settings,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `dopamine_backup_${formatDateKey(new Date())}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Clear all data
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.HABITS);
  localStorage.removeItem(STORAGE_KEYS.LOGS);
  localStorage.removeItem(STORAGE_KEYS.STATS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
}
