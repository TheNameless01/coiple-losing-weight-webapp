import React, { useState, useEffect } from 'react';
import {
  Language,
  Theme,
  User,
  CoupleSummary,
  HealthProfile,
  GamificationState,
  QuestItem,
  AchievementItem,
  NotificationItem,
} from './types';
import { api, getAuthToken, setAuthToken } from './api';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { OfflineBanner } from './components/OfflineBanner';
import { HomeScreen } from './screens/HomeScreen';
import { NutritionScreen } from './screens/NutritionScreen';
import { ActivityScreen } from './screens/ActivityScreen';
import { QuestsScreen } from './screens/QuestsScreen';
import { TogetherScreen } from './screens/TogetherScreen';
import { OnboardingModal } from './screens/OnboardingModal';
import { AuthModal } from './screens/AuthModal';
import { SettingsModal } from './screens/SettingsModal';
import { NotificationsModal } from './screens/NotificationsModal';

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('couplefit_lang') as Language) || 'en';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('couplefit_theme') as Theme) || 'dark';
  });

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [user, setUser] = useState<User | null>(null);
  const [couple, setCouple] = useState<CoupleSummary | null>(null);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [gamification, setGamification] = useState<GamificationState>({
    userId: '',
    totalXp: 0,
    currentLevel: 1,
    unlockedTitles: ['Wellness Novice'],
    nextLevelXp: 150,
    progressPct: 0,
  });

  const [dailyTotals, setDailyTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [waterTotalMl, setWaterTotalMl] = useState<number>(0);
  const [waterTargetMl, setWaterTargetMl] = useState<number>(2500);
  const [weightTrend, setWeightTrend] = useState<{ weight: number; trend: number } | null>(null);
  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogMealModal, setShowLogMealModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync RTL and lang attribute
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('couplefit_lang', language);
  }, [language]);

  // Sync Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('couplefit_theme', theme);
  }, [theme]);

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration note:', err);
      });
    }
  }, []);

  const refreshUserData = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const meRes = await api.getMe();
      setUser({
        id: meRes.user.id,
        email: meRes.user.email,
        displayName: meRes.profile?.displayName || 'Partner',
      });
      setCouple(meRes.couple || null);
      setHealthProfile(meRes.healthProfile || null);
      if (meRes.gamification) {
        setGamification(meRes.gamification);
      }

      // If user has never completed health onboarding, prompt gently
      if (!meRes.healthProfile) {
        setShowOnboarding(true);
      }

      // Load today's totals
      const today = new Date().toISOString().split('T')[0];
      const [diaryRes, waterRes, questsRes, gameRes, notifRes, weightRes] = await Promise.all([
        api.getDiary(today).catch(() => ({ totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } })),
        api.getWater(today).catch(() => ({ totalMl: 0, targetMl: 2500 })),
        api.getQuests().catch(() => ({ quests: [] })),
        api.getGamification().catch(() => ({ gamification: null, achievements: [] })),
        api.getNotifications().catch(() => ({ notifications: [] })),
        api.getWeights().catch(() => ({ entries: [], trend: [] })),
      ]);

      setDailyTotals(diaryRes.totals);
      setWaterTotalMl(waterRes.totalMl);
      setWaterTargetMl(waterRes.targetMl || 2500);
      setQuests(questsRes.quests || []);
      if (gameRes.gamification) setGamification(gameRes.gamification);
      setAchievements(gameRes.achievements || []);
      setNotifications(notifRes.notifications || []);

      if (weightRes.trend && weightRes.trend.length > 0) {
        const last = weightRes.trend[weightRes.trend.length - 1];
        setWeightTrend({ weight: last.weight, trend: last.trend });
      }
    } catch (err) {
      console.error('Session expired or error refreshing data', err);
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {}
    setAuthToken(null);
    setUser(null);
    setCouple(null);
    setHealthProfile(null);
  };

  const handleQuickAddWater = async (ml: number) => {
    try {
      await api.addWater(ml);
      setWaterTotalMl((prev) => prev + ml);
      refreshUserData();
    } catch (err) {
      console.error('Failed to log water', err);
    }
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center animate-pulse mb-3">
          ❤️
        </div>
        <p className="text-sm font-semibold tracking-wide">Loading CoupleFit...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthModal
        language={language}
        onSuccess={() => {
          refreshUserData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <OfflineBanner />

      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        partner={couple?.partner || null}
        unreadNotificationsCount={unreadNotifsCount}
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenTogether={() => setActiveTab('together')}
        user={user}
      />

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 pt-6 pb-24">
        {activeTab === 'home' && (
          <HomeScreen
            language={language}
            user={user}
            healthProfile={healthProfile}
            gamification={gamification}
            dailyTotals={dailyTotals}
            waterTotalMl={waterTotalMl}
            waterTargetMl={waterTargetMl}
            quests={quests}
            partner={couple?.partner || null}
            weightTrend={weightTrend}
            onOpenLogMeal={() => setActiveTab('nutrition')}
            onQuickAddWater={handleQuickAddWater}
            onOpenLogWeight={() => setShowOnboarding(true)}
            onOpenLogActivity={() => setActiveTab('activity')}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionScreen
            language={language}
            healthProfile={healthProfile}
            onRefreshData={refreshUserData}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityScreen
            language={language}
            waterTotalMl={waterTotalMl}
            waterTargetMl={waterTargetMl}
            onRefreshData={refreshUserData}
          />
        )}

        {activeTab === 'quests' && (
          <QuestsScreen
            language={language}
            gamification={gamification}
            quests={quests}
            achievements={achievements}
            onRefreshData={refreshUserData}
          />
        )}

        {activeTab === 'together' && (
          <TogetherScreen
            language={language}
            user={user}
            couple={couple}
            onOpenSettings={() => setShowSettings(true)}
            onRefreshData={refreshUserData}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        language={language}
      />

      {/* Modals */}
      {showOnboarding && (
        <OnboardingModal
          language={language}
          existingProfile={healthProfile}
          onClose={() => setShowOnboarding(false)}
          onSaved={refreshUserData}
        />
      )}

      {showSettings && (
        <SettingsModal
          language={language}
          onLanguageChange={setLanguage}
          theme={theme}
          onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          couple={couple}
          onOpenOnboarding={() => setShowOnboarding(true)}
          onClose={() => setShowSettings(false)}
          onLogout={handleLogout}
          onSwitchedUser={refreshUserData}
        />
      )}

      {showNotifications && (
        <NotificationsModal
          language={language}
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onRefresh={refreshUserData}
        />
      )}
    </div>
  );
}
