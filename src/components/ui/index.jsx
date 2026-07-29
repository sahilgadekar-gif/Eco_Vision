// ─── Reusable UI Components ───────────────────────────────────────────────────

/**
 * Stat Card — glassmorphism card with icon, value, and label
 */
export const StatCard = ({ icon: Icon, label, value, sub, color = 'green', className = '' }) => {
  const colorMap = {
    green:  'text-eco-400 bg-eco-500/10',
    blue:   'text-sky-400 bg-sky-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10',
    red:    'text-red-400 bg-red-500/10',
    teal:   'text-teal-400 bg-teal-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
  };

  return (
    <div className={`stat-card animate-slideUp ${className}`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.green}`}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-outfit font-bold text-white">{value}</p>
        <p className="text-sm text-white/60">{label}</p>
        {sub && <p className="text-xs text-white/40 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

/**
 * Emission Badge — colored pill
 */
export const EmissionBadge = ({ category }) => {
  if (category?.includes('Low'))      return <span className="badge-green">{category}</span>;
  if (category?.includes('Moderate')) return <span className="badge-yellow">{category}</span>;
  if (category?.includes('High'))     return <span className="badge-red">{category}</span>;
  return <span className="badge-blue">{category}</span>;
};

/**
 * Loading Spinner
 */
export const Spinner = ({ size = 6 }) => (
  <div className={`w-${size} h-${size} border-2 border-white/20 border-t-eco-500 rounded-full animate-spin`} />
);

/**
 * Circular Progress Ring (SVG)
 */
export const ProgressRing = ({ value, max = 100, size = 120, strokeWidth = 10, color = '#22c55e', label, sublabel }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, Math.max(0, value / max));
  const offset = circumference * (1 - pct);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-outfit font-bold text-xl text-white">{value}</span>
        {label && <span className="text-xs text-white/50">{label}</span>}
        {sublabel && <span className="text-xs text-white/30">{sublabel}</span>}
      </div>
    </div>
  );
};

/**
 * Toggle Switch
 */
export const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      {label && <p className="text-sm font-medium text-white">{label}</p>}
      {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-eco-500' : 'bg-white/10'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

/**
 * Section Header
 */
export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="section-title">{title}</h1>
      {subtitle && <p className="text-white/50 mt-1 text-sm">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

/**
 * Empty State
 */
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="font-outfit font-semibold text-lg text-white mb-2">{title}</h3>
    <p className="text-white/50 text-sm max-w-xs">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

/**
 * Recommendation Card
 */
export const RecommendationCard = ({ icon, title, description, color = 'green', impact }) => {
  const colorMap = {
    green:  'border-eco-500/20 bg-eco-500/5',
    yellow: 'border-yellow-500/20 bg-yellow-500/5',
    blue:   'border-sky-500/20 bg-sky-500/5',
    red:    'border-red-500/20 bg-red-500/5',
    purple: 'border-purple-500/20 bg-purple-500/5',
  };
  const impactColor = {
    'Very High':    'text-red-400',
    'High':         'text-orange-400',
    'Medium':       'text-yellow-400',
    'Supplemental': 'text-eco-400',
  };

  return (
    <div className={`glass ${colorMap[color] || colorMap.green} p-4 flex gap-4 items-start hover:scale-[1.01] transition-transform duration-200`}>
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-sm text-white">{title}</p>
          {impact && (
            <span className={`text-xs ${impactColor[impact] || 'text-white/50'}`}>
              {impact} impact
            </span>
          )}
        </div>
        <p className="text-xs text-white/50 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};
