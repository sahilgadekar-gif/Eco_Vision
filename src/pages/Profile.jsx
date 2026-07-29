import { useState, useMemo } from 'react';
import { User, Mail, Lock, LogOut, Trash2, Eye, EyeOff, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calculationAPI } from '../services/api';
import { getHistory } from '../services/storage';
import { SectionHeader } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const BADGES = [
  { id: 'first_calc',  emoji: '🌱', label: 'First Step',    desc: 'Completed first calculation' },
  { id: 'eco_warrior', emoji: '🌿', label: 'Eco Warrior',   desc: 'Eco score above 70' },
  { id: 'green_champ', emoji: '🏆', label: 'Green Champion',desc: '5+ calculations completed' },
  { id: 'low_carbon',  emoji: '🌍', label: 'Low Carbon',    desc: 'Achieved Low Emission status' },
];

const Profile = () => {
  const { user, updateProfile, changePassword, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  // Load history (from backend, fallback to local)
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await calculationAPI.getAll();
        if (data.success) setHistory(data.data);
      } catch {
        setHistory(user ? getHistory(user.email) : []);
      }
    };
    load();
  }, [user]);

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [profileSaving, setProfileSaving] = useState(false);

  // Password form
  const [pwForm,  setPwForm]  = useState({ current: '', newPw: '', confirm: '' });
  const [showPw,  setShowPw]  = useState({ current: false, newPw: false, confirm: false });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving,  setPwSaving]  = useState(false);

  // Stats
  const stats = useMemo(() => {
    const avgScore = history.length
      ? Math.round(history.reduce((s, r) => s + r.ecoScore, 0) / history.length)
      : 0;
    const best = history.length ? Math.max(...history.map((r) => r.ecoScore)) : 0;
    return { count: history.length, avgScore, best };
  }, [history]);

  // Earned badges
  const earnedBadges = useMemo(() => {
    const ids = new Set();
    if (history.length >= 1)                                   ids.add('first_calc');
    if (history.some((r) => r.ecoScore >= 70))                ids.add('eco_warrior');
    if (history.length >= 5)                                   ids.add('green_champ');
    if (history.some((r) => r.category?.includes('Low')))     ids.add('low_carbon');
    return ids;
  }, [history]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) { toast.error('Name cannot be empty'); return; }
    setProfileSaving(true);
    const res = await updateProfile({ name: profileForm.name.trim(), bio: profileForm.bio });
    if (res.success) toast.success('Profile updated! ✅');
    else              toast.error(res.error || 'Update failed.');
    setProfileSaving(false);
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.current)               errs.current = 'Required';
    if (pwForm.newPw.length < 8)       errs.newPw   = 'Min 8 characters';
    if (pwForm.newPw !== pwForm.confirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setPwErrors(errs); return; }

    setPwSaving(true);
    const res = await changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw });
    if (res.success) {
      toast.success('Password updated! 🔒');
      setPwForm({ current: '', newPw: '', confirm: '' });
    } else {
      toast.error(res.error || 'Password change failed.');
      setPwErrors({ current: res.error });
    }
    setPwSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This permanently deletes your account and all data.')) return;
    if (!window.confirm('Final confirmation: delete everything?')) return;
    const res = await deleteAccount();
    if (res.success) {
      navigate('/');
      toast.success('Account deleted.');
    } else {
      toast.error(res.error || 'Delete failed.');
    }
  };

  const toggleShow = (field) => setShowPw((p) => ({ ...p, [field]: !p[field] }));

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      <SectionHeader title="Profile" subtitle="Manage your account and personal information." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-eco-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold font-outfit mx-auto mb-4 shadow-eco-md">
              {user?.avatar || user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <h2 className="font-outfit font-bold text-xl text-white">{user?.name}</h2>
            <p className="text-white/50 text-sm">{user?.email}</p>
            {user?.bio && <p className="text-white/40 text-xs mt-2 italic">"{user.bio}"</p>}
            <p className="text-white/30 text-xs mt-3">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </p>
          </div>

          <div className="glass p-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-bold text-lg text-eco-400">{stats.count}</p>
              <p className="text-xs text-white/40">Calculations</p>
            </div>
            <div>
              <p className="font-bold text-lg text-sky-400">{stats.avgScore || '—'}</p>
              <p className="text-xs text-white/40">Avg Score</p>
            </div>
            <div>
              <p className="font-bold text-lg text-yellow-400">{stats.best || '—'}</p>
              <p className="text-xs text-white/40">Best Score</p>
            </div>
          </div>

          <div className="glass p-4">
            <p className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Award size={14} className="text-eco-400" /> Achievements
            </p>
            <div className="grid grid-cols-2 gap-2">
              {BADGES.map((b) => {
                const earned = earnedBadges.has(b.id);
                return (
                  <div key={b.id} className={`glass p-3 text-center transition-all ${earned ? 'border-eco-500/30' : 'opacity-40'}`}>
                    <span className="text-2xl">{b.emoji}</span>
                    <p className="text-xs font-medium text-white mt-1">{b.label}</p>
                    <p className="text-xs text-white/30">{b.desc}</p>
                    {!earned && <p className="text-xs text-white/20 mt-1">Locked</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit profile */}
          <form onSubmit={handleProfileSave} className="glass p-6 space-y-4">
            <h3 className="font-outfit font-semibold text-white flex items-center gap-2">
              <User size={16} className="text-eco-400" /> Edit Profile
            </h3>
            <div>
              <label className="text-sm text-white/70 mb-1.5 block">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="text" value={profileForm.name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  className="input-field pl-9" />
              </div>
            </div>
            <div>
              <label className="text-sm text-white/70 mb-1.5 block">Email (read-only)</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" value={user?.email} disabled className="input-field pl-9 opacity-50 cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="text-sm text-white/70 mb-1.5 block">Bio (optional)</label>
              <textarea value={profileForm.bio}
                onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                rows={2} placeholder="Tell us about yourself..."
                className="input-field resize-none" />
            </div>
            <button type="submit" disabled={profileSaving} className="btn-primary flex items-center gap-2">
              {profileSaving ? <div className="spinner w-4 h-4" /> : null} Save Profile
            </button>
          </form>

          {/* Change password */}
          <form onSubmit={handlePasswordSave} className="glass p-6 space-y-4">
            <h3 className="font-outfit font-semibold text-white flex items-center gap-2">
              <Lock size={16} className="text-eco-400" /> Change Password
            </h3>
            {['current','newPw','confirm'].map((field) => {
              const labels = { current: 'Current Password', newPw: 'New Password', confirm: 'Confirm New Password' };
              return (
                <div key={field}>
                  <label className="text-sm text-white/70 mb-1.5 block">{labels[field]}</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type={showPw[field] ? 'text' : 'password'}
                      value={pwForm[field]}
                      onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                      className={`input-field pl-9 pr-9 ${pwErrors[field] ? 'border-red-500/50' : ''}`} />
                    <button type="button" onClick={() => toggleShow(field)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                      {showPw[field] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {pwErrors[field] && <p className="text-red-400 text-xs mt-1">{pwErrors[field]}</p>}
                </div>
              );
            })}
            <button type="submit" disabled={pwSaving} className="btn-primary flex items-center gap-2">
              {pwSaving ? <div className="spinner w-4 h-4" /> : null} Update Password
            </button>
          </form>

          {/* Danger zone */}
          <div className="glass border-red-500/20 bg-red-500/5 p-6 space-y-4">
            <h3 className="font-outfit font-semibold text-red-400 flex items-center gap-2">⚠️ Danger Zone</h3>
            <p className="text-white/50 text-sm">These actions are permanent and cannot be undone.</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => { logout(); navigate('/'); }} className="btn-danger flex items-center gap-2 text-sm">
                <LogOut size={14} /> Logout
              </button>
              <button onClick={handleDeleteAccount}
                className="flex items-center gap-2 bg-red-600/20 border border-red-500/40 text-red-400 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-red-600/30 transition-all">
                <Trash2 size={14} /> Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
