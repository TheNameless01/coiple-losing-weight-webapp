import React, { useState } from 'react';
import { Language, HealthProfile } from '../types';
import { translations } from '../locales/translations';
import { api } from '../api';
import { Sparkles, ShieldAlert, Check } from 'lucide-react';

interface OnboardingModalProps {
  language: Language;
  existingProfile: HealthProfile | null;
  onClose: () => void;
  onSaved: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  language,
  existingProfile,
  onClose,
  onSaved,
}) => {
  const t = translations[language];

  const [gender, setGender] = useState<'male' | 'female'>(existingProfile?.gender || 'male');
  const [birthDate, setBirthDate] = useState<string>(existingProfile?.birthDate || '1995-06-15');
  const [heightCm, setHeightCm] = useState<string>(existingProfile?.heightCm?.toString() || '175');
  const [currentWeightKg, setCurrentWeightKg] = useState<string>(existingProfile?.currentWeightKg?.toString() || '78');
  const [targetWeightKg, setTargetWeightKg] = useState<string>(existingProfile?.targetWeightKg?.toString() || '72');
  const [activityLevel, setActivityLevel] = useState<number>(existingProfile?.activityLevel || 1.375);
  const [goalType, setGoalType] = useState<'lose' | 'maintain' | 'gain'>(existingProfile?.goalType || 'lose');
  const [paceKgPerWeek, setPaceKgPerWeek] = useState<number>(existingProfile?.paceKgPerWeek || 0.5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!heightCm || !currentWeightKg || !birthDate) {
      setError('Please fill in all required physiological metrics.');
      return;
    }

    try {
      setLoading(true);
      await api.saveHealthProfile({
        gender,
        birthDate,
        heightCm: Number(heightCm),
        currentWeightKg: Number(currentWeightKg),
        targetWeightKg: Number(targetWeightKg || currentWeightKg),
        activityLevel,
        goalType,
        paceKgPerWeek,
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save health profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Mifflin-St Jeor Engine
            </span>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold">
              ✕
            </button>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t.onboarding.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.onboarding.subtitle}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Gender */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">
              {t.onboarding.gender}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2 rounded-xl font-bold border transition ${
                  gender === 'male'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {t.onboarding.male}
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2 rounded-xl font-bold border transition ${
                  gender === 'female'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {t.onboarding.female}
              </button>
            </div>
          </div>

          {/* Birth Date & Height */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">
                {t.onboarding.birthDate}
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">
                {t.onboarding.height}
              </label>
              <input
                type="number"
                min="100"
                max="250"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="175"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Current & Target Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">
                {t.onboarding.currentWeight}
              </label>
              <input
                type="number"
                step="0.1"
                min="35"
                max="300"
                value={currentWeightKg}
                onChange={(e) => setCurrentWeightKg(e.target.value)}
                placeholder="78"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">
                {t.onboarding.targetWeight}
              </label>
              <input
                type="number"
                step="0.1"
                min="35"
                max="300"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(e.target.value)}
                placeholder="72"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">
              {t.onboarding.activityLevel}
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value={1.2}>{t.onboarding.sedentary}</option>
              <option value={1.375}>{t.onboarding.light}</option>
              <option value={1.55}>{t.onboarding.moderate}</option>
              <option value={1.725}>{t.onboarding.veryActive}</option>
            </select>
          </div>

          {/* Goal & Pace */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">
                {t.onboarding.goal}
              </label>
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="lose">{t.onboarding.lose}</option>
                <option value="maintain">{t.onboarding.maintain}</option>
                <option value="gain">{t.onboarding.gain}</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">
                {t.onboarding.pace}
              </label>
              <select
                value={paceKgPerWeek}
                onChange={(e) => setPaceKgPerWeek(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value={0.25}>{t.onboarding.mildPace}</option>
                <option value={0.5}>{t.onboarding.standardPace}</option>
                <option value={0.75}>{t.onboarding.fasterPace}</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{t.onboarding.safetyFloorNote}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow transition"
            >
              {loading ? t.common.loading : t.onboarding.calculateBtn}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              {t.common.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
