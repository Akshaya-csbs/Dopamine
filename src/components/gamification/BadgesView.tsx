import React, { useState } from 'react';
import { Trophy, Lock, CheckCircle } from 'lucide-react';
import type { Badge, UserStats } from '../../types';
import { getLevelFromXP } from '../../utils/gamification';
import { IconRenderer } from '../common/IconRenderer';

interface BadgesViewProps {
  badges: Badge[];
  stats: UserStats;
}

export const BadgesView: React.FC<BadgesViewProps> = ({ badges, stats }) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const levelInfo = getLevelFromXP(stats.xp);

  const unlockedCount = badges.filter((b) => b.progress >= 100).length;

  const filteredBadges = badges.filter((b) => {
    if (filter === 'unlocked') return b.progress >= 100;
    if (filter === 'locked') return b.progress < 100;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Gamification Level Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900/60 via-slate-900 to-fuchsia-950/50 border border-violet-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          
          {/* Level Hexagon / Emblem */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-cyan-400 p-[3px] shadow-2xl shadow-violet-500/40">
            <div className="w-full h-full bg-slate-950 rounded-[21px] flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Level</span>
              <span className="text-3xl font-black text-white">{levelInfo.level}</span>
            </div>
          </div>

          {/* Level Info & Slogan */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0">
                {levelInfo.title}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                {stats.xp} Total XP
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Each habit completion grants +25 XP. Keep your streak alive to unlock bonus multipliers and climb the ranks!
            </p>

            {/* Progress to next level */}
            <div className="space-y-1.5 pt-2 max-w-md mx-auto sm:mx-0">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Progress to Level {levelInfo.level + 1}</span>
                <span className="text-violet-300 font-mono">
                  {levelInfo.currentLevelXP} / {levelInfo.nextLevelXP} XP ({levelInfo.progress}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${levelInfo.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Filter & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">
              Trophies & Milestones
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {unlockedCount} / {badges.length} Unlocked
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Collect achievements by pushing streaks, completing volume, and achieving flawless days
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({badges.length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filter === 'unlocked'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filter === 'locked'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            In Progress ({badges.length - unlockedCount})
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          const isUnlocked = badge.progress >= 100;

          return (
            <div
              key={badge.id}
              className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                isUnlocked
                  ? 'bg-slate-900/90 border-violet-500/40 shadow-lg shadow-violet-950/20'
                  : 'bg-slate-900/40 border-slate-800/80 opacity-75 hover:opacity-100'
              }`}
            >
              {isUnlocked && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-500/20 to-transparent pointer-events-none" />
              )}

              <div className="flex items-start gap-4">
                {/* Badge Icon Emblem */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-amber-400 via-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-500/30'
                      : 'bg-slate-800 border border-slate-700 text-slate-500'
                  }`}
                >
                  {isUnlocked ? (
                    <IconRenderer name={badge.icon} className="w-6 h-6" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-500" />
                  )}
                </div>

                {/* Badge Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4
                      className={`text-sm font-bold tracking-tight truncate ${
                        isUnlocked ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {badge.title}
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                      +{badge.xpReward} XP
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {badge.description}
                  </p>

                  {/* Progress Status */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Requirement: {badge.targetRequirement}</span>
                      <span className="font-mono font-semibold text-slate-300">
                        {isUnlocked ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Unlocked
                          </span>
                        ) : (
                          `${badge.progress}%`
                        )}
                      </span>
                    </div>

                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isUnlocked
                            ? 'bg-emerald-400'
                            : 'bg-violet-500'
                        }`}
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
