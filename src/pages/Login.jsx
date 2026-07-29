import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Leaf, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from?.pathname || '/dashboard';

  const [form, setForm]   = useState({ email: '', password: '', remember: false });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email.';
    if (!form.password) e.password = 'Password is required.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);

    const result = await login({ email: form.email, password: form.password });
    if (result.success) {
      toast.success('Welcome back! 🌿');
      navigate(from, { replace: true });
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
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-eco-500/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-teal-500/10 blur-3xl" />
        </div>

        <Link to="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 bg-gradient-to-br from-eco-500 to-teal-500 rounded-xl flex items-center justify-center shadow-eco">
            <Leaf size={18} className="text-white" />
          </div>
          <span className="font-outfit font-bold text-xl text-white">EcoVision</span>
        </Link>

        <div className="relative z-10">
          <h2 className="font-outfit font-bold text-4xl text-white mb-4 leading-tight">
            "Every Action Counts<br />for Our Planet"
          </h2>
          <p className="text-white/50 text-lg mb-8">
            Track your carbon footprint and take meaningful steps toward a sustainable future.
          </p>
          <div className="space-y-3">
            {[
              { emoji: '🌍', stat: '1.2B kg CO₂',   label: 'tracked by our community' },
              { emoji: '👤', stat: '2M+ users',      label: 'taking climate action' },
              { emoji: '🌱', stat: '98% accuracy',   label: 'in emission calculations' },
            ].map((s) => (
              <div key={s.stat} className="glass px-4 py-3 flex items-center gap-3 rounded-xl">
                <span className="text-xl">{s.emoji}</span>
                <span className="text-white font-semibold">{s.stat}</span>
                <span className="text-white/40 text-sm">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-sm relative z-10">© EcoVision</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-eco-gradient" />
        <div className="relative z-10 w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-eco-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-outfit font-bold text-lg text-white">EcoVision</span>
          </div>

          <div className="glass p-8 animate-slideUp">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-eco-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LogIn size={22} className="text-eco-400" />
              </div>
              <h1 className="font-outfit font-bold text-2xl text-white">Welcome Back</h1>
              <p className="text-white/50 text-sm mt-1">Sign in to your EcoVision account</p>
            </div>

            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-6 text-red-400 text-sm text-center">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label className="text-sm text-white/70 mb-1.5 block">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={set('email')}
                    className={`input-field pl-10 ${errors.email ? 'border-red-500/50' : ''}`}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm text-white/70">Password</label>
                  <button type="button" className="text-xs text-eco-400 hover:text-eco-300 transition-colors">Forgot password?</button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={set('password')}
                    className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500/50' : ''}`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={set('remember')}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-eco-500 focus:ring-eco-500 focus:ring-offset-0"
                />
                <span className="text-sm text-white/60">Remember me</span>
              </label>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <div className="spinner w-5 h-5" /> : <>Sign In <LogIn size={16} /></>}
              </button>
            </form>

            <p className="text-center text-sm text-white/40 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-eco-400 hover:text-eco-300 font-medium transition-colors">
                Register free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
