import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Trash, Calendar, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { calculationAPI } from '../services/api';
import { getHistory, deleteCalculation as deleteLocal, clearHistory as clearLocal } from '../services/storage';
import { EmissionBadge, SectionHeader, EmptyState, Spinner } from '../components/ui';
import toast from 'react-hot-toast';

const History = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch history from backend (fallback to localStorage)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await calculationAPI.getAll();
        if (data.success) {
          setRecords(data.data);
        }
      } catch {
        // Fallback to localStorage if server unavailable
        const local = user ? getHistory(user.email) : [];
        setRecords(local);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const handleDelete = async (id) => {
    try {
      await calculationAPI.deleteOne(id);
      setRecords((prev) => prev.filter((r) => r.id !== id && r._id !== id));
      toast.success('Record deleted');
    } catch {
      // Fallback: try local delete
      deleteLocal(user?.email, id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      toast.success('Record deleted');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all history? This cannot be undone.')) return;
    try {
      await calculationAPI.clearAll();
      setRecords([]);
      toast.success('History cleared');
    } catch {
      clearLocal(user?.email);
      setRecords([]);
      toast.success('History cleared');
    }
  };

  // Chart data — last 12 records reversed for chronological order
  const chartData = useMemo(() =>
    [...records].reverse().slice(-12).map((r) => ({
      date:  new Date(r.date || r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      co2:   r.totalKg,
      score: r.ecoScore,
    })),
  [records]);

  // Averages
  const avg = useMemo(() => {
    if (!records.length) return {};
    return {
      totalKg:  Math.round(records.reduce((s, r) => s + r.totalKg, 0) / records.length),
      ecoScore: Math.round(records.reduce((s, r) => s + r.ecoScore, 0) / records.length),
    };
  }, [records]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Spinner size={10} />
          <p className="text-white/40 text-sm mt-4">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionHeader
        title="Calculation History"
        subtitle={`${records.length} record${records.length !== 1 ? 's' : ''} saved`}
        action={
          records.length > 0 && (
            <button onClick={handleClearAll} className="btn-danger flex items-center gap-2 text-sm">
              <Trash size={14} /> Clear All
            </button>
          )
        }
      />

      {records.length === 0 ? (
        <EmptyState
          icon="📊"
          title="No calculations yet"
          description="Complete a carbon footprint calculation to see your history and track progress over time."
          action={<Link to="/calculator" className="btn-primary text-sm">Start Calculating</Link>}
        />
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card">
              <div className="w-9 h-9 bg-eco-500/10 rounded-xl flex items-center justify-center text-eco-400">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-2xl font-outfit font-bold text-white">{records.length}</p>
                <p className="text-sm text-white/50">Total Records</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="w-9 h-9 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-2xl font-outfit font-bold text-white">{avg.ecoScore ?? '—'}</p>
                <p className="text-sm text-white/50">Avg Eco Score</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="w-9 h-9 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-400">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-2xl font-outfit font-bold text-white">{avg.totalKg ?? '—'} <span className="text-sm text-white/40">kg</span></p>
                <p className="text-sm text-white/50">Avg CO₂/calc</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="w-9 h-9 bg-eco-500/10 rounded-xl flex items-center justify-center text-eco-400">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-2xl font-outfit font-bold text-white">
                  {records.length >= 2
                    ? (() => {
                        const diff = records[0]?.ecoScore - records[records.length - 1]?.ecoScore;
                        return diff > 0 ? `+${diff}` : diff;
                      })()
                    : '—'}
                </p>
                <p className="text-sm text-white/50">Score Change</p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="glass p-6">
            <h3 className="font-outfit font-semibold text-white mb-6">CO₂ Trend Over Time</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="glass px-4 py-3 text-sm">
                        <p className="text-white/60 mb-1">{label}</p>
                        <p className="text-eco-400 font-semibold">{payload[0]?.value} kg CO₂</p>
                      </div>
                    ) : null
                  }
                />
                <Area type="monotone" dataKey="co2" stroke="#22c55e" fill="url(#histGrad)" strokeWidth={2}
                  dot={{ fill: '#22c55e', strokeWidth: 0, r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="glass overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-outfit font-semibold text-white">All Records</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Date', 'Transport', 'Energy', 'Food', 'Lifestyle', 'Total CO₂', 'Eco Score', 'Category', ''].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs text-white/40 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={r._id || r.id} className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                      <td className="px-4 py-3 text-white/70 whitespace-nowrap">
                        {new Date(r.date || r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-white/60">{r.transportation} kg</td>
                      <td className="px-4 py-3 text-white/60">{r.energy} kg</td>
                      <td className="px-4 py-3 text-white/60">{r.food} kg</td>
                      <td className="px-4 py-3 text-white/60">{r.lifestyle} kg</td>
                      <td className="px-4 py-3 font-semibold text-white">{r.totalKg} kg</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-eco-400">{r.ecoScore}</span>
                      </td>
                      <td className="px-4 py-3">
                        <EmissionBadge category={r.category} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(r._id || r.id)}
                          className="text-white/30 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg"
                          title="Delete record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default History;
