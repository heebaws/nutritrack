import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DietitianProfile } from '../../types';
import { X, ShieldCheck, Check, KeyRound, Upload, Camera } from 'lucide-react';

interface EditCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  coach: DietitianProfile;
}

export const EditCoachModal: React.FC<EditCoachModalProps> = ({ isOpen, onClose, coach }) => {
  const { updateDietitian } = useApp();

  const [name, setName] = useState(coach?.name || '');
  const [role, setRole] = useState<'super_admin' | 'admin' | 'dietitian'>(coach?.role || 'admin');
  const [title, setTitle] = useState(coach?.title || '');
  const [specialization, setSpecialization] = useState(coach?.specialization || '');
  const [email, setEmail] = useState(coach?.email || '');
  const [phone, setPhone] = useState(coach?.phone || '');
  const [bio, setBio] = useState(coach?.bio || '');
  const [username, setUsername] = useState(coach?.username || coach?.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || '');
  const [password, setPassword] = useState(coach?.password || 'password123');
  const [avatarUrl, setAvatarUrl] = useState(coach?.avatarUrl || '');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (!coach) return;
    setName(coach.name || '');
    setRole(coach.role || 'admin');
    setTitle(coach.title || '');
    setSpecialization(coach.specialization || '');
    setEmail(coach.email || '');
    setPhone(coach.phone || '');
    setBio(coach.bio || '');
    setUsername(coach.username || coach.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || '');
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
      isSuperAdmin: role === 'super_admin' || coach.isSuperAdmin,
      title: title.trim() || 'Wellness Coach',
      specialization: specialization.trim() || 'Holistic Wellness & Nutrition',
      email: email.trim() || 'coach@wellnesscentre.com',
      phone: phone.trim() || '+91 98470 00000',
      bio: bio.trim(),
      username: username.trim() || 'admin',
      password: password.trim() || 'password123',
      avatarUrl: avatarUrl.trim() || coach.avatarUrl,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-transparent dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-purple-50/60 dark:bg-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Edit Coach / Admin Profile</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Update centre details, credentials, and coaching profile</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Saleem Valanchery"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                System Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              >
                <option value="super_admin">👑 Super Admin (Full Centre &amp; Food Library Authority)</option>
                <option value="admin">Centre Administrator &amp; Wellness Coach</option>
                <option value="dietitian">Wellness Coach / Dietitian</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Professional Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Wellness Coach & Lead Centre Admin"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Specialization
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Holistic Wellness, Weight Loss & Lifestyle Coaching"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98470 12345"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="saleem@wellnesscentre.com"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Login Credentials Box */}
          <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-900 space-y-2">
            <div className="text-[11px] font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
              <span>Admin / Coach Login Credentials</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="saleem"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Coach Bio &amp; Philosophy
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe coaching background, guiding principles, and client methodology..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-900 dark:text-slate-100 leading-relaxed"
            />
          </div>

          {/* Profile Picture File Upload */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <label className="block font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">
              Coach Profile Picture (Upload as File)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex flex-col items-center justify-center border-2 border-dashed border-purple-300 dark:border-purple-700">
                    <Camera className="w-5 h-5" />
                    <span className="text-[9px] font-bold mt-0.5">No Pic</span>
                  </div>
                )}
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarUrl('');
                      setFileName('');
                    }}
                    className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-1 shadow-sm hover:bg-rose-700 cursor-pointer"
                    title="Remove picture"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex-1 w-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 rounded-xl p-3 text-center bg-white dark:bg-slate-900 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFileName(file.name);
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setAvatarUrl(event.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  id="edit-coach-pic-file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-1">
                  <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {fileName ? fileName : 'Upload photo file or drag & drop'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    Supports JPG, PNG, WEBP files
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl cursor-pointer"
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
