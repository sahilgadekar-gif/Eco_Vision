import { useState, useEffect } from 'react';
import { Moon, Sun, Palette, Bell, Shield, Download, Trash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { settingsAPI, calculationAPI } from '../services/api';
import { getSettings, saveSettings as saveLocal, clearHistory as clearLocalHistory } from '../services/storage';
import { SectionHeader, Toggle, Spinner } from '../components/ui';
import toast from 'react-hot-toast';

const SettingsSection = ({ icon: Icon, title, description, children }) => (
  <div className="glass p-6 space-y-5">
    <div className="flex items-start gap-3 pb-4 border-b border-white/5">
      <div className="w-9 h-9 bg-eco-500/10 rounded-xl flex items-center justify-center text-eco-400 flex-shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <h3 className="font-outfit font-semibold text-white">{title}</h3>
        <p className="text-white/40 text-xs mt-0.5">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState(() => getSettings(user?.email));
  const [loading,  setLoading]  = useState(true);

  // Load settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await settingsAPI.get();
        if (data.success) {
          setSettings(data.settings);
          // Sync theme from backend
          if (data.settings.theme) setTheme(data.settings.theme);
        }
      } catch {
        // Fallback to local settings
        const local = getSettings(user?.email);
        setSettings(local);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [user, setTheme]);

  const updateSetting = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveLocal(user?.email, updated); // local cache

    try {
      await settingsAPI.update({ [key]: value });
    } catch {
      // Silent fail — local already updated
    }
  };

  const handleExport = () => {
    const data = {
      user: { name: user?.name, email: user?.email, createdAt: user?.createdAt },
      settings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `ecovision-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported!');
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all calculation history? This cannot be undone.')) return;
    try {
      await calculationAPI.clearAll();
      toast.success('History cleared!');
    } catch {
      clearLocalHistory(user?.email);
      toast.success('History cleared!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={10} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fadeIn">
      <SectionHeader title="Settings" subtitle="Customize your EcoVision experience." />

      {/* Appearance */}
      <SettingsSection icon={Palette} title="Appearance" description="Customize how EcoVision looks and feels.">
        <div>
          <p className="text-sm text-white/70 mb-3">Theme</p>
          <div className="flex gap-3">
            {[
              { value: 'dark',  label: 'Dark',  icon: Moon },
              { value: 'light', label: 'Light', icon: Sun  },
            ].map(({ value, label, icon: Icon }) => (
              <button key={value} type="button"
                onClick={() => { setTheme(value); updateSetting('theme', value); }}
                className={`flex-1 glass py-3 flex items-center justify-center gap-2 text-sm transition-all ${
                  theme === value ? 'border-eco-500/50 bg-eco-500/10 text-eco-400' : 'text-white/60 hover:text-white'
                }`}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-white/70 mb-3">UI Density</p>
          <div className="flex gap-2">
            {['compact', 'comfortable', 'spacious'].map((d) => (
              <button key={d} type="button" onClick={() => updateSetting('density', d)}
                className={`flex-1 glass py-2 text-xs capitalize transition-all ${
                  settings.density === d ? 'border-eco-500/50 bg-eco-500/10 text-eco-400' : 'text-white/60 hover:text-white'
                }`}>
                {d}
              </button>
            ))}
          </div>
        </div>
      </SettingsSection>

      {/* Units */}
      <SettingsSection icon={Palette} title="Units & Display" description="Choose how data is displayed.">
        <div>
          <p className="text-sm text-white/70 mb-3">CO₂ Unit</p>
          <div className="flex gap-3">
            {[
              { value: 'kg',     label: 'Kilograms (kg)' },
              { value: 'tonnes', label: 'Metric Tonnes'  },
            ].map(({ value, label }) => (
              <button key={value} type="button" onClick={() => updateSetting('unit', value)}
                className={`flex-1 glass py-3 text-sm transition-all ${
                  settings.unit === value ? 'border-eco-500/50 bg-eco-500/10 text-eco-400' : 'text-white/60 hover:text-white'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-white/70 mb-3">Date Format</p>
          <div className="flex gap-2 flex-wrap">
            {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map((f) => (
              <button key={f} type="button" onClick={() => updateSetting('dateFormat', f)}
                className={`glass px-3 py-2 text-xs transition-all ${
                  settings.dateFormat === f ? 'border-eco-500/50 bg-eco-500/10 text-eco-400' : 'text-white/50 hover:text-white'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection icon={Bell} title="Notifications" description="Control what alerts you receive.">
        <Toggle checked={settings.emailAlerts}  onChange={(v) => updateSetting('emailAlerts', v)}
          label="Email Alerts"         description="Receive important updates and tips via email" />
        <Toggle checked={settings.weeklyReport} onChange={(v) => updateSetting('weeklyReport', v)}
          label="Weekly Carbon Report" description="Get a weekly summary of your carbon footprint" />
        <Toggle checked={settings.achievements} onChange={(v) => updateSetting('achievements', v)}
          label="Achievement Notifications" description="Be notified when you earn new eco badges" />
      </SettingsSection>

      {/* Privacy & Data */}
      <SettingsSection icon={Shield} title="Privacy & Data" description="Manage your personal data.">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Export My Data</p>
              <p className="text-xs text-white/40">Download all your data as JSON</p>
            </div>
            <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm px-4 py-2">
              <Download size={14} /> Export
            </button>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div>
              <p className="text-sm font-medium text-yellow-400">Clear History</p>
              <p className="text-xs text-white/40">Delete all calculation records</p>
            </div>
            <button onClick={handleClearHistory}
              className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-yellow-500/20 transition-all">
              <Trash size={14} /> Clear
            </button>
          </div>
        </div>
      </SettingsSection>

      <p className="text-white/20 text-xs text-center pb-4">
        EcoVision v1.0.0 · Powered by MongoDB · JWT Authentication
      </p>
    </div>
  );
};

export default Settings;
