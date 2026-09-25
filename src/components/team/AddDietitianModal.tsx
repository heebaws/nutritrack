import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, Upload, Camera, Check, ShieldCheck, Stethoscope } from 'lucide-react';

interface AddDietitianModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDietitianModal: React.FC<AddDietitianModalProps> = ({ isOpen, onClose }) => {
  const { addDietitian } = useApp();

  const [name, setName] = useState('');
  const [role, setRole] = useState<'dietitian' | 'admin'>('dietitian');
  const [title, setTitle] = useState('Wellness Coach & Nutritionist');
  const [specialization, setSpecialization] = useState('Weight Management & Clinical Nutrition');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('coach123');

  // Profile Picture File State
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalUsername = username.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const fallbackAvatar = `https://images.unsplash.com/photo-1594824813637-27a3a93d4895?auto=format&fit=crop&q=80&w=250`;

    addDietitian({
      name: name.trim(),
      role,
      title: title.trim() || 'Wellness Coach',
      specialization: specialization.trim() || 'Clinical Nutrition & Dietetics',
      email: email.trim() || `${finalUsername}@wellnessclinic.com`,
      phone: phone.trim() || '+91 98470 00000',
      bio: bio.trim() || 'Dedicated wellness professional focused on personalized client nutrition and sustainable metabolic health.',
      username: finalUsername,
      password: password.trim() || 'password123',
      avatarUrl: avatarPreview || fallbackAvatar,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add New Dietitian / Wellness Coach</h2>
              <p className="text-xs text-slate-500">Register a new healthcare practitioner or admin to the team</p>
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
          {/* PROFILE PICTURE FILE UPLOAD SECTION */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
              Dietitian Profile Picture (File Upload)
            </label>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Picture Preview */}
              <div className="relative shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-700 flex flex-col items-center justify-center border-2 border-dashed border-emerald-300">
                    <Camera className="w-6 h-6" />
                    <span className="text-[10px] font-bold mt-1">No Pic</span>
                  </div>
                )}
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarPreview('');
                      setFileName('');
                    }}
                    className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-1 shadow-sm hover:bg-rose-700 cursor-pointer"
                    title="Remove picture"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Upload Drop Zone / Input */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="flex-1 w-full border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-3 text-center bg-white transition-colors cursor-pointer relative"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  id="dietitian-pic-file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-1">
                  <Upload className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-slate-800">
                    {fileName ? fileName : 'Choose photo file or drag & drop'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Supports JPG, PNG, WEBP files
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Ayesha Rahman"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Role &amp; Permissions *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'dietitian')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
              >
                <option value="dietitian">Wellness Coach / Dietitian</option>
                <option value="admin">Clinic Administrator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Professional Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Clinical Dietitian"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Specialization *
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Metabolic &amp; PCOS Nutrition"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98470 12345"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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
                placeholder="ayesha@wellnessclinic.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-600 mb-1">
              Professional Bio &amp; Philosophy
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Provide a brief summary of the coach's credentials, dietary approach, and patient consultation style..."
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Login Credentials Box */}
          <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Coach Portal Login Credentials</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Set the username and password used to access the staff portal.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-0.5">
                  Portal Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={name ? name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'ayesha'}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-0.5">
                  Portal Password
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="coach123"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Add Dietitian</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
