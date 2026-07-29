import { useState, useCallback } from 'react';
import { Search, Wind, Thermometer, Droplets, Eye, MapPin } from 'lucide-react';
import { getAQIInfo } from '../utils/carbon';
import { SectionHeader, Spinner } from '../components/ui';
import toast from 'react-hot-toast';

// WAQI API base URL (free public API)
const WAQI_BASE = 'https://api.waqi.info/feed';
const WAQI_TOKEN = 'demo'; // Replace with your token from https://aqicn.org/api/

const AQI_SCALE = [
  { label: 'Good',       range: '0-50',    color: '#22c55e' },
  { label: 'Moderate',   range: '51-100',  color: '#eab308' },
  { label: 'Unhealthy*', range: '101-150', color: '#f97316' },
  { label: 'Unhealthy',  range: '151-200', color: '#ef4444' },
  { label: 'Very Unhlt', range: '201-300', color: '#a855f7' },
  { label: 'Hazardous',  range: '301+',    color: '#7c3aed' },
];

const StatPill = ({ icon: Icon, label, value, color = 'eco' }) => {
  const colorCls = {
    eco:    'bg-eco-500/10 text-eco-400 border-eco-500/20',
    sky:    'bg-sky-500/10 text-sky-400 border-sky-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    red:    'bg-red-500/10 text-red-400 border-red-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };
  return (
    <div className={`glass p-4 flex flex-col gap-2 border ${colorCls[color] || colorCls.eco}`}>
      <div className="flex items-center gap-2 text-xs text-white/50">
        <Icon size={14} /> {label}
      </div>
      <p className="font-outfit font-bold text-xl text-white">{value ?? '—'}</p>
    </div>
  );
};

