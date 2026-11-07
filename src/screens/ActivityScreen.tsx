import React, { useState, useEffect } from 'react';
import { Language, HabitItem, ActivityRecord, WellnessRecord } from '../types';
import { translations } from '../locales/translations';
import { api } from '../api';
import {
  Flame,
  Droplets,
  CheckCircle2,
  Moon,
  Smile,
  Zap,
  Plus,
  Clock,
  Dumbbell,
  Footprints,
  Bike,
  Sparkles,
} from 'lucide-react';

interface ActivityScreenProps {
  language: Language;
  waterTotalMl: number;
  waterTargetMl: number;
  onRefreshData: () => void;
}

export const ActivityScreen: React.FC<ActivityScreenProps> = ({
  language,
  waterTotalMl,
  waterTargetMl,
  onRefreshData,
}) => {
  const t = translations[language];
  const today = new Date().toISOString().split('T')[0];

  // Water State
  const [customWater, setCustomWater] = useState('');

  // Activity Log State
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityType, setActivityType] = useState<'walk' | 'run' | 'cycle' | 'strength' | 'yoga' | 'swimming' | 'other'>('walk');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [notes, setNotes] = useState('');

  // Habits State
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [completedHabitIds, setCompletedHabitIds] = useState<string[]>([]);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [showAddHabit, setShowAddHabit] = useState(false);

  // Wellness Check-In State
  const [wellnessLog, setWellnessLog] = useState<WellnessRecord | null>(null);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [sleepQuality, setSleepQuality] = useState<number>(4);
  const [mood, setMood] = useState<number>(4);
  const [energy, setEnergy] = useState<number>(4);

  const loadData = async () => {
    try {
      const actRes = await api.getActivityLogs();
      setActivities(actRes.entries || []);

      const habitRes = await api.getHabits(today);
      setHabits(habitRes.habits || []);
      setCompletedHabitIds(habitRes.completedHabitIds || []);

      const wellRes = await api.getWellness(today);
      if (wellRes.log) {
        setWellnessLog(wellRes.log);
        setSleepHours(wellRes.log.sleepHours || 7.5);
        setSleepQuality(wellRes.log.sleepQuality || 4);
        setMood(wellRes.log.mood || 4);
        setEnergy(wellRes.log.energyLevel || 4);
      }
    } catch (err) {
      console.error('Failed to load activity data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddWater = async (amount: number) => {
    try {
      await api.addWater(amount, today);
      setCustomWater('');
      onRefreshData();
    } catch (err) {
      console.error('Failed to log water', err);
    }
  };

  const handleLogActivity = async () => {
    if (!duration) return;
    try {
      await api.addActivityLog({
        activityType,
        durationMinutes: Number(duration),
        distanceKm: distance ? Number(distance) : undefined,
        notes: notes || undefined,
      });
      setShowActivityModal(false);
      setDuration('');
      setDistance('');
      setNotes('');
      loadData();
      onRefreshData();
    } catch (err) {
      console.error('Failed to record activity', err);
    }
  };

  const handleToggleHabit = async (habitId: string) => {
    try {
      await api.toggleHabit(habitId, today);
      setCompletedHabitIds((prev) =>
        prev.includes(habitId) ? prev.filter((id) => id !== habitId) : [...prev, habitId]
      );
      onRefreshData();
    } catch (err) {
      console.error('Failed to toggle habit', err);
    }
  };

  const handleCreateHabit = async () => {
    if (!newHabitTitle) return;
    try {
      await api.addHabit({
        title: newHabitTitle,
        titleFr: newHabitTitle,
        titleAr: newHabitTitle,
      });
      setNewHabitTitle('');
      setShowAddHabit(false);
      loadData();
    } catch (err) {
      console.error('Failed to create habit', err);
    }
  };

  const handleSaveWellness = async () => {
    try {
      const res = await api.saveWellness({
        date: today,
        sleepHours,
        sleepQuality,
        mood,
        energyLevel: energy,
      });
      setWellnessLog(res.log);
      onRefreshData();
    } catch (err) {
      console.error('Failed to save wellness log', err);
    }
  };

  const waterPct = Math.min(100, Math.round((waterTotalMl / (waterTargetMl || 2500)) * 100));

  const getActivityIcon = (type: string) => {
    if (type === 'walk') return <Footprints className="w-4 h-4 text-emerald-500" />;
    if (type === 'run') return <Flame className="w-4 h-4 text-amber-500" />;
    if (type === 'cycle') return <Bike className="w-4 h-4 text-blue-500" />;
    return <Dumbbell className="w-4 h-4 text-purple-500" />;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Flame className="w-6 h-6 text-amber-500" />
          <span>{t.activity.title}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t.activity.subtitle}
        </p>
      </div>

      {/* Water Hydration Card */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-blue-900/90 via-slate-900 to-slate-900 text-white shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
              <Droplets className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                {t.activity.waterTracker}
              </span>
              <h2 className="text-2xl font-extrabold mt-0.5">
                {waterTotalMl} <span className="text-sm font-normal text-blue-200">/ {waterTargetMl} ml</span>
              </h2>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2">
            {[250, 500, 750].map((ml) => (
              <button
                key={ml}
                onClick={() => handleAddWater(ml)}
                className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-xs font-bold text-blue-200 transition"
              >
                +{ml}ml
              </button>
            ))}

            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={customWater}
                onChange={(e) => setCustomWater(e.target.value)}
                placeholder="ml"
                className="w-20 px-2 py-1 text-xs text-center rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400"
              />
              <button
                onClick={() => customWater && handleAddWater(Number(customWater))}
                className="px-3 py-1 text-xs font-bold rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${waterPct}%` }}
            ></div>
          </div>
          <span className="text-[11px] text-blue-300 font-semibold mt-1.5 block text-right rtl:text-left">
            {waterPct}% completed today
          </span>
        </div>
      </div>

      {/* Row 2: Workout Sessions & Daily Habits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Workouts Card */}
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t.activity.logWorkout}
                </h3>
              </div>
              <button
                onClick={() => setShowActivityModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.activity.logWorkout}</span>
              </button>
            </div>

            {/* List of recent workouts */}
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                No active workouts recorded yet today. Keep moving together!
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-48 overflow-y-auto">
                {activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700">
                        {getActivityIcon(act.activityType)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white capitalize">
                          {act.activityType}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {act.durationMinutes} min {act.distanceKm ? `• ${act.distanceKm} km` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ~{act.estimatedCalories} kcal
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Habits Checklist Card */}
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t.activity.habitsTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowAddHabit(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.activity.addHabit}</span>
              </button>
            </div>

            {/* Habit creation inline form */}
            {showAddHabit && (
              <div className="mb-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <input
                  type="text"
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="e.g. 10-min evening stretch / No phone before sleep"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateHabit}
                    className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowAddHabit(false)}
                    className="px-3 py-1 text-xs rounded-lg text-slate-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Habit Checkboxes */}
            <div className="space-y-2">
              {habits.map((h) => {
                const isCompleted = completedHabitIds.includes(h.id);
                const title = language === 'ar' ? h.titleAr : language === 'fr' ? h.titleFr : h.title;
                return (
                  <div
                    key={h.id}
                    onClick={() => handleToggleHabit(h.id)}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold ${
                        isCompleted
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {title}
                    </span>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs transition ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'border border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isCompleted && '✓'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Wellness Check-In Card */}
      <div className="rounded-3xl p-6 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t.activity.wellnessCheckin}
            </h3>
          </div>
          {wellnessLog && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Saved for today
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              {t.activity.sleepDuration} ({sleepHours}h)
            </label>
            <input
              type="range"
              min="4"
              max="12"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              {t.activity.sleepQuality} ({sleepQuality}/5)
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={sleepQuality}
              onChange={(e) => setSleepQuality(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              {t.activity.mood} ({mood}/5)
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              {t.activity.energy} ({energy}/5)
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveWellness}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
          >
            {t.activity.saveWellness}
          </button>
        </div>
      </div>

      {/* Record Workout Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t.activity.logWorkout}
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                {t.activity.workoutType}
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white capitalize"
              >
                <option value="walk">Walk / Fast Pace</option>
                <option value="run">Running / Jogging</option>
                <option value="cycle">Outdoor / Stationary Cycling</option>
                <option value="strength">Strength / Resistance Training</option>
                <option value="yoga">Yoga / Mobility</option>
                <option value="swimming">Swimming</option>
                <option value="other">Other Movement</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  {t.activity.durationMinutes} *
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  {t.activity.distanceKm}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="e.g. 3.5"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                {t.activity.notes}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did you and your partner feel?"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleLogActivity}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition"
              >
                {t.activity.saveActivity}
              </button>
              <button
                onClick={() => setShowActivityModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
