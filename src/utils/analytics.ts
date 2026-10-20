import type { Habit, HabitLog, DailySummary } from '../types';
import { formatDateKey, getPastDays, getDayOfWeek } from './dates';

export interface HeatmapCell {
  date: string;
  totalScheduled: number;
  completed: number;
  completionRate: number; // 0 - 100
  intensity: 0 | 1 | 2 | 3 | 4; // 0=0%, 1=1-39%, 2=40-69%, 3=70-99%, 4=100%
  dayOfWeek: number;
}

export interface HabitAnalytics {
  habitId: string;
  currentStreak: number;
  bestStreak: number;
  totalCompleted: number;
  completionRate: number; // % of days active
}

export interface DayOfWeekStat {
  dayName: string;
  shortName: string;
  dayIndex: number;
  scheduled: number;
  completed: number;
  rate: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  completed: number;
  scheduled: number;
  rate: number;
}

export interface DopamineInsight {
  id: string;
  type: 'streak' | 'time' | 'category' | 'praise' | 'tip';
  title: string;
  description: string;
  icon: string;
  color: string;
}

// Check if a habit was scheduled on a given date
export function isHabitScheduledOn(habit: Habit, dateKey: string): boolean {
  if (habit.archived) return false;
  // If created after this date, not scheduled yet
  const createdDateKey = habit.createdAt.slice(0, 10);
  if (dateKey < createdDateKey) return false;

  if (habit.frequency.type === 'daily') return true;

  const dayOfWeek = getDayOfWeek(dateKey);
  return habit.frequency.daysOfWeek.includes(dayOfWeek);
}

// Compute daily summary for a specific date
export function getDailySummary(
  dateKey: string,
  habits: Habit[],
  logs: HabitLog[]
): DailySummary {
  const scheduledHabits = habits.filter((h) => isHabitScheduledOn(h, dateKey));
  const logMap = new Map(logs.filter((l) => l.date === dateKey).map((l) => [l.habitId, l]));

  let completedCount = 0;
  scheduledHabits.forEach((h) => {
    const log = logMap.get(h.id);
    if (log && log.completed) {
      completedCount++;
    }
  });

  const total = scheduledHabits.length;
  const rate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return {
    date: dateKey,
    totalActiveHabits: total,
    completedHabits: completedCount,
    completionRate: rate,
  };
}

// Calculate streak for an individual habit
export function calculateHabitStreak(
  habit: Habit,
  logs: HabitLog[]
): { currentStreak: number; bestStreak: number; totalCompleted: number } {
  const habitLogs = logs
    .filter((l) => l.habitId === habit.id && l.completed)
    .map((l) => l.date);
  const completedDateSet = new Set(habitLogs);

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  // Scan backwards from today to calculate current streak
  const today = new Date();
  let checkDate = new Date(today);
  let checkedToday = false;

  while (true) {
    const key = formatDateKey(checkDate);
    // Don't look before creation
    if (key < habit.createdAt.slice(0, 10)) break;

    const scheduled = isHabitScheduledOn(habit, key);
    if (scheduled) {
      if (completedDateSet.has(key)) {
        currentStreak++;
      } else {
        // If today is not completed yet, check if yesterday was completed
        if (!checkedToday && key === formatDateKey(today)) {
          // It's today and not done yet - don't break streak yet, check yesterday
        } else {
          break;
        }
      }
    }
    checkedToday = true;
    checkDate.setDate(checkDate.getDate() - 1);
    // Limit lookback
    const diffDays = (today.getTime() - checkDate.getTime()) / (1000 * 3600 * 24);
    if (diffDays > 365) break;
  }

  // Calculate best streak historically across the past 365 days
  const pastDates = getPastDays(365);
  pastDates.forEach((dateKey) => {
    if (dateKey >= habit.createdAt.slice(0, 10) && isHabitScheduledOn(habit, dateKey)) {
      if (completedDateSet.has(dateKey)) {
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }
  });

  bestStreak = Math.max(bestStreak, currentStreak);

  return {
    currentStreak,
    bestStreak,
    totalCompleted: completedDateSet.size,
  };
}

// Calculate overall daily streak (days with >= dailyTargetRate completion, default 80% or at least 1 habit)
export function calculateOverallStreak(
  habits: Habit[],
  logs: HabitLog[],
  targetRate: number = 75
): { currentStreak: number; bestStreak: number; perfectDaysCount: number } {
  const pastDates = getPastDays(365);
  let currentStreak = 0;
  let bestStreak = 0;
  let runningStreak = 0;
  let perfectDaysCount = 0;

  const summaryByDate = new Map<string, DailySummary>();
  pastDates.forEach((dateKey) => {
    summaryByDate.set(dateKey, getDailySummary(dateKey, habits, logs));
  });

  pastDates.forEach((dateKey) => {
    const summary = summaryByDate.get(dateKey);
    if (summary && summary.totalActiveHabits > 0) {
      const metGoal = summary.completionRate >= targetRate || (summary.totalActiveHabits > 0 && summary.completedHabits === summary.totalActiveHabits);
      if (metGoal) {
        runningStreak++;
        if (runningStreak > bestStreak) bestStreak = runningStreak;
      } else {
        runningStreak = 0;
      }

      if (summary.totalActiveHabits >= 2 && summary.completionRate === 100) {
        perfectDaysCount++;
      }
    }
  });

  // Calculate current streak backwards from today
  const today = new Date();
  let checkDate = new Date(today);
  let isFirstDay = true;

  while (true) {
    const key = formatDateKey(checkDate);
    const summary = summaryByDate.get(key) || getDailySummary(key, habits, logs);

    if (summary && summary.totalActiveHabits > 0) {
      const metGoal = summary.completionRate >= targetRate || summary.completedHabits === summary.totalActiveHabits;
      if (metGoal) {
        currentStreak++;
      } else {
        if (isFirstDay && key === formatDateKey(today)) {
          // Today not done yet, continue checking yesterday
        } else {
          break;
        }
      }
    } else if (!isFirstDay) {
      // No habits scheduled on this day, skip or break depending on history
      break;
    }

    isFirstDay = false;
    checkDate.setDate(checkDate.getDate() - 1);
    const diff = (today.getTime() - checkDate.getTime()) / (1000 * 3600 * 24);
    if (diff > 365) break;
  }

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    perfectDaysCount,
  };
}

