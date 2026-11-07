import React from 'react';
import { Language, User, HealthProfile, GamificationState, QuestItem } from '../types';
import { translations } from '../locales/translations';
import {
  Flame,
  Droplets,
  Scale,
  Sparkles,
  Trophy,
  Heart,
  Plus,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface HomeScreenProps {
  language: Language;
  user: User;
  healthProfile: HealthProfile | null;
  gamification: GamificationState;
  dailyTotals: { calories: number; protein: number; carbs: number; fat: number };
  waterTotalMl: number;
  waterTargetMl: number;
  quests: QuestItem[];
  partner: any | null;
  weightTrend: { weight: number; trend: number } | null;
  onOpenLogMeal: () => void;
  onQuickAddWater: (ml: number) => void;
  onOpenLogWeight: () => void;
  onOpenLogActivity: () => void;
  onNavigateTab: (tab: any) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  language,
  user,
  healthProfile,
  gamification,
  dailyTotals,
  waterTotalMl,
  waterTargetMl,
  quests,
  partner,
  weightTrend,
  onOpenLogMeal,
  onQuickAddWater,
  onOpenLogWeight,
  onOpenLogActivity,
  onNavigateTab,
}) => {
  const t = translations[language];

  // Target values from health profile or default safe estimates
  const targetCalories = healthProfile?.targetCalories || 2000;
  const targetProtein = healthProfile?.targetProteinG || 140;
  const targetCarbs = healthProfile?.targetCarbsG || 220;
  const targetFat = healthProfile?.targetFatG || 65;

  const remainingCalories = Math.max(0, targetCalories - dailyTotals.calories);
  const caloriePct = Math.min(100, Math.round((dailyTotals.calories / targetCalories) * 100));

  const proteinPct = Math.min(100, Math.round((dailyTotals.protein / targetProtein) * 100));
  const carbsPct = Math.min(100, Math.round((dailyTotals.carbs / targetCarbs) * 100));
  const fatPct = Math.min(100, Math.round((dailyTotals.fat / targetFat) * 100));

  const waterPct = Math.min(100, Math.round((waterTotalMl / (waterTargetMl || 2500)) * 100));

  const todayStr = new Intl.DateTimeFormat(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6 pb-20">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            {todayStr}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t.home.greeting}, {user.displayName}! 👋
          </h1>
        </div>

        {/* Level & XP Chip */}
        <div
          onClick={() => onNavigateTab('quests')}
          className="cursor-pointer self-start sm:self-auto flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 hover:border-emerald-500/60 transition"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {gamification.currentLevel}
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
              <span>{gamification.unlockedTitles?.[0] || 'Wellness Novice'}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {gamification.totalXp} XP • {gamification.progressPct}% to Lvl {gamification.currentLevel + 1}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Calorie Card */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl shadow-slate-950/20 border border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Flame className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              {t.home.dailySummary}
            </h2>
          </div>
          <button
            onClick={onOpenLogMeal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.home.quickLogMeal}</span>
          </button>
        </div>

        {/* Calories Counter Grid */}
        <div className="grid grid-cols-3 gap-3 text-center my-4">
          <div className="rounded-2xl p-3 bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">{t.home.target}</span>
            <p className="text-xl sm:text-2xl font-extrabold mt-0.5">{targetCalories}</p>
            <span className="text-[10px] text-slate-400">kcal</span>
          </div>
          <div className="rounded-2xl p-3 bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-sm">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase">{t.home.consumed}</span>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-0.5">{dailyTotals.calories}</p>
            <span className="text-[10px] text-emerald-300/80">kcal</span>
          </div>
          <div className="rounded-2xl p-3 bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">{t.home.remaining}</span>
            <p className="text-xl sm:text-2xl font-extrabold text-teal-300 mt-0.5">{remainingCalories}</p>
            <span className="text-[10px] text-slate-400">kcal</span>
          </div>
        </div>

        {/* Calorie Progress Bar */}
        <div className="mt-2 mb-4">
          <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${caloriePct}%` }}
            ></div>
          </div>
        </div>

        {/* Macronutrient Splits */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-blue-400">{t.home.protein}</span>
              <span>{dailyTotals.protein}/{targetProtein}g</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-400 h-full rounded-full" style={{ width: `${proteinPct}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-amber-400">{t.home.carbs}</span>
              <span>{dailyTotals.carbs}/{targetCarbs}g</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: `${carbsPct}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-rose-400">{t.home.fat}</span>
              <span>{dailyTotals.fat}/{targetFat}g</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-rose-400 h-full rounded-full" style={{ width: `${fatPct}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Hydration & Weight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hydration Widget */}
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm transition">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t.home.water}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {waterTotalMl} / {waterTargetMl} ml ({waterPct}%)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onQuickAddWater(250)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
              >
                +250ml
              </button>
              <button
                onClick={() => onQuickAddWater(500)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                +500ml
              </button>
            </div>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${waterPct}%` }}
            ></div>
          </div>
        </div>

        {/* Weight & Trend Widget */}
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm transition">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t.home.weight}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {weightTrend?.weight ? `${weightTrend.weight} kg` : (healthProfile?.currentWeightKg ? `${healthProfile.currentWeightKg} kg` : '—')}
                  </span>
                  {weightTrend?.trend && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1 font-medium">
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                      Trend: {weightTrend.trend} kg
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onOpenLogWeight}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition"
            >
              {t.home.quickLogWeight}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Target goal: {healthProfile?.targetWeightKg || '—'} kg • Safe healthy rate: ~{healthProfile?.paceKgPerWeek || 0.5} kg/wk
          </p>
        </div>
      </div>

      {/* Partner Preview & Couple Synergy Card */}
      {partner && (
        <div
          onClick={() => onNavigateTab('together')}
          className="rounded-3xl p-5 bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-emerald-500/10 border border-rose-300/40 dark:border-rose-900/40 shadow-sm cursor-pointer hover:shadow-md transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={partner.avatarUrl}
                alt={partner.displayName}
                className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow"
              />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px] font-bold">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {partner.displayName}
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Lvl {partner.level || 1}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Active partner • Together we grow stronger and healthier every day.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>Together Space</span>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </div>
        </div>
      )}

      {/* Daily Quests Quick Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t.home.dailyQuests}
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('quests')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {t.home.viewAllQuests} →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quests.slice(0, 4).map((q) => {
            const title = language === 'ar' ? q.titleAr : language === 'fr' ? q.titleFr : q.titleEn;
            const desc = language === 'ar' ? q.descAr : language === 'fr' ? q.descFr : q.descEn;
            return (
              <div
                key={q.id}
                className={`rounded-2xl p-3.5 border transition flex items-center justify-between gap-3 ${
                  q.completed
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      q.completed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {q.completed ? '✓' : '•'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {desc}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                  +{q.xpReward} XP
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
