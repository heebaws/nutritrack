import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  ShieldCheck, 
  RotateCcw, 
  Stethoscope, 
  Globe,
  LayoutDashboard,
  LogOut,
  Bot,
  Sparkles
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    activeClient,
    clients,
    quickSwitchClient,
    clientSignOut,
    activeTeamUser,
    dietitians,
    quickSwitchTeamRole,
    resetAllData,
  } = useApp();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo and Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-sm shadow-emerald-200">
                🥗
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-lg tracking-tight">NutriTrack</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                    Wellness Clinic
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Connected Nutrition &amp; Lifestyle Management Portal
                </p>
              </div>
            </div>

            {/* Mobile View Switcher for small screens */}
            <div className="flex md:hidden items-center bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('client')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'client' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Client Portal</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('team')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'team' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Coach Portal</span>
              </button>
            </div>
          </div>

          {/* Center Website Switcher: Client Web Portal vs Coach / Admin Web Portal */}
          <div className="hidden md:flex items-center justify-center">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('client')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  viewMode === 'client'
                    ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>Client Web Portal</span>
                <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                  Client
                </span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('team')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  viewMode === 'team'
                    ? 'bg-white text-blue-800 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                <span>Coach &amp; Admin Portal</span>
                <span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                  Clinic
                </span>
              </button>
            </div>
          </div>

          {/* Right Side: Demo Quick Switchers & Helpers */}
          <div className="flex items-center justify-between md:justify-end gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
            {viewMode === 'client' ? (
              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                {/* Switch Client */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden lg:inline text-slate-400">Viewing Client:</span>
                  <select
                    value={activeClient?.id || ''}
                    onChange={(e) => quickSwitchClient(e.target.value)}
                    aria-label="Select demo client"
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.status === 'active' ? 'Active' : 'Inactive'})
                      </option>
                    ))}
                  </select>
                </div>

                {activeClient && (
                  <button
                    type="button"
                    onClick={clientSignOut}
                    title="Sign Out of Client Portal"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                {/* Team Role Switcher */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden lg:inline text-slate-400">Coach / Staff:</span>
                  <select
                    value={activeTeamUser.id}
                    onChange={(e) => quickSwitchTeamRole(
                      dietitians.find(d => d.id === e.target.value)?.role || 'dietitian',
                      e.target.value
                    )}
                    aria-label="Select staff member"
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
                  >
                    {dietitians.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.role === 'admin' ? 'Main Admin' : 'Wellness Coach'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {activeTeamUser.role === 'admin' ? 'Admin Access' : 'Coach Access'}
                </div>
              </div>
            )}

            {/* Ask AI Bot Button */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-nutribot'))}
              title="Ask NutriBot AI Assistant (Instant Food Calories & Clear Doubts)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Ask AI Bot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* Reset Data Button */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all demo records, meal logs, and measurements back to default?')) {
                  resetAllData();
                }
              }}
              title="Reset Demo Data"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
