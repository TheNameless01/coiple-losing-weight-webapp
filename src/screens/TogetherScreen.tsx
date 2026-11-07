import React, { useState, useEffect } from 'react';
import { Language, User, CoupleSummary, CoupleActivityEvent, CoupleMessage, CoupleChallengeItem } from '../types';
import { translations } from '../locales/translations';
import { api } from '../api';
import {
  Heart,
  Flame,
  Send,
  Sparkles,
  Trophy,
  MessageCircle,
  Share2,
  Clock,
  ThumbsUp,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TogetherScreenProps {
  language: Language;
  user: User;
  couple: CoupleSummary | null;
  onOpenSettings: () => void;
  onRefreshData: () => void;
}

export const TogetherScreen: React.FC<TogetherScreenProps> = ({
  language,
  user,
  couple,
  onOpenSettings,
  onRefreshData,
}) => {
  const t = translations[language];

  const [feedEvents, setFeedEvents] = useState<CoupleActivityEvent[]>([]);
  const [messages, setMessages] = useState<CoupleMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [challenges, setChallenges] = useState<CoupleChallengeItem[]>([]);
  const [cheeredEventIds, setCheeredEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTogetherData = async () => {
    try {
      setLoading(true);
      const [feedRes, chatRes, challRes] = await Promise.all([
        api.getFeed(),
        api.getChat(),
        api.getChallenges(),
      ]);
      setFeedEvents(feedRes.events || []);
      setMessages(chatRes.messages || []);
      setChallenges(challRes.challenges || []);
    } catch (err) {
      console.error('Failed to load together space data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTogetherData();
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await api.sendChatMessage(newMessage.trim());
      setNewMessage('');
      const chatRes = await api.getChat();
      setMessages(chatRes.messages || []);
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleSendCheer = async (eventId: string, reactionEmoji: string) => {
    try {
      await api.reactToEvent(eventId, reactionEmoji);
      setCheeredEventIds((prev) => [...prev, eventId]);
      try {
        confetti({
          particleCount: 40,
          spread: 45,
          origin: { y: 0.7 },
        });
      } catch (e) {}
      const feedRes = await api.getFeed();
      setFeedEvents(feedRes.events || []);
      onRefreshData();
    } catch (err) {
      console.error('Failed to send cheer', err);
    }
  };

  const partner = couple?.partner;

  return (
    <div className="space-y-6 pb-20">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            <span>{t.together.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.together.subtitle}
          </p>
        </div>

        {!partner && (
          <button
            onClick={onOpenSettings}
            className="self-start sm:self-auto px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow transition flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>{t.settings.invitePartner}</span>
          </button>
        )}
      </div>

      {/* Couple Synergy Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-rose-500/15 via-purple-500/10 to-teal-500/15 border border-rose-300/40 dark:border-rose-800/40 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Couple Title */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Shared Space
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Connected since {couple?.anniversaryDate || '2024'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {couple?.name || 'Our Couple Sanctuary'}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-lg leading-relaxed">
              Health consistency is built hand in hand. Every meal, drop of water, and workout brings you closer to your goals.
            </p>
          </div>

          {/* Both Partners Cards */}
          <div className="flex items-center gap-3">
            {/* User */}
            <div className="text-center p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm min-w-[90px]">
              <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg mb-1">
                {user.displayName.charAt(0)}
              </div>
              <span className="text-xs font-bold block text-slate-900 dark:text-white truncate max-w-[80px]">
                {user.displayName}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                You
              </span>
            </div>

            <div className="text-rose-500 font-black text-lg">❤️</div>

            {/* Partner */}
            {partner ? (
              <div className="text-center p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm min-w-[90px]">
                <img
                  src={partner.avatarUrl}
                  alt={partner.displayName}
                  className="w-12 h-12 mx-auto rounded-xl bg-purple-500/20 shadow-sm mb-1"
                />
                <span className="text-xs font-bold block text-slate-900 dark:text-white truncate max-w-[80px]">
                  {partner.displayName}
                </span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                  Lvl {partner.level || 1}
                </span>
              </div>
            ) : (
              <div
                onClick={onOpenSettings}
                className="text-center p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 cursor-pointer min-w-[90px]"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-lg mb-1">
                  +
                </div>
                <span className="text-xs text-slate-500 font-medium block">
                  {t.settings.invitePartner}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Couple Challenge */}
      {challenges.length > 0 && (
        <div className="rounded-3xl p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-800/40">
          {challenges.map((c) => {
            const title = language === 'ar' ? c.titleAr : language === 'fr' ? c.titleFr : c.titleEn;
            const desc = language === 'ar' ? c.descAr : language === 'fr' ? c.descFr : c.descEn;
            const progress = Math.min(100, Math.round((c.currentTotal / c.targetTotal) * 100));

            return (
              <div key={c.id} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                        {t.together.coupleChallenge}
                      </span>
                      <h3 className="text-lg font-bold">{title}</h3>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 self-start sm:self-auto">
                    +{c.rewardXp} Team XP
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{desc}</p>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-indigo-200">
                    <span>{t.together.challengeProgress}</span>
                    <span>{c.currentTotal} / {c.targetTotal} ml ({progress}%)</span>
                  </div>
                  <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-400 to-indigo-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Row 2: Live Activity Feed & Private Couple Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Partner Activity Feed */}
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t.together.activityFeed}
                </h3>
              </div>
            </div>

            {feedEvents.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center italic">
                No recent partner events logged yet. Log a meal or workout to see it live here!
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {feedEvents.map((event) => {
                  const title = language === 'ar' ? event.titleAr : language === 'fr' ? event.titleFr : event.titleEn;
                  const isCheered = cheeredEventIds.includes(event.id);

                  return (
                    <div
                      key={event.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {event.userName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                            {title}
                          </p>
                        </div>

                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          +{event.xpEarned} XP
                        </span>
                      </div>

                      {/* Cheer action row */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-800/60 text-xs">
                        <span className="text-[11px] text-slate-400">
                          {event.reactions?.length ? `${event.reactions.length} cheers` : 'Cheer your partner:'}
                        </span>

                        <div className="flex items-center gap-1">
                          {['❤️', '🔥', '👏', '🌟'].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleSendCheer(event.id, emoji)}
                              className="px-2 py-0.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition text-xs"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Private Couple Chat */}
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[420px]">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
            <MessageCircle className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t.together.privateChat}
            </h3>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center p-4">
                <p className="text-xs text-slate-400 italic">
                  {t.together.emptyChat}
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderId === user.id;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-none'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick encouragement chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-2 text-[11px]">
            {['Crushing it today! 🔥', 'Proud of you! ❤️', 'Don’t forget water! 💧'].map((chip) => (
              <button
                key={chip}
                onClick={() => setNewMessage(chip)}
                className="px-2.5 py-1 rounded-full whitespace-nowrap bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message input */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t.together.sendMessage}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleSendMessage}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow transition"
              title="Send"
            >
              <Send className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
