import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  Stethoscope, 
  User, 
  Trash2,
  CalendarCheck
} from 'lucide-react';
import { getTodayString } from '../../utils/dateUtils';
import { ClinicAppointment } from '../../types';

interface AppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
}

export const AppointmentsModal: React.FC<AppointmentsModalProps> = ({
  isOpen,
  onClose,
  clientId
}) => {
  const { 
    activeClient, 
    clients, 
    dietitians, 
    appointments, 
    addAppointment, 
    deleteAppointment,
    viewMode
  } = useApp();

  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState<string>('10:30 AM');
  const [type, setType] = useState<ClinicAppointment['type']>('inbody_scan');
  const [location, setLocation] = useState<string>('NutriTrack Clinic Valanchery - Diagnostic Room');
  const [selectedDietitianId, setSelectedDietitianId] = useState<string>(dietitians[0]?.id || 'admin-1');
  const [notes, setNotes] = useState<string>('Periodic InBody 270 scan, body fat % review, and diet adjustment.');

  if (!isOpen) return null;

  const targetClient = clientId 
    ? clients.find(c => c.id === clientId) || activeClient 
    : activeClient;

  if (!targetClient) return null;

  // Filter appointments for this client
  const clientAppointments = appointments.filter(a => a.clientId === targetClient.id);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const coach = dietitians.find(d => d.id === selectedDietitianId) || dietitians[0];

    addAppointment({
      clientId: targetClient.id,
      clientName: targetClient.name,
      dietitianId: coach.id,
      dietitianName: coach.name,
      date,
      time,
      type,
      status: 'scheduled',
      location,
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-700 to-emerald-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
              <CalendarCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Clinic Consultations &amp; Checkups</h2>
              <p className="text-xs text-teal-100 font-medium">
                Patient: <span className="text-white font-bold">{targetClient.name}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Scheduled Appointments */}
        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Scheduled Appointments ({clientAppointments.length})
            </h3>

            {clientAppointments.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-200/80 text-xs text-slate-500">
                No upcoming consultations scheduled yet. Book your next InBody scan or review below!
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {clientAppointments.map((app) => (
                  <div
                    key={app.id}
                    className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-3 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 capitalize">
                          {app.type.replace('_', ' ')}
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {app.status}
                        </span>
                      </div>
                      <p className="text-slate-600 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{app.date} at {app.time}</span>
                        <span className="text-slate-300">•</span>
                        <span>Coach: <b>{app.dietitianName}</b></span>
                      </p>
                      <p className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{app.location}</span>
                      </p>
                      {app.notes && (
                        <p className="text-slate-400 text-[11px] italic mt-1">
                          "{app.notes}"
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteAppointment(app.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Cancel appointment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schedule / Request New Form */}
          <form onSubmit={handleCreate} className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>{viewMode === 'team' ? 'Book New Consultation for Client' : 'Request Next Review Appointment'}</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  min={getTodayString()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-emerald-500 cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Time Slot
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10:30 AM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Appointment Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-emerald-500 cursor-pointer"
                >
                  <option value="inbody_scan">InBody Full Scan &amp; Composition</option>
                  <option value="diet_review">Diet Plan Review &amp; Calories</option>
                  <option value="initial_consult">Clinical Consultation</option>
                  <option value="virtual_checkin">WhatsApp Video Call Review</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Coach / Dietitian
                </label>
                <select
                  value={selectedDietitianId}
                  onChange={(e) => setSelectedDietitianId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-emerald-500 cursor-pointer"
                >
                  {dietitians.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.role === 'admin' ? 'Lead Coach' : 'Wellness Coach'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Location / Branch
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Consultation Purpose / Clinical Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-emerald-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Appointment</span>
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};
