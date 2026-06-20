import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ExperimentLayout from '../components/ExperimentLayout';
import SimCanvas from '../components/SimCanvas';
import ControlPanel from '../components/ControlPanel';
import DataBar from '../components/DataBar';
import ARScene from '../components/ARScene';

const PLANETS = [
  { name: 'Merkurius', distance: 0.387, period: 0.24, color: '#A8A8A8', size: 2 },
  { name: 'Venus', distance: 0.723, period: 0.62, color: '#E0B050', size: 4 },
  { name: 'Bumi', distance: 1.0, period: 1.0, color: '#0066FF', size: 5 },
  { name: 'Mars', distance: 1.524, period: 1.88, color: '#E03010', size: 3 },
];

export default function SolarSystem() {
  const [mode, setMode] = useState('sim');
  const [speed, setSpeed] = useState(1.0);
  
  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const drawSimulation = useCallback((ctx, time) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.clearRect(0, 0, width, height);

    const originX = width / 2;
    const originY = height / 2;
    const scale = 150; // pixels per AU

    // Draw Sun
    ctx.beginPath();
    ctx.arc(originX, originY, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#FFD700';
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    // Draw Planets
    PLANETS.forEach(planet => {
      const r = planet.distance * scale;
      // Orbit
      ctx.beginPath();
      ctx.arc(originX, originY, r, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Planet Position
      // speed factor: time * speed / period
      const angle = (time * speed) / planet.period;
      const x = originX + r * Math.cos(angle);
      const y = originY + r * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(x, y, planet.size, 0, 2 * Math.PI);
      ctx.fillStyle = planet.color;
      ctx.fill();
      
      // Label
      ctx.fillStyle = '#666';
      ctx.font = '10px sans-serif';
      ctx.fillText(planet.name, x + 8, y + 3);
    });

  }, [speed]);

  const handleARSceneReady = useCallback(({ scene, anchor, THREE }) => {
    const group = new THREE.Group();
    
    // Shadow Catcher (Invisible floor that receives shadows)
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      new THREE.ShadowMaterial({ opacity: 0.5 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.05; // Slightly below orbits
    shadowPlane.receiveShadow = true;
    group.add(shadowPlane);
    
    // Sun
    const sunGeo = new THREE.SphereGeometry(0.1, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({ 
      color: 0xFFD700, emissive: 0xFFD700, emissiveIntensity: 0.5 
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    group.add(sun);

    const planets = PLANETS.map(p => {
      const r = p.distance * 0.4;
      
      // Orbit ring
      const orbitGeo = new THREE.RingGeometry(r - 0.002, r + 0.002, 64);
      const orbitMat = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
      const orbit = new THREE.Mesh(orbitGeo, orbitMat);
      orbit.rotation.x = Math.PI / 2;
      group.add(orbit);

      // Planet mesh
      const planetGeo = new THREE.SphereGeometry(p.size * 0.005, 32, 32);
      const planetMat = new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.4, metalness: 0.2 });
      const planetMesh = new THREE.Mesh(planetGeo, planetMat);
      planetMesh.castShadow = true;
      planetMesh.receiveShadow = true;
      
      // Pivot for rotation
      const pivot = new THREE.Group();
      pivot.add(planetMesh);
      planetMesh.position.x = r;
      group.add(pivot);

      return { pivot, period: p.period };
    });

    // Add a light that casts shadow
    const light = new THREE.PointLight(0xFFFFFF, 2, 10);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    group.add(light);
    const ambient = new THREE.AmbientLight(0x404040);
    group.add(ambient);

    group.position.set(0, 0, 0);
    anchor.group.add(group);

    const clock = new THREE.Clock();
    
    sun.onBeforeRender = () => {
      const delta = clock.getDelta();
      const currentSpeed = speedRef.current;
      // Rotate planets
      planets.forEach(p => {
        p.pivot.rotation.y += (delta * currentSpeed) / p.period;
      });
      // Rotate sun
      sun.rotation.y += delta * 0.5;
    };
  }, []);

  return (
    <ExperimentLayout title="Tata Surya" mode={mode} setMode={setMode}>
      {mode === 'sim' && (
        <div className="flex-1 overflow-y-auto px-4 pb-12">
          <SimCanvas draw={drawSimulation} isPlaying={true} width={800} height={500} />
          
          <ControlPanel>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Kecepatan Waktu: <span className="font-mono text-primary">{speed.toFixed(1)}x</span>
              </label>
              <input 
                type="range" min="0.1" max="5.0" step="0.1" 
                value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </ControlPanel>

          <DataBar data={{
            "Hukum": "Kepler III",
            "T² ∝ r³": "Berlaku",
            "Pusat": "Matahari",
            "Jumlah": `${PLANETS.length} Planet Dalam`
          }} />
        </div>
      )}

      {mode === 'ar' && (
        <>
          {document.getElementById('ar-hud-bottom') && createPortal(
            <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-4 w-full max-w-sm shadow-2xl">
              <label className="text-sm font-bold text-white mb-2 block">
                Kecepatan Waktu: {speed.toFixed(1)}x
              </label>
              <input 
                type="range" min="0.1" max="5.0" step="0.1" 
                value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-white"
              />
            </div>,
            document.getElementById('ar-hud-bottom')
          )}
          <ARScene 
            targetSrc="/targets.mind"
            onSceneReady={handleARSceneReady}
            onStop={() => setMode('sim')}
          />
        </>
      )}
    </ExperimentLayout>
  );
}
