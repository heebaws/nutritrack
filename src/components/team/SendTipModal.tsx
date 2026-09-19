import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, Sparkles, CheckCircle2 } from 'lucide-react';

interface SendTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedClientId?: string | null;
  defaultType?: 'tip' | 'note' | 'reminder';
}

export const SendTipModal: React.FC<SendTipModalProps> = ({
  isOpen,
  onClose,
  preselectedClientId = null,
  defaultType = 'tip',
}) => {
  const { clients, activeTeamUser, sendTipOrReminder } = useApp();

  const [targetAudience, setTargetAudience] = useState<'all' | 'specific' | 'inactive'>(
    preselectedClientId ? 'specific' : 'all'
  );
  const [selectedClientId, setSelectedClientId] = useState<string>(preselectedClientId || (clients[0]?.id ?? ''));
  const [type, setType] = useState<'tip' | 'note' | 'reminder'>(defaultType);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    sendTipOrReminder({
      dietitianId: activeTeamUser.id,
      dietitianName: activeTeamUser.name,
      clientId: targetAudience === 'specific' ? selectedClientId : null,
      targetAudience,
      type,
      title: title.trim(),
      message: message.trim(),
    });

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
      setTitle('');
      setMessage('');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Send Tip or Reminder</h2>
              <p className="text-xs text-slate-500">Delivered directly to client's phone app</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          
          {/* Target Audience */}
          <div>
            <label className="block font-semibold uppercase text-slate-600 mb-1">
              Recipient
            </label>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              <button
                type="button"
                onClick={() => setTargetAudience('all')}
                className={`py-1.5 px-2 rounded-lg font-medium border text-center transition-colors ${
                  targetAudience === 'all'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Clients
              </button>
              <button
                type="button"
                onClick={() => setTargetAudience('specific')}
                className={`py-1.5 px-2 rounded-lg font-medium border text-center transition-colors ${
                  targetAudience === 'specific'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Specific Client
              </button>
              <button
                type="button"
                onClick={() => setTargetAudience('inactive')}
                className={`py-1.5 px-2 rounded-lg font-medium border text-center transition-colors ${
                  targetAudience === 'inactive'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Inactive Clients
              </button>
            </div>

            {targetAudience === 'specific' && (
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone} - {c.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Type Selector */}
          <div>
            <label className="block font-semibold uppercase text-slate-600 mb-1">
              Communication Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('tip')}
                className={`py-1.5 px-2 rounded-lg font-medium border text-center transition-colors ${
                  type === 'tip'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                💡 Nutrition Tip
              </button>
              <button
                type="button"
                onClick={() => setType('note')}
                className={`py-1.5 px-2 rounded-lg font-medium border text-center transition-colors ${
                  type === 'note'
                    ? 'bg-purple-50 text-purple-800 border-purple-300 font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                📝 Clinician Note
              </button>
              <button
                type="button"
                onClick={() => setType('reminder')}
                className={`py-1.5 px-2 rounded-lg font-medium border text-center transition-colors ${
                  type === 'reminder'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                🔔 Reminder
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold uppercase text-slate-600 mb-1">
              Subject / Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Remember to drink 500ml water with lunch"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              required
            />
          </div>

          {/* Message Content */}
          <div>
            <label className="block font-semibold uppercase text-slate-600 mb-1">
              Message Content *
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your note or advice..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              required
            />
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSent || !title.trim() || !message.trim()}
              className="px-5 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSent ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Delivered!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to App</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
