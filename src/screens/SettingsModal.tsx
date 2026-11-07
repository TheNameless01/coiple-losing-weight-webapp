import React, { useState } from 'react';
import { Language, Theme, CoupleSummary } from '../types';
import { translations } from '../locales/translations';
import { api, setAuthToken } from '../api';
import {
  Globe,
  Moon,
  Sun,
  Share2,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Users,
  ShieldCheck,
} from 'lucide-react';

interface SettingsModalProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
  onThemeToggle: () => void;
  couple: CoupleSummary | null;
  onOpenOnboarding: () => void;
  onClose: () => void;
  onLogout: () => void;
  onSwitchedUser: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  couple,
  onOpenOnboarding,
  onClose,
  onLogout,
  onSwitchedUser,
}) => {
  const t = translations[language];

  const [generatedInvite, setGeneratedInvite] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateInvite = async () => {
    try {
      setLoading(true);
      const res = await api.invitePartner();
      setGeneratedInvite(res.invitationToken);
    } catch (err: any) {
      alert(err.message || 'Failed to generate invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInvite = () => {
    if (!generatedInvite) return;
    navigator.clipboard.writeText(generatedInvite);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      setLoading(true);
      setJoinError(null);
      await api.joinCouple(joinCode.trim());
      setJoinSuccess('Successfully joined couple space!');
      setTimeout(() => {
        onSwitchedUser();
        onClose();
      }, 1500);
    } catch (err: any) {
      setJoinError(err.message || 'Failed to join couple');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchPartner = async () => {
    try {
      setLoading(true);
      const res = await api.switchPartner();
      setAuthToken(res.token);
      onSwitchedUser();
      onClose();
    } catch (err: any) {
      alert(err.message || 'No partner found in current couple space to switch to.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t.settings.title}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-lg">
            ✕
          </button>
        </div>

        {/* Language Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>{t.settings.language}</span>
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => onLanguageChange('en')}
              className={`py-2 rounded-xl font-bold border transition ${
                language === 'en'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('fr')}
              className={`py-2 rounded-xl font-bold border transition ${
                language === 'fr'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Français
            </button>
            <button
              onClick={() => onLanguageChange('ar')}
              className={`py-2 rounded-xl font-bold border transition font-arabic ${
                language === 'ar'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              العربية (RTL)
            </button>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            {t.settings.theme}
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={onThemeToggle}
              className={`py-2 px-3 rounded-xl font-bold border flex items-center justify-center gap-2 transition ${
                theme === 'dark'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>{t.settings.dark}</span>
            </button>
            <button
              onClick={onThemeToggle}
              className={`py-2 px-3 rounded-xl font-bold border flex items-center justify-center gap-2 transition ${
                theme === 'light'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>{t.settings.light}</span>
            </button>
          </div>
        </div>

        {/* Health Recalculate */}
        <div className="pt-2">
          <button
            onClick={() => {
              onClose();
              onOpenOnboarding();
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4 text-emerald-500" />
            <span>{t.settings.healthRecalc}</span>
          </button>
        </div>

        {/* Couple Invitation Section */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
          <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-rose-500" />
            <span>{t.settings.invitePartner}</span>
          </h3>

          {generatedInvite ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedInvite}
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <button
                  onClick={handleCopyInvite}
                  className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Send this single-use code to your partner. It expires in 72 hours.
              </p>
            </div>
          ) : (
            <button
              onClick={handleGenerateInvite}
              disabled={loading}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
            >
              {t.settings.generateInviteBtn}
            </button>
          )}
        </div>

        {/* Join existing couple */}
        <form onSubmit={handleJoinCouple} className="space-y-2 text-xs">
          <label className="font-bold text-slate-700 dark:text-slate-300 block">
            {t.settings.joinCoupleTitle}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="cf_inv_xxxx"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold"
            >
              {t.settings.joinBtn}
            </button>
          </div>
          {joinError && <p className="text-rose-500 text-[11px] font-semibold">{joinError}</p>}
          {joinSuccess && <p className="text-emerald-500 text-[11px] font-semibold">{joinSuccess}</p>}
        </form>

        {/* Local Dev Switch Partner Account */}
        {couple?.partner && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleSwitchPartner}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <Users className="w-4 h-4" />
              <span>{t.settings.switchPartnerDev} ({couple.partner.displayName})</span>
            </button>
          </div>
        )}

        {/* Logout */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.nav.logout}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
