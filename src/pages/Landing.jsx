import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Leaf, Calculator, Wind, BarChart2, ArrowRight, CheckCircle2, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import EcoGlobe3D from '../components/ui/EcoGlobe3D';

// Particle animation hook
const useParticles = (canvasRef) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 197, 94, ${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef]);
};

const FeatureCard = ({ icon: Icon, title, description, color }) => {
  const colorMap = {
    green:  { icon: 'text-eco-400',    bg: 'bg-eco-500/10',    border: 'hover:border-eco-500/40' },
    blue:   { icon: 'text-sky-400',    bg: 'bg-sky-500/10',    border: 'hover:border-sky-500/40' },
    teal:   { icon: 'text-teal-400',   bg: 'bg-teal-500/10',   border: 'hover:border-teal-500/40' },
  };
  const c = colorMap[color] || colorMap.green;

  return (
    <div className={`glass ${c.border} p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-eco cursor-default`}>
      <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center`}>
        <Icon size={24} className={c.icon} />
      </div>
      <div>
        <h3 className="font-outfit font-semibold text-white text-lg mb-2">{title}</h3>
        <p className="text-white/50 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

const Landing = () => {
  const { user } = useAuth();
  const canvasRef = useRef(null);
  useParticles(canvasRef);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Ambient glow blobs */}
      <div className="fixed top-[-20%] left-[-10%] w-96 h-96 rounded-full bg-eco-500/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-eco-500 to-teal-500 rounded-lg flex items-center justify-center shadow-eco">
            <Leaf size={16} className="text-white" />
          </div>
          <span className="font-outfit font-bold text-lg text-white">EcoVision</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#about"    className="hover:text-white transition-colors">About</a>
          <a href="#impact"   className="hover:text-white transition-colors">Impact</a>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/dashboard" className="btn-primary text-sm px-5 py-2.5">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login"    className="text-sm text-white/70 hover:text-white transition-colors px-3 py-2">Login</Link>
              <Link to="/register" className="btn-primary text-sm px-5 py-2.5">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 px-6 md:px-12 pt-16 pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-eco-400 text-sm border-eco-500/20 animate-slideUp">
              <span className="w-2 h-2 rounded-full bg-eco-400 animate-pulse" />
              🌿 Join 2 Million+ Eco Warriors Worldwide
            </div>

            <h1 className="font-outfit font-black text-4xl sm:text-5xl md:text-6xl lg:text-6xl text-white leading-[1.1] animate-slideUp animate-delay-100">
              Track Your Carbon Footprint,{' '}
              <span className="text-gradient">Save the Planet</span>
            </h1>

            <p className="text-white/60 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-slideUp animate-delay-200">
              EcoVision helps you understand and reduce your environmental impact with real-time AI insights, AQI monitoring, and photo-verified tree plantation tracking.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 animate-slideUp animate-delay-300">
              <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-4 shadow-eco-md">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link to="/dashboard" className="btn-secondary flex items-center gap-2 text-base px-8 py-4">
                View Interactive Demo
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/5 animate-fadeIn animate-delay-500">
              {[
                { value: '2M+',   label: 'Active Users' },
                { value: '1.2B',  label: 'kg CO₂ Tracked' },
                { value: '98%',   label: 'Accuracy Rate' },
                { value: '150+',  label: 'Countries' },
              ].map((s) => (
                <div key={s.label} className="text-center lg:text-left">
                  <p className="font-outfit font-bold text-2xl text-gradient">{s.value}</p>
                  <p className="text-white/40 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: 3D Interactive Globe Model */}
          <div className="lg:col-span-5 relative flex items-center justify-center animate-fadeIn animate-delay-200">
            <div className="absolute inset-0 bg-eco-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="w-full relative z-10 glass border-eco-500/20 shadow-eco-md rounded-3xl overflow-hidden p-2">
              <EcoGlobe3D />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 px-6 md:px-12 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-outfit font-bold text-3xl md:text-4xl text-white mb-4">
              Everything you need to go green
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Powerful tools to measure, understand, and reduce your environmental impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Calculator}
              color="green"
              title="Carbon Calculator"
              description="Calculate your precise carbon footprint across transportation, energy, food, and lifestyle with our interactive multi-step calculator."
            />
            <FeatureCard
              icon={Wind}
              color="blue"
              title="Air Quality Map"
              description="Search any city worldwide and get real-time AQI data including PM2.5, PM10, temperature, and humidity with color-coded indicators."
            />
            <FeatureCard
              icon={BarChart2}
              color="teal"
              title="Impact History"
              description="Track your progress over time with beautiful charts. See how your eco score improves and get personalized recommendations."
            />
          </div>
        </div>
      </section>

      {/* ── Why EcoVision ── */}
      <section id="about" className="relative z-10 px-6 md:px-12 pb-24">
        <div className="max-w-6xl mx-auto glass p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-outfit font-bold text-3xl text-white mb-6">
                Why <span className="text-gradient">EcoVision</span>?
              </h2>
              <div className="space-y-4">
                {[
                  'Privacy-first — all data stored locally on your device',
                  'No backend required — works completely offline',
                  'Science-based emission factors and calculations',
                  'Personalized action plans based on your lifestyle',
                  'Beautiful, accessible design for everyone',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-eco-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/70 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/register" className="btn-primary inline-flex items-center gap-2 mt-8">
                Start Tracking <ArrowRight size={16} />
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-eco-500/20 to-teal-500/10 border border-eco-500/20 flex items-center justify-center animate-float">
                  <Globe size={80} className="text-eco-400" />
                </div>
                <div className="absolute -top-4 -right-4 glass px-3 py-2 rounded-xl text-sm">
                  <span className="text-eco-400 font-bold">4.8t</span>
                  <span className="text-white/50 ml-1">avg CO₂/yr</span>
                </div>
                <div className="absolute -bottom-4 -left-4 glass px-3 py-2 rounded-xl text-sm">
                  <span className="text-yellow-400 font-bold">72</span>
                  <span className="text-white/50 ml-1">Eco Score</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="impact" className="relative z-10 px-6 md:px-12 pb-32 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-outfit font-bold text-3xl md:text-4xl text-white mb-4">
            Ready to make a difference?
          </h2>
          <p className="text-white/50 mb-8">
            Join millions of people tracking and reducing their carbon footprint every day.
          </p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-10 py-4">
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 md:px-12 py-8 text-center text-white/30 text-sm">
        <p>© EcoVision. Built with 💚 for a greener tomorrow. | MIT License</p>
      </footer>
    </div>
  );
};

export default Landing;
