import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Search,
  Sunrise,
  Sun,
  Moon,
  Clock,
  Sparkles,
  Trophy,
  Plus,
} from 'lucide-react';
import type { Habit, HabitLog, HabitCategory, TimeOfDay } from '../../types';
import { HabitCard } from './HabitCard';
import {
  formatFriendlyDate,
  offsetDateKey,
  getWeekDates,
  isToday,
  getTodayKey,
} from '../../utils/dates';
import { isHabitScheduledOn, calculateHabitStreak } from '../../utils/analytics';

interface DailyViewProps {
  currentDateKey: string;
  setCurrentDateKey: (date: string) => void;
  habits: Habit[];
  logs: HabitLog[];
  onToggleComplete: (habitId: string, completed: boolean, value?: number) => void;
  onUpdateValue: (habitId: string, newValue: number) => void;
  onSaveNote: (habitId: string, note: string) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onOpenNewHabitModal: () => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  currentDateKey,
  setCurrentDateKey,
  habits,
  logs,
  onToggleComplete,
  onUpdateValue,
  onSaveNote,
  onEditHabit,
  onDeleteHabit,
  onOpenNewHabitModal,
}) => {
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<TimeOfDay | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const weekDates = getWeekDates(currentDateKey);
  const isSelectedDateToday = isToday(currentDateKey);

  // Filter habits scheduled for this day
  const scheduledHabits = habits.filter((h) => isHabitScheduledOn(h, currentDateKey));

  // Logs for current date
  const logsForDate = new Map(
    logs.filter((l) => l.date === currentDateKey).map((l) => [l.habitId, l])
  );

  // Filtered habits by time, category, search
  const filteredHabits = scheduledHabits.filter((h) => {
    if (selectedTimeOfDay !== 'all' && h.timeOfDay !== selectedTimeOfDay) return false;
    if (selectedCategory !== 'all' && h.category !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = h.title.toLowerCase().includes(q);
      const matchDesc = h.description?.toLowerCase().includes(q) || false;
      const matchCat = h.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  // Calculate day completion stats
  const totalScheduled = scheduledHabits.length;
  let completedCount = 0;
  scheduledHabits.forEach((h) => {
    const l = logsForDate.get(h.id);
    if (l?.completed) completedCount++;
  });

  const completionPercentage =
    totalScheduled > 0 ? Math.round((completedCount / totalScheduled) * 100) : 0;

  const isPerfectDay = totalScheduled >= 3 && completedCount === totalScheduled;

  // Group habits by time of day for clean layout
  const morningList = filteredHabits.filter((h) => h.timeOfDay === 'morning');
  const afternoonList = filteredHabits.filter((h) => h.timeOfDay === 'afternoon');
  const eveningList = filteredHabits.filter((h) => h.timeOfDay === 'evening');
  const anytimeList = filteredHabits.filter((h) => h.timeOfDay === 'anytime');

  return (
    <div className="space-y-6">
      {/* Date Navigation & Calendar Strip */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:p-4 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDateKey(offsetDateKey(currentDateKey, -1))}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95"
              title="Previous Day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white min-w-[180px]">
                {formatFriendlyDate(currentDateKey)}
              </h2>
            </div>

            <button
              onClick={() => setCurrentDateKey(offsetDateKey(currentDateKey, 1))}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95"
              title="Next Day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {!isSelectedDateToday && (
              <button
                onClick={() => setCurrentDateKey(getTodayKey())}
                className="ml-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30 transition-all"
              >
                Jump to Today
              </button>
            )}
          </div>

          {/* Quick Date Picker Input */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={currentDateKey}
              onChange={(e) => e.target.value && setCurrentDateKey(e.target.value)}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* 7-Day Carousel Selector */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-2 border-t border-slate-800/60">
          {weekDates.map((item) => {
            const isSelected = item.key === currentDateKey;
            // Quick check if day had any logs
            const dayLogs = logs.filter((l) => l.date === item.key && l.completed);
            const hasActivity = dayLogs.length > 0;

            return (
              <button
                key={item.key}
                onClick={() => setCurrentDateKey(item.key)}
                className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 scale-105 ring-2 ring-violet-400/40'
                    : 'bg-slate-950/40 hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-slate-800/40'
                }`}
              >
                <span className="text-[10px] sm:text-xs font-medium uppercase">{item.label}</span>
                <span className={`text-sm sm:text-base font-bold my-0.5 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {item.dayNum}
                </span>
                <div className="h-1.5 flex items-center justify-center">
                  {hasActivity && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-emerald-400'
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dopamine Meter & Day Motivation Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-md bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Daily Dopamine Meter
              </span>
              {isPerfectDay && (
                <span className="text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 animate-bounce-short">
                  <Trophy className="w-3 h-3" /> Perfect Day Achieved!
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white m-0">
                {completionPercentage}%
              </h1>
              <span className="text-sm sm:text-base font-semibold text-slate-400">
                ({completedCount} of {totalScheduled} habits completed)
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300">
              {completionPercentage === 100
                ? '🔥 Absolute peak dopamine! Every single habit is crushed for today.'
                : completionPercentage >= 75
                ? '⚡ Fantastic momentum! You’ve crossed the critical consistency threshold.'
                : completionPercentage >= 50
                ? '💪 Halfway there! Keep going to lock in today’s streak.'
                : totalScheduled === 0
                ? 'No habits scheduled for this day.'
                : '🌱 Start with just one small habit to trigger your daily reward loop.'}
            </p>
          </div>

          {/* Large Progress Bar with XP info */}
          <div className="w-full md:w-72 space-y-2">
            <div className="flex justify-between text-xs font-medium text-slate-400">
              <span>Day Progress</span>
              <span className="text-violet-400 font-bold">+{completedCount * 25} XP Today</span>
            </div>
            <div className="w-full bg-slate-950/80 rounded-full h-3.5 p-0.5 border border-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>0%</span>
              <span>Target: 80%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Time of Day Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedTimeOfDay('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedTimeOfDay === 'all'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            All Day ({scheduledHabits.length})
          </button>
          <button
            onClick={() => setSelectedTimeOfDay('morning')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedTimeOfDay === 'morning'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sunrise className="w-3.5 h-3.5 text-amber-400" />
            Morning
          </button>
          <button
            onClick={() => setSelectedTimeOfDay('afternoon')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedTimeOfDay === 'afternoon'
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-yellow-400" />
            Afternoon
          </button>
          <button
            onClick={() => setSelectedTimeOfDay('evening')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedTimeOfDay === 'evening'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            Evening
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habits..."
              className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as HabitCategory | 'all')}
            className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500 capitalize"
          >
            <option value="all">All Categories</option>
            <option value="health">Health</option>
            <option value="fitness">Fitness</option>
            <option value="mind">Mind</option>
            <option value="productivity">Productivity</option>
            <option value="learning">Learning</option>
            <option value="creativity">Creativity</option>
            <option value="social">Social</option>
          </select>
        </div>
      </div>

      {/* Habits List Section */}
      {filteredHabits.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-violet-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-200 mb-1">
            {habits.length === 0
              ? 'No Habits Created Yet'
              : scheduledHabits.length === 0
              ? 'No Habits Scheduled for this Day'
              : 'No Habits Match Your Filter'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
            {habits.length === 0
              ? 'Start building your neuroplastic habit loops today. Add your first habit!'
              : 'Try clearing the search query or selecting a different category/time.'}
          </p>
          {habits.length === 0 && (
            <button
              onClick={onOpenNewHabitModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-600/30"
            >
              <Plus className="w-4 h-4" />
              Create First Habit
            </button>
          )}
        </div>
      ) : selectedTimeOfDay === 'all' && searchQuery === '' && selectedCategory === 'all' ? (
        // Grouped by Time of Day for clean structure
        <div className="space-y-6">
          {morningList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Sunrise className="w-4 h-4" /> Morning Rituals
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {morningList.map((habit) => {
                  const streakInfo = calculateHabitStreak(habit, logs);
                  return (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      log={logsForDate.get(habit.id)}
                      streak={streakInfo.currentStreak}
                      bestStreak={streakInfo.bestStreak}
                      onToggleComplete={onToggleComplete}
                      onUpdateValue={onUpdateValue}
                      onSaveNote={onSaveNote}
                      onEdit={onEditHabit}
                      onDelete={onDeleteHabit}
                      isToday={isSelectedDateToday}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {afternoonList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yellow-400">
                <Sun className="w-4 h-4" /> Afternoon Habits
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {afternoonList.map((habit) => {
                  const streakInfo = calculateHabitStreak(habit, logs);
                  return (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      log={logsForDate.get(habit.id)}
                      streak={streakInfo.currentStreak}
                      bestStreak={streakInfo.bestStreak}
                      onToggleComplete={onToggleComplete}
                      onUpdateValue={onUpdateValue}
                      onSaveNote={onSaveNote}
                      onEdit={onEditHabit}
                      onDelete={onDeleteHabit}
                      isToday={isSelectedDateToday}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {eveningList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                <Moon className="w-4 h-4" /> Evening & Wind Down
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {eveningList.map((habit) => {
                  const streakInfo = calculateHabitStreak(habit, logs);
                  return (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      log={logsForDate.get(habit.id)}
                      streak={streakInfo.currentStreak}
                      bestStreak={streakInfo.bestStreak}
                      onToggleComplete={onToggleComplete}
                      onUpdateValue={onUpdateValue}
                      onSaveNote={onSaveNote}
                      onEdit={onEditHabit}
                      onDelete={onDeleteHabit}
                      isToday={isSelectedDateToday}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {anytimeList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Clock className="w-4 h-4" /> Anytime Habits
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {anytimeList.map((habit) => {
                  const streakInfo = calculateHabitStreak(habit, logs);
                  return (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      log={logsForDate.get(habit.id)}
                      streak={streakInfo.currentStreak}
                      bestStreak={streakInfo.bestStreak}
                      onToggleComplete={onToggleComplete}
                      onUpdateValue={onUpdateValue}
                      onSaveNote={onSaveNote}
                      onEdit={onEditHabit}
                      onDelete={onDeleteHabit}
                      isToday={isSelectedDateToday}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Flat filtered grid
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredHabits.map((habit) => {
            const streakInfo = calculateHabitStreak(habit, logs);
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                log={logsForDate.get(habit.id)}
                streak={streakInfo.currentStreak}
                bestStreak={streakInfo.bestStreak}
                onToggleComplete={onToggleComplete}
                onUpdateValue={onUpdateValue}
                onSaveNote={onSaveNote}
                onEdit={onEditHabit}
                onDelete={onDeleteHabit}
                isToday={isSelectedDateToday}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
