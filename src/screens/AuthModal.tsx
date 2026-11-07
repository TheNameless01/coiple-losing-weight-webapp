import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../locales/translations';
import { api, setAuthToken } from '../api';
import { Heart, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  language: Language;
  onSuccess: (token: string, user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ language, onSuccess }) => {
  const t = translations[language];
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      if (isRegister) {
        const res = await api.register({
          email,
          password,
          displayName,
          invitationToken: invitationCode || undefined,
          language,
        });
        setAuthToken(res.token);
        onSuccess(res.token, res.user);
      } else {
        const res = await api.login({ email, password });
        setAuthToken(res.token);
        onSuccess(res.token, res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrapDemo = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.bootstrapDemo();
      if (res.accounts?.alex?.token) {
        setAuthToken(res.accounts.alex.token);
        onSuccess(res.accounts.alex.token, {
          email: 'alex@couplefit.app',
          displayName: 'Alex',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to bootstrap demo accounts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {t.auth.loginTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.auth.loginSubtitle}
          </p>
        </div>

        {/* Demo Bootstrap Button */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 border border-emerald-500/30 space-y-2 text-center">
          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            {t.auth.demoNotice}
          </p>
          <button
            type="button"
            onClick={handleBootstrapDemo}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t.auth.demoBootstrapBtn}</span>
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase">
            Or sign in with email
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {isRegister && (
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t.auth.displayName} *
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alex or Sam"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {t.auth.email} *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@couplefit.app"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {t.auth.password} *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t.auth.invitationCode}
              </label>
              <input
                type="text"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                placeholder="cf_inv_xxxx (leave blank to create a new couple space)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs shadow transition mt-2"
          >
            {loading ? t.common.loading : isRegister ? t.auth.registerBtn : t.auth.loginBtn}
          </button>
        </form>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
          >
            {isRegister ? t.auth.switchToLogin : t.auth.switchToRegister}
          </button>
        </div>
      </div>
    </div>
  );
};
