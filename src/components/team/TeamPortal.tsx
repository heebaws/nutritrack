import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FoodDatabaseManager } from './FoodDatabaseManager';
import { CentreDeviceModal } from './CentreDeviceModal';
import { DietPlanBuilderModal } from './DietPlanBuilderModal';
import { SendTipModal } from './SendTipModal';
import { AddClientModal } from './AddClientModal';
import { ClientDossierModal } from './ClientDossierModal';
import { EditCoachModal } from './EditCoachModal';
import { ClientProfile, DietPlan, DietitianProfile } from '../../types';
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
  Lock
} from 'lucide-react';

export const TeamPortal: React.FC = () => {
  const { 
    activeTeamUser, 
    dietitians, 
    clients, 
    foods, 
    dietPlans, 
    measurements, 
    tips,
    sendFollowupReminderToInactive,
    quickSwitchTeamRole,
    deleteClient,
    addDietitian
  } = useApp();

  // Navigation tabs in Team Portal
  const [currentTab, setCurrentTab] = useState<
    'reports' | 'clients' | 'foods' | 'plans' | 'centre' | 'broadcast' | 'staff'
  >('reports');

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
  const [editingCoach, setEditingCoach] = useState<DietitianProfile | null>(null);

  const [viewingClientDossier, setViewingClientDossier] = useState<ClientProfile | null>(null);
  const [quickFollowupSentId, setQuickFollowupSentId] = useState<string | null>(null);

  // Statistics
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active');
  const inactiveClients = clients.filter(c => c.status === 'inactive');

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.phone.includes(clientSearch);
      const matchDietitian = dietitianFilter === 'all' || c.assignedDietitianId === dietitianFilter;
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchDietitian && matchStatus;
    });
  }, [clients, clientSearch, dietitianFilter, statusFilter]);

  // Centre device readings count
  const centreReadings = useMemo(() => {
    return measurements.filter(m => m.source === 'centre_device');
  }, [measurements]);

  const handleSendInactiveFollowup = (clientId: string) => {
    sendFollowupReminderToInactive(clientId);
    setQuickFollowupSentId(clientId);
    setTimeout(() => setQuickFollowupSentId(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Team Portal Top Banner with Active Staff Profile */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={activeTeamUser.avatarUrl || 'https://images.unsplash.com/photo-1594824813637-27a3a93d4895?auto=format&fit=crop&q=80&w=250'}
            alt={activeTeamUser.name}
            className="w-13 h-13 rounded-2xl object-cover border-2 border-blue-500 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">{activeTeamUser.name}</h1>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                activeTeamUser.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}>
                <ShieldCheck className="w-3 h-3" />
                {activeTeamUser.role === 'admin' ? 'Clinic Administrator' : 'Clinical Dietitian'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTeamUser.title} • {activeTeamUser.specialization}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setEditingCoach(activeTeamUser)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Admin Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddClientOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedClientIdForCentre(clients[0]?.id);
              setIsCentreModalOpen(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Enter Centre Reading</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedClientIdForTip(null);
              setIsSendTipOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send Tips &amp; Reminders</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setCurrentTab('reports')}
          className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors ${
            currentTab === 'reports'
              ? 'border-blue-600 text-blue-600 bg-blue-50/30'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Active &amp; Inactive Reports</span>
          {inactiveClients.length > 0 && (
            <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {inactiveClients.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('clients')}
          className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors ${
            currentTab === 'clients'
              ? 'border-blue-600 text-blue-600 bg-blue-50/30'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Clients Directory ({totalClients})</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('foods')}
          className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors ${
            currentTab === 'foods'
              ? 'border-blue-600 text-blue-600 bg-blue-50/30'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Food Database ({foods.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('plans')}
          className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors ${
            currentTab === 'plans'
              ? 'border-blue-600 text-blue-600 bg-blue-50/30'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Diet Plans ({dietPlans.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('centre')}
          className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors ${
            currentTab === 'centre'
              ? 'border-blue-600 text-blue-600 bg-blue-50/30'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Centre Device Readings ({centreReadings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('broadcast')}
          className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors ${
            currentTab === 'broadcast'
              ? 'border-blue-600 text-blue-600 bg-blue-50/30'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Tips &amp; Reminders Sent ({tips.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('staff')}
          className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors ${
            currentTab === 'staff'
              ? 'border-blue-600 text-blue-600 bg-blue-50/30'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Staff &amp; Role Logins</span>
        </button>
      </div>

      {/* ================= VIEW 1: ACTIVE & INACTIVE REPORTS ================= */}
      {currentTab === 'reports' && (
        <div className="space-y-6">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total Enrolled Clients</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 mt-2">{totalClients}</div>
              <p className="text-xs text-slate-500 mt-1">Across all assigned clinic dietitians</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-linear-to-b from-emerald-50/30 to-white shadow-xs">
              <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
                <span>Active Clients</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-emerald-700 mt-2">{activeClients.length}</div>
              <p className="text-xs text-emerald-700 mt-1">
                {Math.round((activeClients.length / totalClients) * 100)}% active logging meals &amp; measurements
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-linear-to-b from-rose-50/30 to-white shadow-xs">
              <div className="flex items-center justify-between text-rose-800 text-xs font-semibold">
                <span>Inactive / At-Risk Clients</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl font-black text-rose-600 mt-2">{inactiveClients.length}</div>
              <p className="text-xs text-rose-600 mt-1">No logs recorded in the last 3+ days</p>
            </div>
          </div>

          {/* Simple Report: Inactive Clients Requiring Attention */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Client Activity &amp; Inactivity Report
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Identifies clients who have stopped logging so dietitians can follow up early.
                </p>
              </div>

              {inactiveClients.length > 0 && (
                <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                  {inactiveClients.length} clients need follow-up
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Assigned Dietitian</th>
                    <th className="py-3 px-4">Primary Goal</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.map((client) => {
                    const dietitian = dietitians.find(d => d.id === client.assignedDietitianId);
                    const isInactive = client.status === 'inactive';

                    return (
                      <tr 
                        key={client.id} 
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isInactive ? 'bg-rose-50/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={client.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                              alt={client.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <span className="font-semibold text-slate-900 block">{client.name}</span>
                              <span className="text-[11px] text-slate-500">{client.phone}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-medium text-slate-700">
                          {dietitian?.name || 'Unassigned'}
                        </td>

                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                          {client.goal}
                        </td>

                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isInactive 
                              ? 'bg-rose-100 text-rose-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {client.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-600">
                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{client.lastActiveDate}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isInactive && (
                              <button
                                type="button"
                                onClick={() => handleSendInactiveFollowup(client.id)}
                                disabled={quickFollowupSentId === client.id}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-2.5 py-1 rounded-lg text-[11px] transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                              >
                                {quickFollowupSentId === client.id ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Sent!</span>
                                  </>
                                ) : (
                                  <>
                                    <Bell className="w-3 h-3" />
                                    <span>Send Reminder</span>
                                  </>
                                )}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setViewingClientDossier(client)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded-lg text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
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

        </div>
      )}

      {/* ================= VIEW 2: CLIENTS DIRECTORY ================= */}
      {currentTab === 'clients' && (
        <div className="space-y-4">
          
          {/* Search and Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Search client by name, username or phone..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Dietitian filter */}
                <select
                  value={dietitianFilter}
                  onChange={(e) => setDietitianFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
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
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {/* View switcher: Table vs Cards */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setClientViewMode('table')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      clientViewMode === 'table'
                        ? 'bg-white text-blue-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>📊 All Columns Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientViewMode('cards')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      clientViewMode === 'cards'
                        ? 'bg-white text-blue-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
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
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                Check People Under:
              </span>
              <button
                type="button"
                onClick={() => setDietitianFilter('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer text-xs ${
                  dietitianFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{d.name}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
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
                  <tbody className="divide-y divide-slate-100">
                    {filteredClients.map((client) => {
                      const dietitian = dietitians.find(d => d.id === client.assignedDietitianId);
                      const plan = dietPlans.find(p => p.id === client.dietPlanId);
                      const isInactive = client.status === 'inactive';
                      
                      // Fat norm calculation
                      const fatNormLabel = client.gender === 'Male' ? '10–30%' : '20–30%';
                      const isFatHigh = client.bodyFatPercentage ? client.bodyFatPercentage > 30 : false;

                      return (
                        <tr 
                          key={client.id}
                          className={`hover:bg-slate-50/90 transition-colors ${
                            isInactive ? 'bg-rose-50/20' : ''
                          }`}
                        >
                          {/* 1. Client & Contact */}
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={client.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                                alt={client.name}
                                className="w-8 h-8 rounded-full object-cover shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{client.name}</span>
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    ({client.gender}, {client.age}y)
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                                  <span>{client.phone}</span>
                                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase ${
                                    isInactive ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    {client.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Weight & Needed Weight */}
                          <td className="py-3 px-3">
                            <div className="space-y-0.5">
                              <div className="flex items-baseline gap-1.5">
                                <span className="font-black text-slate-900 text-sm">{client.currentWeightKg}</span>
                                <span className="text-[10px] text-slate-400">kg</span>
                              </div>
                              <div className="text-[11px] text-emerald-700 font-medium">
                                Needed: <b className="font-bold">{client.targetWeightKg} kg</b>
                              </div>
                            </div>
                          </td>

                          {/* 3. Fat % (Men 10-30, Women 20-30) */}
                          <td className="py-3 px-3">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-slate-900 text-sm">
                                  {client.bodyFatPercentage ?? '--'}%
                                </span>
                                {isFatHigh && (
                                  <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1 rounded-sm">
                                    High
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Needed: <strong className="text-emerald-700">{client.targetBodyFatPercentage ?? '--'}%</strong> <span className="text-slate-400">({fatNormLabel})</span>
                              </div>
                            </div>
                          </td>

                          {/* 4. Visceral Fat (V-Fat: 5-9) */}
                          <td className="py-3 px-3">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-slate-900 text-sm">
                                  {client.visceralFat ?? '--'}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                  (client.visceralFat ?? 0) > 14 
                                    ? 'bg-rose-100 text-rose-800' 
                                    : (client.visceralFat ?? 0) >= 10 
                                    ? 'bg-amber-100 text-amber-800' 
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {(client.visceralFat ?? 0) > 14 ? 'High' : (client.visceralFat ?? 0) >= 10 ? 'Elevated' : 'Optimal'}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Needed: <strong className="text-emerald-700">5 – 9</strong>
                              </div>
                            </div>
                          </td>

                          {/* 5. BMI (15-23) */}
                          <td className="py-3 px-3">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-slate-900 text-sm">
                                  {client.bmi ?? '--'}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                  (client.bmi ?? 0) > 23 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {(client.bmi ?? 0) > 23 ? 'Higher' : 'Optimal'}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Needed: <strong className="text-emerald-700">{client.targetBmi ?? '15–23'}</strong>
                              </div>
                            </div>
                          </td>

                          {/* 6. BMR & Work Status */}
                          <td className="py-3 px-3">
                            <div className="space-y-0.5 max-w-[150px]">
                              <div className="flex items-baseline gap-1">
                                <span className="font-bold text-slate-900">{client.bmr ?? '--'}</span>
                                <span className="text-[10px] text-slate-400">kcal (Base)</span>
                              </div>
                              <div className="text-[10px] text-purple-800 font-medium truncate" title={client.bmrStatus}>
                                {client.bmrStatus || `Req: ${client.targetBmr || '--'} kcal`}
                              </div>
                            </div>
                          </td>

                          {/* Coach & Plan */}
                          <td className="py-3 px-3">
                            <div className="text-slate-800 font-medium">{dietitian?.name || 'Unassigned'}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{plan?.title || 'No plan'}</div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedClientIdForCentre(client.id);
                                  setIsCentreModalOpen(true);
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2 py-1 rounded-lg text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                                title="InBody / Device Scan"
                              >
                                <Building2 className="w-3 h-3 text-blue-600" />
                                <span>Scan</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setViewingClientDossier(client)}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-lg text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Dossier</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to remove ${client.name}?`)) {
                                    deleteClient(client.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
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
                const dietitian = dietitians.find(d => d.id === client.assignedDietitianId);
                const plan = dietPlans.find(p => p.id === client.dietPlanId);
                const uName = client.username || client.name.split(' ')[0].toLowerCase();
                const uPass = client.password || 'password123';

                return (
                  <div 
                    key={client.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Avatar, Name, Status */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={client.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                            alt={client.name}
                            className="w-11 h-11 rounded-full object-cover border-2 border-slate-100"
                          />
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm leading-tight">{client.name}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Phone: {client.phone}</p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          client.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {client.status}
                        </span>
                      </div>

                      {/* Portal Credentials Pill */}
                      <div className="mt-2.5 px-2.5 py-1.5 bg-emerald-50/80 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-emerald-900 font-medium truncate">
                          <KeyRound className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">User: <b className="font-mono text-emerald-800">{uName}</b></span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-600 shrink-0">
                          Pass: <b className="text-slate-800">{uPass}</b>
                        </div>
                      </div>

                      {/* Primary Goal */}
                      <div className="mt-2 text-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Primary Goal</span>
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1">{client.goal}</p>
                      </div>

                      {/* Clinical Health & Body Composition Grid */}
                      <div className="mt-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-2">
                        {/* Weight Row */}
                        <div className="grid grid-cols-3 gap-1 text-center text-xs">
                          <div>
                            <span className="text-[9px] text-slate-400 block">Start</span>
                            <span className="font-bold text-slate-700">{client.startingWeightKg} kg</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-blue-600 block">Current</span>
                            <span className="font-bold text-blue-700">{client.currentWeightKg} kg</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-emerald-600 block">Needed</span>
                            <span className="font-bold text-emerald-700">{client.targetWeightKg} kg</span>
                          </div>
                        </div>

                        {/* Extended Body Composition Metrics */}
                        <div className="pt-2 border-t border-slate-200/70 grid grid-cols-3 gap-1 text-center text-[11px]">
                          <div className="bg-white p-1 rounded-md border border-slate-100">
                            <span className="text-[9px] text-amber-700 block font-semibold">Fat %</span>
                            <span className="font-bold text-slate-800">{client.bodyFatPercentage ?? '--'}%</span>
                            <span className="text-[8px] text-slate-400 block">Ned: {client.targetBodyFatPercentage ?? '--'}%</span>
                          </div>
                          <div className="bg-white p-1 rounded-md border border-slate-100">
                            <span className="text-[9px] text-rose-700 block font-semibold">V-Fat</span>
                            <span className="font-bold text-slate-800">{client.visceralFat ?? '--'}</span>
                            <span className="text-[8px] text-emerald-600 block">Ned: 5-9</span>
                          </div>
                          <div className="bg-white p-1 rounded-md border border-slate-100">
                            <span className="text-[9px] text-blue-700 block font-semibold">BMI</span>
                            <span className="font-bold text-slate-800">{client.bmi ?? '--'}</span>
                            <span className="text-[8px] text-emerald-600 block">Ned: 15-23</span>
                          </div>
                        </div>

                        {/* BMR & Status Footer */}
                        <div className="text-[10px] text-purple-900 bg-purple-50/80 px-2 py-1 rounded-md flex items-center justify-between">
                          <span className="font-semibold">BMR: {client.bmr || '--'} kcal</span>
                          <span className="text-[9px] text-purple-700 truncate max-w-[130px]">{client.bmrStatus || `Req: ${client.targetBmr || '--'} kcal`}</span>
                        </div>
                      </div>

                      {/* Assigned Dietitian & Plan */}
                      <div className="mt-2.5 space-y-1 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Coach:</span>
                          <span className="font-semibold text-slate-800">{dietitian?.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Plan:</span>
                          <span className="font-medium text-slate-800 truncate max-w-[150px]">{plan?.title || 'None'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Last Active:</span>
                          <span className="font-mono text-slate-600">{client.lastActiveDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClientIdForCentre(client.id);
                          setIsCentreModalOpen(true);
                        }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>+ Scan</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove ${client.name} from the clinic system?`)) {
                              deleteClient(client.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete client"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setViewingClientDossier(client)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
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
      {currentTab === 'foods' && (
        <FoodDatabaseManager />
      )}

      {/* ================= VIEW 4: DIET PLANS ================= */}
      {currentTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                Diet Plans Repository
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
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
                <div key={plan.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          {assignedCount} Clients Assigned
                        </span>
                        <h3 className="font-bold text-slate-900 text-base mt-2">{plan.title}</h3>
                        <p className="text-xs text-slate-600 mt-1">{plan.description}</p>
                      </div>
                    </div>

                    {/* Macro pill summary */}
                    <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                      <div className="bg-amber-50 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Calories</span>
                        <span className="text-xs font-black text-amber-800">{plan.targetCalories}</span>
                      </div>
                      <div className="bg-emerald-50 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Protein</span>
                        <span className="text-xs font-black text-emerald-800">{plan.targetProtein}g</span>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Carbs</span>
                        <span className="text-xs font-black text-blue-800">{plan.targetCarbs}g</span>
                      </div>
                      <div className="bg-purple-50 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Fat</span>
                        <span className="text-xs font-black text-purple-800">{plan.targetFat}g</span>
                      </div>
                    </div>

                    {/* Meal slots summary */}
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-700 block">Included Meal Slots:</span>
                      {plan.meals.map(m => (
                        <div key={m.mealType} className="text-xs text-slate-600 flex items-center justify-between">
                          <span className="font-medium text-slate-800">• {m.mealType} ({m.timeGuideline})</span>
                          <span className="text-[11px] text-slate-400">{m.recommendedFoods.length} foods recommended</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlan(plan);
                        setIsPlanBuilderOpen(true);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
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
      {currentTab === 'centre' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Centre Device Readings (Entered by Hand)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official clinical assessments from InBody 270, Tanita, or clinic stadiometers
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

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
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
                <tbody className="divide-y divide-slate-100">
                  {centreReadings.map((reading) => {
                    const client = clients.find(c => c.id === reading.clientId);

                    return (
                      <tr key={reading.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-700">{reading.date}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {client?.name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-blue-700 font-medium">
                          {reading.deviceModel}
                        </td>
                        <td className="py-3 px-4 font-black text-slate-900">{reading.weightKg} kg</td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{reading.bmi || '-'}</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">{reading.bodyFatPercentage ? `${reading.bodyFatPercentage}%` : '-'}</td>
                        <td className="py-3 px-4 text-slate-700">{reading.muscleMassKg ? `${reading.muscleMassKg} kg` : '-'}</td>
                        <td className="py-3 px-4 text-slate-700">{reading.visceralFatLevel ? `Level ${reading.visceralFatLevel}` : '-'}</td>
                        <td className="py-3 px-4 text-slate-500">{reading.enteredBy}</td>
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
      {currentTab === 'broadcast' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                Tips &amp; Reminders Broadcast
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
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
                <div key={tip.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          tip.type === 'note' ? 'bg-purple-100 text-purple-800' :
                          tip.type === 'reminder' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {tip.type}
                        </span>
                        <span className="text-xs text-slate-500">
                          Recipient: <b className="text-slate-800">{tip.targetAudience === 'all' ? 'All Clients' : client?.name || 'Targeted'}</b>
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{tip.title}</h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{tip.createdAt}</span>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed">
                    {tip.message}
                  </p>

                  <div className="text-[11px] text-slate-400 pt-1">
                    Sent by: <span className="font-medium text-slate-600">{tip.dietitianName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= VIEW 7: STAFF & SEPARATE ROLE LOGINS ================= */}
      {currentTab === 'staff' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Team Logins &amp; Wellness Coach Management
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Main Admin Saleem Valanchery and Wellness Coach Faseela Saleem oversee clients, diet plans, daily calorie intakes, and device scans. Admins can edit coach profiles, credentials, and manage all assigned clients.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setEditingCoach(activeTeamUser)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit My Admin Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dietitians.map((staff) => {
              const isCurrent = activeTeamUser.id === staff.id;
              const assignedClients = clients.filter(c => c.assignedDietitianId === staff.id).length;
              const staffUser = staff.username || staff.name.toLowerCase().replace(/[^a-z0-9]/g, '');
              const staffPass = staff.password || 'password123';

              return (
                <div 
                  key={staff.id} 
                  className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    isCurrent ? 'border-purple-500 ring-2 ring-purple-100 shadow-md' : 'border-slate-200 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <img
                        src={staff.avatarUrl || 'https://images.unsplash.com/photo-1594824813637-27a3a93d4895?auto=format&fit=crop&q=80&w=250'}
                        alt={staff.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100"
                      />
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          staff.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {staff.role === 'admin' ? 'Main Admin' : 'Wellness Coach'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{staff.name}</h3>
                        <p className="text-xs text-purple-700 font-semibold">{staff.title}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingCoach(staff)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit this coach / admin profile"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{staff.bio}</p>

                    {/* Staff Login Credentials Box */}
                    <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <KeyRound className="w-3 h-3 text-purple-600" />
                        <span>Portal Credentials</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Username:</span>
                        <span className="font-mono font-bold text-slate-800">{staffUser}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Password:</span>
                        <span className="font-mono text-slate-700">{staffPass}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                      <div>Email: <span className="font-mono text-slate-800">{staff.email}</span></div>
                      <div>Phone: <span className="font-mono text-slate-800">{staff.phone}</span></div>
                      <div className="flex items-center justify-between pt-1">
                        <span>Clients Under Coach:</span>
                        <span className="font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                          {assignedClients} people
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDietitianFilter(staff.id);
                          setCurrentTab('clients');
                        }}
                        className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer text-center"
                      >
                        Check Clients Under ({assignedClients})
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingCoach(staff)}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                        title="Edit Admin / Coach"
                      >
                        Edit
                      </button>
                    </div>

                    {isCurrent ? (
                      <div className="w-full py-2 bg-emerald-50 text-emerald-800 text-center font-bold text-xs rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Currently Active Admin Session</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => quickSwitchTeamRole(staff.role, staff.id)}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Switch Session to {staff.name.split(' ')[0]}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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

      {editingCoach && (
        <EditCoachModal
          isOpen={!!editingCoach}
          onClose={() => setEditingCoach(null)}
          coach={editingCoach}
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

    </div>
  );
};
