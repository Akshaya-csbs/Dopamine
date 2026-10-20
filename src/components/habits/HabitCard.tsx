import React, { useState } from 'react';
import {
  Check,
  Flame,
  MoreVertical,
  Edit2,
  Trash2,
  MessageSquare,
  Plus,
  Minus,
  Sunrise,
  Sun,
  Moon,
  Clock,
} from 'lucide-react';
import type { Habit, HabitLog } from '../../types';
import { IconRenderer } from '../common/IconRenderer';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  streak: number;
  bestStreak: number;
  onToggleComplete: (habitId: string, completed: boolean, value?: number) => void;
  onUpdateValue: (habitId: string, newValue: number) => void;
  onSaveNote: (habitId: string, note: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  isToday: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  log,
  streak,
  onToggleComplete,
  onUpdateValue,
  onSaveNote,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(log?.note || '');

  const isCompleted = log?.completed || false;
  const currentValue = log?.currentValue ?? (isCompleted ? habit.targetValue : 0);
  const hasCounter = habit.targetValue > 1;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasCounter && !isCompleted && currentValue < habit.targetValue) {
      // If it's a counter, clicking complete fills to max
      onToggleComplete(habit.id, true, habit.targetValue);
    } else {
      onToggleComplete(habit.id, !isCompleted, !isCompleted ? habit.targetValue : 0);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = Math.min(habit.targetValue, currentValue + 1);
    onUpdateValue(habit.id, nextVal);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = Math.max(0, currentValue - 1);
    onUpdateValue(habit.id, nextVal);
  };

  const handleSaveNote = () => {
    onSaveNote(habit.id, noteText);
    setIsEditingNote(false);
  };

  const getTimeIcon = () => {
    switch (habit.timeOfDay) {
      case 'morning':
        return <Sunrise className="w-3.5 h-3.5 text-amber-400" />;
      case 'afternoon':
        return <Sun className="w-3.5 h-3.5 text-yellow-400" />;
      case 'evening':
        return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const progressPercent = hasCounter
    ? Math.min(100, Math.round((currentValue / habit.targetValue) * 100))
    : isCompleted
    ? 100
    : 0;

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-300 p-4 sm:p-5 ${
        isCompleted
          ? 'bg-slate-900/90 border-slate-700/80 shadow-md shadow-violet-950/20'
          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/90 hover:bg-slate-900/60'
      }`}
    >
      {/* Category Accent top bar */}
      <div
        className="absolute top-0 left-6 right-6 h-[2px] rounded-t-full transition-opacity opacity-40 group-hover:opacity-100"
        style={{ backgroundColor: habit.color }}
      />

      <div className="flex items-start gap-3.5 sm:gap-4">
        {/* Habit Checkmark Button */}
        <button
          onClick={handleCheckboxClick}
          aria-label={`Mark ${habit.title} as ${isCompleted ? 'incomplete' : 'completed'}`}
          className={`flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-300 transform active:scale-90 ${
            isCompleted
              ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/30'
              : 'border-2 border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800 text-transparent'
          }`}
        >
          <Check className={`w-6 h-6 stroke-[3] transition-all duration-200 ${isCompleted ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`} />
        </button>

        {/* Habit Body Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {/* Category Pill */}
            <span
              className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1"
              style={{
                backgroundColor: `${habit.color}15`,
                color: habit.color,
                border: `1px solid ${habit.color}35`,
              }}
            >
              <IconRenderer name={habit.icon} className="w-3 h-3" />
              {habit.category}
            </span>

            {/* Time of Day */}
            <span className="text-[11px] font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              {getTimeIcon()}
              <span className="capitalize">{habit.timeOfDay}</span>
            </span>

            {/* Streak Flame */}
            {streak > 0 && (
              <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-sm shadow-amber-500/5">
                <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                {streak} {streak === 1 ? 'day' : 'days'}
              </span>
            )}
          </div>

          <h3
            className={`text-base sm:text-lg font-bold tracking-tight transition-all truncate ${
              isCompleted ? 'line-through text-slate-400 decoration-slate-600' : 'text-slate-100'
            }`}
          >
            {habit.title}
          </h3>

          {habit.description && (
            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{habit.description}</p>
          )}

          {/* Counter widget if habit has targetValue > 1 */}
          {hasCounter && (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800">
                <button
                  onClick={handleDecrement}
                  disabled={currentValue <= 0}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Decrease counter"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono font-bold text-slate-200 px-1 min-w-[36px] text-center">
                  {currentValue} / {habit.targetValue}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={currentValue >= habit.targetValue}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Increase counter"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="flex-1 bg-slate-800/80 h-2 rounded-full overflow-hidden max-w-[120px]">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: habit.color,
                  }}
                />
              </div>

              <span className="text-xs font-medium text-slate-400">
                {habit.unit}
              </span>
            </div>
          )}

          {/* Day Note Display */}
          {log?.note && !isEditingNote && (
            <div
              onClick={() => setIsEditingNote(true)}
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
            >
              <MessageSquare className="w-3 h-3 text-violet-400" />
              <span className="italic">"{log.note}"</span>
            </div>
          )}

          {/* Note Input Drawer */}
          {isEditingNote && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a quick note or reflection..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveNote()}
              />
              <button
                onClick={handleSaveNote}
                className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingNote(false)}
                className="px-2 py-1 text-slate-400 hover:text-slate-200 text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Action Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors"
            aria-label="Habit options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-30 w-44 bg-slate-900 border border-slate-700/80 rounded-xl shadow-xl py-1 text-xs">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setIsEditingNote(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-slate-100 text-left"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                  {log?.note ? 'Edit Note' : 'Add Note'}
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(habit);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-slate-100 text-left"
                >
                  <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                  Edit Habit
                </button>
                <div className="border-t border-slate-800 my-1" />
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(habit.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Habit
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
