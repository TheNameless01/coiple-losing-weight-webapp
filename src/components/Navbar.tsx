import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language, Theme } from '../types';
import { translations } from '../locales/translations';
import {
  Heart,
  Download,
  Moon,
  Sun,
  Globe,
  Bell,
  Settings,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
  onThemeToggle: () => void;
  partner: any | null;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenTogether: () => void;
  user: any;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  partner,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenSettings,
  onOpenTogether,
  user,
}) => {
  const t = translations[language];
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                {t.app.name}
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Couples
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              {t.app.tagline}
            </p>
          </div>
        </div>

        {/* Center: Partner Status */}
        {partner ? (
          <button
            onClick={onOpenTogether}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700 text-xs"
          >
            <div className="relative">
              <img
                src={partner.avatarUrl}
                alt={partner.displayName}
                className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-slate-700"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
            </div>
            <span className="font-medium">
              {partner.displayName}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
              Lvl {partner.level || 1}
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenSettings}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-medium hover:bg-amber-100 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.settings.invitePartner}</span>
          </button>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          {!isInstalled && isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
              title="Install CoupleFit PWA"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          {!isInstalled && isIOS && (
            <button
              onClick={() => setShowIOSModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">iOS App</span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition text-xs flex items-center gap-1"
              title="Select Language"
            >
              <Globe className="w-4 h-4" />
              <span className="font-semibold uppercase">{language}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1 z-50 text-sm">
                <button
                  onClick={() => {
                    onLanguageChange('en');
                    setShowLangMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left rtl:text-right hover:bg-slate-100 dark:hover:bg-slate-700 font-medium ${
                    language === 'en' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    onLanguageChange('fr');
                    setShowLangMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left rtl:text-right hover:bg-slate-100 dark:hover:bg-slate-700 font-medium ${
                    language === 'fr' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
                  }`}
                >
                  Français
                </button>
                <button
                  onClick={() => {
                    onLanguageChange('ar');
                    setShowLangMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left rtl:text-right hover:bg-slate-100 dark:hover:bg-slate-700 font-medium font-arabic ${
                    language === 'ar' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
                  }`}
                >
                  العربية (RTL)
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Settings Modal */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title={t.nav.settings}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Install Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Install CoupleFit on iPhone / iPad
            </h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              1. Tap the <strong>Share</strong> button in Safari's bottom toolbar.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
              3. Launch directly from your home screen for full native PWA experience!
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-6 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              {t.common.close}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
