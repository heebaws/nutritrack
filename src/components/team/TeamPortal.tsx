import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FoodDatabaseManager } from './FoodDatabaseManager';
import { CentreDeviceModal } from './CentreDeviceModal';
import { DietPlanBuilderModal } from './DietPlanBuilderModal';
import { SendTipModal } from './SendTipModal';
import { AddClientModal } from './AddClientModal';
import { AddDietitianModal } from './AddDietitianModal';
import { ClientDossierModal } from './ClientDossierModal';
import { EditCoachModal } from './EditCoachModal';
import { EditClientModal } from './EditClientModal';
import { PrintReportModal } from '../common/PrintReportModal';
import { AppointmentsModal } from '../common/AppointmentsModal';
import { LoginPortal } from '../common/LoginPortal';
import { NutriTrackLogo } from '../common/NutriTrackLogo';
import { ClientProfile, DietPlan, DietitianProfile } from '../../types';
import { getDaysSinceDate, isClientInactiveThreeDays } from '../../utils/dateUtils';
import { 
  Users, 
  UtensilsCrossed, 
  CalendarDays, 
  Building2, 
  Send, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  ChevronRight,
  Bell,
  Stethoscope,
  Sparkles,
  Award,
  Edit3,
  KeyRound,
  Trash2,
  Lock,
  UserPlus,
  Printer,
  CalendarCheck,
  Smartphone,
  Cloud,
  Zap,
  Droplets,
  Scale,
  Footprints,
  RotateCcw,
  SlidersHorizontal,
  BellRing,
  ArrowLeft,
  LogOut,
  Languages,
  Sun,
  Moon
} from 'lucide-react';

