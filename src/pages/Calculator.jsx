import { useState } from 'react';
import { Car, Plane, Bus, Zap, Flame, Salad, ShoppingBag, Trash2, Droplets, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calculationAPI } from '../services/api';
import { saveCalculation } from '../services/storage'; // fallback if backend is down
import { calculateTotal, generateRecommendations } from '../utils/carbon';
import { ProgressRing, EmissionBadge, RecommendationCard, SectionHeader } from '../components/ui';
import toast from 'react-hot-toast';

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = ['Transportation', 'Energy', 'Food', 'Lifestyle', 'Results'];
const STEP_ICONS = [Car, Zap, Salad, ShoppingBag, CheckCircle2];

// ── Step 1: Transportation ────────────────────────────────────────────────────
const StepTransportation = ({ data, onChange }) => (
  <div className="space-y-6">
    <div>
      <label className="flex items-center gap-2 text-sm text-white/70 mb-2">
        <Car size={16} className="text-eco-400" /> Car / Motorcycle km per week
      </label>
      <div className="flex items-center gap-4">
        <input type="range" min="0" max="1000" step="10"
          value={data.carKmPerWeek || 0}
          onChange={(e) => onChange('carKmPerWeek', e.target.value)}
          className="flex-1" />
        <div className="glass px-3 py-2 min-w-[80px] text-center">
          <span className="text-eco-400 font-bold">{data.carKmPerWeek || 0}</span>
          <span className="text-white/40 text-xs ml-1">km</span>
        </div>
      </div>
      <p className="text-xs text-white/30 mt-1">Average distance driven each week</p>
    </div>

    <div>
      <label className="flex items-center gap-2 text-sm text-white/70 mb-2">
        <Plane size={16} className="text-eco-400" /> Flight hours per year
      </label>
      <div className="flex items-center gap-4">
        <input type="range" min="0" max="200" step="1"
          value={data.flightHoursPerYear || 0}
          onChange={(e) => onChange('flightHoursPerYear', e.target.value)}
          className="flex-1" />
        <div className="glass px-3 py-2 min-w-[80px] text-center">
          <span className="text-eco-400 font-bold">{data.flightHoursPerYear || 0}</span>
          <span className="text-white/40 text-xs ml-1">hrs</span>
        </div>
      </div>
      <p className="text-xs text-white/30 mt-1">Total time in the air per year</p>
    </div>

    <div>
      <label className="flex items-center gap-2 text-sm text-white/70 mb-3">
        <Bus size={16} className="text-eco-400" /> Public transport usage
      </label>
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: 'never',     label: 'Never',           desc: 'Always drive' },
          { value: 'sometimes', label: 'Sometimes',       desc: '1-2 days/week' },
          { value: 'often',     label: 'Often',           desc: '3-4 days/week' },
          { value: 'always',    label: 'Always',          desc: 'My primary mode' },
        ].map((opt) => (
          <button
            key={opt.value} type="button"
            onClick={() => onChange('publicTransportFreq', opt.value)}
            className={`glass p-3 text-left transition-all duration-200 ${
              data.publicTransportFreq === opt.value
                ? 'border-eco-500/50 bg-eco-500/10'
                : 'hover:border-white/20'
            }`}
          >
            <p className="text-sm font-medium text-white">{opt.label}</p>
            <p className="text-xs text-white/40">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>
  </div>
);

// ── Step 2: Energy ────────────────────────────────────────────────────────────
const StepEnergy = ({ data, onChange }) => (
  <div className="space-y-6">
    <div>
      <label className="flex items-center gap-2 text-sm text-white/70 mb-2">
        <Zap size={16} className="text-eco-400" /> Monthly electricity usage (kWh)
      </label>
      <div className="flex items-center gap-4">
        <input type="range" min="0" max="1000" step="10"
          value={data.electricityKwhPerMonth || 0}
          onChange={(e) => onChange('electricityKwhPerMonth', e.target.value)}
          className="flex-1" />
        <div className="glass px-3 py-2 min-w-[90px] text-center">
          <span className="text-eco-400 font-bold">{data.electricityKwhPerMonth || 0}</span>
          <span className="text-white/40 text-xs ml-1">kWh</span>
        </div>
      </div>
      <p className="text-xs text-white/30 mt-1">Check your electricity bill for this number</p>
    </div>

    <div>
      <label className="flex items-center gap-2 text-sm text-white/70 mb-3">
        <Flame size={16} className="text-eco-400" /> Primary cooking fuel
      </label>
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: 'electric', label: '⚡ Electric',    desc: 'Induction / electric stove' },
          { value: 'gas',      label: '🔥 Natural Gas', desc: 'Piped gas stove' },
          { value: 'lpg',      label: '🛢️ LPG',         desc: 'Cylinder gas' },
          { value: 'biomass',  label: '🪵 Biomass',      desc: 'Wood / charcoal' },
        ].map((opt) => (
          <button
            key={opt.value} type="button"
            onClick={() => onChange('cookingFuel', opt.value)}
            className={`glass p-3 text-left transition-all duration-200 ${
              data.cookingFuel === opt.value
                ? 'border-eco-500/50 bg-eco-500/10'
                : 'hover:border-white/20'
            }`}
          >
            <p className="text-sm font-medium text-white">{opt.label}</p>
            <p className="text-xs text-white/40">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>

    {(data.cookingFuel === 'gas' || data.cookingFuel === 'lpg' || data.cookingFuel === 'electric') && (
      <div>
        <label className="text-sm text-white/70 mb-2 block">Monthly cooking usage (m³ / kWh)</label>
        <div className="flex items-center gap-4">
          <input type="range" min="0" max="100" step="1"
            value={data.cookingUsageM3 || 0}
            onChange={(e) => onChange('cookingUsageM3', e.target.value)}
            className="flex-1" />
          <div className="glass px-3 py-2 min-w-[70px] text-center">
            <span className="text-eco-400 font-bold">{data.cookingUsageM3 || 0}</span>
          </div>
        </div>
      </div>
    )}
  </div>
);

// ── Step 3: Food ──────────────────────────────────────────────────────────────
const StepFood = ({ data, onChange }) => (
  <div className="space-y-4">
    <p className="text-sm text-white/50 mb-6">
      Food choices have a major impact on your carbon footprint. What best describes your diet?
    </p>
    {[
      { value: 'vegan',      emoji: '🥦', label: 'Vegan',                    desc: 'No animal products whatsoever',        co2: '~1.5 tonnes/yr' },
      { value: 'vegetarian', emoji: '🥗', label: 'Vegetarian',               desc: 'Dairy & eggs, no meat',               co2: '~1.7 tonnes/yr' },
      { value: 'mixed',      emoji: '🍗', label: 'Mixed (moderate meat)',    desc: 'Meat a few times per week',           co2: '~2.5 tonnes/yr' },
      { value: 'heavyMeat',  emoji: '🥩', label: 'Heavy Meat Eater',         desc: 'Meat most meals, especially red meat', co2: '~3.3 tonnes/yr' },
    ].map((opt) => (
      <button
        key={opt.value} type="button"
        onClick={() => onChange('dietType', opt.value)}
        className={`w-full glass p-4 flex items-center gap-4 text-left transition-all duration-200 ${
          data.dietType === opt.value
            ? 'border-eco-500/50 bg-eco-500/10'
            : 'hover:border-white/20'
        }`}
      >
        <span className="text-3xl flex-shrink-0">{opt.emoji}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{opt.label}</p>
          <p className="text-xs text-white/40">{opt.desc}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0 ${
          opt.value === 'vegan'     ? 'bg-eco-500/20 text-eco-400' :
          opt.value === 'vegetarian'? 'bg-sky-500/20 text-sky-400' :
          opt.value === 'mixed'     ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>{opt.co2}</span>
      </button>
    ))}
  </div>
);

// ── Step 4: Lifestyle ─────────────────────────────────────────────────────────
const StepLifestyle = ({ data, onChange }) => {
  const ScoreInput = ({ field, label, icon: Icon, descriptions }) => (
    <div>
      <label className="flex items-center gap-2 text-sm text-white/70 mb-3">
        <Icon size={16} className="text-eco-400" /> {label}
      </label>
      <div className="flex gap-2">
        {[1,2,3,4,5].map((n) => (
          <button
            key={n} type="button"
            onClick={() => onChange(field, n)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              parseInt(data[field]) === n
                ? 'bg-eco-500 text-white shadow-eco'
                : 'glass text-white/60 hover:bg-white/10'
            }`}
          >{n}</button>
        ))}
      </div>
      <p className="text-xs text-white/30 mt-1.5">
        {descriptions[parseInt(data[field]) - 1] || descriptions[2]}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <ScoreInput
        field="shoppingScore" label="Shopping Habits" icon={ShoppingBag}
        descriptions={[
          'Buy only essentials, mostly second-hand',
          'Occasional new purchases, very mindful',
          'Average consumer, some fast fashion',
          'Frequent shopper, love new things',
          'Heavy shopper, new items very often',
        ]}
      />
      <ScoreInput
        field="wasteScore" label="Waste Generation" icon={Trash2}
        descriptions={[
          'Minimal waste, compost and recycle everything',
          'Low waste, good recycling habits',
          'Average household waste',
          'Higher than average waste',
          'Generate a lot of waste, rarely recycle',
        ]}
      />
      <div>
        <label className="flex items-center gap-2 text-sm text-white/70 mb-2">
          <Droplets size={16} className="text-eco-400" /> Monthly water usage (m³)
        </label>
        <div className="flex items-center gap-4">
          <input type="range" min="1" max="30" step="1"
            value={data.waterM3PerMonth || 5}
            onChange={(e) => onChange('waterM3PerMonth', e.target.value)}
            className="flex-1" />
          <div className="glass px-3 py-2 min-w-[70px] text-center">
            <span className="text-eco-400 font-bold">{data.waterM3PerMonth || 5}</span>
            <span className="text-white/40 text-xs ml-1">m³</span>
          </div>
        </div>
        <p className="text-xs text-white/30 mt-1">Average household: 5-10 m³/month</p>
      </div>
    </div>
  );
};

// ── Step 5: Results ───────────────────────────────────────────────────────────
const StepResults = ({ results, recs, onSave, saved }) => {
  if (!results) return null;
  const catColor = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' };

  const breakdown = [
    { label: 'Transportation', value: results.transportation, color: '#22c55e' },
    { label: 'Energy',         value: results.energy,         color: '#0ea5e9' },
    { label: 'Food',           value: results.food,           color: '#f59e0b' },
    { label: 'Lifestyle',      value: results.lifestyle,      color: '#a855f7' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero result */}
      <div className="flex flex-col sm:flex-row items-center gap-8 p-6 glass border-eco-500/20">
        <ProgressRing
          value={results.ecoScore} size={140} strokeWidth={12}
          color={catColor[results.categoryColor] || '#22c55e'}
          label="Eco Score" sublabel="/100"
        />
        <div className="text-center sm:text-left">
          <p className="text-4xl font-outfit font-black text-white">
            {results.totalTonnes} <span className="text-xl text-white/50">tonnes CO₂/yr</span>
          </p>
          <EmissionBadge category={results.category} />
          <p className="text-sm text-white/50 mt-2">
            {results.vsAverage > 0
              ? `${Math.abs(results.vsAverage)}% above global average`
              : `${Math.abs(results.vsAverage)}% below global average — great job!`}
          </p>
          <p className="text-sm text-white/40">
            Equivalent to {results.treesNeeded} trees needed to offset
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {breakdown.map((b) => (
          <div key={b.label} className="glass p-4 text-center">
            <p className="font-bold text-lg font-outfit" style={{ color: b.color }}>{b.value} <span className="text-xs text-white/40">kg</span></p>
            <p className="text-xs text-white/50">{b.label}</p>
          </div>
        ))}
      </div>

      {/* Save button */}
      {!saved && (
        <button onClick={onSave} className="btn-primary w-full flex items-center justify-center gap-2">
          <CheckCircle2 size={16} /> Save to History
        </button>
      )}
      {saved && (
        <div className="glass border-eco-500/30 p-4 text-center text-eco-400 text-sm flex items-center justify-center gap-2">
          <CheckCircle2 size={16} /> Saved to your history!
        </div>
      )}

      {/* Recommendations */}
      {recs.length > 0 && (
        <div>
          <h3 className="font-outfit font-semibold text-white mb-3">Your Personalized Recommendations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recs.map((r) => <RecommendationCard key={r.title} {...r} />)}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Calculator ───────────────────────────────────────────────────────────
const Calculator = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);

  const [transportation, setTransportation] = useState({ carKmPerWeek: 100, flightHoursPerYear: 5, publicTransportFreq: 'sometimes' });
  const [energy,         setEnergy]         = useState({ electricityKwhPerMonth: 200, cookingFuel: 'gas', cookingUsageM3: 10 });
  const [food,           setFood]           = useState({ dietType: 'mixed' });
  const [lifestyle,      setLifestyle]      = useState({ shoppingScore: 3, wasteScore: 3, waterM3PerMonth: 6 });
  const [results,        setResults]        = useState(null);
  const [recs,           setRecs]           = useState([]);

  const updateField = (setter) => (field, value) => setter((prev) => ({ ...prev, [field]: value }));

  const handleNext = () => {
    if (step === 3) {
      // Compute results
      const inputs  = { transportation, energy, food, lifestyle };
      const res     = calculateTotal(inputs);
      const recList = generateRecommendations(inputs, res);
      setResults(res);
      setRecs(recList);
      setSaved(false);
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleSave = async () => {
    if (!user || !results) return;
    try {
      // Try backend first
      await calculationAPI.save(results);
      setSaved(true);
      toast.success('Calculation saved to cloud! 🌿');
    } catch {
      // Fallback: save locally if server unavailable
      saveCalculation(user.email, results);
      setSaved(true);
      toast.success('Calculation saved locally! 🌿');
    }
  };

  const isLast = step === STEPS.length - 1;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <SectionHeader
        title="Carbon Footprint Calculator"
        subtitle="Complete all 4 steps to calculate your annual CO₂ footprint."
      />

      {/* Step progress */}
      <div className="glass p-4">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = STEP_ICONS[i];
            const isActive   = i === step;
            const isComplete = i < step;
            return (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => i < step && setStep(i)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isComplete ? 'bg-eco-500 text-white shadow-eco' :
                      isActive   ? 'bg-eco-500/20 text-eco-400 border-2 border-eco-500' :
                      'bg-white/5 text-white/30'
                    }`}
                  >
                    {isComplete ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                  </button>
                  <span className={`text-xs hidden sm:block ${isActive ? 'text-eco-400' : 'text-white/30'}`}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${isComplete ? 'bg-eco-500' : 'bg-white/5'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="glass p-6 md:p-8 animate-slideUp">
        <h2 className="font-outfit font-bold text-xl text-white mb-6 flex items-center gap-2">
          {(() => { const Icon = STEP_ICONS[step]; return <Icon size={20} className="text-eco-400" />; })()}
          {STEPS[step]}
        </h2>

        {step === 0 && <StepTransportation data={transportation} onChange={updateField(setTransportation)} />}
        {step === 1 && <StepEnergy         data={energy}         onChange={updateField(setEnergy)} />}
        {step === 2 && <StepFood           data={food}           onChange={updateField(setFood)} />}
        {step === 3 && <StepLifestyle      data={lifestyle}      onChange={updateField(setLifestyle)} />}
        {step === 4 && <StepResults results={results} recs={recs} onSave={handleSave} saved={saved} />}
      </div>

      {/* Navigation */}
      {!isLast && (
        <div className="flex gap-4 justify-between">
          <button
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0}
            className="btn-secondary flex items-center gap-2 disabled:opacity-30"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button onClick={handleNext} className="btn-primary flex items-center gap-2">
            {step === 3 ? 'Calculate Results' : 'Next Step'} <ArrowRight size={16} />
          </button>
        </div>
      )}
      {isLast && (
        <button onClick={() => { setStep(0); setSaved(false); setResults(null); }} className="btn-secondary w-full">
          Start New Calculation
        </button>
      )}
    </div>
  );
};

export default Calculator;
