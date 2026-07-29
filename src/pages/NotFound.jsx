import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
    {/* Ambient blobs */}
    <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-eco-500/5 blur-3xl pointer-events-none" />
    <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />

    {/* Floating leaves */}
    {['🍃','🌿','🍀','🌱'].map((l, i) => (
      <span
        key={i}
        className="absolute text-2xl pointer-events-none animate-float opacity-30"
        style={{
          top:  `${20 + i * 20}%`,
          left: `${10 + i * 20}%`,
          animationDelay: `${i * 0.5}s`,
        }}
      >
        {l}
      </span>
    ))}

    <div className="relative z-10 space-y-6">
      {/* 404 */}
      <div className="font-outfit font-black text-[8rem] md:text-[12rem] leading-none text-gradient animate-glow select-none">
        404
      </div>

      {/* Earth */}
      <div className="text-6xl animate-float">🌍</div>

      <div>
        <h1 className="font-outfit font-bold text-3xl md:text-4xl text-white mb-3">
          Lost in the Carbon Clouds
        </h1>
        <p className="text-white/50 max-w-md mx-auto leading-relaxed">
          The page you are looking for has vanished into thin air — much like our forests.
          Let's get you back on track.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link to="/" className="btn-primary flex items-center gap-2">
          <Home size={16} /> Go Home
        </Link>
        <button onClick={() => window.history.back()} className="btn-secondary flex items-center gap-2">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>

      <p className="text-white/20 text-sm">
        EcoVision — Every action counts for our planet 🌿
      </p>
    </div>
  </div>
);

export default NotFound;
