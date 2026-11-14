import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ClientProfile, ClientReminder, DietitianTip, MealLogItem, MealType } from '../../types';
import { CoachClinicalAlertsCard } from './CoachClinicalAlertsCard';
import { getNotificationStatus, requestOSNotificationPermission, showOSNotification } from '../../utils/notifications';
import {
  Bell,
  BellRing,
  X,
  Smartphone,
  Clock,
  CheckCircle2,
  Sun,
  Sunset,
  Moon,
  Droplets,
  Utensils,
  Scale,
  ShieldCheck,
  CalendarDays,
  Sparkles,
  Send,
  Check,
  CheckCheck
} from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientProfile;
  reminders: ClientReminder[];
  onToggleReminder: (id: string) => void;
  tips: DietitianTip[];
  logsForDay: MealLogItem[];
  selectedDate: string;
  onQuickAction: (action: 'log-meal' | 'hydration' | 'weight' | 'plan' | 'clinical-rules', slot?: MealType) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  client,
  reminders,
  onToggleReminder,
  tips,
  logsForDay,
  selectedDate,
  onQuickAction,
}) => {
  const { t, language, markTipAsRead, markAllTipsAsRead, isTipRead } = useApp();
  const isMl = language === 'ml';
  const [notifPermission, setNotifPermission] = useState<'default' | 'granted' | 'denied' | 'unsupported'>(() => getNotificationStatus());
  const [testSentBanner, setTestSentBanner] = useState(false);

  const requestPhonePermission = async () => {
    const perm = await requestOSNotificationPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      void showOSNotification(isMl ? 'ന്യൂട്രിട്രാക്ക് പ്രോ അലേർട്ടുകൾ സജീവമായി' : 'NutriTrack Pro Alerts Enabled', {
        body: isMl
          ? `ഹായ് ${client.name}, 8:00 AM, 1:00 PM, 7:30 PM എന്നീ ഭക്ഷണ സമയങ്ങളിലും കോച്ച് നിർദ്ദേശങ്ങളിലും അലേർട്ട് ലഭിക്കും.`
          : `Hi ${client.name}, you will receive on-time reminders at 8:00 AM (Breakfast), 1:00 PM (Lunch), and 7:30 PM (Dinner), plus coach alerts.`,
        tag: 'nutritrack-welcome-notif',
      });
    }
  };

  const sendTestPhoneAlert = () => {
    void showOSNotification(isMl ? 'കോച്ച് സലീം · ഭക്ഷണ ഓർമ്മപ്പെടുത്തൽ' : 'Coach Saleem · Meal Reminder', {
      body: isMl
        ? `ന്യൂട്രിട്രാക്ക് പ്രോയിൽ ഇന്നത്തെ ഭക്ഷണം രേഖപ്പെടുത്താൻ സമയമായി!`
        : `Time to log your nutrition in NutriTrack Pro! Stay consistent with your ${client.goal} goal.`,
      tag: `nutritrack-test-${Date.now()}`,
    });
    setTestSentBanner(true);
    setTimeout(() => setTestSentBanner(false), 3500);
  };

  const mealIconForTitle = (title: string, time: string) => {
    const lower = `${title} ${time}`.toLowerCase();
    if (lower.includes('breakfast') || lower.includes('8:00 am') || lower.includes('morning')) {
      return <Sun className="w-4 h-4 text-amber-600" />;
    }
    if (lower.includes('lunch') || lower.includes('1:00 pm') || lower.includes('afternoon')) {
      return <Sunset className="w-4 h-4 text-orange-600" />;
    }
    if (lower.includes('dinner') || lower.includes('7:30 pm') || lower.includes('evening')) {
      return <Moon className="w-4 h-4 text-indigo-600" />;
    }
    return <Droplets className="w-4 h-4 text-cyan-600" />;
  };

  const sortedTips = useMemo(() => {
    return [...tips].sort((a, b) => {
      const aUnread = isTipRead(a.id) ? 0 : 1;
      const bUnread = isTipRead(b.id) ? 0 : 1;
      if (aUnread !== bUnread) return bUnread - aUnread;
      return (b.type === 'reminder' ? 1 : 0) - (a.type === 'reminder' ? 1 : 0);
    });
  }, [tips, isTipRead]);

  const unreadTipIds = useMemo(() => {
    return tips.filter(tip => !isTipRead(tip.id)).map(tip => tip.id);
  }, [tips, isTipRead]);

  const unreadCount = unreadTipIds.length;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-950 text-white px-5 py-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight truncate">
                {t('Notifications & Coach Reminders')}
              </h2>
              <p className="text-xs text-emerald-200 tabular-nums">
                8:00 AM · 1:00 PM · 7:30 PM ·{' '}
                <span className={unreadCount > 0 ? 'text-amber-300 font-bold' : 'text-emerald-300'}>
                  {unreadCount > 0
                    ? `${unreadCount} ${t('Unread')}`
                    : t('All Caught Up')}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white px-3 py-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold shrink-0"
            title={t('Close')}
          >
            <X className="w-4 h-4" />
            <span>{t('Close')}</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-6 bg-slate-50/70 dark:bg-slate-950">

          {/* 1. Native Phone Push Notification Permission Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('Phone Notification Delivery')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {notifPermission === 'granted'
                    ? t('Active: Scheduled meal times & coach reminders trigger native alerts directly on your phone.')
                    : notifPermission === 'denied'
                    ? t('Notifications are blocked in your browser settings. Enable them in site permissions to receive phone alerts.')
                    : t('Allow notifications so meal check-ins and coach alerts arrive on your phone on time — without cluttering the app.')}
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
                  {isMl
                    ? 'സെർവീസ് വർക്കർ (PWA) വഴി Android/Desktop നോട്ടിഫിക്കേഷനുകൾ പ്രവർത്തിക്കുന്നു.'
                    : 'Delivered via Service Worker (PWA) for mobile & desktop reliability.'}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {notifPermission === 'granted' ? (
                <button
                  type="button"
                  onClick={sendTestPhoneAlert}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('Test Alert')}</span>
                </button>
              ) : notifPermission !== 'unsupported' && notifPermission !== 'denied' ? (
                <button
                  type="button"
                  onClick={requestPhonePermission}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{t('Enable Phone Alerts')}</span>
                </button>
              ) : null}
            </div>
          </div>

          {testSentBanner && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t('Test notification sent! Scheduled reminders will alert your phone at exact meal times.')}</span>
            </div>
          )}

          {/* 2. Quick-Action Square Icons inside Notification Center */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">{t('Quick Actions from Alerts')}</h3>
            </div>

            <div className="grid grid-cols-5 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onQuickAction('log-meal');
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 group-hover:bg-emerald-600 group-hover:text-white text-emerald-700 dark:text-emerald-400 flex items-center justify-center transition-colors">
                  <Utensils className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight">{t('Log Meal')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onQuickAction('hydration');
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 group-hover:bg-cyan-600 group-hover:text-white text-cyan-700 dark:text-cyan-400 flex items-center justify-center transition-colors">
                  <Droplets className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight">{t('Daily Hydration')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onQuickAction('weight');
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 group-hover:bg-blue-600 group-hover:text-white text-blue-700 dark:text-blue-400 flex items-center justify-center transition-colors">
                  <Scale className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight">{t('Morning Weight')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onQuickAction('plan');
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 group-hover:bg-amber-500 group-hover:text-white text-amber-700 dark:text-amber-400 flex items-center justify-center transition-colors">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight">{t('Diet Plan')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onQuickAction('clinical-rules');
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 group-hover:bg-rose-600 group-hover:text-white text-rose-700 dark:text-rose-400 flex items-center justify-center transition-colors">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight">{t('Food Rules')}</span>
              </button>
            </div>
          </div>

          {/* 3. Coach Reminders & Clinical Meal Alerts */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 px-1">
              <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('Coach Reminders & Live Guidance')}</span>
                <span className="text-slate-400">·</span>
                <span className={`tabular-nums ${unreadCount > 0 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : 'text-emerald-700 dark:text-emerald-400'}`}>
                  {unreadCount} {t('Unread')}
                </span>
              </h3>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllTipsAsRead(unreadTipIds)}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>{t('Mark All as Read')}</span>
                </button>
              )}
            </div>

            {/* Live Clinical Food Feedback */}
            <CoachClinicalAlertsCard
              logs={logsForDay}
              client={client}
              selectedDate={selectedDate}
            />

            {/* Direct Coach Messages / Reminders with Mark as Read */}
            <div className="space-y-2">
              {sortedTips.length === 0 ? (
                <div className="rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400">
                  {t('No notifications right now')}
                </div>
              ) : (
                sortedTips.map((tip) => {
                  const read = isTipRead(tip.id);
                  return (
                    <div
                      key={tip.id}
                      className={`rounded-2xl p-4 border space-y-2 transition-colors ${
                        read
                          ? 'bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80'
                          : tip.type === 'reminder'
                          ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 shadow-2xs'
                          : 'bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-700 shadow-2xs'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 text-xs">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-bold ${read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                              {tip.title}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">·</span>
                            <span className={`text-[11px] font-bold ${read ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              {read ? `✓ ${t('Read')}` : t('Unread')}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                            {tip.dietitianName} · {tip.createdAt}
                          </div>
                        </div>

                        {!read && (
                          <button
                            type="button"
                            onClick={() => markTipAsRead(tip.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{t('Mark as Read')}</span>
                          </button>
                        )}
                      </div>

                      <p className={`text-xs leading-relaxed ${read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                        {tip.message}
                      </p>

                      {tip.type === 'reminder' && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (!read) markTipAsRead(tip.id);
                              onClose();
                              onQuickAction('log-meal');
                            }}
                            className="text-[11px] font-bold text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 underline cursor-pointer"
                          >
                            {t("Log Today's Meals Now →")}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 4. Scheduled Official Meal Notification Times */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 px-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('Scheduled Phone Notification Times')}</span>
            </h3>

            <div className="bg-white dark:bg-slate-900 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 overflow-hidden">
              {reminders.map((r) => (
                <div key={r.id} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      {mealIconForTitle(r.title, r.time)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">{r.title}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">{r.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{r.message}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleReminder(r.id)}
                    aria-label={`Toggle ${r.title}`}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shrink-0 ${
                      r.enabled ? 'bg-emerald-600 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