export const TeamPortal: React.FC = () => {
  const { 
    activeTeamUser, 
    dietitians, 
    clients, 
    foods, 
    dietPlans, 
    mealLogs,
    measurements, 
    waterLogs,
    activities,
    habits,
    appointments,
    tips,
    cloudSyncStatus,
    lastSyncedAt,
    sendFollowupReminderToInactive,
    quickSwitchTeamRole,
    staffSignOut,
    deleteClient,
    addDietitian,
    resetAllData,
    t,
    language,
    toggleLanguage,
    theme,
    toggleTheme
  } = useApp();

  const [isResetting, setIsResetting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    | null
    | { type: 'reset' }
    | { type: 'delete-client'; clientId: string; clientName: string }
    | { type: 'switch-staff'; staffName: string }
  >(null);

  const executeResetData = async () => {
    setIsResetting(true);
    await resetAllData();
    setTimeout(() => setIsResetting(false), 1000);
  };

  // Safe coach reference (null check enforced below after all hooks)
  const currentCoach = activeTeamUser;

  // Workspace launcher panel (null = clean front page showing compact Coach summary + square icons only)
  const [activeWorkspace, setActiveWorkspace] = useState<
    null | 'reports' | 'live-feed' | 'clients' | 'foods' | 'plans' | 'centre' | 'broadcast' | 'staff' | 'more'
  >(null);

  // Search and filters for clients
  const [clientSearch, setClientSearch] = useState('');
  const [dietitianFilter, setDietitianFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [clientViewMode, setClientViewMode] = useState<'table' | 'cards'>('table');

  // Modal controls
  const [isCentreModalOpen, setIsCentreModalOpen] = useState(false);
  const [selectedClientIdForCentre, setSelectedClientIdForCentre] = useState<string | undefined>(undefined);

  const [isPlanBuilderOpen, setIsPlanBuilderOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DietPlan | null>(null);

  const [isSendTipOpen, setIsSendTipOpen] = useState(false);
  const [selectedClientIdForTip, setSelectedClientIdForTip] = useState<string | null>(null);

  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddDietitianOpen, setIsAddDietitianOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<DietitianProfile | null>(null);
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null);

  const [viewingClientDossier, setViewingClientDossier] = useState<ClientProfile | null>(null);
  const [quickFollowupSentId, setQuickFollowupSentId] = useState<string | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedClientIdForPrint, setSelectedClientIdForPrint] = useState<string | undefined>(undefined);

  const [isAppointmentsModalOpen, setIsAppointmentsModalOpen] = useState(false);
  const [selectedClientIdForAppointment, setSelectedClientIdForAppointment] = useState<string | undefined>(undefined);

  // Dynamically evaluate client inactivity: if no food log for 3+ days, client is inactive (in red)
  const isClientInactive = (client: ClientProfile): boolean => {
    // Check mealLogs for this client
    const logs = mealLogs.filter(m => m.clientId === client.id);
    if (logs.length > 0) {
      // Find the most recent meal date
      const sortedDates = [...logs].map(l => l.date).sort((a, b) => b.localeCompare(a));
      const mostRecentLogDate = sortedDates[0];
      return isClientInactiveThreeDays(mostRecentLogDate);
    }
    // Fall back to client.lastActiveDate or status
    if (client.lastActiveDate) {
      return isClientInactiveThreeDays(client.lastActiveDate);
    }
    return client.status === 'inactive';
  };

  const getDaysInactiveCount = (client: ClientProfile): number => {
    const logs = mealLogs.filter(m => m.clientId === client.id);
    if (logs.length > 0) {
      const sortedDates = [...logs].map(l => l.date).sort((a, b) => b.localeCompare(a));
      return getDaysSinceDate(sortedDates[0]);
    }
    return getDaysSinceDate(client.lastActiveDate);
  };

  // Valid clients list excluding corrupted empty ghost records
  const validClients = useMemo(() => {
    return clients.filter(c => c && c.id && ((c.name && c.name.trim().length > 0) || (c.phone && c.phone.trim().length > 0)));
  }, [clients]);

  // Dynamic Statistics based on 3-day rule
  const totalClients = validClients.length;
  const inactiveClients = validClients.filter(c => isClientInactive(c));
  const activeClients = validClients.filter(c => !isClientInactive(c));

  const filteredClients = useMemo(() => {
    return validClients.filter(c => {
      const cName = (c?.name || '').toLowerCase();
      const cPhone = (c?.phone || '');
      const s = (clientSearch || '').toLowerCase();
      const matchSearch = cName.includes(s) || cPhone.includes(s);
      const matchDietitian = dietitianFilter === 'all' || c?.assignedDietitianId === dietitianFilter;
      const clientInactive = isClientInactive(c);
      const matchStatus = statusFilter === 'all' 
        || (statusFilter === 'inactive' && clientInactive)
        || (statusFilter === 'active' && !clientInactive);
      return matchSearch && matchDietitian && matchStatus;
    });
  }, [validClients, clientSearch, dietitianFilter, statusFilter, mealLogs]);

  // Centre device readings count
  const centreReadings = useMemo(() => {
    return measurements.filter(m => m.source === 'centre_device');
  }, [measurements]);

  const [notificationSentMessage, setNotificationSentMessage] = useState<{ clientId: string; text: string } | null>(null);

  const handleSendInactiveFollowup = (clientId: string) => {
    const targetClient = clients.find(c => c.id === clientId);
    sendFollowupReminderToInactive(clientId);
    setQuickFollowupSentId(clientId);
    setNotificationSentMessage({
      clientId,
      text: `📱 Push Notification sent to ${targetClient?.name || 'client'}'s phone: "Please log your meals today!"`
    });
    setTimeout(() => {
      setQuickFollowupSentId(null);
      setNotificationSentMessage(null);
    }, 4500);
  };

  // Enforce authentication: only logged-in coaches and admins can view the team portal
  if (!currentCoach) {
    return <LoginPortal defaultTab="coach" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Toast Feedback when Coach clicks "Remind on Phone" */}
      {notificationSentMessage && (
        <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-lg border border-emerald-400 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              <Smartphone className="w-5 h-5 text-amber-300 animate-bounce" />
            </div>
            <div>
              <div className="font-extrabold text-sm flex items-center gap-2">
                <span>Phone Reminder Delivered</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">
                  SMS &amp; Push Active
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                {notificationSentMessage.text}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNotificationSentMessage(null)}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ================= 1. COMPACT COACH PROFILE HEADER & 3 METRICS ================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <NutriTrackLogo size="md" showText={false} />
            <img
              src={currentCoach?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'}
              alt={currentCoach?.name || 'Centre Coach'}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                  {currentCoach?.name || 'Saleem Valanchery'}
                </h1>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className={`text-xs font-bold ${
                  currentCoach?.role === 'admin' ? 'text-purple-700 dark:text-purple-400' : 'text-emerald-700 dark:text-emerald-400'
                }`}>
                  {currentCoach?.role === 'admin' ? t('Centre Administrator') : t('Clinical Dietitian')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                NutriTrack Pro · {currentCoach?.title || 'Wellness Coach & Lead Centre Admin'}
              </p>
            </div>
          </div>

          {/* 3 Essential Clinic Stats (Clean tabular-nums, clickable to inspect) */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveWorkspace('clients')}
              className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-left transition-colors cursor-pointer"
            >
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">{t('Enrolled')}</span>
              <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{totalClients}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter('active');
                setActiveWorkspace('clients');
              }}
              className="bg-emerald-50/70 dark:bg-emerald-950/50 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-3.5 py-2.5 text-left transition-colors cursor-pointer"
            >
              <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block">{t('Active')}</span>
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">{activeClients.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveWorkspace('reports')}
              className={`border rounded-2xl px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                inactiveClients.length > 0
                  ? 'bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border-rose-200 dark:border-rose-800'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
              }`}
            >
              <span className={`text-[11px] font-semibold block ${inactiveClients.length > 0 ? 'text-rose-800 dark:text-rose-300' : 'text-slate-500 dark:text-slate-400'}`}>
                {t('3+ Days Away')}
              </span>
              <span className={`text-xl font-black tabular-nums ${inactiveClients.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                {inactiveClients.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= 2. SQUARE ICON WORKSPACE GRID ================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-5 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-semibold">
            <span>{t('Coach Workspace')}</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-slate-500 dark:text-slate-400 font-normal">{t('Tap any square icon to open tools or client records')}</span>
          </div>
          {activeWorkspace && (
            <button
              type="button"
              onClick={() => setActiveWorkspace(null)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('Minimize Open View')}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-5 pt-1">
          {[
            {
              key: 'clients',
              label: t('Clients'),
              icon: Users,
              bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-600 hover:text-white',
              active: activeWorkspace === 'clients',
              badge: totalClients,
              onClick: () => {
                setStatusFilter('all');
                setActiveWorkspace(prev => prev === 'clients' ? null : 'clients');
              },
            },
            {
              key: 'reports',
              label: t('Inactive Alerts'),
              icon: AlertTriangle,
              bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-600 hover:text-white',
              active: activeWorkspace === 'reports',
              badge: inactiveClients.length > 0 ? inactiveClients.length : undefined,
              onClick: () => setActiveWorkspace(prev => prev === 'reports' ? null : 'reports'),
            },
            {
              key: 'live-feed',
              label: t('Live Feed'),
              icon: Smartphone,
              bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-600 hover:text-white',
              active: activeWorkspace === 'live-feed',
              onClick: () => setActiveWorkspace(prev => prev === 'live-feed' ? null : 'live-feed'),
            },
            {
              key: 'add-client',
              label: t('Add Client'),
              icon: UserPlus,
              bg: 'bg-blue-600 text-white hover:bg-blue-700',
              active: false,
              onClick: () => setIsAddClientOpen(true),
            },
            {
              key: 'send-alert',
              label: t('Send Alert'),
              icon: BellRing,
              bg: 'bg-emerald-600 text-white hover:bg-emerald-700',
              active: false,
              onClick: () => {
                setSelectedClientIdForTip(null);
                setIsSendTipOpen(true);
              },
            },
            {
              key: 'plans',
              label: t('Diet Plans'),
              icon: CalendarDays,
              bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-600 hover:text-white',
              active: activeWorkspace === 'plans',
              onClick: () => setActiveWorkspace(prev => prev === 'plans' ? null : 'plans'),
            },
            {
              key: 'foods',
              label: t('Food Library'),
              icon: UtensilsCrossed,
              bg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-600 hover:text-white',
              active: activeWorkspace === 'foods',
              onClick: () => setActiveWorkspace(prev => prev === 'foods' ? null : 'foods'),
            },
            {
              key: 'centre',
              label: t('Centre Scan'),
              icon: Building2,
              bg: 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700',
              active: activeWorkspace === 'centre',
              onClick: () => setActiveWorkspace(prev => prev === 'centre' ? null : 'centre'),
            },
            {
              key: 'appointments',
              label: t('Appointments'),
              icon: CalendarCheck,
              bg: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-600 hover:text-white',
              active: false,
              onClick: () => {
                setSelectedClientIdForAppointment(clients[0]?.id);
                setIsAppointmentsModalOpen(true);
              },
            },
            {
              key: 'print',
              label: t('Print Report'),
              icon: Printer,
              bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-800 hover:text-white dark:hover:bg-slate-700',
              active: false,
              onClick: () => {
                setSelectedClientIdForPrint(clients[0]?.id);
                setIsPrintModalOpen(true);
              },
            },
            {
              key: 'staff',
              label: t('Staff & Roles'),
              icon: ShieldCheck,
              bg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-600 hover:text-white',
              active: activeWorkspace === 'staff',
              onClick: () => setActiveWorkspace(prev => prev === 'staff' ? null : 'staff'),
            },
            {
              key: 'more',
              label: t('More & Admin'),
              icon: SlidersHorizontal,
              bg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-800 hover:text-white dark:hover:bg-slate-700',
              active: activeWorkspace === 'more' || activeWorkspace === 'broadcast',
              onClick: () => setActiveWorkspace(prev => prev === 'more' ? null : 'more'),
            },
          ].map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
              >
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 aspect-square rounded-2xl flex items-center justify-center relative transition-all duration-150 group-active:scale-95 ${
                    item.active
                      ? 'bg-emerald-800 text-white ring-4 ring-emerald-200 dark:ring-emerald-900 shadow-sm'
                      : item.bg
                  }`}
                >
                  <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2]" />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900 tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-bold text-center leading-tight transition-colors ${
                  item.active ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-950 dark:group-hover:text-white'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= VIEW 0: MORE & ADMIN SQUARE DRAWER ================= */}
      {activeWorkspace === 'more' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('Additional Admin & Broadcast Controls')}</h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveWorkspace(null)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('Close')}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            <button
              type="button"
              onClick={() => toggleTheme()}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className={`w-16 h-16 aspect-square rounded-2xl border flex flex-col items-center justify-center transition-colors ${
                theme === 'dark'
                  ? 'bg-amber-950/60 text-amber-300 border-amber-700 group-hover:bg-amber-600 group-hover:text-white'
                  : 'bg-slate-100 text-slate-800 border-slate-200 group-hover:bg-slate-900 group-hover:text-white'
              }`}>
                {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">
                {theme === 'dark' ? t('Light Mode') : t('Dark Mode')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => toggleLanguage()}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className={`w-16 h-16 aspect-square rounded-2xl border flex flex-col items-center justify-center transition-colors ${
                language === 'ml'
                  ? 'bg-emerald-800 text-white border-emerald-900'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 group-hover:bg-emerald-700 group-hover:text-white'
              }`}>
                <Languages className="w-5 h-5" />
                <span className="text-[10px] font-bold mt-0.5">
                  {language === 'ml' ? 'EN' : 'മലയാളം'}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">
                {language === 'ml' ? t('Switch to English') : t('Switch to Malayalam')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveWorkspace('broadcast')}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-16 h-16 aspect-square rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                <Send className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight tabular-nums">Broadcast ({tips.length})</span>
            </button>

            <button
              type="button"
              onClick={() => currentCoach && setEditingCoach(currentCoach)}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-16 h-16 aspect-square rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors">
                <Edit3 className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">{t('Edit Profile')}</span>
            </button>

            {currentCoach?.role === 'admin' && (
              <button
                type="button"
                onClick={() => setIsAddDietitianOpen(true)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-16 h-16 aspect-square rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <UserPlus className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">{t('Add Coach')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSelectedClientIdForCentre(clients[0]?.id);
                setIsCentreModalOpen(true);
              }}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-16 h-16 aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 group-hover:bg-slate-800 dark:group-hover:bg-slate-700 group-hover:text-white flex items-center justify-center transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">{t('New Scan')}</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmAction({ type: 'reset' })}
              disabled={isResetting}
              className="flex flex-col items-center gap-2 group cursor-pointer disabled:opacity-50"
            >
              <div className="w-16 h-16 aspect-square rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-colors">
                <RotateCcw className={`w-6 h-6 ${isResetting ? 'animate-spin' : ''}`} />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">
                {isResetting ? 'Restoring...' : t('Reset Centre')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => staffSignOut()}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-16 h-16 aspect-square rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 group-hover:bg-rose-600 group-hover:text-white flex items-center justify-center transition-colors">
                <LogOut className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">{t('Sign Out')}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= VIEW 1: ACTIVE & INACTIVE REPORTS ================= */}
      {activeWorkspace === 'reports' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Active &amp; Inactive Client Alerts</span>
            </h2>
            <button
              type="button"
              onClick={() => setActiveWorkspace(null)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Icons</span>
            </button>
          </div>
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Total Enrolled Clients</span>
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-2 tabular-nums">{totalClients}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across all assigned centre dietitians</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-linear-to-b from-emerald-50/30 dark:from-emerald-950/30 to-white dark:to-slate-900 shadow-xs">
              <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <span>Active Clients</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-2 tabular-nums">{activeClients.length}</div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                {totalClients > 0 ? Math.round((activeClients.length / totalClients) * 100) : 0}% active logging meals &amp; measurements
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-rose-200 dark:border-rose-800/80 bg-linear-to-b from-rose-50/30 dark:from-rose-950/30 to-white dark:to-slate-900 shadow-xs">
              <div className="flex items-center justify-between text-rose-800 dark:text-rose-300 text-xs font-semibold">
                <span>Inactive / At-Risk Clients</span>
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-2 tabular-nums">{inactiveClients.length}</div>
              <p className="text-xs text-rose-600 dark:text-rose-300 mt-1">No logs recorded in the last 3+ days</p>
            </div>
          </div>

          {/* Simple Report: Inactive Clients Requiring Attention */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Client Activity &amp; Inactivity Report
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Identifies clients who have stopped logging so dietitians can follow up early.
                </p>
              </div>

              {inactiveClients.length > 0 && (
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                  {inactiveClients.length} clients need follow-up
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Assigned Dietitian</th>
                    <th className="py-3 px-4">Primary Goal</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {validClients.map((client) => {
                    const dietitian = dietitians.find(d => d.id === client.assignedDietitianId) || dietitians[0];
                    const inactive = isClientInactive(client);
                    const daysAway = getDaysInactiveCount(client);
                    const clientDisplayName = (client.name && client.name.trim().length > 0) ? client.name.trim() : 'Registered Client';
                    const clientPhoneDisplay = client.phone || '5550199';
                    const clientGoalDisplay = client.goal || 'General Health & Metabolic Management';
                    const coachDisplayName = dietitian?.name || 'Saleem Valanchery (Lead)';

                    return (
                      <tr 
                        key={client.id} 
                        className={`transition-colors ${
                          inactive
                            ? 'bg-rose-50/70 dark:bg-rose-950/30 border-l-4 border-l-rose-600 hover:bg-rose-100/50 dark:hover:bg-rose-950/45'
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="relative">
                              <img
                                src={client.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                                alt={clientDisplayName}
                                className={`w-9 h-9 rounded-full object-cover shrink-0 border-2 ${
                                  inactive ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-900' : 'border-emerald-400'
                                }`}
                              />
                              {inactive && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-600 border-2 border-white dark:border-slate-900 animate-pulse" title="Inactive for 3+ days" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`font-bold block ${inactive ? 'text-rose-950 dark:text-rose-200' : 'text-slate-900 dark:text-slate-100'}`}>{clientDisplayName}</span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  inactive 
                                    ? 'bg-rose-600 text-white shadow-xs animate-pulse' 
                                    : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                                }`}>
                                  {inactive ? `Inactive (${daysAway}d no food logs)` : 'Active'}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block">Phone: {clientPhoneDisplay}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {coachDisplayName}
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                          {clientGoalDisplay}
                        </td>

                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide inline-flex items-center gap-1 ${
                            inactive 
                              ? 'bg-rose-600 text-white shadow-xs' 
                              : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                          }`}>
                            {inactive ? <AlertTriangle className="w-2.5 h-2.5" /> : <CheckCircle2 className="w-2.5 h-2.5" />}
                            <span>{inactive ? 'INACTIVE (3+ DAYS)' : 'ACTIVE'}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          <div className={`flex items-center gap-1 font-mono text-[11px] ${inactive ? 'text-rose-700 dark:text-rose-300 font-bold' : ''}`}>
                            <Clock className={`w-3 h-3 ${inactive ? 'text-rose-500' : 'text-slate-400'}`} />
                            <span>{client.lastActiveDate || 'No food logs'}</span>
                            {inactive && (
                              <span className="text-[10px] bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 px-1.5 rounded-sm font-sans font-bold">
                                {daysAway} days ago
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {inactive && (
                              <button
                                type="button"
                                onClick={() => handleSendInactiveFollowup(client.id)}
                                disabled={quickFollowupSentId === client.id}
                                className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-80"
                                title="Click to send phone notification and in-app reminder to log meals"
                              >
                                {quickFollowupSentId === client.id ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 animate-bounce" />
                                    <span>Phone Alert Sent!</span>
                                  </>
                                ) : (
                                  <>
                                    <Smartphone className="w-3.5 h-3.5 text-amber-200" />
                                    <span>Remind on Phone</span>
                                  </>
                                )}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setViewingClientDossier(client)}
                              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-2.5 py-1 rounded-lg text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Dossier</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Mobile Updates Preview in Reports Tab */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/70 p-5 shadow-xs bg-linear-to-r from-emerald-50/40 via-white to-blue-50/30 dark:from-emerald-950/30 dark:via-slate-900 dark:to-blue-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Live Mobile Updates from Clients
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                    Real-Time Cloud Storage
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Updates entered by clients on their smartphones (meals, fasting weight, water, habits) reflect here immediately via Firestore.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveWorkspace('live-feed')}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>Open Full Mobile Feed ({mealLogs.length + measurements.length + waterLogs.length} updates)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick mini-cards of latest 4 events */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {mealLogs.slice(0, 2).map((m) => {
                const client = clients.find(c => c.id === m.clientId);
                return (
                  <div key={m.id} className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🥗</span>
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block truncate max-w-[120px]">
                            {client?.name || 'Client'}
                          </span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">{m.mealType}</span>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{m.timeLogged || m.date}</span>
                    </div>
                    <div className="mt-2 text-xs text-slate-700 dark:text-slate-200 truncate font-medium">
                      {m.foodName}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] font-bold text-slate-900 dark:text-white tabular-nums">
                      <span>{m.calories} kcal</span>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">P:{m.protein}g • C:{m.carbs}g • F:{m.fat}g</span>
                    </div>
                  </div>
                );
              })}

              {measurements.slice(0, 1).map((w) => {
                const client = clients.find(c => c.id === w.clientId);
                return (
                  <div key={w.id} className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block truncate max-w-[120px]">
                            {client?.name || 'Client'}
                          </span>
                          <span className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold">Morning Weigh-in</span>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{w.date}</span>
                    </div>
                    <div className="mt-2 text-base font-extrabold text-blue-700 dark:text-blue-400 tabular-nums">
                      {w.weightKg} kg
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {w.source === 'centre_device' ? 'Centre InBody Scan' : 'Mobile Fasting Weight'}
                    </div>
                  </div>
                );
              })}

              {waterLogs.slice(0, 1).map((wat) => {
                const client = clients.find(c => c.id === wat.clientId);
                return (
                  <div key={wat.id} className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block truncate max-w-[120px]">
                            {client?.name || 'Client'}
                          </span>
                          <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold">Hydration Log</span>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{wat.timeLogged || wat.date}</span>
                    </div>
                    <div className="mt-2 text-base font-extrabold text-cyan-700 dark:text-cyan-400 tabular-nums">
                      +{wat.amountMl} ml
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      Logged from mobile phone
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ================= VIEW: FULL LIVE CLIENT PHONE FEED ================= */}
      {activeWorkspace === 'live-feed' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Live Client Mobile Feed</span>
            </h2>
            <button
              type="button"
              onClick={() => setActiveWorkspace(null)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Icons</span>
            </button>
          </div>
          
          {/* Header Banner */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-800/70 p-5 shadow-xs bg-linear-to-r from-emerald-50/50 via-white to-blue-50/40 dark:from-emerald-950/30 dark:via-slate-900 dark:to-blue-950/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Live Client Mobile Feed
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Real-time cloud stream: Any food logged, weight recorded, or habit checked on a client's phone immediately appears here.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 shadow-2xs flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Firestore Cloud Sync</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Latest Client Actions (Chronological)
              </h3>
              <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Total Logs: <span className="font-bold text-slate-800 dark:text-white">{mealLogs.length + measurements.length + waterLogs.length + activities.length}</span> items
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Combine and sort recent logs */}
              {mealLogs.length === 0 && measurements.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                  No mobile logs recorded yet. When clients log on their phone, they will stream here in real time.
                </div>
              ) : (
                mealLogs.slice(0, 20).map((meal) => {
                  const client = clients.find(c => c.id === meal.clientId);
                  return (
                    <div key={meal.id} className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-lg shrink-0">
                          🥗
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{client?.name || 'Client'}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {meal.mealType}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                              {meal.timeLogged} • {meal.date}
                            </span>
                          </div>
                          <div className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
                            {meal.foodName} ({meal.quantity}x {meal.servingUnit})
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-3 tabular-nums">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">🔥 {meal.calories} kcal</span>
                            <span>Protein: {meal.protein}g</span>
                            <span>Carbs: {meal.carbs}g</span>
                            <span>Fat: {meal.fat}g</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {client && (
                          <button
                            type="button"
                            onClick={() => setViewingClientDossier(client)}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                          >
                            View Client
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {/* ================= VIEW 2: CLIENTS DIRECTORY ================= */}
      {activeWorkspace === 'clients' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="tabular-nums">Clients Directory ({filteredClients.length})</span>
            </h2>
            <button
              type="button"
              onClick={() => setActiveWorkspace(null)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Icons</span>
            </button>
          </div>
          
          {/* Search and Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Search client by name, username or phone..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Dietitian filter */}
                <select
                  value={dietitianFilter}
                  onChange={(e) => setDietitianFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="all">All Wellness Coaches</option>
                  {dietitians.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.role === 'admin' ? 'Admin' : 'Coach'})</option>
                  ))}
                </select>

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {/* View switcher: Table vs Cards */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setClientViewMode('table')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      clientViewMode === 'table'
                        ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>📊 All Columns Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientViewMode('cards')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      clientViewMode === 'cards'
                        ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>🗂️ Cards View</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddClientOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Client</span>
                </button>
              </div>
            </div>

            {/* Quick Coach Filter Shortcuts */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 dark:text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                Check People Under:
              </span>
              <button
                type="button"
                onClick={() => setDietitianFilter('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer text-xs ${
                  dietitianFilter === 'all'
                    ? 'bg-slate-900 dark:bg-emerald-700 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All People ({clients.length})
              </button>

              {dietitians.map((d) => {
                const count = clients.filter(c => c.assignedDietitianId === d.id).length;
                const isSelected = dietitianFilter === d.id;

                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDietitianFilter(d.id)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer text-xs flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{d.name}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold tabular-nums ${
                      isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= CLIENTS DISPLAY: TABLE OR CARDS ================= */}
          {clientViewMode === 'table' ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                      <th className="py-3 px-3.5">Client &amp; Contact</th>
                      <th className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <span>⚖️ Weight &amp; Needed</span>
                        </div>
                      </th>
                      <th className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <span>💧 Fat % (Needed)</span>
                        </div>
                      </th>
                      <th className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <span>🫀 V-Fat (5–9)</span>
                        </div>
                      </th>
                      <th className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <span>📐 BMI (15–23)</span>
                        </div>
                      </th>
                      <th className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <span>🔥 BMR &amp; Work Status</span>
                        </div>
                      </th>
                      <th className="py-3 px-3">Coach &amp; Plan</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredClients.map((client) => {
                      const dietitian = dietitians.find(d => d.id === client.assignedDietitianId) || dietitians[0];
                      const plan = dietPlans.find(p => p.id === client.dietPlanId) || dietPlans[0];
                      const inactive = isClientInactive(client);
                      const daysAway = getDaysInactiveCount(client);
                      const clientDisplayName = (client.name && client.name.trim().length > 0) ? client.name.trim() : 'Registered Client';
                      const clientPhoneDisplay = client.phone || '5550199';
                      const coachDisplayName = dietitian?.name || 'Saleem Valanchery (Lead)';
                      const planTitleDisplay = plan?.title || 'Metabolic Nutrition Plan';
                      
                      // Fat norm calculation
                      const fatNormLabel = client.gender === 'Male' ? '10–20%' : '20–30%';
                      const isFatHigh = client.bodyFatPercentage ? (client.gender === 'Male' ? client.bodyFatPercentage > 20 : client.bodyFatPercentage > 30) : false;

                      return (
                        <tr 
                          key={client.id} 
                          className={`transition-colors ${
                            inactive
                              ? 'bg-rose-50/70 dark:bg-rose-950/30 border-l-4 border-l-rose-600 hover:bg-rose-100/50 dark:hover:bg-rose-950/45'
                              : 'hover:bg-slate-50/90 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          {/* 1. Client & Contact */}
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="relative">
                                <img
                                  src={client.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                                  alt={clientDisplayName}
                                  className={`w-9 h-9 rounded-full object-cover shrink-0 border-2 ${
                                    inactive ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-900' : 'border-emerald-400'
                                  }`}
                                />
                                {inactive && (
                                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-600 border-2 border-white dark:border-slate-900 animate-pulse" title="Inactive for 3+ days" />
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                                  <span className={inactive ? 'text-rose-950 dark:text-rose-200 font-black' : 'text-slate-900 dark:text-slate-100'}>{clientDisplayName}</span>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                                    ({client.gender || 'Client'}, {client.age || 30}y)
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                                  <span>{clientPhoneDisplay}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                    inactive ? 'bg-rose-600 text-white shadow-2xs animate-pulse' : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                                  }`}>
                                    {inactive ? `Inactive (${daysAway}d)` : 'Active'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Weight & Needed Weight */}
                          <td className="py-3 px-3 tabular-nums">
                            <div className="space-y-0.5">
                              <div className="flex items-baseline gap-1.5">
                                <span className="font-black text-slate-900 dark:text-white text-sm">{client.currentWeightKg}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">kg</span>
                              </div>
                              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                                Needed: <b className="font-bold">{client.targetWeightKg} kg</b>
                              </div>
                            </div>
                          </td>

                          {/* 3. Fat % (Men 10-20, Women 20-30) */}
                          <td className="py-3 px-3 tabular-nums">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-slate-900 dark:text-white text-sm">
                                  {client.bodyFatPercentage ?? '--'}%
                                </span>
                                {isFatHigh && (
                                  <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 px-1 rounded-sm">
                                    High
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                Needed: <strong className="text-emerald-700 dark:text-emerald-400">{client.targetBodyFatPercentage ?? '--'}%</strong> <span className="text-slate-400 dark:text-slate-500">({fatNormLabel})</span>
                              </div>
                            </div>
                          </td>

                          {/* 4. Visceral Fat (V-Fat: 0.5-9) */}
                          <td className="py-3 px-3 tabular-nums">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-slate-900 dark:text-white text-sm">
                                  {client.visceralFat ?? '--'}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                  (client.visceralFat ?? 0) > 14 
                                    ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300' 
                                    : (client.visceralFat ?? 0) >= 10 
                                    ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300' 
                                    : (client.visceralFat ?? 0) < 0.5
                                    ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                                    : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                                }`}>
                                  {(client.visceralFat ?? 0) > 14 ? 'High' : (client.visceralFat ?? 0) >= 10 ? 'Elevated' : (client.visceralFat ?? 0) < 0.5 ? 'Low' : 'Optimal'}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                Needed: <strong className="text-emerald-700 dark:text-emerald-400">0.5 – 9</strong>
                              </div>
                            </div>
                          </td>

                          {/* 5. BMI (18-23) */}
                          <td className="py-3 px-3 tabular-nums">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-slate-900 dark:text-white text-sm">
                                  {client.bmi ?? '--'}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                  (client.bmi ?? 0) > 23 ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300' : (client.bmi ?? 0) < 18 ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                                }`}>
                                  {(client.bmi ?? 0) > 23 ? 'Higher' : (client.bmi ?? 0) < 18 ? 'Underweight' : 'Optimal'}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                Needed: <strong className="text-emerald-700 dark:text-emerald-400">{client.targetBmi ?? '18–23'}</strong>
                              </div>
                            </div>
                          </td>

                          {/* 6. BMR & Work Status */}
                          <td className="py-3 px-3 tabular-nums">
                            <div className="space-y-0.5 max-w-[150px]">
                              <div className="flex items-baseline gap-1">
                                <span className="font-bold text-slate-900 dark:text-white">{client.bmr ?? '--'}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">kcal (Base)</span>
                              </div>
                              <div className="text-[10px] text-purple-800 dark:text-purple-300 font-medium truncate" title={client.bmrStatus}>
                                {client.bmrStatus || `Req: ${client.targetBmr || '--'} kcal`}
                              </div>
                            </div>
                          </td>

                          {/* Coach & Plan */}
                          <td className="py-3 px-3">
                            <div className="text-slate-800 dark:text-slate-200 font-medium">{coachDisplayName}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{planTitleDisplay}</div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {inactive && (
                                <button
                                  type="button"
                                  onClick={() => handleSendInactiveFollowup(client.id)}
                                  disabled={quickFollowupSentId === client.id}
                                  className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] transition-all shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-80"
                                  title="Send push notification to client's phone to log meals"
                                >
                                  {quickFollowupSentId === client.id ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                                      <span>Alert Sent!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Smartphone className="w-3 h-3 text-amber-200" />
                                      <span>Remind on Phone</span>
                                    </>
                                  )}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedClientIdForCentre(client.id);
                                  setIsCentreModalOpen(true);
                                }}
                                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-2 py-1 rounded-lg text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                                title="InBody / Device Scan"
                              >
                                <Building2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                <span>Scan</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setEditingClient(client)}
                                className="bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold px-2 py-1 rounded-lg text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                                title="Edit client photo & data"
                              >
                                <Edit3 className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setViewingClientDossier(client)}
                                className="bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold px-2.5 py-1 rounded-lg text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Dossier</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setConfirmAction({
                                  type: 'delete-client',
                                  clientId: client.id,
                                  clientName: client.name || 'Registered Client',
                                })}
                                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Client Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => {
                const dietitian = dietitians.find(d => d.id === client.assignedDietitianId) || dietitians[0];
                const plan = dietPlans.find(p => p.id === client.dietPlanId) || dietPlans[0];
                const clientDisplayName = (client.name && client.name.trim().length > 0) ? client.name.trim() : 'Registered Client';
                const clientPhoneDisplay = client.phone || '5550199';
                const uName = client.username || (clientDisplayName.split(' ')[0].toLowerCase()) || 'client';
                const inactive = isClientInactive(client);
                const daysAway = getDaysInactiveCount(client);

                return (
                  <div 
                    key={client.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                      inactive 
                        ? 'border-rose-400 dark:border-rose-700 bg-linear-to-b from-rose-50/40 via-white to-white dark:from-rose-950/35 dark:via-slate-900 dark:to-slate-900 ring-2 ring-rose-200 dark:ring-rose-900/60 shadow-sm' 
                        : 'border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <div>
                      {/* Top Row: Avatar, Name, Status */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={client.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                              alt={clientDisplayName}
                              className={`w-11 h-11 rounded-full object-cover border-2 ${
                                inactive ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-900' : 'border-slate-100 dark:border-slate-800'
                              }`}
                            />
                            {inactive && (
                              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-600 border-2 border-white dark:border-slate-900 animate-pulse" title="Inactive for 3+ days" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className={`font-bold text-sm leading-tight ${inactive ? 'text-rose-950 dark:text-rose-200 font-black' : 'text-slate-900 dark:text-white'}`}>{clientDisplayName}</h3>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                inactive ? 'bg-rose-600 text-white shadow-xs animate-pulse' : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                              }`}>
                                {inactive ? `Inactive (${daysAway}d)` : 'Active'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">Phone: {clientPhoneDisplay}</p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                          inactive ? 'bg-rose-600 text-white shadow-xs' : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                        }`}>
                          {inactive ? <AlertTriangle className="w-3 h-3 text-white" /> : <CheckCircle2 className="w-3 h-3" />}
                          <span>{inactive ? 'INACTIVE (3+ DAYS)' : 'ACTIVE'}</span>
                        </span>
                      </div>

                      {/* Portal Credentials Pill */}
                      <div className="mt-2.5 px-2.5 py-1.5 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-emerald-900 dark:text-emerald-300 font-medium truncate">
                          <KeyRound className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">Username: <b className="font-mono text-emerald-800 dark:text-emerald-200">{uName}</b></span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                          Password: <span className="text-slate-500 dark:text-slate-400 font-sans tracking-widest">••••••••</span>
                        </div>
                      </div>

                      {/* Primary Goal */}
                      <div className="mt-2 text-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-0.5">Primary Goal</span>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{client.goal}</p>
                      </div>

                      {/* Clinical Health & Body Composition Grid */}
                      <div className="mt-2.5 bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 tabular-nums">
                        {/* Weight Row */}
                        <div className="grid grid-cols-3 gap-1 text-center text-xs">
                          <div>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Start</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{client.startingWeightKg} kg</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-blue-600 dark:text-blue-400 block">Current</span>
                            <span className="font-bold text-blue-700 dark:text-blue-300">{client.currentWeightKg} kg</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block">Needed</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-300">{client.targetWeightKg} kg</span>
                          </div>
                        </div>

                        {/* Extended Body Composition Metrics */}
                        <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700 grid grid-cols-3 gap-1 text-center text-[11px]">
                          <div className="bg-white dark:bg-slate-900 p-1 rounded-md border border-slate-100 dark:border-slate-800">
                            <span className="text-[9px] text-amber-700 dark:text-amber-400 block font-semibold">Fat %</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{client.bodyFatPercentage ?? '--'}%</span>
                            <span className="text-[8px] text-slate-400 dark:text-slate-500 block">Ned: {client.targetBodyFatPercentage ?? '--'}%</span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-1 rounded-md border border-slate-100 dark:border-slate-800">
                            <span className="text-[9px] text-rose-700 dark:text-rose-400 block font-semibold">V-Fat</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{client.visceralFat ?? '--'}</span>
                            <span className="text-[8px] text-emerald-600 dark:text-emerald-400 block">Ned: 0.5-9</span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-1 rounded-md border border-slate-100 dark:border-slate-800">
                            <span className="text-[9px] text-blue-700 dark:text-blue-400 block font-semibold">BMI</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{client.bmi ?? '--'}</span>
                            <span className="text-[8px] text-emerald-600 dark:text-emerald-400 block">Ned: 18-23</span>
                          </div>
                        </div>

                        {/* BMR & Status Footer */}
                        <div className="text-[10px] text-purple-900 dark:text-purple-200 bg-purple-50/80 dark:bg-purple-950/50 px-2 py-1 rounded-md flex items-center justify-between">
                          <span className="font-semibold">BMR: {client.bmr || '--'} kcal</span>
                          <span className="text-[9px] text-purple-700 dark:text-purple-300 truncate max-w-[130px]">{client.bmrStatus || `Req: ${client.targetBmr || '--'} kcal`}</span>
                        </div>
                      </div>

                      {/* Assigned Dietitian & Plan */}
                      <div className="mt-2.5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 dark:text-slate-500">Coach:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{dietitian?.name || 'Saleem Valanchery (Lead)'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 dark:text-slate-500">Plan:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{plan?.title || 'Metabolic Plan'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 dark:text-slate-500">Last Active:</span>
                          <span className="font-mono text-slate-600 dark:text-slate-300">{client.lastActiveDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClientIdForCentre(client.id);
                          setIsCentreModalOpen(true);
                        }}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>+ Scan</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {inactive && (
                          <button
                            type="button"
                            onClick={() => handleSendInactiveFollowup(client.id)}
                            disabled={quickFollowupSentId === client.id}
                            className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold px-2.5 py-1 rounded-lg text-xs transition-all shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-80"
                            title="Send push notification to client's phone to log meals"
                          >
                            {quickFollowupSentId === client.id ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                                <span>Alert Sent!</span>
                              </>
                            ) : (
                              <>
                                <Smartphone className="w-3.5 h-3.5 text-amber-200" />
                                <span>Remind Phone</span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setConfirmAction({
                            type: 'delete-client',
                            clientId: client.id,
                            clientName: client.name || 'Registered Client',
                          })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                          title="Delete client"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingClient(client)}
                          className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                          title="Edit client photo, credentials & clinical data"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setViewingClientDossier(client)}
                          className="bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold px-3 py-1 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open Dossier</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ================= VIEW 3: FOOD DATABASE ================= */}
      {activeWorkspace === 'foods' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span className="tabular-nums">Clinical Food Library ({foods.length} foods)</span>
            </h2>
            <button
              type="button"
              onClick={() => setActiveWorkspace(null)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Icons</span>
            </button>
          </div>
          <FoodDatabaseManager />
        </div>
      )}

      {/* ================= VIEW 4: DIET PLANS ================= */}
      {activeWorkspace === 'plans' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="tabular-nums">Clinical Diet Plans ({dietPlans.length})</span>
            </h2>
            <button
              type="button"
              onClick={() => setActiveWorkspace(null)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Icons</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Diet Plans Repository
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Build meal plans with macro targets and assign them to clients
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingPlan(null);
                setIsPlanBuilderOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Diet Plan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dietPlans.map((plan) => {
              const assignedCount = clients.filter(c => c.dietPlanId === plan.id).length;

              return (
                <div key={plan.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 tabular-nums">
                          {assignedCount} Clients Assigned
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base mt-2">{plan.title}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{plan.description}</p>
                      </div>
                    </div>

                    {/* Macro pill summary */}
                    <div className="grid grid-cols-4 gap-2 mt-4 text-center tabular-nums">
                      <div className="bg-amber-50 dark:bg-amber-950/50 p-2 rounded-xl border border-amber-100 dark:border-amber-900/60">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Calories</span>
                        <span className="text-xs font-black text-amber-800 dark:text-amber-300">{plan.targetCalories}</span>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/50 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Protein</span>
                        <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">{plan.targetProtein}g</span>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/50 p-2 rounded-xl border border-blue-100 dark:border-blue-900/60">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Carbs</span>
                        <span className="text-xs font-black text-blue-800 dark:text-blue-300">{plan.targetCarbs}g</span>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-950/50 p-2 rounded-xl border border-purple-100 dark:border-purple-900/60">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Fat</span>
                        <span className="text-xs font-black text-purple-800 dark:text-purple-300">{plan.targetFat}g</span>
                      </div>
                    </div>

                    {/* Meal slots summary */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Included Meal Slots:</span>
                      {plan.meals.map(m => (
                        <div key={m.mealType} className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                          <span className="font-medium text-slate-800 dark:text-slate-200">• {m.mealType} ({m.timeGuideline})</span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">{m.recommendedFoods.length} foods recommended</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlan(plan);
                        setIsPlanBuilderOpen(true);
                      }}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Edit Plan &amp; Portions
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= VIEW 5: CENTRE DEVICE READINGS ================= */}
      {activeWorkspace === 'centre' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-800 dark:text-slate-300" />
              <span>Centre InBody &amp; Device Scans</span>
            </h2>
            <button
              type="button"
              onClick={() => setActiveWorkspace(null)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Icons</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Centre Device Readings (Entered by Hand)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official clinical assessments from InBody 270, Tanita, or centre stadiometers
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedClientIdForCentre(clients[0]?.id);
                setIsCentreModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Enter New Reading</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Device Model</th>
                    <th className="py-3 px-4">Weight</th>
                    <th className="py-3 px-4">BMI</th>
                    <th className="py-3 px-4">Body Fat %</th>
                    <th className="py-3 px-4">Muscle Mass</th>
                    <th className="py-3 px-4">Visceral Fat</th>
                    <th className="py-3 px-4">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 tabular-nums">
                  {centreReadings.map((reading) => {
                    const client = clients.find(c => c.id === reading.clientId);

                    return (
                      <tr key={reading.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{reading.date}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {client?.name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-blue-700 dark:text-blue-400 font-medium">
                          {reading.deviceModel}
                        </td>
                        <td className="py-3 px-4 font-black text-slate-900 dark:text-white">{reading.weightKg} kg</td>
                        <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">{reading.bmi || '-'}</td>
                        <td className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-bold">{reading.bodyFatPercentage ? `${reading.bodyFatPercentage}%` : '-'}</td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{reading.muscleMassKg ? `${reading.muscleMassKg} kg` : '-'}</td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{reading.visceralFatLevel ? `Level ${reading.visceralFatLevel}` : '-'}</td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{reading.enteredBy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 6: TIPS & REMINDERS BROADCAST ================= */}
      {activeWorkspace === 'broadcast' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="tabular-nums">Broadcast Alerts Sent ({tips.length})</span>
            </h2>
            <button
              type="button"
              onClick={() => setActiveWorkspace(null)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Icons</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Tips &amp; Reminders Broadcast
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Send dietary advice, personalized clinical notes, or logging reminders to clients' phones
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedClientIdForTip(null);
                setIsSendTipOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Message</span>
            </button>
          </div>

          <div className="space-y-3">
            {tips.map((tip) => {
              const client = tip.clientId ? clients.find(c => c.id === tip.clientId) : null;

              return (
                <div key={tip.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          tip.type === 'note' ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300' :
                          tip.type === 'reminder' ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300' :
                          'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                        }`}>
                          {tip.type}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Recipient: <b className="text-slate-800 dark:text-slate-200">{tip.targetAudience === 'all' ? 'All Clients' : client?.name || 'Targeted'}</b>
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-1">{tip.title}</h3>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{tip.createdAt}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl leading-relaxed">
                    {tip.message}
                  </p>

                  <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                    Sent by: <span className="font-medium text-slate-600 dark:text-slate-300">{tip.dietitianName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= VIEW 7: STAFF & SEPARATE ROLE LOGINS ================= */}
      {activeWorkspace === 'staff' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Team Roles &amp; Staff Logins</span>
            </h2>
            <button
              type="button"
              onClick={() => setActiveWorkspace(null)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Icons</span>
            </button>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Team Logins &amp; Wellness Coach Management
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Main Admin Saleem Valanchery and Wellness Coach Faseela Saleem oversee clients, diet plans, daily calorie intakes, and device scans. Admins can edit coach profiles, credentials, and manage all assigned clients.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddDietitianOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Add New Dietitian</span>
              </button>

              <button
                type="button"
                onClick={() => currentCoach && setEditingCoach(currentCoach)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit My Admin Profile</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dietitians.map((staff) => {
              const isCurrent = currentCoach?.id === staff.id;
              const assignedClients = clients.filter(c => c.assignedDietitianId === staff.id).length;
              const staffUser = staff.username || staff.name.toLowerCase().replace(/[^a-z0-9]/g, '');

              return (
                <div 
                  key={staff.id} 
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    isCurrent ? 'border-purple-500 ring-2 ring-purple-100 dark:ring-purple-900/60 shadow-md' : 'border-slate-200 dark:border-slate-800 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <img
                        src={staff.avatarUrl || 'https://images.unsplash.com/photo-1594824813637-27a3a93d4895?auto=format&fit=crop&q=80&w=250'}
                        alt={staff.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-800"
                      />
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          staff.role === 'admin' ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300' : 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300'
                        }`}>
                          {staff.role === 'admin' ? 'Main Admin' : 'Wellness Coach'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{staff.name}</h3>
                        <p className="text-xs text-purple-700 dark:text-purple-400 font-semibold">{staff.title}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingCoach(staff)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-lg transition-colors cursor-pointer"
                        title="Edit this coach / admin profile"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{staff.bio}</p>

                    {/* Staff Login Credentials Box */}
                    <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <KeyRound className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        <span>Portal Credentials</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">Username:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{staffUser}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">Password:</span>
                        <span className="font-mono text-slate-400 dark:text-slate-500 tracking-wider">••••••••</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1 text-slate-600 dark:text-slate-400">
                      <div>Email: <span className="font-mono text-slate-800 dark:text-slate-200">{staff.email}</span></div>
                      <div>Phone: <span className="font-mono text-slate-800 dark:text-slate-200">{staff.phone}</span></div>
                      <div className="flex items-center justify-between pt-1">
                        <span>Clients Under Coach:</span>
                        <span className="font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs tabular-nums">
                          {assignedClients} people
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDietitianFilter(staff.id);
                          setActiveWorkspace('clients');
                        }}
                        className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer text-center tabular-nums"
                      >
                        Check Clients Under ({assignedClients})
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingCoach(staff)}
                        className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                        title="Edit Admin / Coach"
                      >
                        Edit
                      </button>
                    </div>

                    {isCurrent ? (
                      <div className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-center font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Currently Active Admin Session</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmAction({ type: 'switch-staff', staffName: staff.name })}
                        className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        title="Sign out and enter username and password to log in as this coach"
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>Sign In as {(staff.name || 'Coach').split(' ')[0]}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add Dietitian Card in Grid */}
            <div
              onClick={() => setIsAddDietitianOpen(true)}
              className="bg-slate-50/70 dark:bg-slate-900/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 rounded-2xl p-5 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[260px] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3 transition-colors">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-900 dark:group-hover:text-emerald-300 text-sm">
                Add New Dietitian
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
                Register a new wellness coach or admin with profile photo file
              </p>
              <span className="mt-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-3 py-1 rounded-lg">
                + Register Coach
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <DietPlanBuilderModal
        isOpen={isPlanBuilderOpen}
        onClose={() => {
          setIsPlanBuilderOpen(false);
          setEditingPlan(null);
        }}
        existingPlan={editingPlan}
      />

      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
      />

      <AddDietitianModal
        isOpen={isAddDietitianOpen}
        onClose={() => setIsAddDietitianOpen(false)}
      />

      {editingCoach && (
        <EditCoachModal
          isOpen={!!editingCoach}
          onClose={() => setEditingCoach(null)}
          coach={editingCoach}
        />
      )}

      {editingClient && (
        <EditClientModal
          isOpen={!!editingClient}
          onClose={() => setEditingClient(null)}
          client={editingClient}
        />
      )}

      <ClientDossierModal
        isOpen={!!viewingClientDossier}
        onClose={() => setViewingClientDossier(null)}
        client={viewingClientDossier}
        onOpenCentreReading={(cId) => {
          setSelectedClientIdForCentre(cId);
          setIsCentreModalOpen(true);
        }}
        onOpenSendTip={(cId) => {
          setSelectedClientIdForTip(cId);
          setIsSendTipOpen(true);
        }}
        onOpenEditClient={(c) => setEditingClient(c)}
      />

      {/* Centre Device Modal & Send Tip Modal appear in front (z-[80]) of Dossier or any active tab without closing it */}
      <CentreDeviceModal
        isOpen={isCentreModalOpen}
        onClose={() => setIsCentreModalOpen(false)}
        preselectedClientId={selectedClientIdForCentre}
      />

      <SendTipModal
        isOpen={isSendTipOpen}
        onClose={() => {
          setIsSendTipOpen(false);
          setSelectedClientIdForTip(null);
        }}
        preselectedClientId={selectedClientIdForTip}
      />

      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        clientId={selectedClientIdForPrint}
      />

      <AppointmentsModal
        isOpen={isAppointmentsModalOpen}
        onClose={() => setIsAppointmentsModalOpen(false)}
        clientId={selectedClientIdForAppointment}
      />

      {/* Inline Confirmation Dialog (Replaces window.confirm across TeamPortal) */}
      {confirmAction && (
        <div className="fixed inset-0 z-[95] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                confirmAction.type === 'delete-client' || confirmAction.type === 'reset'
                  ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400'
                  : 'bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {confirmAction.type === 'reset'
                    ? 'Reset Centre Records?'
                    : confirmAction.type === 'delete-client'
                    ? 'Remove Client?'
                    : 'Switch Coach Session?'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {confirmAction.type === 'reset'
                    ? 'Reset all centre records (clients, meal logs, weights, diet plans, food database) back to default pristine setup?'
                    : confirmAction.type === 'delete-client'
                    ? `Are you sure you want to remove ${confirmAction.clientName} from the centre system?`
                    : `Sign out of ${currentCoach.name} to sign in as ${confirmAction.staffName} using username and password?`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const action = confirmAction;
                  setConfirmAction(null);
                  if (action.type === 'reset') {
                    await executeResetData();
                  } else if (action.type === 'delete-client') {
                    deleteClient(action.clientId);
                  } else if (action.type === 'switch-staff') {
                    staffSignOut();
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer ${
                  confirmAction.type === 'switch-staff'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {confirmAction.type === 'reset'
                  ? 'Confirm Reset'
                  : confirmAction.type === 'delete-client'
                  ? 'Remove Client'
                  : 'Sign Out & Switch'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
