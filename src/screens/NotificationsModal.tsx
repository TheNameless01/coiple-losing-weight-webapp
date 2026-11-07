import React from 'react';
import { Language, NotificationItem } from '../types';
import { translations } from '../locales/translations';
import { api } from '../api';
import { Bell, Trophy, Sparkles, Check, Heart } from 'lucide-react';

interface NotificationsModalProps {
  language: Language;
  notifications: NotificationItem[];
  onClose: () => void;
  onRefresh: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  language,
  notifications,
  onClose,
  onRefresh,
}) => {
  const t = translations[language];

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      onRefresh();
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const getIcon = (type: string) => {
    if (type === 'achievement' || type === 'level_up') return <Trophy className="w-4 h-4 text-amber-500" />;
    if (type === 'partner_activity') return <Heart className="w-4 h-4 text-rose-500" />;
    return <Sparkles className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[80vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Notifications
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10 italic">
              No new notifications. You're all caught up!
            </p>
          ) : (
            notifications.map((n) => {
              const title = language === 'ar' ? n.titleAr : language === 'fr' ? n.titleFr : n.titleEn;
              const body = language === 'ar' ? n.bodyAr : language === 'fr' ? n.bodyFr : n.bodyEn;

              return (
                <div
                  key={n.id}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                    n.read
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {body}
                      </p>
                      <span className="text-[9px] text-slate-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
                  )}
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
        >
          {t.common.close}
        </button>
      </div>
    </div>
  );
};
