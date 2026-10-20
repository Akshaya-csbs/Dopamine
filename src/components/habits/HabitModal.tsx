import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import type { Habit, HabitCategory, HabitPriority, TimeOfDay } from '../../types';
import { IconRenderer, AVAILABLE_ICONS } from '../common/IconRenderer';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Partial<Habit>) => void;
  initialHabit?: Habit | null;
}

const COLOR_PRESETS = [
  '#8b5cf6', // Violet
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#f43f5e', // Rose
  '#a855f7', // Purple
];

const CATEGORIES: { id: HabitCategory; label: string; icon: string }[] = [
  { id: 'health', label: 'Health', icon: 'Droplets' },
  { id: 'fitness', label: 'Fitness', icon: 'Dumbbell' },
  { id: 'mind', label: 'Mind', icon: 'Moon' },
  { id: 'productivity', label: 'Productivity', icon: 'Brain' },
  { id: 'learning', label: 'Learning', icon: 'BookOpen' },
  { id: 'creativity', label: 'Creativity', icon: 'Sparkles' },
  { id: 'social', label: 'Social', icon: 'Heart' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialHabit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('health');
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [icon, setIcon] = useState('Sparkles');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [freqType, setFreqType] = useState<'daily' | 'weekly_days'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // default Mon-Fri
  const [targetValue, setTargetValue] = useState<number>(1);
  const [unit, setUnit] = useState<string>('time');
  const [priority, setPriority] = useState<HabitPriority>('medium');

  useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title);
      setDescription(initialHabit.description || '');
      setCategory(initialHabit.category);
      setColor(initialHabit.color);
      setIcon(initialHabit.icon);
      setTimeOfDay(initialHabit.timeOfDay);
      setFreqType(initialHabit.frequency.type);
      setSelectedDays(initialHabit.frequency.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]);
      setTargetValue(initialHabit.targetValue);
      setUnit(initialHabit.unit);
      setPriority(initialHabit.priority);
    } else {
      // Reset for new habit
      setTitle('');
      setDescription('');
      setCategory('health');
      setColor(COLOR_PRESETS[0]);
      setIcon('Sparkles');
      setTimeOfDay('morning');
      setFreqType('daily');
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
      setTargetValue(1);
      setUnit('time');
      setPriority('medium');
    }
  }, [initialHabit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      color,
      icon,
      timeOfDay,
      frequency: {
        type: freqType,
        daysOfWeek: freqType === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : selectedDays,
      },
      targetValue: Math.max(1, targetValue),
      unit: unit.trim() || 'time',
      priority,
    });
    onClose();
  };

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayIndex));
      }
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Accent Bar */}
        <div className="h-1.5 w-full transition-colors" style={{ backgroundColor: color }} />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: `${color}25`, color }}
            >
              <IconRenderer name={icon} className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {initialHabit ? 'Edit Habit' : 'Create New Habit'}
              </h2>
              <p className="text-xs text-slate-400">Design your dopamine feedback loop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Habit Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning Sunlight, 90m Deep Work, Read 15 Pages"
              className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Description / Cue (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why this habit matters or what triggers it"
              className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Category Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Life Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    category === cat.id
                      ? 'bg-violet-600/20 border-violet-500 text-violet-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <IconRenderer name={cat.icon} className="w-3.5 h-3.5" />
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Icon and Color Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Accent Color
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PRESETS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-lg transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Time of Day */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Time of Day
              </label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none capitalize"
              >
                <option value="morning">Morning (Wake up - 12 PM)</option>
                <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                <option value="evening">Evening (5 PM - Sleep)</option>
                <option value="anytime">Anytime during day</option>
              </select>
            </div>
          </div>

          {/* Icon Selector list */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select Icon
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`p-2.5 rounded-xl border flex-shrink-0 transition-all ${
                    icon === ic
                      ? 'bg-violet-600 text-white border-violet-500 scale-110 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <IconRenderer name={ic} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Frequency & Target */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Frequency
              </label>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setFreqType('daily')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    freqType === 'daily'
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Daily
                </button>
                <button
                  type="button"
                  onClick={() => setFreqType('weekly_days')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    freqType === 'weekly_days'
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Custom Days
                </button>
              </div>
            </div>

            {freqType === 'weekly_days' && (
              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {DAYS.map((dayName, idx) => {
                  const active = selectedDays.includes(idx);
                  return (
                    <button
                      type="button"
                      key={dayName}
                      onClick={() => toggleDay(idx)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        active
                          ? 'bg-violet-600/30 border border-violet-500 text-violet-300'
                          : 'bg-slate-950 border border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {dayName}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Target Value & Unit */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Target Count</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={targetValue}
                  onChange={(e) => setTargetValue(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Unit Label</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="time, mins, glasses, pages"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              {initialHabit ? 'Save Changes' : 'Create Habit (+50 XP)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
