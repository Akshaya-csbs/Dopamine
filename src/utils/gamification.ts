import type { Habit, HabitLog, Badge, UserStats } from '../types';

export const LEVEL_TITLES: { [level: number]: string } = {
  1: 'Curious Spark',
  2: 'Habit Novice',
  3: 'Momentum Seeker',
  4: 'Consistency Builder',
  5: 'Dopamine Crafter',
  6: 'Streak Champion',
  7: 'Discipline Knight',
  8: 'Flow State Master',
  9: 'Neural Architect',
  10: 'Dopamine Overlord',
};

export function getLevelFromXP(xp: number): { level: number; title: string; currentLevelXP: number; nextLevelXP: number; progress: number } {
  // Level threshold formula: level 1 is 0-100, level 2 is 100-250, level 3 is 250-450, etc.
  // formula: requiredXP = 75 * level * level - 25 * level
  let level = 1;
  while (true) {
    const nextXP = 50 * level * level + 50 * level;
    if (xp < nextXP) {
      const prevXP = level === 1 ? 0 : 50 * (level - 1) * (level - 1) + 50 * (level - 1);
      const span = nextXP - prevXP;
      const gainedInLevel = xp - prevXP;
      const progress = Math.min(100, Math.max(0, Math.round((gainedInLevel / span) * 100)));
      const title = LEVEL_TITLES[level] || (level >= 10 ? `Level ${level} Grandmaster` : 'Habit Champion');
      return {
        level,
        title,
        currentLevelXP: gainedInLevel,
        nextLevelXP: span,
        progress,
      };
    }
    level++;
    if (level > 100) break;
  }

  return {
    level: 100,
    title: 'Legendary Ascendant',
    currentLevelXP: 1000,
    nextLevelXP: 1000,
    progress: 100,
  };
}

export const INITIAL_BADGES: Omit<Badge, 'progress' | 'unlockedAt'>[] = [
  {
    id: 'first_step',
    title: 'The Spark',
    description: 'Complete your very first habit check-in.',
    icon: 'Sparkles',
    category: 'volume',
    xpReward: 50,
    targetRequirement: '1 check-in',
  },
  {
    id: 'streak_3',
    title: 'Momentum Ignited',
    description: 'Maintain an active 3-day overall streak.',
    icon: 'Flame',
    category: 'streak',
    xpReward: 100,
    targetRequirement: '3-day streak',
  },
  {
    id: 'streak_7',
    title: '7-Day Warrior',
    description: 'Crush your habits for 7 consecutive days.',
    icon: 'Zap',
    category: 'streak',
    xpReward: 250,
    targetRequirement: '7-day streak',
  },
  {
    id: 'streak_30',
    title: 'Habit Titan',
    description: 'Reach a legendary 30-day streak.',
    icon: 'Crown',
    category: 'streak',
    xpReward: 1000,
    targetRequirement: '30-day streak',
  },
  {
    id: 'perfect_day',
    title: 'Flawless Execution',
    description: 'Complete 100% of all scheduled habits for a day (min 3 habits).',
    icon: 'CheckCircle2',
    category: 'mastery',
    xpReward: 150,
    targetRequirement: '1 perfect day',
  },
  {
    id: 'triple_perfect',
    title: 'The Hat Trick',
    description: 'Achieve 3 perfect 100% completion days.',
    icon: 'Trophy',
    category: 'mastery',
    xpReward: 300,
    targetRequirement: '3 perfect days',
  },
  {
    id: 'morning_ritual',
    title: 'Dawn Patrol',
    description: 'Complete 10 morning routine habits.',
    icon: 'Sunrise',
    category: 'special',
    xpReward: 150,
    targetRequirement: '10 morning completions',
  },
  {
    id: 'night_owl',
    title: 'Nocturnal Discipline',
    description: 'Complete 10 evening habits before bed.',
    icon: 'Moon',
    category: 'special',
    xpReward: 150,
    targetRequirement: '10 evening completions',
  },
  {
    id: 'checkins_25',
    title: 'Iron Will',
    description: 'Complete 25 total habit check-ins.',
    icon: 'Shield',
    category: 'volume',
    xpReward: 200,
    targetRequirement: '25 completions',
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Reach an incredible 100 total habit check-ins.',
    icon: 'Award',
    category: 'volume',
    xpReward: 500,
    targetRequirement: '100 completions',
  },
  {
    id: 'polymath',
    title: 'Balanced Life',
    description: 'Complete habits across at least 4 different life categories.',
    icon: 'Layers',
    category: 'mastery',
    xpReward: 200,
    targetRequirement: '4 categories active',
  },
  {
    id: 'xp_1000',
    title: 'XP Virtuoso',
    description: 'Accumulate 1,000 total Dopamine XP.',
    icon: 'Medal',
    category: 'special',
    xpReward: 350,
    targetRequirement: '1,000 XP',
  },
];

