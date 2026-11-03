import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getTodayString } from '../../utils/dateUtils';
import { 
  Droplets, 
  Plus, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles,
  CupSoda,
  Clock,
  AlertTriangle,
  Bell,
  BellRing,
  Check
} from 'lucide-react';

export const WaterTrackerCard: React.FC = () => {
  const { 
    activeClient, 
    selectedDate, 
    waterLogs, 
    addWaterLog, 
    deleteWaterLog, 
    resetWaterLogForDate,
    reminders,
    toggleReminder
  } = useApp();

  const [customMl, setCustomMl] = useState<string>('');
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [alertDismissed, setAlertDismissed] = useState<boolean>(false);

  // Daily target in ml
  const targetLiters = activeClient?.dailyWaterTargetLiters || 2.5;
  const targetMl = Math.round(targetLiters * 1000);

  // Logs for this client on selected date
  const dayLogs = useMemo(() => {
    if (!activeClient) return [];
    return waterLogs.filter(w => w.clientId === activeClient.id && w.date === selectedDate);
  }, [waterLogs, activeClient?.id, selectedDate]);

  // Total ml consumed today
  const totalConsumedMl = useMemo(() => {
    return dayLogs.reduce((sum, log) => sum + log.amountMl, 0);
  }, [dayLogs]);

  const percentage = Math.min(100, Math.round((totalConsumedMl / targetMl) * 100));
  const remainingMl = Math.max(0, targetMl - totalConsumedMl);
  const isTargetReached = totalConsumedMl >= targetMl;

  // Water reminder from reminders context
  const clientWaterReminder = useMemo(() => {
    return reminders.find(r => r.clientId === activeClient?.id && r.type === 'water');
  }, [reminders, activeClient?.id]);

  // Calculate hours since last water log for 3-hour inactivity reminder
  const hoursSinceLastWater = useMemo(() => {
    if (selectedDate !== getTodayString()) return null;

    if (dayLogs.length === 0) {
      const now = new Date();
      if (now.getHours() >= 10) {
        return Math.max(3, now.getHours() - 7);
      }
      return null;
    }

    const latestLog = dayLogs[0];
    const timeStr = latestLog.timeLogged;
    if (!timeStr) return null;

    try {
      const now = new Date();
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const ampm = match[3];
        if (ampm) {
          if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
        const logDate = new Date();
        logDate.setHours(hours, minutes, 0, 0);

        const diffMs = now.getTime() - logDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        return diffHours > 0 ? diffHours : 0;
      }
    } catch {
      return null;
    }
    return null;
  }, [dayLogs, selectedDate]);

  const isOverdueForWater = !alertDismissed && hoursSinceLastWater !== null && hoursSinceLastWater >= 3 && selectedDate === getTodayString();

  // Browser notification permission state
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  const requestBrowserNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Browser notifications are not supported on this browser or device.');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);

    if (permission === 'granted') {
      new Notification('💧 Hydration Reminders Active', {
        body: `Saleem Valanchery Centre: We will alert you whenever 3 hours pass without drinking water.`,
        icon: '/favicon.ico'
      });
      if (clientWaterReminder && !clientWaterReminder.enabled) {
        toggleReminder(clientWaterReminder.id);
      }
    }
  };

  // Dispatch browser notification when overdue if permitted
  useEffect(() => {
    if (isOverdueForWater && notificationStatus === 'granted' && !alertDismissed) {
      try {
        new Notification('💧 Hydration Inactivity Alert (3 Hours)', {
          body: `Hi ${activeClient?.name || 'there'}, you haven't logged water for over 3 hours! Please drink a glass of water now.`,
          icon: '/favicon.ico'
        });
      } catch {}
    }
  }, [isOverdueForWater, notificationStatus, alertDismissed, activeClient?.name]);

  const handleAddPreset = (ml: number) => {
    addWaterLog(ml, selectedDate);
    setAlertDismissed(false);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customMl, 10);
    if (!isNaN(parsed) && parsed > 0) {
      addWaterLog(parsed, selectedDate);
      setCustomMl('');
      setAlertDismissed(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs relative overflow-hidden transition-all">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold shadow-xs">
            <Droplets className="w-5 h-5 text-cyan-600 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-base">
                Daily Hydration Tracker
              </h3>
              {isTargetReached && (
                <span className="bg-cyan-100 text-cyan-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 border border-cyan-200">
                  <CheckCircle2 className="w-3 h-3 text-cyan-600" />
                  Goal Met
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Target: <span className="font-bold text-slate-700">{targetLiters} Liters</span> ({targetMl} ml) • Essential for fat oxidation &amp; kidney health
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dayLogs.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setShowHistory(prev => !prev)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {showHistory ? 'Hide Entries' : `${dayLogs.length} Entries`}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Reset today's water intake?")) {
                    resetWaterLogForDate(selectedDate);
                  }
                }}
                className="text-xs text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="Reset today's water log"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3-Hour Hydration Inactivity On-Screen Alert Banner */}
      {isOverdueForWater && (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-cyan-50 to-blue-50 border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md">
                  3-Hour Hydration Alert
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {hoursSinceLastWater ? `~${Math.round(hoursSinceLastWater)} hrs since last water log` : 'No water logged yet today'}
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1">
                You haven't logged water in the last 3 hours! Please drink a glass of water (250 ml) now to stay hydrated and keep your metabolic fat oxidation optimal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => handleAddPreset(250)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Drink 250 ml Now</span>
            </button>
            <button
              type="button"
              onClick={() => setAlertDismissed(true)}
              className="text-xs text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 px-2.5 py-2 rounded-xl transition-colors cursor-pointer"
              title="Dismiss for now"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 3-Hour Interval Browser Reminder Pill / Bar */}
      <div className="mt-3 px-3.5 py-2 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Clock className="w-3.5 h-3.5 text-cyan-600" />
          <span>
            <b>3-Hour Interval Tracker:</b> {hoursSinceLastWater !== null ? `Last logged ~${Math.round(hoursSinceLastWater)} hrs ago` : 'Stay hydrated every 2-3 hours'}
          </span>
          {clientWaterReminder && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${clientWaterReminder.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
              Reminder {clientWaterReminder.enabled ? 'Active' : 'Muted'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {notificationStatus === 'granted' ? (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <BellRing className="w-3 h-3 text-emerald-600" />
              Browser Alerts Active
            </span>
          ) : (
            <button
              type="button"
              onClick={requestBrowserNotification}
              className="text-[11px] font-bold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="Click to receive on-screen browser notifications every 3 hours if water is not logged"
            >
              <Bell className="w-3 h-3 text-cyan-600" />
              Enable 3-Hour Browser Alert
            </button>
          )}

          {clientWaterReminder && (
            <button
              type="button"
              onClick={() => toggleReminder(clientWaterReminder.id)}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 underline cursor-pointer"
            >
              {clientWaterReminder.enabled ? 'Mute' : 'Enable'} Centre Reminder
            </button>
          )}
        </div>
      </div>

      {/* Main Hydration Gauge & Progress */}
      <div className="my-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Progress Numbers */}
        <div className="md:col-span-5 bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50/40 rounded-2xl p-4 border border-cyan-100/80">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-800">
              Consumed
            </span>
            <span className="text-xs font-bold text-cyan-700">
              {percentage}% of goal
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {(totalConsumedMl / 1000).toFixed(2)}
            </span>
            <span className="text-sm font-bold text-slate-500">
              / {targetLiters} L
            </span>
            <span className="text-xs font-semibold text-slate-400 ml-auto">
              ({totalConsumedMl} ml)
            </span>
          </div>

          {/* Progress Bar with Water Flow Animation */}
          <div className="mt-3 w-full bg-slate-200/80 rounded-full h-3.5 overflow-hidden p-0.5 relative">
            <div 
              className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out shadow-xs"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="mt-2 text-[11px] text-slate-500 font-medium flex items-center justify-between">
            {isTargetReached ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Excellent! Daily hydration target completed.
              </span>
            ) : (
              <span>💧 <b>{remainingMl} ml</b> remaining to reach your coach target.</span>
            )}
          </p>
        </div>

        {/* Quick Add Presets */}
        <div className="md:col-span-7 flex flex-col justify-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Quick 1-Tap Log:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleAddPreset(250)}
              className="group bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 p-2.5 rounded-xl transition-all text-center cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <div className="text-xs font-extrabold text-slate-800 group-hover:text-cyan-800 flex items-center justify-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                <span>+250 ml</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                Glass
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleAddPreset(500)}
              className="group bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 p-2.5 rounded-xl transition-all text-center cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <div className="text-xs font-extrabold text-slate-800 group-hover:text-cyan-800 flex items-center justify-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                <span>+500 ml</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                Bottle
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleAddPreset(750)}
              className="group bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 p-2.5 rounded-xl transition-all text-center cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <div className="text-xs font-extrabold text-slate-800 group-hover:text-cyan-800 flex items-center justify-center gap-1">
                <CupSoda className="w-3.5 h-3.5 text-cyan-600" />
                <span>+750 ml</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                Gym Sipper
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleAddPreset(1000)}
              className="group bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 p-2.5 rounded-xl transition-all text-center cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <div className="text-xs font-extrabold text-slate-800 group-hover:text-cyan-800 flex items-center justify-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span>+1,000 ml</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                1 Liter Flask
              </span>
            </button>
          </div>

          {/* Custom ml input */}
          <form onSubmit={handleAddCustom} className="flex items-center gap-2 mt-1">
            <input
              type="number"
              step="50"
              min="50"
              max="3000"
              placeholder="Custom ml (e.g. 350)"
              value={customMl}
              onChange={(e) => setCustomMl(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-cyan-500"
            />
            <button
              type="submit"
              disabled={!customMl}
              className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0"
            >
              Add Water
            </button>
          </form>
        </div>
      </div>

      {/* Expandable History of Water Logs for Selected Day */}
      {showHistory && dayLogs.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Logged Intake Times for {selectedDate}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Click trash to remove accidental entry
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {dayLogs.map((log) => (
              <div
                key={log.id}
                className="bg-cyan-50/70 border border-cyan-200/80 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs"
              >
                <Droplets className="w-3 h-3 text-cyan-600" />
                <span className="font-bold text-cyan-950">+{log.amountMl} ml</span>
                <span className="text-slate-400 font-mono text-[10px]">({log.timeLogged})</span>
                <button
                  type="button"
                  onClick={() => deleteWaterLog(log.id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                  title="Remove this intake"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Tip Footnote */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>
          <b>Centre Protocol:</b> Drink 500ml upon waking with a pinch of pink salt or lemon, and avoid drinking large volumes during meals to maintain stomach acid potency.
        </span>
      </div>
    </div>
  );
};
