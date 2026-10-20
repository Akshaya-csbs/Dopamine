import React, { useState } from 'react';
import {
  Flame,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  BarChart2,
  Calendar,
  Layers,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import type { Habit, HabitLog, UserStats } from '../../types';
import {
  generateHeatmap,
  getDayOfWeekStats,
  getCategoryStats,
  generateDopamineInsights,
  calculateHabitStreak,
  getDailySummary,
  type HeatmapCell,
} from '../../utils/analytics';
import { getPastDays, formatFriendlyDate } from '../../utils/dates';
import { getLevelFromXP } from '../../utils/gamification';
import { IconRenderer } from '../common/IconRenderer';

interface AnalyticsDashboardProps {
  habits: Habit[];
  logs: HabitLog[];
  stats: UserStats;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  habits,
  logs,
  stats,
}) => {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [trendDaysRange, setTrendDaysRange] = useState<14 | 30>(14);

  const levelInfo = getLevelFromXP(stats.xp);
  const heatmapCells = generateHeatmap(habits, logs, 98); // 14 weeks * 7 days
  const dowStats = getDayOfWeekStats(habits, logs);
  const categoryStats = getCategoryStats(habits, logs);
  const insights = generateDopamineInsights(
    habits,
    logs,
    stats.currentOverallStreak,
    stats.bestOverallStreak
  );

  // Calculate 30-day average rate
  const past30Days = getPastDays(30);
  let totalScheduled30 = 0;
  let totalCompleted30 = 0;
  past30Days.forEach((d) => {
    const summary = getDailySummary(d, habits, logs);
    totalScheduled30 += summary.totalActiveHabits;
    totalCompleted30 += summary.completedHabits;
  });
  const avg30DayRate =
    totalScheduled30 > 0 ? Math.round((totalCompleted30 / totalScheduled30) * 100) : 0;

  // Trend data for chart
  const trendDates = getPastDays(trendDaysRange);
  const trendData = trendDates.map((dateKey) => {
    const summary = getDailySummary(dateKey, habits, logs);
    return {
      date: dateKey,
      shortLabel: dateKey.slice(5), // MM-DD
      rate: summary.completionRate,
      completed: summary.completedHabits,
      scheduled: summary.totalActiveHabits,
    };
  });

  // Habit leaderboard sorted by completion count and current streak
  const habitLeaderboard = habits
    .map((h) => {
      const s = calculateHabitStreak(h, logs);
      return {
        habit: h,
        ...s,
      };
    })
    .sort((a, b) => b.totalCompleted - a.totalCompleted || b.currentStreak - a.currentStreak);

  // Group heatmap cells into weeks (7 days per column)
  const weeks: HeatmapCell[][] = [];
  for (let i = 0; i < heatmapCells.length; i += 7) {
    weeks.push(heatmapCells.slice(i, i + 7));
  }

  // Get color for intensity in dark mode
  const getIntensityClass = (intensity: number) => {
    switch (intensity) {
      case 4:
        return 'bg-emerald-400 shadow-sm shadow-emerald-400/40 ring-1 ring-emerald-300';
      case 3:
        return 'bg-emerald-600/80 hover:bg-emerald-500';
      case 2:
        return 'bg-emerald-800/60 hover:bg-emerald-700';
      case 1:
        return 'bg-emerald-950/80 border border-emerald-900/60 hover:bg-emerald-900';
      default:
        return 'bg-slate-900 border border-slate-800/80 hover:border-slate-700';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0">
            Analytics & Neural Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visualizing consistency, streak momentum, and behavior loops
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
          <Award className="w-4 h-4 text-violet-400" />
          <span className="text-slate-400">Current Rank:</span>
          <span className="font-bold text-violet-300">{levelInfo.title}</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Current Streak */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/20 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Current Streak
            </span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {stats.currentOverallStreak}
            </span>
            <span className="text-xs text-slate-400">days active</span>
          </div>
          <p className="text-[11px] text-amber-300/80 mt-2 font-medium">
            Personal Record: {stats.bestOverallStreak} days
          </p>
        </div>

        {/* 30-Day Completion Rate */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-950 border border-emerald-500/20 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              30-Day Consistency
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{avg30DayRate}%</span>
            <span className="text-xs text-slate-400">average rate</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{ width: `${avg30DayRate}%` }}
            />
          </div>
        </div>

        {/* Total Check-ins Done */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 via-slate-900 to-slate-950 border border-cyan-500/20 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Total Check-Ins
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {stats.totalCompletions}
            </span>
            <span className="text-xs text-slate-400">completions</span>
          </div>
          <p className="text-[11px] text-cyan-300/80 mt-2 font-medium">
            Across {habits.length} active habits
          </p>
        </div>

        {/* Total XP & Level */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/10 via-slate-900 to-slate-950 border border-violet-500/20 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
              Level & XP
            </span>
            <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">Lvl {levelInfo.level}</span>
            <span className="text-xs text-violet-400 font-mono font-bold">{stats.xp} XP</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* GitHub-Style Contribution Heatmap */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Activity Heatmap
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              14-week consistency footprint (higher green intensity = higher completion %)
            </p>
          </div>

          {/* Intensity Legend */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-slate-900 border border-slate-800" />
              <div className="w-3 h-3 rounded-sm bg-emerald-950/80 border border-emerald-900/60" />
              <div className="w-3 h-3 rounded-sm bg-emerald-800/60" />
              <div className="w-3 h-3 rounded-sm bg-emerald-600/80" />
              <div className="w-3 h-3 rounded-sm bg-emerald-400" />
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[650px]">
            {/* Weekday labels + grid */}
            <div className="flex gap-2">
              <div className="flex flex-col justify-between py-1 text-[10px] text-slate-500 font-mono">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
                <span>Sun</span>
              </div>

              <div className="flex-1 flex gap-1.5">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1.5">
                    {week.map((cell) => (
                      <div
                        key={cell.date}
                        onMouseEnter={() => setHoveredCell(cell)}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`w-3.5 h-3.5 rounded-[4px] cursor-pointer transition-transform hover:scale-125 ${getIntensityClass(
                          cell.intensity
                        )}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tooltip display */}
        <div className="mt-3 min-h-[28px] text-xs text-slate-300 flex items-center justify-between border-t border-slate-800/60 pt-3">
          {hoveredCell ? (
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white">
                {formatFriendlyDate(hoveredCell.date)}:
              </span>
              <span className="text-emerald-400 font-bold">
                {hoveredCell.completed} / {hoveredCell.totalScheduled} habits completed ({hoveredCell.completionRate}%)
              </span>
            </div>
          ) : (
            <span className="text-slate-500 italic">
              Hover over any square in the heatmap to inspect daily completion stats.
            </span>
          )}
        </div>
      </div>

      {/* Completion Trend Visualizer & Day-of-Week Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend Visualizer */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-violet-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Daily Completion Trend
                </h3>
              </div>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setTrendDaysRange(14)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    trendDaysRange === 14 ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  14 Days
                </button>
                <button
                  onClick={() => setTrendDaysRange(30)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    trendDaysRange === 30 ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  30 Days
                </button>
              </div>
            </div>

            {/* SVG Visual Bar Chart */}
            <div className="h-44 w-full flex items-end gap-1 sm:gap-2 pt-4 pb-2 border-b border-slate-800">
              {trendData.map((d) => (
                <div
                  key={d.date}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                >
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-10 bg-slate-950 text-white text-[10px] py-1 px-2 rounded-lg border border-slate-700 whitespace-nowrap z-20 shadow-xl transition-opacity">
                    {d.shortLabel}: {d.rate}% ({d.completed}/{d.scheduled})
                  </div>

                  <div
                    className="w-full rounded-t-md transition-all duration-300 group-hover:brightness-125"
                    style={{
                      height: `${Math.max(6, d.rate)}%`,
                      backgroundColor:
                        d.rate >= 80 ? '#10b981' : d.rate >= 50 ? '#8b5cf6' : d.rate > 0 ? '#f59e0b' : '#334155',
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2">
              <span>{trendData[0]?.shortLabel}</span>
              <span>Past {trendDaysRange} Days</span>
              <span>{trendData[trendData.length - 1]?.shortLabel}</span>
            </div>
          </div>
        </div>

        {/* Day-of-Week Consistency Chart */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Consistency by Day of Week
              </h3>
            </div>

            <div className="space-y-2.5">
              {dowStats.map((d) => {
                const isTopDay = Math.max(...dowStats.map((s) => s.rate)) === d.rate && d.rate > 0;
                return (
                  <div key={d.dayName} className="flex items-center gap-3 text-xs">
                    <span className="w-10 font-bold text-slate-300">{d.shortName}</span>
                    <div className="flex-1 bg-slate-950 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTopDay
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-300 shadow-sm'
                            : 'bg-violet-500/80'
                        }`}
                        style={{ width: `${d.rate}%` }}
                      />
                    </div>
                    <span
                      className={`w-12 text-right font-mono font-bold ${
                        isTopDay ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {d.rate}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 border-t border-slate-800/60 pt-3">
            💡 Highlighted bars show your highest consistency day over the last 60 days.
          </p>
        </div>
      </div>

      {/* Category Breakdown & Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-fuchsia-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Category Distribution
            </h3>
          </div>

          {categoryStats.length === 0 ? (
            <p className="text-xs text-slate-500">No category data recorded yet.</p>
          ) : (
            <div className="space-y-3.5">
              {categoryStats.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold capitalize text-slate-200">
                      {cat.category} ({cat.count} habits)
                    </span>
                    <span className="font-mono text-slate-400">
                      {cat.completed} done ({cat.rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                      style={{ width: `${cat.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Habit Consistency Leaderboard */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Habit Performance Leaderboard
            </h3>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {habitLeaderboard.map((item, idx) => (
              <div
                key={item.habit.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 text-center font-bold text-slate-500">
                    #{idx + 1}
                  </span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${item.habit.color}20`, color: item.habit.color }}
                  >
                    <IconRenderer name={item.habit.icon} className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-200 truncate">{item.habit.title}</p>
                    <p className="text-[10px] text-slate-400">Total done: {item.totalCompleted} times</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-500/20">
                    <Flame className="w-3 h-3 fill-amber-400" />
                    {item.currentStreak}d
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Smart Dopamine Insights Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-violet-400" />
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Personalized Dopamine Insights & Biohacks
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: `${insight.color}15`,
                      color: insight.color,
                      border: `1px solid ${insight.color}35`,
                    }}
                  >
                    {insight.type}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">{insight.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
