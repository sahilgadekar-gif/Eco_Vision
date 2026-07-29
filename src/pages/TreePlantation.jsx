import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, Upload, Sprout, Trees, Trash2, MapPin,
  Calendar, CheckCircle2, X, RefreshCw, Leaf, Award, Image as ImageIcon
} from 'lucide-react';
import { treeAPI } from '../services/api';
import { SectionHeader, StatCard, EmptyState, Spinner } from '../components/ui';
import toast from 'react-hot-toast';

const LOCAL_STORAGE_KEY = 'ecovision_tree_plantations';

// Sample tree SVG data URL generator for zero-camera fallback
const generateSampleTreeBlob = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  // Gradient sky background
  const sky = ctx.createLinearGradient(0, 0, 0, 450);
  sky.addColorStop(0, '#0a2315');
  sky.addColorStop(1, '#1a472a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 800, 600);

  // Sun / Eco glow
  const glow = ctx.createRadialGradient(400, 180, 20, 400, 180, 250);
  glow.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(400, 180, 250, 0, Math.PI * 2); ctx.fill();

  // Hill ground
  ctx.fillStyle = '#0f381e';
  ctx.beginPath();
  ctx.ellipse(400, 550, 500, 150, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tree Trunk
  ctx.fillStyle = '#4a2e18';
  ctx.fillRect(380, 320, 40, 180);

  // Tree Foliage Layers
  const foliage = [
    { y: 300, r: 110, c: '#15803d' },
    { y: 240, r: 90, c: '#16a34a' },
    { y: 180, r: 70, c: '#22c55e' },
    { y: 130, r: 45, c: '#4ade80' },
  ];

  foliage.forEach((f) => {
    ctx.fillStyle = f.c;
    ctx.beginPath();
    ctx.arc(400, f.y, f.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Text watermark
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌿 EcoVision Verified Plantation', 400, 560);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], `planted_tree_${Date.now()}.jpg`, { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.9);
  });
};

const TreePlantation = () => {
  const [trees, setTrees] = useState([]);
  const [stats, setStats] = useState({ totalTrees: 0, totalCo2Offset: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [treeCount, setTreeCount] = useState(1);
  const [species, setSpecies] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Camera State
  const [useCamera, setUseCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Load Tree Plantations
  const loadPlantations = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await treeAPI.getAll();
      if (data.success) {
        setTrees(data.data);
        setStats(data.stats);
      }
    } catch {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setTrees(parsed);
        const count = parsed.reduce((sum, item) => sum + item.treeCount, 0);
        setStats({
          totalTrees: count,
          totalCo2Offset: parseFloat((count * 21).toFixed(2)),
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlantations();
  }, [loadPlantations]);

  // Attach camera stream when video element mounts
  useEffect(() => {
    if (useCamera && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {});
    }
  }, [useCamera, cameraStream]);

  // Camera Management
  const startCamera = async () => {
    setCameraError(false);
    setUseCamera(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setCameraStream(stream);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(true);
      toast.error("Could not access camera. Try uploading a photo or using sample image.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setUseCamera(false);
    setCameraError(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `tree_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        stopCamera();
        toast.success("Photo captured! 📸");
      }
    }, 'image/jpeg', 0.9);
  };

  const handleUseSampleImage = async () => {
    const file = await generateSampleTreeBlob();
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    stopCamera();
    toast.success("Sample tree photo attached! 🌿");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image file size must be less than 10MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setTreeCount(1);
    setSpecies('');
    setLocation('');
    setNotes('');
    setImageFile(null);
    setImagePreview(null);
    stopCamera();
    setIsModalOpen(false);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile && !imagePreview) {
      toast.error("Please capture or upload a picture of your tree plantation!");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append('image', imageFile);
      }
      formData.append('treeCount', treeCount);
      formData.append('species', species);
      formData.append('location', location);
      formData.append('notes', notes);

      const { data } = await treeAPI.create(formData);
      if (data.success) {
        toast.success(`Planted ${treeCount} tree(s)! Total CO₂ offset: +${treeCount * 21} kg/yr 🌿`);
        resetForm();
        loadPlantations();
      }
    } catch {
      // LocalStorage Fallback (convert image to Base64)
      const reader = new FileReader();
      const fileToRead = imageFile || await fetch(imagePreview).then((r) => r.blob());

      reader.onloadend = () => {
        const base64Image = reader.result;
        const newPlantation = {
          id: Date.now().toString(),
          imageUrl: base64Image,
          treeCount: Number(treeCount),
          species: species || 'Eco Tree',
          location,
          notes,
          co2OffsetKg: Number(treeCount) * 21,
          createdAt: new Date().toISOString(),
        };

        const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        const updated = [newPlantation, ...existing];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

        toast.success(`Planted ${treeCount} tree(s) (Saved locally) 🌿`);
        resetForm();
        loadPlantations();
      };
      reader.readAsDataURL(fileToRead);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plantation record?")) return;
    try {
      await treeAPI.deleteOne(id);
      toast.success("Plantation record deleted.");
      loadPlantations();
    } catch {
      const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const updated = existing.filter((item) => item.id !== id && item._id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      toast.success("Record deleted locally.");
      loadPlantations();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionHeader
        title="Tree Plantation Tracker"
        subtitle="Capture photos of your planted trees to track active carbon sequestration."
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 text-sm shadow-eco"
          >
            <Sprout size={16} /> Log Tree Plantation
          </button>
        }
      />

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Trees}
          label="Total Trees Planted"
          value={stats.totalTrees || 0}
          sub="Verified eco actions"
          color="green"
        />
        <StatCard
          icon={Leaf}
          label="Annual CO₂ Offset"
          value={`${stats.totalCo2Offset || 0} kg`}
          sub={`~${((stats.totalCo2Offset || 0) / 1000).toFixed(2)} tonnes / year`}
          color="teal"
        />
        <StatCard
          icon={Award}
          label="Estimated Lifetime Offset"
          value={`${((stats.totalCo2Offset || 0) * 20).toLocaleString()} kg`}
          sub="Based on 20-year tree lifespan"
          color="blue"
        />
      </div>

      {/* Plantations Gallery Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size={8} />
        </div>
      ) : trees.length === 0 ? (
        <EmptyState
          icon="🌱"
          title="No Tree Plantations Logged Yet"
          description="Planting trees is one of the most effective ways to neutralize your carbon footprint. Snap a picture of your tree to get started!"
          action={
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Camera size={16} /> Capture First Plantation
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trees.map((item) => (
            <div
              key={item._id || item.id}
              className="glass overflow-hidden group hover:border-eco-500/40 transition-all duration-300 flex flex-col"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-surface-900">
                <img
                  src={item.imageUrl}
                  alt={item.species || 'Planted Tree'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-eco-500/30 text-eco-400 text-xs font-bold flex items-center gap-1">
                  <Leaf size={12} /> +{item.co2OffsetKg} kg CO₂/yr
                </div>
                <div className="absolute top-3 left-3 bg-eco-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-md">
                  {item.treeCount} {item.treeCount > 1 ? 'Trees' : 'Tree'}
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-outfit font-bold text-lg text-white group-hover:text-eco-400 transition-colors">
                    {item.species || 'Tree Plantation'}
                  </h3>
                  {item.location && (
                    <p className="text-white/60 text-xs flex items-center gap-1.5 mt-1">
                      <MapPin size={13} className="text-eco-400 flex-shrink-0" />
                      {item.location}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-white/50 text-xs mt-2.5 line-clamp-2 italic">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <button
                    onClick={() => handleDelete(item._id || item.id)}
                    className="text-white/30 hover:text-red-400 transition-colors p-1 hover:bg-red-500/10 rounded-lg"
                    title="Delete record"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Log Tree Plantation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto relative animate-scaleUp">
            {/* Close Button */}
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="font-outfit font-bold text-xl text-white mb-1 flex items-center gap-2">
              <Sprout className="text-eco-400" size={22} /> Log Tree Plantation
            </h2>
            <p className="text-white/50 text-xs mb-6">
              Each mature tree offsets approximately 21 kg of CO₂ every year.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Input Selector */}
              <div>
                <label className="block text-sm text-white/70 mb-2">Plantation Photo *</label>

                {!useCamera && !imagePreview && (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="glass p-4 flex flex-col items-center justify-center gap-1.5 border-dashed border-eco-500/40 hover:bg-eco-500/10 text-eco-400 transition-colors rounded-xl text-center"
                    >
                      <Camera size={22} />
                      <span className="text-[11px] font-semibold">Take Photo</span>
                    </button>

                    <label className="glass p-4 flex flex-col items-center justify-center gap-1.5 border-dashed border-sky-500/40 hover:bg-sky-500/10 text-sky-400 cursor-pointer transition-colors rounded-xl text-center">
                      <Upload size={22} />
                      <span className="text-[11px] font-semibold">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleUseSampleImage}
                      className="glass p-4 flex flex-col items-center justify-center gap-1.5 border-dashed border-teal-500/40 hover:bg-teal-500/10 text-teal-400 transition-colors rounded-xl text-center"
                    >
                      <ImageIcon size={22} />
                      <span className="text-[11px] font-semibold">Sample Photo</span>
                    </button>
                  </div>
                )}

                {/* Camera Viewfinder */}
                {useCamera && (
                  <div className="relative rounded-xl overflow-hidden glass border-eco-500/40 bg-black">
                    {!cameraError ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-56 object-cover"
                      />
                    ) : (
                      <div className="w-full h-56 flex flex-col items-center justify-center p-4 text-center bg-black/60">
                        <Camera size={32} className="text-white/40 mb-2" />
                        <p className="text-xs text-white/70 font-semibold mb-1">Camera Feed Unavailable</p>
                        <p className="text-[11px] text-white/40 max-w-xs mb-3">
                          No camera device detected or permission denied.
                        </p>
                        <button
                          type="button"
                          onClick={handleUseSampleImage}
                          className="btn-primary text-xs px-3 py-1.5"
                        >
                          Attach Verified Sample Photo
                        </button>
                      </div>
                    )}
                    <canvas ref={canvasRef} className="hidden" />

                    <div className="p-3 flex items-center justify-between bg-surface-900/90 border-t border-white/5">
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="btn-secondary text-xs px-3 py-1.5"
                      >
                        Cancel
                      </button>
                      {!cameraError && (
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
                        >
                          <Camera size={14} /> Snap Photo
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Photo Preview */}
                {imagePreview && !useCamera && (
                  <div className="relative rounded-xl overflow-hidden glass border-eco-500/40 group">
                    <img
                      src={imagePreview}
                      alt="Plantation preview"
                      className="w-full h-52 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="bg-red-500/80 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        title="Remove photo"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="bg-eco-500/80 text-white p-2 rounded-full hover:bg-eco-600 transition-colors"
                        title="Retake photo"
                      >
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Number of Trees */}
              <div>
                <label className="block text-sm text-white/70 mb-1.5">Number of Trees Planted</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={treeCount}
                    onChange={(e) => setTreeCount(Number(e.target.value))}
                    className="flex-1"
                  />
                  <div className="glass px-4 py-2 min-w-[80px] text-center font-bold text-eco-400">
                    {treeCount} {treeCount === 1 ? 'tree' : 'trees'}
                  </div>
                </div>
                <p className="text-xs text-eco-400/80 mt-1">
                  🌱 Absorbs ~{(treeCount * 21).toFixed(0)} kg CO₂ per year!
                </p>
              </div>

              {/* Tree Species */}
              <div>
                <label className="block text-sm text-white/70 mb-1.5">Species / Tree Name</label>
                <input
                  type="text"
                  placeholder="e.g. Oak, Neem, Banyan, Pine, Mango"
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm text-white/70 mb-1.5">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Community Park, Backyard, School Field"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-white/70 mb-1.5">Notes / Story</label>
                <textarea
                  placeholder="Describe your plantation drive or tree details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="input-field resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {submitting ? <Spinner size={4} /> : <CheckCircle2 size={16} />} Save Plantation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreePlantation;