export function evaluateBadges(
  habits: Habit[],
  logs: HabitLog[],
  userStats: UserStats,
  perfectDaysCount: number
): { badges: Badge[]; newlyUnlocked: Badge[] } {
  const completedLogs = logs.filter((l) => l.completed);
  const totalCompleted = completedLogs.length;

  // Category count
  const completedHabitIds = new Set(completedLogs.map((l) => l.habitId));
  const activeCategories = new Set(
    habits.filter((h) => completedHabitIds.has(h.id)).map((h) => h.category)
  );

  // Time of day counts
  const habitMap = new Map(habits.map((h) => [h.id, h]));
  let morningCompletions = 0;
  let eveningCompletions = 0;
  completedLogs.forEach((log) => {
    const habit = habitMap.get(log.habitId);
    if (habit) {
      if (habit.timeOfDay === 'morning') morningCompletions++;
      if (habit.timeOfDay === 'evening') eveningCompletions++;
    }
  });

  const unlockedSet = new Set(userStats.unlockedBadgeIds || []);
  const newlyUnlocked: Badge[] = [];

  const badges: Badge[] = INITIAL_BADGES.map((badgeDef) => {
    let progress = 0;
    let unlocked = unlockedSet.has(badgeDef.id);

    switch (badgeDef.id) {
      case 'first_step':
        progress = Math.min(100, Math.round((totalCompleted / 1) * 100));
        if (totalCompleted >= 1) unlocked = true;
        break;
      case 'streak_3':
        progress = Math.min(100, Math.round((userStats.bestOverallStreak / 3) * 100));
        if (userStats.bestOverallStreak >= 3) unlocked = true;
        break;
      case 'streak_7':
        progress = Math.min(100, Math.round((userStats.bestOverallStreak / 7) * 100));
        if (userStats.bestOverallStreak >= 7) unlocked = true;
        break;
      case 'streak_30':
        progress = Math.min(100, Math.round((userStats.bestOverallStreak / 30) * 100));
        if (userStats.bestOverallStreak >= 30) unlocked = true;
        break;
      case 'perfect_day':
        progress = Math.min(100, Math.round((perfectDaysCount / 1) * 100));
        if (perfectDaysCount >= 1) unlocked = true;
        break;
      case 'triple_perfect':
        progress = Math.min(100, Math.round((perfectDaysCount / 3) * 100));
        if (perfectDaysCount >= 3) unlocked = true;
        break;
      case 'morning_ritual':
        progress = Math.min(100, Math.round((morningCompletions / 10) * 100));
        if (morningCompletions >= 10) unlocked = true;
        break;
      case 'night_owl':
        progress = Math.min(100, Math.round((eveningCompletions / 10) * 100));
        if (eveningCompletions >= 10) unlocked = true;
        break;
      case 'checkins_25':
        progress = Math.min(100, Math.round((totalCompleted / 25) * 100));
        if (totalCompleted >= 25) unlocked = true;
        break;
      case 'century_club':
        progress = Math.min(100, Math.round((totalCompleted / 100) * 100));
        if (totalCompleted >= 100) unlocked = true;
        break;
      case 'polymath':
        progress = Math.min(100, Math.round((activeCategories.size / 4) * 100));
        if (activeCategories.size >= 4) unlocked = true;
        break;
      case 'xp_1000':
        progress = Math.min(100, Math.round((userStats.xp / 1000) * 100));
        if (userStats.xp >= 1000) unlocked = true;
        break;
      default:
        break;
    }

    const badge: Badge = {
      ...badgeDef,
      progress: unlocked ? 100 : progress,
      unlockedAt: unlocked ? new Date().toISOString() : undefined,
    };

    if (unlocked && !unlockedSet.has(badgeDef.id)) {
      newlyUnlocked.push(badge);
    }

    return badge;
  });

  return { badges, newlyUnlocked };
}
