import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ExperimentLayout from '../components/ExperimentLayout';
import SimCanvas from '../components/SimCanvas';
import ControlPanel from '../components/ControlPanel';
import DataBar from '../components/DataBar';
import ARScene from '../components/ARScene';

export default function FreeFall() {
  const [mode, setMode] = useState('sim');
  const [isVacuum, setIsVacuum] = useState(false);
  const [height, setHeight] = useState(10); // meters
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);

  const isPlayingRef = useRef(isPlaying);
  const isVacuumRef = useRef(isVacuum);
  const heightRef = useRef(height);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    isVacuumRef.current = isVacuum;
    heightRef.current = height;
  }, [isPlaying, isVacuum, height]);

  const resetSim = () => {
    setIsPlaying(false);
    setTime(0);
  };

  const drawSimulation = useCallback((ctx, deltaTime) => {
    const width = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    ctx.clearRect(0, 0, width, canvasHeight);

    const isVac = isVacuumRef.current;
    const h = heightRef.current;
    
    if (isPlayingRef.current) {
      setTime(t => {
        // max time logic: max t = sqrt(2h/g_fastest)
        const g = 9.8;
        const maxT = Math.sqrt((2 * h) / g);
        if (t >= maxT) {
          setIsPlaying(false);
          return maxT;
        }
        return t + 1/60; // assume 60fps
      });
    }

    const t = time;
    const gApple = 9.8;
    const gFeather = isVac ? 9.8 : 2.0;

    // Physics
    const dropApple = 0.5 * gApple * t * t;
    const dropFeather = 0.5 * gFeather * t * t;

    // Drawing scale
    const pixelsPerMeter = (canvasHeight - 100) / 20; // max height 20m
    const baseY = 50;
    const groundY = baseY + h * pixelsPerMeter;

    // Draw Ground
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, groundY, width, canvasHeight - groundY);
    ctx.fillStyle = '#4ADE80';
    ctx.fillRect(0, groundY, width, 10);

    // Draw Grid / Ruler
    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px sans-serif';
    for(let i=0; i<=h; i+=2) {
      const y = baseY + i * pixelsPerMeter;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(60, y);
      ctx.stroke();
      ctx.fillText(`${i}m`, 20, y+4);
    }

    const appleY = Math.min(baseY + dropApple * pixelsPerMeter, groundY);
    const featherY = Math.min(baseY + dropFeather * pixelsPerMeter, groundY);

    // Draw Apple
    ctx.beginPath();
    ctx.arc(width/2 - 50, appleY - 15, 15, 0, 2*Math.PI);
    ctx.fillStyle = '#EF4444';
    ctx.fill();
    ctx.fillText('🍎', width/2 - 58, appleY - 10);

    // Draw Feather
    ctx.beginPath();
    ctx.fillStyle = '#CBD5E1';
    // rough feather shape
    ctx.ellipse(width/2 + 50, featherY - 20, 8, 20, 0, 0, 2*Math.PI);
    ctx.fill();
    ctx.fillText('🪶', width/2 + 42, featherY - 15);

  }, [time]);

  const handleARSceneReady = useCallback(({ scene, anchor, THREE }) => {
    const group = new THREE.Group();
    
    // Shadow Catcher
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      new THREE.ShadowMaterial({ opacity: 0.5 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.receiveShadow = true;
    group.add(shadowPlane);

    // Apple
    const appleGeo = new THREE.SphereGeometry(0.1, 32, 32);
    const appleMat = new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.5 });
    const apple = new THREE.Mesh(appleGeo, appleMat);
    apple.position.set(-0.2, 1, 0);
    apple.castShadow = true;
    group.add(apple);

    // Feather (Capsule)
    const featherGeo = new THREE.CapsuleGeometry(0.05, 0.1, 4, 16);
    const featherMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1 });
    const feather = new THREE.Mesh(featherGeo, featherMat);
    feather.position.set(0.2, 1, 0);
    feather.castShadow = true;
    group.add(feather);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(1, 1);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x4ADE80, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    group.add(ground);

    const light = new THREE.SpotLight(0xFFFFFF, 2);
    light.position.set(0, 3, 2);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    group.add(light);
    group.add(new THREE.AmbientLight(0x404040, 1.5));

    anchor.group.add(group);

    const clock = new THREE.Clock();
    let arTime = 0;
    
    apple.onBeforeRender = () => {
      const delta = clock.getDelta();
      if (isPlayingRef.current) {
        arTime += delta;
        const gApple = 9.8;
        const gFeather = isVacuumRef.current ? 9.8 : 2.0;
        
        let dropA = 0.5 * gApple * arTime * arTime;
        let dropF = 0.5 * gFeather * arTime * arTime;
        
        // Scale down for AR (1m = 0.1 units)
        apple.position.y = Math.max(1 - dropA * 0.1, 0.1);
        feather.position.y = Math.max(1 - dropF * 0.1, 0.05);

        if (apple.position.y <= 0.1 && feather.position.y <= 0.05) {
          // both hit ground
        }
      } else {
        arTime = 0;
        apple.position.y = 1;
        feather.position.y = 1;
      }
    };
  }, []);

  const g = 9.8;
  const timeApple = Math.sqrt((2 * height) / g);
  const timeFeather = isVacuum ? timeApple : Math.sqrt((2 * height) / 2.0);

  return (
    <ExperimentLayout title="Gerak Jatuh Bebas" mode={mode} setMode={setMode}>
      {mode === 'sim' && (
        <div className="flex-1 overflow-y-auto px-4 pb-12">
          <SimCanvas draw={drawSimulation} isPlaying={true} width={800} height={500} />
          
          <ControlPanel>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ketinggian (h): <span className="font-mono text-primary">{height} m</span>
              </label>
              <input 
                type="range" min="1" max="20" step="1" 
                value={height} onChange={(e) => { setHeight(parseInt(e.target.value)); resetSim(); }}
                className="w-full accent-primary"
                disabled={isPlaying}
              />
            </div>
            
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-3 rounded-xl border border-slate-200 dark:border-slate-600">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Ruang Hampa (Vacuum)</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Hilangkan hambatan udara</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isVacuum} onChange={(e) => { setIsVacuum(e.target.checked); resetSim(); }} disabled={isPlaying} />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-end">
              <button 
                onClick={() => { if(isPlaying) resetSim(); else setIsPlaying(true); }}
                className={`px-8 py-3 rounded-full font-bold text-white shadow-lg transition-transform active:scale-95 ${
                  isPlaying ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/30'
                }`}
              >
                {isPlaying ? '⏹ Reset' : '▶ Jatuhkan'}
              </button>
            </div>
          </ControlPanel>

          <DataBar data={{
            "Waktu (Apel)": `${timeApple.toFixed(2)} s`,
            "Waktu (Bulu)": `${timeFeather.toFixed(2)} s`,
            "Gravitasi (g)": "9.8 m/s²",
            "Hukum": "h = ½gt²"
          }} />
        </div>
      )}

      {mode === 'ar' && (
        <>
          {document.getElementById('ar-hud-bottom') && createPortal(
            <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-4 w-full max-w-sm shadow-2xl flex flex-col gap-3">
              <button 
                onClick={() => { if(isPlaying) resetSim(); else setIsPlaying(true); }} 
                className="w-full py-3 bg-red-500/90 hover:bg-red-600/90 text-white rounded-xl font-bold shadow-lg backdrop-blur-sm transition-transform active:scale-95"
              >
                {isPlaying ? '⏹ Reset' : '▶ Drop (Jatuhkan)'}
              </button>
              
              <div className="flex items-center justify-between bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10">
                <p className="font-bold text-white text-sm">Ruang Hampa (Vacuum)</p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isVacuum} onChange={(e) => { setIsVacuum(e.target.checked); resetSim(); }} disabled={isPlaying} />
                  <div className="w-11 h-6 bg-slate-500/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
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
