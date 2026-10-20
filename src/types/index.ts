export type HabitCategory =
  | 'health'
  | 'fitness'
  | 'mind'
  | 'productivity'
  | 'learning'
  | 'creativity'
  | 'social';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export type HabitPriority = 'high' | 'medium' | 'low';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  color: string;
  icon: string;
  timeOfDay: TimeOfDay;
  frequency: {
    type: 'daily' | 'weekly_days';
    daysOfWeek: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  };
  targetValue: number; // e.g. 1 for boolean, 8 for glasses
  unit: string; // 'times', 'mins', 'glasses', 'pages', etc.
  createdAt: string; // ISO string
  archived?: boolean;
  priority: HabitPriority;
}

export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  currentValue: number; // For counter habits
  completedAt?: string;
  note?: string;
}

export interface UserStats {
  xp: number;
  level: number;
  levelTitle: string;
  currentOverallStreak: number;
  bestOverallStreak: number;
  totalCompletions: number;
  unlockedBadgeIds: string[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'volume' | 'mastery' | 'special';
  xpReward: number;
  unlockedAt?: string;
  progress: number; // 0 to 100
  targetRequirement: string;
}

export interface UserSettings {
  soundEnabled: boolean;
  confettiEnabled: boolean;
  dailyGoalPercentage: number; // default 80%
  name: string;
}

export interface DailySummary {
  date: string;
  totalActiveHabits: number;
  completedHabits: number;
  completionRate: number; // 0 to 100
}
