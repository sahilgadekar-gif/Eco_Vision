import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Leaf, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Password strength scorer
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)              score++;
  if (/[A-Z]/.test(pw))           score++;
  if (/[0-9]/.test(pw))           score++;
  if (/[^A-Za-z0-9]/.test(pw))   score++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-sky-500', 'bg-eco-500'];
  return { score, label: labels[score], color: colors[score] };
};

const Register = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', terms: false });
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});

  const strength = getStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Name is required.';
    if (!form.email)        e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email.';
    if (!form.password)     e.password = 'Password is required.';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    if (!form.terms)        e.terms = 'Please accept the terms.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);

    const result = await register({ name: form.name.trim(), email: form.email, password: form.password });
    if (result.success) {
      toast.success('Account created! Welcome to EcoVision 🌿');
      navigate('/dashboard');
    } else {
      setErrors({ submit: result.error });
      toast.error(result.error);
    }
    setLoading(false);
  };

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined, submit: undefined }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden p-12 bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-eco-500/10 blur-3xl" />
        </div>

        <Link to="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 bg-gradient-to-br from-eco-500 to-teal-500 rounded-xl flex items-center justify-center shadow-eco">
            <Leaf size={18} className="text-white" />
          </div>
          <span className="font-outfit font-bold text-xl text-white">EcoVision</span>
        </Link>

        <div className="relative z-10">
          <div className="text-6xl mb-6 animate-float">🌍</div>
          <h2 className="font-outfit font-bold text-4xl text-white mb-4">
            Join 2 Million<br />
            <span className="text-gradient">Eco Warriors</span>
          </h2>
          <p className="text-white/50 mb-8">
            Start tracking your carbon footprint today and be part of the global sustainability movement.
          </p>
          <div className="space-y-3">
            {[
              '✅ Free forever — no credit card needed',
              '✅ Privacy-first — data stays on your device',
              '✅ AI-powered personalized recommendations',
              '✅ Real-time air quality monitoring',
            ].map((item) => (
              <p key={item} className="text-white/60 text-sm">{item}</p>
            ))}
          </div>
        </div>
        <p className="text-white/20 text-sm relative z-10">© EcoVision</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-eco-gradient" />
        <div className="relative z-10 w-full max-w-md">
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-eco-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-outfit font-bold text-lg text-white">EcoVision</span>
          </div>

          <div className="glass p-8 animate-slideUp">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-eco-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserPlus size={22} className="text-eco-400" />
              </div>
              <h1 className="font-outfit font-bold text-2xl text-white">Create Account</h1>
              <p className="text-white/50 text-sm mt-1">Start your eco journey today</p>
            </div>

            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-6 text-red-400 text-sm text-center">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Name */}
              <div>
                <label className="text-sm text-white/70 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input id="reg-name" type="text" placeholder="Jane Doe"
                    value={form.name} onChange={set('name')}
                    className={`input-field pl-10 ${errors.name ? 'border-red-500/50' : ''}`} />
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="text-sm text-white/70 mb-1.5 block">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input id="reg-email" type="email" placeholder="you@example.com"
                    value={form.email} onChange={set('email')}
                    className={`input-field pl-10 ${errors.email ? 'border-red-500/50' : ''}`}
                    autoComplete="email" />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="text-sm text-white/70 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input id="reg-password" type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters"
                    value={form.password} onChange={set('password')}
                    className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500/50' : ''}`}
                    autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Strength meter */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-white/10'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-white/40">{strength.label}</p>
                  </div>
                )}
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label className="text-sm text-white/70 mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input id="reg-confirm" type={showCf ? 'text' : 'password'} placeholder="Repeat password"
                    value={form.confirm} onChange={set('confirm')}
                    className={`input-field pl-10 pr-10 ${errors.confirm ? 'border-red-500/50' : ''}`}
                    autoComplete="new-password" />
                  <button type="button" onClick={() => setShowCf(!showCf)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm}</p>}
              </div>

              {/* Terms */}
              <div>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={form.terms} onChange={set('terms')}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-eco-500 focus:ring-eco-500 focus:ring-offset-0 mt-0.5" />
                  <span className="text-sm text-white/60">
                    I agree to the{' '}
                    <a href="#" className="text-eco-400 hover:underline">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" className="text-eco-400 hover:underline">Privacy Policy</a>
                  </span>
                </label>
                {errors.terms && <p className="text-red-400 text-xs mt-1">{errors.terms}</p>}
              </div>

              <button id="reg-submit" type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <div className="spinner w-5 h-5" /> : <>Create Account <UserPlus size={16} /></>}
              </button>
            </form>

            <p className="text-center text-sm text-white/40 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-eco-400 hover:text-eco-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
