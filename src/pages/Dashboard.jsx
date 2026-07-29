import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Calculator, Wind, Leaf, TrendingUp,
  ArrowRight, Flame, Droplets, Sprout,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calculationAPI } from '../services/api';
import { getHistory } from '../services/storage';
import { StatCard, ProgressRing, EmissionBadge, EmptyState, RecommendationCard } from '../components/ui';

// Recharts custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass px-4 py-3 text-sm">
        <p className="text-white/60 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-eco-400 font-semibold">{p.value} kg CO₂</p>
        ))}
      </div>
    );
  }
  return null;
};

const PIE_COLORS = ['#22c55e', '#0ea5e9', '#f59e0b', '#a855f7'];

const Dashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  // Load history from backend with localStorage fallback
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

  // Derive stats from history
  const latest    = history[0] || null;
  const ecoScore  = latest?.ecoScore  ?? 0;
  const totalKg   = latest?.totalKg   ?? 0;
  const totalTon  = latest?.totalTonnes ?? 0;
  const category  = latest?.category ?? '—';

  // Last 6 calculations for the area chart
  const chartData = useMemo(() => {
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return [...history].reverse().slice(-6).map((h) => {
      const d = new Date(h.date);
      return {
        month: MONTHS[d.getMonth()],
        co2:   h.totalKg,
      };
    });
  }, [history]);

  // Pie data for latest breakdown
  const pieData = latest ? [
    { name: 'Transport', value: latest.transportation },
    { name: 'Energy',    value: latest.energy },
    { name: 'Food',      value: latest.food },
    { name: 'Lifestyle', value: latest.lifestyle },
  ] : [];

  const QUICK_ACTIONS = [
    { to: '/calculator',      icon: Calculator, label: 'Calculate Now',    color: 'green',  desc: 'Track your latest footprint' },
    { to: '/tree-plantation', icon: Sprout,     label: 'Plant a Tree',      color: 'teal',   desc: 'Snap photo & offset CO₂' },
    { to: '/air-quality',     icon: Wind,       label: 'Check Air Quality', color: 'blue',   desc: 'Real-time AQI data' },
    { to: '/history',         icon: TrendingUp, label: 'View History',      color: 'yellow', desc: 'All past calculations' },
  ];

  const SAMPLE_RECS = [
    { icon: '🚌', title: 'Use Public Transport', description: 'Switching to bus/metro 3 days/week reduces transport emissions by 30%.', color: 'green',  impact: 'High' },
    { icon: '💡', title: 'Switch to LED Bulbs',  description: 'LED bulbs use 75% less energy than incandescent bulbs.',                 color: 'blue',   impact: 'Medium' },
    { icon: '🥗', title: 'Try Meatless Monday', description: 'One plant-based day per week saves ~300 kg CO₂ annually.',               color: 'green',  impact: 'Medium' },
    { icon: '♻️', title: 'Recycle Properly',     description: 'Proper recycling and composting can reduce waste emissions by 40%.',    color: 'blue',   impact: 'Medium' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-outfit font-bold text-2xl text-white">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-white/50 text-sm mt-0.5">
            Here's your environmental impact overview.
          </p>
        </div>
        <Link to="/calculator" className="btn-primary hidden sm:flex items-center gap-2 text-sm">
          New Calculation <ArrowRight size={14} />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Leaf}
          label="Total CO₂ this year"
          value={`${totalTon} t`}
          sub={totalKg ? `${totalKg} kg` : 'No data yet'}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Eco Score"
          value={ecoScore || '—'}
          sub={ecoScore ? `${ecoScore > 60 ? 'Above' : 'Below'} average` : 'Calculate first'}
          color={ecoScore >= 70 ? 'green' : ecoScore >= 40 ? 'yellow' : 'red'}
        />
        <StatCard
          icon={Flame}
          label="Emission Category"
          value={category === '—' ? '—' : category.split(' ')[0]}
          sub={category === '—' ? 'No calculation yet' : category}
          color={category.includes('Low') ? 'green' : category.includes('Moderate') ? 'yellow' : 'red'}
        />
        <StatCard
          icon={Droplets}
          label="Trees Needed"
          value={latest?.treesNeeded ? `${latest.treesNeeded}` : '—'}
          sub="to offset your footprint"
          color="teal"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Area chart */}
        <div className="xl:col-span-3 glass p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-outfit font-semibold text-white">CO₂ Trend</h3>
              <p className="text-white/40 text-xs">Last 6 calculations</p>
            </div>
            <Link to="/history" className="text-xs text-eco-400 hover:text-eco-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}  />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="co2" stroke="#22c55e" fill="url(#co2Grad)" strokeWidth={2} dot={{ fill: '#22c55e', strokeWidth: 0, r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon="📊"
              title="No data yet"
              description="Complete a calculation to see your CO₂ trend."
              action={<Link to="/calculator" className="btn-primary text-sm px-5 py-2.5">Calculate Now</Link>}
            />
          )}
        </div>

        {/* Eco score + pie */}
        <div className="xl:col-span-2 glass p-6 flex flex-col items-center gap-6">
          <div className="text-center">
            <h3 className="font-outfit font-semibold text-white mb-1">Eco Score</h3>
            <p className="text-white/40 text-xs">Out of 100</p>
          </div>
          <ProgressRing value={ecoScore} size={140} label="/100" />
          {latest && <EmissionBadge category={category} />}

          {pieData.length > 0 && (
            <div className="w-full">
              <p className="text-xs text-white/40 text-center mb-3">Emission Breakdown</p>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" paddingAngle={2}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `${v} kg`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="font-outfit font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(({ to, icon: Icon, label, desc, color }) => (
            <Link
              key={to}
              to={to}
              className="glass p-4 flex items-center gap-4 hover:border-eco-500/30 hover:shadow-eco transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                color === 'green'  ? 'bg-eco-500/10 text-eco-400' :
                color === 'blue'   ? 'bg-sky-500/10 text-sky-400' :
                color === 'yellow' ? 'bg-yellow-500/10 text-yellow-400' :
                'bg-teal-500/10 text-teal-400'
              }`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-white/40">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-outfit font-semibold text-white">Recommendations</h3>
          <Link to="/calculator" className="text-xs text-eco-400 hover:text-eco-300 flex items-center gap-1">
            Personalize <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SAMPLE_RECS.map((r) => (
            <RecommendationCard key={r.title} {...r} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
