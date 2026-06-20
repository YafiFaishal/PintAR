import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ExperimentLayout from '../components/ExperimentLayout';
import SimCanvas from '../components/SimCanvas';
import ControlPanel from '../components/ControlPanel';
import DataBar from '../components/DataBar';
import ARScene from '../components/ARScene';

export default function Circuit() {
  const [mode, setMode] = useState('sim');
  const [voltage, setVoltage] = useState(12); // Volts
  const [r1, setR1] = useState(10); // Ohms
  const [r2, setR2] = useState(10); // Ohms
  const [circuitType, setCircuitType] = useState('seri'); // 'seri' or 'paralel'

  const vRef = useRef(voltage);
  const r1Ref = useRef(r1);
  const r2Ref = useRef(r2);
  const typeRef = useRef(circuitType);

  useEffect(() => {
    vRef.current = voltage;
    r1Ref.current = r1;
    r2Ref.current = r2;
    typeRef.current = circuitType;
  }, [voltage, r1, r2, circuitType]);

  const calcPhysics = (v, r1, r2, type) => {
    let req = type === 'seri' ? r1 + r2 : (r1 * r2) / (r1 + r2);
    let i = v / req;
    let i1 = type === 'seri' ? i : v / r1;
    let i2 = type === 'seri' ? i : v / r2;
    return { req, i, i1, i2 };
  };

  const drawSimulation = useCallback((ctx, time) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.clearRect(0, 0, width, height);

    const v = vRef.current;
    const r1 = r1Ref.current;
    const r2 = r2Ref.current;
    const type = typeRef.current;

    const { i, i1, i2 } = calcPhysics(v, r1, r2, type);

    const originX = width / 2;
    const originY = height / 2;

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;

    // Draw Battery
    ctx.beginPath();
    ctx.moveTo(originX - 150, originY + 100);
    ctx.lineTo(originX + 150, originY + 100);
    ctx.stroke();

    ctx.fillStyle = '#ef4444'; // +
    ctx.fillRect(originX - 30, originY + 85, 10, 30);
    ctx.fillStyle = '#3b82f6'; // -
    ctx.fillRect(originX + 20, originY + 90, 10, 20);

    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`${v}V`, originX - 10, originY + 130);

    // Wires and Resistors
    if (type === 'seri') {
      ctx.beginPath();
      // left wire up
      ctx.moveTo(originX - 150, originY + 100);
      ctx.lineTo(originX - 150, originY - 50);
      // top wire
      ctx.lineTo(originX + 150, originY - 50);
      // right wire down
      ctx.lineTo(originX + 150, originY + 100);
      ctx.stroke();

      // R1 Box
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(originX - 100, originY - 70, 60, 40);
      ctx.fillStyle = '#333';
      ctx.fillText(`R1=${r1}Ω`, originX - 95, originY - 45);

      // R2 Box
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(originX + 40, originY - 70, 60, 40);
      ctx.fillStyle = '#333';
      ctx.fillText(`R2=${r2}Ω`, originX + 45, originY - 45);

      // Draw flowing current (electrons)
      ctx.fillStyle = '#ef4444';
      const pathLength = 300 + 150 + 300 + 150; // roughly
      const speed = i * 50; 
      const pos = (time * speed) % pathLength;
      
      // Simple dots for current
      for(let j=0; j<5; j++) {
        let p = (pos + j * (pathLength/5)) % pathLength;
        let dx, dy;
        if (p < 150) { dx = originX - 150; dy = originY + 100 - p; }
        else if (p < 450) { dx = originX - 150 + (p-150); dy = originY - 50; }
        else if (p < 600) { dx = originX + 150; dy = originY - 50 + (p-450); }
        else { dx = originX + 150 - (p-600); dy = originY + 100; }

        ctx.beginPath();
        ctx.arc(dx, dy, 6, 0, 2*Math.PI);
        ctx.fill();
      }

    } else {
      // Parallel
      ctx.beginPath();
      ctx.moveTo(originX - 150, originY + 100);
      ctx.lineTo(originX - 150, originY - 100);
      ctx.moveTo(originX + 150, originY + 100);
      ctx.lineTo(originX + 150, originY - 100);
      // top branch
      ctx.moveTo(originX - 150, originY - 100);
      ctx.lineTo(originX + 150, originY - 100);
      // middle branch
      ctx.moveTo(originX - 150, originY);
      ctx.lineTo(originX + 150, originY);
      ctx.stroke();

      // R1 Box
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(originX - 30, originY - 120, 60, 40);
      ctx.fillStyle = '#333';
      ctx.fillText(`R1=${r1}Ω`, originX - 25, originY - 95);

      // R2 Box
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(originX - 30, originY - 20, 60, 40);
      ctx.fillStyle = '#333';
      ctx.fillText(`R2=${r2}Ω`, originX - 25, originY + 5);

      // Electrons animation skipped for parallel to keep simple, 
      // or just draw simple dots on top branch and mid branch
      ctx.fillStyle = '#ef4444';
      let pos1 = (time * i1 * 50) % 300;
      let pos2 = (time * i2 * 50) % 300;
      ctx.beginPath(); ctx.arc(originX - 150 + pos1, originY - 100, 6, 0, 2*Math.PI); ctx.fill();
      ctx.beginPath(); ctx.arc(originX - 150 + pos2, originY, 6, 0, 2*Math.PI); ctx.fill();
    }

  }, []);

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

    // Just a placeholder battery and resistor
    const batteryGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 32);
    const batteryMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 });
    const battery = new THREE.Mesh(batteryGeo, batteryMat);
    battery.rotation.z = Math.PI/2;
    battery.position.z = 0.2;
    battery.position.y = 0.1;
    battery.castShadow = true;
    group.add(battery);

    const resGeo = new THREE.BoxGeometry(0.2, 0.1, 0.1);
    const resMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24 });
    const resistor = new THREE.Mesh(resGeo, resMat);
    resistor.position.z = -0.2;
    resistor.position.y = 0.05;
    resistor.castShadow = true;
    group.add(resistor);

    // Glow for resistor based on current
    const glowGeo = new THREE.SphereGeometry(0.2, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    resistor.add(glow);

    group.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(1, 3, 2);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    group.add(dirLight);
    anchor.group.add(group);

    resistor.onBeforeRender = () => {
      const v = vRef.current;
      const r1 = r1Ref.current;
      const r2 = r2Ref.current;
      const type = typeRef.current;
      const { i } = calcPhysics(v, r1, r2, type);

      // Glow opacity depends on current (I). I max usually ~24A
      glowMat.opacity = Math.min(i / 10, 0.8);
    };
  }, []);

  const { req, i } = calcPhysics(voltage, r1, r2, circuitType);

  return (
    <ExperimentLayout title="Rangkaian Listrik" mode={mode} setMode={setMode}>
      {mode === 'sim' && (
        <div className="flex-1 overflow-y-auto px-4 pb-12">
          <SimCanvas draw={drawSimulation} isPlaying={true} width={800} height={500} />
          
          <ControlPanel>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipe Rangkaian</label>
              <select 
                value={circuitType} onChange={(e) => setCircuitType(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              >
                <option value="seri">Seri</option>
                <option value="paralel">Paralel</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tegangan Baterai (V): <span className="font-mono text-primary">{voltage} V</span>
              </label>
              <input 
                type="range" min="1" max="24" step="1" 
                value={voltage} onChange={(e) => setVoltage(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Hambatan R1: <span className="font-mono text-primary">{r1} Ω</span>
              </label>
              <input 
                type="range" min="1" max="100" step="1" 
                value={r1} onChange={(e) => setR1(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Hambatan R2: <span className="font-mono text-primary">{r2} Ω</span>
              </label>
              <input 
                type="range" min="1" max="100" step="1" 
                value={r2} onChange={(e) => setR2(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </ControlPanel>

          <DataBar data={{
            "Hambatan Total (Req)": `${req.toFixed(2)} Ω`,
            "Arus Total (I)": `${i.toFixed(2)} A`,
            "Daya (P = V×I)": `${(voltage * i).toFixed(2)} W`,
            "Hukum Ohm": "V = I × R"
          }} />
        </div>
      )}

      {mode === 'ar' && (
        <>
          {document.getElementById('ar-hud-bottom') && createPortal(
            <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-4 w-full max-w-sm shadow-2xl flex flex-col gap-4 pointer-events-auto">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-white flex justify-between">
                  <span>Tegangan (V):</span>
                  <span>{voltage} V</span>
                </label>
                <input 
                  type="range" min="1" max="24" step="1" 
                  value={voltage} onChange={(e) => setVoltage(parseInt(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white flex justify-between">
                    <span>R1:</span>
                    <span>{r1} Ω</span>
                  </label>
                  <input 
                    type="range" min="1" max="100" step="1" 
                    value={r1} onChange={(e) => setR1(parseInt(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white flex justify-between">
                    <span>R2:</span>
                    <span>{r2} Ω</span>
                  </label>
                  <input 
                    type="range" min="1" max="100" step="1" 
                    value={r2} onChange={(e) => setR2(parseInt(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>
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
