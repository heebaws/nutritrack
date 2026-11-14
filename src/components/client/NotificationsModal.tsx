import React, { useState, useMemo } from 'react';
import { ClientProfile, ClientReminder, DietitianTip, MealLogItem, MealType } from '../../types';
import { CoachClinicalAlertsCard } from './CoachClinicalAlertsCard';
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
  Send
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
  const [notifPermission, setNotifPermission] = useState<'default' | 'granted' | 'denied' | 'unsupported'>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });
  const [testSentBanner, setTestSentBanner] = useState(false);

  const requestPhonePermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        new Notification('NutriTrack Pro Alerts Enabled', {
          body: `Hi ${client.name}, you will receive on-time reminders at 8:00 AM (Breakfast), 1:00 PM (Lunch), and 7:30 PM (Dinner), plus coach alerts.`,
          icon: '/favicon.ico',
        });
      }
    } catch {}
  };

  const sendTestPhoneAlert = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Coach Saleem · Meal Reminder', {
        body: `Time to log your nutrition in NutriTrack Pro! Stay consistent with your ${client.goal} goal.`,
        icon: '/favicon.ico',
      });
    }
    setTestSentBanner(true);
    setTimeout(() => setTestSentBanner(false), 3500);
  };

  const mealIconForTitle = (title: string, time: string) => {
    const t = `${title} ${time}`.toLowerCase();
    if (t.includes('breakfast') || t.includes('8:00 am') || t.includes('morning')) {
      return <Sun className="w-4 h-4 text-amber-600" />;
    }
    if (t.includes('lunch') || t.includes('1:00 pm') || t.includes('afternoon')) {
      return <Sunset className="w-4 h-4 text-orange-600" />;
    }
    if (t.includes('dinner') || t.includes('7:30 pm') || t.includes('evening')) {
      return <Moon className="w-4 h-4 text-indigo-600" />;
    }
    return <Droplets className="w-4 h-4 text-cyan-600" />;
  };

  const sortedTips = useMemo(() => {
    return [...tips].sort((a, b) => (b.type === 'reminder' ? 1 : 0) - (a.type === 'reminder' ? 1 : 0));
  }, [tips]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-950 text-white px-5 py-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                Notifications &amp; Coach Reminders
              </h2>
              <p className="text-xs text-emerald-200">
                On-time phone alerts at 8:00 AM · 1:00 PM · 7:30 PM &amp; coach messages
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-6 bg-slate-50/70">

          {/* 1. Native Phone Push Notification Permission Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Phone Notification Delivery
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {notifPermission === 'granted'
                    ? 'Active: Scheduled meal times & coach reminders trigger native alerts directly on your phone.'
                    : notifPermission === 'denied'
                    ? 'Notifications are blocked in your browser settings. Enable them in site permissions to receive phone alerts.'
                    : 'Allow notifications so meal check-ins and coach alerts arrive on your phone on time — without cluttering the app.'}
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
                  <span>Test Alert</span>
                </button>
              ) : notifPermission !== 'unsupported' && notifPermission !== 'denied' ? (
                <button
                  type="button"
                  onClick={requestPhonePermission}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Enable Phone Alerts</span>
                </button>
              ) : null}
            </div>
          </div>

          {testSentBanner && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Test notification sent! Scheduled reminders will alert your phone at exact meal times.</span>
            </div>
          )}

          {/* 2. Quick-Action Square Icons inside Notification Center */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700">Quick Actions from Alerts</h3>
              <span className="text-[11px] text-slate-400">Tap any icon to respond</span>
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
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white text-emerald-700 flex items-center justify-center transition-colors">
                  <Utensils className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">Log Meal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onQuickAction('hydration');
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 group-hover:bg-cyan-600 group-hover:text-white text-cyan-700 flex items-center justify-center transition-colors">
                  <Droplets className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">Hydration</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onQuickAction('weight');
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white text-blue-700 flex items-center justify-center transition-colors">
                  <Scale className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">Weight</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onQuickAction('plan');
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 group-hover:bg-amber-500 group-hover:text-white text-amber-700 flex items-center justify-center transition-colors">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">Diet Plan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onQuickAction('clinical-rules');
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 group-hover:bg-rose-600 group-hover:text-white text-rose-700 flex items-center justify-center transition-colors">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">Food Rules</span>
              </button>
            </div>
          </div>

          {/* 3. Coach Reminders & Clinical Meal Alerts */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 px-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Coach Reminders &amp; Live Guidance</span>
            </h3>

            {/* Live Clinical Food Feedback (Red warnings / Green praise moved cleanly here) */}
            <CoachClinicalAlertsCard
              logs={logsForDay}
              client={client}
              selectedDate={selectedDate}
            />

            {/* Direct Coach Messages / Reminders */}
            <div className="space-y-2">
              {sortedTips.map((tip) => (
                <div
                  key={tip.id}
                  className={`rounded-2xl p-4 border space-y-1.5 ${
                    tip.type === 'reminder'
                      ? 'bg-rose-50/70 border-rose-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-900">{tip.title}</span>
                    <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                      {tip.dietitianName} · {tip.createdAt}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{tip.message}</p>
                  {tip.type === 'reminder' && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onQuickAction('log-meal');
                        }}
                        className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                      >
                        Log Today&apos;s Meals Now →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Scheduled Official Meal Notification Times */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 px-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Scheduled Phone Notification Times</span>
            </h3>

            <div className="bg-white rounded-2xl divide-y divide-slate-100 border border-slate-200 overflow-hidden">
              {reminders.map((r) => (
                <div key={r.id} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                      {mealIconForTitle(r.title, r.time)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900">{r.title}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-mono font-semibold text-emerald-700 tabular-nums">{r.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{r.message}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleReminder(r.id)}
                    aria-label={`Toggle ${r.title}`}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shrink-0 ${
                      r.enabled ? 'bg-emerald-600 justify-end' : 'bg-slate-200 justify-start'
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
