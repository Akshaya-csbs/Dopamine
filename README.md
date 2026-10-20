# ⚡ DOPAMINE — Habit Tracker & Gamified Analytics

> **Rewiring habits through momentum, visual analytics, and neuroplastic reward loops.**

**Dopamine** is a modern, high-performance habit tracking application built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**. It is designed to replace dull checkboxes with an engaging gamified system featuring streaks, levels, milestone badges, synthesized Web Audio chimes, and an analytics dashboard.

---

## 🚀 Live Local URL
When the development server is active, open:
```
http://localhost:5173/
```

---

## ✨ Key Features

### 1. 📅 Daily Habit Tracking & Check-in
- **Interactive 7-Day Carousel Strip**: Navigate between past days, today, and future schedules with one click.
- **Daily Dopamine Meter**: Real-time circular/linear progress bar showing daily completion percentage, habits finished, and status message.
- **Grouped Time-of-Day Flows**: View habits organized into **Morning Rituals 🌅**, **Afternoon Habits ☀️**, **Evening Wind Down 🌙**, or **Anytime ⚡**.
- **Counter & Numeric Habits**: Increment/decrement buttons for targets like *8 glasses of water* or *45 mins of exercise*.
- **Daily Reflection Notes**: Add context or notes to any day's habit check-in.
- **Smart Filtering & Search**: Instant real-time search and filtering by category or time of day.

### 2. 📊 Overall Analytics & Insights Dashboard
- **GitHub-Style Contribution Heatmap**: 14-week (98-day) visual activity grid with color intensity representing daily completion rates. Hover over any square to inspect details.
- **Completion Trend Visualizer**: Interactive daily completion percentage bar chart across the past 14 or 30 days.
- **Day-of-the-Week Consistency**: Compare Monday through Sunday completion rates, automatically highlighting your peak performance days.
- **Category Distribution**: Visual progress breakdown across Health, Fitness, Productivity, Mind, Learning, Creativity, and Social habits.
- **Habit Leaderboard**: Ranks habits by consistency, current active streak, and total all-time check-ins.
- **Personalized Dopamine Insights**: Biohack tips and observations highlighting your morning vs. evening patterns and streak momentum.

### 3. 🎮 Gamification & Dopamine Loops
- **XP & Leveling System**:
  - Earn **+25 XP** for every habit check-in.
  - Earn **+50 XP** for creating new habits.
  - Level titles evolve from *Curious Spark* → *Habit Novice* → *Momentum Seeker* → *Consistency Builder* → *Flow State Master* → *Dopamine Overlord*.
- **Streak Multipliers & Flame Counters**: Tracks both individual habit streaks and overall daily target streaks.
- **12+ Unlockable Badges**:
  - *The Spark* (First check-in)
  - *Momentum Ignited* (3-day streak)
  - *7-Day Warrior* (7-day streak)
  - *Habit Titan* (30-day streak)
  - *Flawless Execution* (100% completion day)
  - *Dawn Patrol* (Morning routine consistency)
  - *Century Club* (100 total completions), etc.
- **Satisfying Sound Effects**: Synthesized audio chimes and fanfares using the **Web Audio API** (100% offline, zero latency, no external audio files).
- **Celebration Confetti**: Particle confetti celebrations on completions and perfect days.

### 4. 🔒 Privacy & Cloudless Data Management
- **100% Local**: All data is saved directly in your browser's `localStorage`. No accounts, tracking, or cloud lock-in.
- **Export to JSON**: Download a full backup of all habits, completion history, XP, and settings.
- **Import from JSON**: Restore or transfer your data across devices seamlessly.
- **Instant Demo Showcase**: Built-in "Load Rich Demo History" button in Settings that instantly populates 4 weeks of realistic data to test every chart and analytics feature.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **Celebrations**: Canvas-Confetti
- **Audio**: Web Audio API Synthesizer

---

## 🏃 Getting Started

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```