// Generate data for GitHub-style Activity Heatmap (e.g. past 90 to 120 days)
export function generateHeatmap(
  habits: Habit[],
  logs: HabitLog[],
  daysCount: number = 98 // 14 weeks
): HeatmapCell[] {
  const dates = getPastDays(daysCount);
  return dates.map((dateKey) => {
    const summary = getDailySummary(dateKey, habits, logs);
    const rate = summary.completionRate;
    let intensity: 0 | 1 | 2 | 3 | 4 = 0;
    if (summary.completedHabits > 0) {
      if (rate >= 95) intensity = 4;
      else if (rate >= 70) intensity = 3;
      else if (rate >= 40) intensity = 2;
      else intensity = 1;
    }
    return {
      date: dateKey,
      totalScheduled: summary.totalActiveHabits,
      completed: summary.completedHabits,
      completionRate: rate,
      intensity,
      dayOfWeek: getDayOfWeek(dateKey),
    };
  });
}

// Generate Day of Week Stats (Monday - Sunday)
export function getDayOfWeekStats(habits: Habit[], logs: HabitLog[]): DayOfWeekStat[] {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const stats: DayOfWeekStat[] = dayNames.map((name, i) => ({
    dayName: name,
    shortName: shortNames[i],
    dayIndex: i,
    scheduled: 0,
    completed: 0,
    rate: 0,
  }));

  const past60 = getPastDays(60);
  past60.forEach((dateKey) => {
    const dayIdx = getDayOfWeek(dateKey);
    const summary = getDailySummary(dateKey, habits, logs);
    stats[dayIdx].scheduled += summary.totalActiveHabits;
    stats[dayIdx].completed += summary.completedHabits;
  });

  stats.forEach((s) => {
    s.rate = s.scheduled > 0 ? Math.round((s.completed / s.scheduled) * 100) : 0;
  });

  // Reorder starting Monday: 1, 2, 3, 4, 5, 6, 0
  return [stats[1], stats[2], stats[3], stats[4], stats[5], stats[6], stats[0]];
}

// Generate Category Stats
export function getCategoryStats(habits: Habit[], logs: HabitLog[]): CategoryStat[] {
  const categories = ['health', 'fitness', 'mind', 'productivity', 'learning', 'creativity', 'social'];
  const past30 = getPastDays(30);

  return categories.map((cat) => {
    const catHabits = habits.filter((h) => h.category === cat && !h.archived);
    let scheduled = 0;
    let completed = 0;

    past30.forEach((dateKey) => {
      catHabits.forEach((h) => {
        if (isHabitScheduledOn(h, dateKey)) {
          scheduled++;
          const hasLog = logs.some((l) => l.habitId === h.id && l.date === dateKey && l.completed);
          if (hasLog) completed++;
        }
      });
    });

    const rate = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
    return {
      category: cat,
      count: catHabits.length,
      scheduled,
      completed,
      rate,
    };
  }).filter((c) => c.count > 0 || c.completed > 0);
}