const AirQuality = () => {
  const [city,    setCity]    = useState('');
  const [loading, setLoading] = useState(false);
  const [aqiData, setAqiData] = useState(null);
  const [error,   setError]   = useState('');

  const fetchAQI = useCallback(async (searchCity) => {
    if (!searchCity.trim()) return;
    setLoading(true);
    setError('');
    setAqiData(null);

    try {
      const res  = await fetch(`${WAQI_BASE}/${encodeURIComponent(searchCity)}/?token=${WAQI_TOKEN}`);
      const json = await res.json();

      if (json.status !== 'ok') {
        setError('City not found. Try a different city name.');
        setLoading(false);
        return;
      }

      const d = json.data;
      setAqiData({
        city:        d.city?.name || searchCity,
        aqi:         d.aqi,
        pm25:        d.iaqi?.pm25?.v,
        pm10:        d.iaqi?.pm10?.v,
        o3:          d.iaqi?.o3?.v,
        no2:         d.iaqi?.no2?.v,
        temperature: d.iaqi?.t?.v,
        humidity:    d.iaqi?.h?.v,
        dominantPol: d.dominentpol,
        time:        d.time?.s,
        geo:         d.city?.geo,
      });
    } catch {
      setError('Failed to fetch data. Check your internet connection.');
      toast.error('Failed to fetch AQI data');
    }
    setLoading(false);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAQI(city);
  };

  const aqiInfo = aqiData ? getAQIInfo(aqiData.aqi) : null;

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionHeader
        title="Air Quality Monitor"
        subtitle="Search any city to get real-time air quality data and AQI information."
      />

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            id="aqi-search"
            type="text"
            placeholder="Search city (e.g. New Delhi, London, Tokyo...)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button id="aqi-search-btn" type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-6">
          {loading ? <Spinner /> : <><Search size={16} /> Search</>}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="glass border-red-500/30 bg-red-500/5 p-4 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* AQI Result */}
      {aqiData && (
        <div className="space-y-6 animate-slideUp">
          {/* City + AQI hero */}
          <div className="glass p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                <MapPin size={14} /> {aqiData.city}
              </div>
              <div className="flex items-end gap-3">
                <span
                  className="font-outfit font-black text-6xl leading-none"
                  style={{ color: aqiInfo?.color }}
                >
                  {aqiData.aqi}
                </span>
                <div className="mb-1">
                  <p className="font-semibold text-white">AQI</p>
                  <p className="text-xs text-white/40">US EPA Standard</p>
                </div>
              </div>
              <div className="mt-3">
                <span
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{ background: `${aqiInfo?.color}20`, color: aqiInfo?.color, border: `1px solid ${aqiInfo?.color}40` }}
                >
                  {aqiInfo?.label}
                </span>
              </div>
              <p className="text-white/50 text-sm mt-2 max-w-xs">{aqiInfo?.description}</p>
            </div>

            {/* Dominant pollutant */}
            <div className="sm:ml-auto glass p-4 text-center min-w-[140px]">
              <Wind size={24} className="text-eco-400 mx-auto mb-2" />
              <p className="text-xs text-white/40 mb-1">Dominant Pollutant</p>
              <p className="font-bold text-white uppercase">{aqiData.dominantPol || '—'}</p>
              {aqiData.time && (
                <p className="text-xs text-white/30 mt-2">Updated: {new Date(aqiData.time).toLocaleTimeString()}</p>
              )}
            </div>
          </div>

          {/* Pollutant grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatPill icon={Wind}        label="PM2.5"       value={aqiData.pm25 != null ? `${aqiData.pm25} µg/m³` : '—'} color="purple" />
            <StatPill icon={Wind}        label="PM10"        value={aqiData.pm10 != null ? `${aqiData.pm10} µg/m³` : '—'} color="red"    />
            <StatPill icon={Eye}         label="Ozone (O₃)"  value={aqiData.o3  != null ? `${aqiData.o3} µg/m³`  : '—'} color="sky"    />
            <StatPill icon={Wind}        label="NO₂"         value={aqiData.no2 != null ? `${aqiData.no2} µg/m³` : '—'} color="orange" />
            <StatPill icon={Thermometer} label="Temperature" value={aqiData.temperature != null ? `${aqiData.temperature}°C` : '—'} color="yellow" />
            <StatPill icon={Droplets}    label="Humidity"    value={aqiData.humidity    != null ? `${aqiData.humidity}%`   : '—'} color="sky"    />
          </div>

          {/* Map placeholder */}
          {aqiData.geo && (
            <div className="glass overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <h3 className="font-outfit font-semibold text-white text-sm">Location Map</h3>
                <p className="text-white/40 text-xs">
                  Coordinates: {aqiData.geo[0].toFixed(4)}, {aqiData.geo[1].toFixed(4)}
                </p>
              </div>
              <div
                className="w-full h-64 flex items-center justify-center bg-surface-800 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0d1f14, #071218)' }}
              >
                {/* Styled map placeholder */}
                <div className="absolute inset-0 opacity-20">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="absolute border border-eco-500/20"
                      style={{ left: `${i * 14}%`, top: 0, bottom: 0, width: '1px' }} />
                  ))}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="absolute border border-eco-500/20"
                      style={{ top: `${i * 20}%`, left: 0, right: 0, height: '1px' }} />
                  ))}
                </div>
                <div className="relative z-10 text-center">
                  <div
                    className="w-6 h-6 rounded-full mx-auto mb-3 animate-pulse"
                    style={{ background: aqiInfo?.color, boxShadow: `0 0 20px ${aqiInfo?.color}60` }}
                  />
                  <p className="text-white font-semibold">{aqiData.city}</p>
                  <p className="text-white/40 text-sm">AQI: {aqiData.aqi}</p>
                  <p className="text-white/30 text-xs mt-2">
                    Add a Google Maps API key in .env for an interactive map
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!aqiData && !loading && !error && (
        <div className="glass p-12 text-center">
          <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wind size={32} className="text-sky-400" />
          </div>
          <h3 className="font-outfit font-semibold text-lg text-white mb-2">Check Air Quality Anywhere</h3>
          <p className="text-white/50 text-sm max-w-sm mx-auto">
            Search for any city worldwide to get real-time AQI data, pollutant levels, temperature, and humidity.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['New Delhi', 'London', 'Tokyo', 'New York', 'Beijing'].map((c) => (
              <button
                key={c} type="button"
                onClick={() => { setCity(c); fetchAQI(c); }}
                className="glass px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AQI Scale legend */}
      <div className="glass p-6">
        <h3 className="font-outfit font-semibold text-white mb-4 text-sm">AQI Scale Reference</h3>
        <div className="flex flex-wrap gap-2">
          {AQI_SCALE.map((s) => (
            <div key={s.label} className="flex items-center gap-2 glass px-3 py-2 text-xs">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span className="text-white/70">{s.label}</span>
              <span className="text-white/30">{s.range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AirQuality;
