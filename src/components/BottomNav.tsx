import React from 'react';
import { Language } from '../types';
import { translations } from '../locales/translations';
import { Home, Utensils, Flame, Trophy, Heart } from 'lucide-react';

export type TabType = 'home' | 'nutrition' | 'activity' | 'quests' | 'together';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  language: Language;
  unreadTogetherBadge?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  language,
  unreadTogetherBadge,
}) => {
  const t = translations[language];

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: boolean }[] = [
    { id: 'home', label: t.nav.home, icon: <Home className="w-5 h-5" /> },
    { id: 'nutrition', label: t.nav.nutrition, icon: <Utensils className="w-5 h-5" /> },
    { id: 'activity', label: t.nav.activity, icon: <Flame className="w-5 h-5" /> },
    { id: 'quests', label: t.nav.quests, icon: <Trophy className="w-5 h-5" /> },
    {
      id: 'together',
      label: t.nav.together,
      icon: <Heart className="w-5 h-5" />,
      badge: unreadTogetherBadge,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center relative transition-all duration-150 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight truncate max-w-[56px]">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-8 h-1 rounded-full bg-emerald-500"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
