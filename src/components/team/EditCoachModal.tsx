import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DietitianProfile } from '../../types';
import { X, ShieldCheck, Check, KeyRound } from 'lucide-react';

interface EditCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  coach: DietitianProfile;
}

export const EditCoachModal: React.FC<EditCoachModalProps> = ({ isOpen, onClose, coach }) => {
  const { updateDietitian } = useApp();

  const [name, setName] = useState(coach.name);
  const [role, setRole] = useState<'admin' | 'dietitian'>(coach.role);
  const [title, setTitle] = useState(coach.title);
  const [specialization, setSpecialization] = useState(coach.specialization);
  const [email, setEmail] = useState(coach.email);
  const [phone, setPhone] = useState(coach.phone);
  const [bio, setBio] = useState(coach.bio);
  const [username, setUsername] = useState(coach.username || coach.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const [password, setPassword] = useState(coach.password || 'password123');
  const [avatarUrl, setAvatarUrl] = useState(coach.avatarUrl || '');

  useEffect(() => {
    setName(coach.name);
    setRole(coach.role);
    setTitle(coach.title);
    setSpecialization(coach.specialization);
    setEmail(coach.email);
    setPhone(coach.phone);
    setBio(coach.bio);
    setUsername(coach.username || coach.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
    setPassword(coach.password || 'password123');
    setAvatarUrl(coach.avatarUrl || '');
  }, [coach, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateDietitian({
      ...coach,
      name: name.trim(),
      role,
      title: title.trim() || 'Wellness Coach',
      specialization: specialization.trim() || 'Holistic Wellness & Nutrition',
      email: email.trim() || 'coach@wellnessclinic.com',
      phone: phone.trim() || '+91 98470 00000',
      bio: bio.trim(),
      username: username.trim() || 'admin',
      password: password.trim() || 'password123',
      avatarUrl: avatarUrl.trim() || coach.avatarUrl,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-purple-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Edit Coach / Admin Profile</h2>
              <p className="text-xs text-slate-500">Update clinic details, credentials, and coaching profile</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Saleem Valanchery"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                System Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'dietitian')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              >
                <option value="admin">Clinic Administrator &amp; Wellness Coach</option>
                <option value="dietitian">Wellness Coach / Dietitian</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Professional Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Wellness Coach & Lead Clinic Admin"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Specialization
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Holistic Wellness, Weight Loss & Lifestyle Coaching"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98470 12345"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="saleem@wellnessclinic.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Login Credentials Box */}
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2">
            <div className="text-[11px] font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-purple-700" />
              <span>Admin / Coach Login Credentials</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="saleem"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-600 mb-1">
              Coach Bio &amp; Philosophy
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe coaching background, guiding principles, and client methodology..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 leading-relaxed"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-600 mb-1">
              Profile Avatar Image URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-700 text-[11px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Admin Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