// Generate smart, actionable Dopamine Insights
export function generateDopamineInsights(
  habits: Habit[],
  logs: HabitLog[],
  currentStreak: number,
  bestStreak: number
): DopamineInsight[] {
  const insights: DopamineInsight[] = [];

  if (habits.length === 0) {
    return [
      {
        id: 'welcome',
        type: 'praise',
        title: 'Start Building Momentum',
        description: 'Create your first 2-3 daily habits to trigger your first dopamine reward loop!',
        icon: 'Sparkles',
        color: '#8b5cf6',
      },
    ];
  }

  // Streak insight
  if (currentStreak >= 3) {
    insights.push({
      id: 'streak-fire',
      type: 'streak',
      title: `${currentStreak}-Day Streak Unlocked! 🔥`,
      description: `Your consistency is compounding. Neuroplasticity research shows maintaining a streak for 21 days solidifies automaticity.`,
      icon: 'Flame',
      color: '#f59e0b',
    });
  } else if (bestStreak >= 5) {
    insights.push({
      id: 'streak-recovery',
      type: 'streak',
      title: 'Reignite Your Momentum ⚡',
      description: `Your record is ${bestStreak} days. Check off today's habits to kickstart your next record streak!`,
      icon: 'Zap',
      color: '#06b6d4',
    });
  }

  // Day of week insight
  const dowStats = getDayOfWeekStats(habits, logs);
  const activeDow = dowStats.filter((d) => d.scheduled > 0);
  if (activeDow.length >= 3) {
    const bestDay = [...activeDow].sort((a, b) => b.rate - a.rate)[0];
    const lowestDay = [...activeDow].sort((a, b) => a.rate - b.rate)[0];

    if (bestDay && bestDay.rate >= 60) {
      insights.push({
        id: 'best-day',
        type: 'time',
        title: `${bestDay.dayName} Powerhouse 🚀`,
        description: `You hit a peak ${bestDay.rate}% completion rate on ${bestDay.dayName}s! Keep using this momentum.`,
        icon: 'TrendingUp',
        color: '#10b981',
      });
    }

    if (lowestDay && lowestDay.rate < 50 && lowestDay.rate !== bestDay?.rate) {
      insights.push({
        id: 'lowest-day',
        type: 'tip',
        title: `Protect Your ${lowestDay.dayName}s 🛡️`,
        description: `${lowestDay.dayName}s average ${lowestDay.rate}% completion. Try habit stacking or doing smaller micro-actions on this day.`,
        icon: 'ShieldAlert',
        color: '#ec4899',
      });
    }
  }

  // Time of Day insight
  const morningHabits = habits.filter((h) => h.timeOfDay === 'morning' && !h.archived);
  const eveningHabits = habits.filter((h) => h.timeOfDay === 'evening' && !h.archived);
  const past14 = getPastDays(14);

  let morningDone = 0, morningSched = 0;
  let eveningDone = 0, eveningSched = 0;

  past14.forEach((dateKey) => {
    morningHabits.forEach((h) => {
      if (isHabitScheduledOn(h, dateKey)) {
        morningSched++;
        if (logs.some((l) => l.habitId === h.id && l.date === dateKey && l.completed)) morningDone++;
      }
    });
    eveningHabits.forEach((h) => {
      if (isHabitScheduledOn(h, dateKey)) {
        eveningSched++;
        if (logs.some((l) => l.habitId === h.id && l.date === dateKey && l.completed)) eveningDone++;
      }
    });
  });

  const morningRate = morningSched > 0 ? (morningDone / morningSched) * 100 : 0;
  const eveningRate = eveningSched > 0 ? (eveningDone / eveningSched) * 100 : 0;

  if (morningSched >= 5 && eveningSched >= 5) {
    if (morningRate > eveningRate + 20) {
      insights.push({
        id: 'morning-winner',
        type: 'time',
        title: 'Morning Momentum Leader 🌅',
        description: `You complete ${Math.round(morningRate)}% of morning habits vs ${Math.round(eveningRate)}% in the evening. Front-loading your priorities gives you the best results!`,
        icon: 'Sunrise',
        color: '#f59e0b',
      });
    } else if (eveningRate > morningRate + 20) {
      insights.push({
        id: 'evening-winner',
        type: 'time',
        title: 'Evening Routine Master 🌙',
        description: `Your evening discipline is top notch (${Math.round(eveningRate)}%). Great wind-down habits ensure restful recovery!`,
        icon: 'Moon',
        color: '#8b5cf6',
      });
    }
  }

  // Default encouraging dopamine quote/tip if few insights
  if (insights.length < 3) {
    insights.push({
      id: 'dopamine-loop',
      type: 'tip',
      title: 'The Dopamine Reward Loop 🧠',
      description: 'Dopamine triggers upon the anticipation of reward, not just the completion. Celebrating small wins keeps your baseline high.',
      icon: 'Award',
      color: '#06b6d4',
    });
  }

  return insights;
}
