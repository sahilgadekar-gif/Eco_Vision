import { useEffect, useRef, useState } from 'react';
import { Leaf, ShieldCheck, Zap, Globe } from 'lucide-react';

const EcoGlobe3D = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [activePin, setActivePin] = useState(0);

  const PINS = [
    { title: 'Amazon Rainforest', metric: '+12,400 Trees Planted', icon: Leaf, color: '#22c55e' },
    { title: 'Nordic Wind Grid', metric: '98% Clean Energy', icon: Zap, color: '#0ea5e9' },
    { title: 'Kyoto Eco Reserve', metric: 'AQI 14 · Pristine Air', icon: ShieldCheck, color: '#10b981' },
    { title: 'Saharan Solar Array', metric: '4.2 GW Clean Power', icon: Globe, color: '#f59e0b' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width = (canvas.width = containerRef.current?.clientWidth || 450);
    let height = (canvas.height = containerRef.current?.clientHeight || 450);

    const handleResize = () => {
      if (!containerRef.current) return;
      width = canvas.width = containerRef.current.clientWidth;
      height = canvas.height = containerRef.current.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // ── 3D Sphere Point Cloud & Rings Setup ──────────────────────────────────
    const radius = Math.min(width, height) * 0.35;
    const center = { x: width / 2, y: height / 2 };

    let rotX = 0.2;
    let rotY = 0;

    // Generate 3D Dots on Sphere Surface
    const numDots = 650;
    const dots = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio

    for (let i = 0; i < numDots; i++) {
      const y = 1 - (i / (numDots - 1)) * 2; // -1 to 1
      const radAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radAtY;
      const z = Math.sin(theta) * radAtY;

      // Color variation for continents
      const isGreen = Math.sin(x * 4) * Math.cos(z * 4) > -0.2;

      dots.push({ x, y, z, isGreen });
    }

    // Generate Orbiting Satellite Particles
    const numSatellites = 40;
    const satellites = Array.from({ length: numSatellites }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: 0.01 + Math.random() * 0.015,
      dist: radius * (1.2 + Math.random() * 0.25),
      tilt: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 2 + 1,
    }));

    // Mouse Controls
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;

      rotY += dx * 0.008;
      rotX += dy * 0.008;

      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const onMouseUp = () => { isDragging = false; };

    const cvs = canvas;
    cvs.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch events for mobile
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e) => {
      if (isDragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - lastMouseX;
        const dy = e.touches[0].clientY - lastMouseY;
        rotY += dx * 0.008;
        rotX += dy * 0.008;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
      }
    };
    cvs.addEventListener('touchstart', onTouchStart, { passive: true });
    cvs.addEventListener('touchmove', onTouchMove, { passive: true });
    cvs.addEventListener('touchend', onMouseUp);

    // ── 3D Render Loop ───────────────────────────────────────────────────────
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (!isDragging) {
        rotY += 0.004; // Auto spin
      }

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      // 1. Draw Outer Glowing Halo
      const haloGrad = ctx.createRadialGradient(center.x, center.y, radius * 0.8, center.x, center.y, radius * 1.35);
      haloGrad.addColorStop(0, 'rgba(34, 197, 94, 0.12)');
      haloGrad.addColorStop(0.6, 'rgba(34, 197, 94, 0.04)');
      haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Sphere Background Base
      const sphereGrad = ctx.createRadialGradient(center.x - radius * 0.3, center.y - radius * 0.3, 10, center.x, center.y, radius);
      sphereGrad.addColorStop(0, '#0f2918');
      sphereGrad.addColorStop(0.7, '#07170e');
      sphereGrad.addColorStop(1, '#040b07');
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Draw 3D Tech Grid Lines (Equator & Meridians)
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.15)';
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        const rLat = radius * Math.cos((lat * Math.PI) / 180);
        const yLat = radius * Math.sin((lat * Math.PI) / 180);

        // 3D rotation of latitude circle
        const rx = yLat * sinX;
        const ry = center.y + yLat * cosX;

        ctx.beginPath();
        ctx.ellipse(center.x, ry, rLat, rLat * Math.abs(sinX) * 0.3 + 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4. Project & Render 3D Dots
      const projectedDots = [];

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];

        // Rotation Y
        const x1 = d.x * cosY - d.z * sinY;
        const z1 = d.z * cosY + d.x * sinY;

        // Rotation X
        const y2 = d.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + d.y * sinX;

        // Perspective
        const scale = 2.5 / (2.5 - z2 * 0.4);
        const screenX = center.x + x1 * radius * scale;
        const screenY = center.y + y2 * radius * scale;

        projectedDots.push({
          x: screenX,
          y: screenY,
          z: z2,
          isGreen: d.isGreen,
          alpha: Math.max(0.1, (z2 + 1) / 2),
        });
      }

      // Sort dots by Z depth for realistic rendering
      projectedDots.sort((a, b) => a.z - b.z);

      for (let i = 0; i < projectedDots.length; i++) {
        const p = projectedDots[i];
        if (p.z < -0.3) continue; // Hide back faces slightly

        const size = (p.z + 1.2) * 1.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.8, size), 0, Math.PI * 2);

        if (p.isGreen) {
          ctx.fillStyle = `rgba(34, 197, 94, ${p.alpha * 0.95})`;
        } else {
          ctx.fillStyle = `rgba(14, 165, 233, ${p.alpha * 0.5})`;
        }
        ctx.fill();
      }

      // 5. Render Orbiting Satellites
      for (let i = 0; i < satellites.length; i++) {
        const sat = satellites[i];
        sat.angle += sat.speed;

        const sx = Math.cos(sat.angle) * sat.dist;
        const sz = Math.sin(sat.angle) * sat.dist;
        const sy = Math.sin(sat.angle * 2) * 30 + sat.tilt * 100;

        // 3D rotation
        const rx = sx * cosY - sz * sinY;
        const rz = sz * cosY + sx * sinY;
        const ry = sy * cosX - rz * sinX;

        const screenX = center.x + rx;
        const screenY = center.y + ry;

        if (rz > -0.2) {
          ctx.beginPath();
          ctx.arc(screenX, screenY, sat.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34, 197, 94, ${0.4 + Math.sin(sat.angle) * 0.4})`;
          ctx.fill();
        }
      }

      // 6. Draw Atmosphere Outer Border Ring
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      cvs.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      cvs.removeEventListener('touchstart', onTouchStart);
      cvs.removeEventListener('touchmove', onTouchMove);
      cvs.removeEventListener('touchend', onMouseUp);
    };
  }, []);

  // Cycle pins automatically every 4s
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePin((prev) => (prev + 1) % PINS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [PINS.length]);

  const currentPin = PINS[activePin];
  const Icon = currentPin.icon;

  return (
    <div ref={containerRef} className="relative w-full h-[450px] md:h-[520px] flex items-center justify-center select-none">
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Floating Interactive Eco Node Overlay Card */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 glass p-4 max-w-xs w-[90%] border-eco-500/30 shadow-eco backdrop-blur-2xl animate-slideUp">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0 transition-colors duration-500"
            style={{ backgroundColor: `${currentPin.color}25`, color: currentPin.color, border: `1px solid ${currentPin.color}50` }}
          >
            <Icon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Live Planet Node</span>
              <span className="w-2 h-2 rounded-full bg-eco-500 animate-ping" />
            </div>
            <p className="font-outfit font-bold text-sm text-white truncate">{currentPin.title}</p>
            <p className="text-xs font-semibold text-eco-400 mt-0.5">{currentPin.metric}</p>
          </div>
        </div>

        {/* Pin switcher dots */}
        <div className="flex justify-center gap-1.5 mt-3 pt-2 border-t border-white/5">
          {PINS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActivePin(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activePin ? 'w-6 bg-eco-500' : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Hint badge */}
      <div className="absolute top-4 right-4 glass px-3 py-1.5 text-[11px] text-white/50 flex items-center gap-1.5 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-eco-400 animate-pulse" />
        Interactive 3D Planet · Drag to Rotate
      </div>
    </div>
  );
};

export default EcoGlobe3D;
