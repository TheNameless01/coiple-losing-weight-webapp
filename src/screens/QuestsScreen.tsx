import React, { useState } from 'react';
import { Language, GamificationState, QuestItem, AchievementItem } from '../types';
import { translations } from '../locales/translations';
import {
  Trophy,
  Sparkles,
  CheckCircle2,
  Lock,
  UtensilsCrossed,
  Droplets,
  Flame,
  HeartHandshake,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuestsScreenProps {
  language: Language;
  gamification: GamificationState;
  quests: QuestItem[];
  achievements: AchievementItem[];
  onRefreshData: () => void;
}

export const QuestsScreen: React.FC<QuestsScreenProps> = ({
  language,
  gamification,
  quests,
  achievements,
  onRefreshData,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'daily' | 'couple' | 'achievements'>('daily');

  const filteredQuests = quests.filter((q) => {
    if (activeTab === 'daily') return q.type === 'daily' || q.type === 'weekly';
    if (activeTab === 'couple') return q.type === 'couple';
    return true;
  });

  const getAchievementIcon = (iconName: string) => {
    if (iconName === 'UtensilsCrossed') return <UtensilsCrossed className="w-5 h-5 text-emerald-500" />;
    if (iconName === 'Droplets') return <Droplets className="w-5 h-5 text-blue-500" />;
    if (iconName === 'Flame') return <Flame className="w-5 h-5 text-amber-500" />;
    if (iconName === 'HeartHandshake') return <HeartHandshake className="w-5 h-5 text-rose-500" />;
    return <Zap className="w-5 h-5 text-teal-500" />;
  };

  const fireCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {}
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          <span>{t.quests.title}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t.quests.subtitle}
        </p>
      </div>

      {/* Gamification Level Hero */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-extrabold text-2xl shadow-inner">
              {gamification.currentLevel}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
                  {t.home.level} {gamification.currentLevel}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                  {gamification.unlockedTitles?.[0] || 'Wellness Novice'}
                </span>
              </div>
              <h2 className="text-2xl font-black mt-0.5">
                {gamification.totalXp} <span className="text-sm font-semibold text-emerald-100">Total XP</span>
              </h2>
            </div>
          </div>

          <div className="text-left sm:text-right rtl:text-right rtl:sm:text-left text-xs text-emerald-100">
            <span className="font-semibold">{gamification.progressPct}% to Level {gamification.currentLevel + 1}</span>
            <p className="text-[11px] text-emerald-200/80 mt-0.5">
              {t.quests.nextLevelIn}: {gamification.nextLevelXp - gamification.totalXp} XP
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-300 to-yellow-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${gamification.progressPct}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'daily'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {t.quests.dailyQuests}
        </button>
        <button
          onClick={() => setActiveTab('couple')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'couple'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {t.quests.coupleQuests}
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'achievements'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {t.quests.achievementsTitle}
        </button>
      </div>

      {/* Quests List View */}
      {activeTab !== 'achievements' ? (
        <div className="space-y-3">
          {filteredQuests.map((quest) => {
            const title = language === 'ar' ? quest.titleAr : language === 'fr' ? quest.titleFr : quest.titleEn;
            const desc = language === 'ar' ? quest.descAr : language === 'fr' ? quest.descFr : quest.descEn;
            const progress = Math.min(100, Math.round((quest.currentCount / quest.targetCount) * 100));

            return (
              <div
                key={quest.id}
                className={`rounded-3xl p-5 border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  quest.completed
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-sm'
                    : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      quest.completed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                    }`}
                  >
                    {quest.completed ? '✓' : '•'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {title}
                      </h3>
                      {quest.completed && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                          {t.quests.completed}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {desc}
                    </p>

                    {/* Progress indicator */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-32 bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {quest.currentCount} / {quest.targetCount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-700">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    +{quest.xpReward} XP
                  </span>

                  {quest.completed && (
                    <button
                      onClick={fireCelebration}
                      className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300"
                      title="Celebrate!"
                    >
                      🎉
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Achievements Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {achievements.map((ach) => {
            const title = language === 'ar' ? ach.titleAr : language === 'fr' ? ach.titleFr : ach.titleEn;
            const desc = language === 'ar' ? ach.descAr : language === 'fr' ? ach.descFr : ach.descEn;

            return (
              <div
                key={ach.id}
                className={`rounded-3xl p-5 border transition flex items-start gap-4 ${
                  ach.unlocked
                    ? 'bg-white dark:bg-slate-800/90 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    ach.unlocked
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {ach.unlocked ? (
                    getAchievementIcon(ach.badgeIcon)
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {title}
                    </h4>
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      +{ach.xpReward} XP
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {desc}
                  </p>
                  {ach.unlocked && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-2">
                      ✓ Unlocked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
