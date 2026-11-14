import React from 'react';
import { useApp } from '../../context/AppContext';
import { WaterTrackerCard } from './WaterTrackerCard';
import { X, Droplets } from 'lucide-react';

interface HydrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HydrationModal: React.FC<HydrationModalProps> = ({ isOpen, onClose }) => {
  const { activeClient, selectedDate, t } = useApp();

  if (!isOpen || !activeClient) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clean Header matching ActivityLogModal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-cyan-600 to-sky-600 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                {t('Daily Hydration Tracker')}
              </h2>
              <p className="text-xs text-cyan-100 font-medium tabular-nums">
                {selectedDate} · {t('Consumed')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors cursor-pointer"
            title={t('Close')}
          >
            <X className="w-4 h-4" />
            <span>{t('Close')}</span>
          </button>
        </div>

        {/* Modal Body containing full WaterTrackerCard */}
        <div className="p-4 sm:p-5 overflow-y-auto bg-slate-50/50">
          <WaterTrackerCard />
        </div>
      </div>
    </div>
  );
};
