import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ExperimentLayout from '../components/ExperimentLayout';
import SimCanvas from '../components/SimCanvas';
import ControlPanel from '../components/ControlPanel';
import DataBar from '../components/DataBar';
import ARScene from '../components/ARScene';

export default function Pendulum() {
  const [mode, setMode] = useState('sim'); // 'sim' or 'ar'
  const [length, setLength] = useState(1.0); // meters
  const [mass, setMass] = useState(1.0); // kg
  const [gravity, setGravity] = useState(9.8); // m/s^2

  const lengthRef = useRef(length);
  const massRef = useRef(mass);
  const gravityRef = useRef(gravity);

  useEffect(() => {
    lengthRef.current = length;
    massRef.current = mass;
    gravityRef.current = gravity;
  }, [length, mass, gravity]);

  const period = 2 * Math.PI * Math.sqrt(length / gravity);

  const drawSimulation = useCallback((ctx, time) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.clearRect(0, 0, width, height);

    const originX = width / 2;
    const originY = 50;
    
    // Scale length for visualization
    const visualLength = length * 200;
    
    // Calculate angle based on time and period
    const maxAngle = Math.PI / 4;
    // frequency = 1 / period. Angular frequency = 2 * PI / period
    const omega = Math.sqrt(gravity / length);
    const angle = maxAngle * Math.cos(omega * time);

    const bobX = originX + visualLength * Math.sin(angle);
    const bobY = originY + visualLength * Math.cos(angle);

    // Draw pivot
    ctx.beginPath();
    ctx.moveTo(originX - 30, originY);
    ctx.lineTo(originX + 30, originY);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#333';
    ctx.stroke();

    // Draw string
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(bobX, bobY);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#666';
    ctx.stroke();

    // Draw bob
    ctx.beginPath();
    ctx.arc(bobX, bobY, 15 + mass * 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#0066FF';
    ctx.fill();
    ctx.stroke();
  }, [length, mass, gravity]);

  const handleARSceneReady = useCallback(({ scene, anchor, THREE }) => {
    // We create a group for the pendulum that will be updated in animation loop
    const group = new THREE.Group();
    
    // Shadow Catcher
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      new THREE.ShadowMaterial({ opacity: 0.5 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1;
    shadowPlane.receiveShadow = true;
    group.add(shadowPlane);

    // Tiang (Support)
    const supportGeo = new THREE.BoxGeometry(0.5, 0.05, 0.1);
    const supportMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
    const support = new THREE.Mesh(supportGeo, supportMat);
    support.position.y = 1;
    support.castShadow = true;
    group.add(support);

    // Pivot Group
    const pivot = new THREE.Group();
    pivot.position.y = 1;
    group.add(pivot);

    // Tali (String)
    const stringGeo = new THREE.CylinderGeometry(0.005, 0.005, 1);
    const stringMat = new THREE.MeshBasicMaterial({ color: 0xdddddd });
    const string = new THREE.Mesh(stringGeo, stringMat);
    string.position.y = -0.5; // halfway down
    pivot.add(string);

    // Beban (Bob)
    const bobGeo = new THREE.SphereGeometry(0.1, 32, 32);
    const bobMat = new THREE.MeshStandardMaterial({ color: 0xEF4444, metalness: 0.3, roughness: 0.4 });
    const bob = new THREE.Mesh(bobGeo, bobMat);
    bob.position.y = -1;
    bob.castShadow = true;
    pivot.add(bob);

    group.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(1, 3, 2);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    group.add(dirLight);

    // Animation variables
    const clock = new THREE.Clock();
    const maxAngle = Math.PI / 4;

    bob.onBeforeRender = () => {
      const time = clock.getElapsedTime();
      const currentLength = lengthRef.current;
      const currentGravity = gravityRef.current;
      const omega = Math.sqrt(currentGravity / currentLength);
      
      pivot.rotation.z = maxAngle * Math.cos(omega * time);
    };

    // Position the whole group slightly above the marker
    group.position.set(0, 0, 0);
    anchor.group.add(group);
  }, []);

  return (
    <ExperimentLayout title="Eksperimen Bandul" mode={mode} setMode={setMode}>
      {mode === 'sim' && (
        <div className="flex-1 overflow-y-auto px-4 pb-12">
          <SimCanvas draw={drawSimulation} isPlaying={true} width={800} height={500} />
          
          <ControlPanel>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Panjang Tali: <span className="font-mono text-primary">{length.toFixed(1)} m</span>
              </label>
              <input 
                type="range" min="0.5" max="2.5" step="0.1" 
                value={length} onChange={(e) => setLength(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Massa Beban: <span className="font-mono text-primary">{mass.toFixed(1)} kg</span>
              </label>
              <input 
                type="range" min="0.5" max="3.0" step="0.1" 
                value={mass} onChange={(e) => setMass(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Gravitasi: <span className="font-mono text-primary">{gravity} m/s²</span>
              </label>
              <select 
                value={gravity} onChange={(e) => setGravity(parseFloat(e.target.value))}
                className="w-full p-2 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="9.8">Bumi (9.8)</option>
                <option value="1.62">Bulan (1.62)</option>
                <option value="24.79">Jupiter (24.79)</option>
                <option value="3.72">Mars (3.72)</option>
              </select>
            </div>
          </ControlPanel>

          <DataBar data={{
            "T (Periode)": `${period.toFixed(2)} s`,
            "f (Frekuensi)": `${(1 / period).toFixed(2)} Hz`,
            "Gravitasi": `${gravity} m/s²`,
            "Panjang": `${length} m`
          }} />
        </div>
      )}

      {mode === 'ar' && (
        <>
          {document.getElementById('ar-hud-bottom') && createPortal(
            <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-4 w-full max-w-sm shadow-2xl flex flex-col gap-4">
              <button 
                onClick={() => { if(isPlaying) resetSim(); else setIsPlaying(true); }}
                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${
                  isPlaying ? 'bg-red-500/90 hover:bg-red-600/90' : 'bg-primary-500/90 hover:bg-primary-600/90'
                }`}
              >
                {isPlaying ? '⏹ Reset' : '▶ Ayunkan'}
              </button>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-white flex justify-between">
                  <span>Panjang Tali:</span>
                  <span>{length} m</span>
                </label>
                <input 
                  type="range" min="0.5" max="5.0" step="0.1" 
                  value={length} onChange={(e) => { setLength(parseFloat(e.target.value)); resetSim(); }}
                  className="w-full accent-white"
                />
              </div>
            </div>,
            document.getElementById('ar-hud-bottom')
          )}
          <ARScene 
            targetSrc={import.meta.env.BASE_URL + "targets.mind"}
            onSceneReady={handleARSceneReady}
            onStop={() => setMode('sim')}
          />
        </>
      )}
    </ExperimentLayout>
  );
}
