import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ExperimentLayout from '../components/ExperimentLayout';
import SimCanvas from '../components/SimCanvas';
import ControlPanel from '../components/ControlPanel';
import DataBar from '../components/DataBar';
import ARScene from '../components/ARScene';

const MEDIUMS = {
  udara: { name: 'Udara', n: 1.0, color: '#f8fafc', arColor: 0xffffff, opacity: 0.1 },
  air: { name: 'Air', n: 1.33, color: '#bae6fd', arColor: 0x3b82f6, opacity: 0.4 },
  kaca: { name: 'Kaca', n: 1.5, color: '#cbd5e1', arColor: 0x94a3b8, opacity: 0.6 }
};

export default function Refraction() {
  const [mode, setMode] = useState('sim');
  const [n1Key, setN1Key] = useState('udara');
  const [n2Key, setN2Key] = useState('kaca');
  const [theta1, setTheta1] = useState(45); // degrees

  const n1Ref = useRef(n1Key);
  const n2Ref = useRef(n2Key);
  const theta1Ref = useRef(theta1);

  useEffect(() => {
    n1Ref.current = n1Key;
    n2Ref.current = n2Key;
    theta1Ref.current = theta1;
  }, [n1Key, n2Key, theta1]);

  const drawSimulation = useCallback((ctx) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.clearRect(0, 0, width, height);

    const m1 = MEDIUMS[n1Ref.current];
    const m2 = MEDIUMS[n2Ref.current];
    const t1 = theta1Ref.current;

    const originX = width / 2;
    const originY = height / 2;

    // Draw Medium 1 (Top)
    ctx.fillStyle = m1.color;
    ctx.fillRect(0, 0, width, originY);
    ctx.fillStyle = '#64748b';
    ctx.font = '14px sans-serif';
    ctx.fillText(`${m1.name} (n=${m1.n})`, 10, 20);

    // Draw Medium 2 (Bottom)
    ctx.fillStyle = m2.color;
    ctx.fillRect(0, originY, width, originY);
    ctx.fillStyle = '#64748b';
    ctx.fillText(`${m2.name} (n=${m2.n})`, 10, originY + 20);

    // Draw Normal Line
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.strokeStyle = '#94a3b8';
    ctx.stroke();
    ctx.setLineDash([]);

    // Physics
    const t1Rad = (t1 * Math.PI) / 180;
    const sinT2 = (m1.n * Math.sin(t1Rad)) / m2.n;
    
    // Draw Incident Beam
    const rayLength = Math.max(width, height);
    const inX = originX - rayLength * Math.sin(t1Rad);
    const inY = originY - rayLength * Math.cos(t1Rad);
    
    ctx.beginPath();
    ctx.moveTo(inX, inY);
    ctx.lineTo(originX, originY);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ef4444';
    ctx.stroke();

    if (sinT2 > 1) {
      // Total Internal Reflection
      const refX = originX + rayLength * Math.sin(t1Rad);
      const refY = originY - rayLength * Math.cos(t1Rad);
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(refX, refY);
      ctx.stroke();
      
      // text
      ctx.fillStyle = '#ef4444';
      ctx.fillText('Refleksi Internal Total', originX + 20, originY - 40);
    } else {
      // Refraction
      const t2Rad = Math.asin(sinT2);
      const outX = originX + rayLength * Math.sin(t2Rad);
      const outY = originY + rayLength * Math.cos(t2Rad);
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(outX, outY);
      ctx.stroke();

      // Reflected part (weak)
      const refX = originX + rayLength * Math.sin(t1Rad);
      const refY = originY - rayLength * Math.cos(t1Rad);
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(refX, refY);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.stroke();
    }
    
    ctx.shadowBlur = 0; // reset
  }, [n1Key, n2Key, theta1]);

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

    // Medium 2 Box
    const m2Geo = new THREE.BoxGeometry(1.5, 0.5, 1.5);
    const m2Mat = new THREE.MeshPhysicalMaterial({ 
      color: 0x94a3b8, 
      transmission: 0.9, 
      opacity: 1, 
      metalness: 0.1, 
      roughness: 0.1, 
      transparent: true 
    });
    const m2Mesh = new THREE.Mesh(m2Geo, m2Mat);
    m2Mesh.position.y = -0.25;
    m2Mesh.castShadow = true;
    m2Mesh.receiveShadow = true;
    group.add(m2Mesh);

    // Laser Source
    const laserGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.2);
    const laserMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.castShadow = true;
    group.add(laser);

    // Beam Lines
    const beamMat = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const inBeamGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)]);
    const outBeamGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)]);
    const inBeam = new THREE.Line(inBeamGeo, beamMat);
    const outBeam = new THREE.Line(outBeamGeo, beamMat);
    group.add(inBeam);
    group.add(outBeam);

    group.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(1, 3, 2);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    group.add(dirLight);
    anchor.group.add(group);

    // Animation Loop
    m2Mesh.onBeforeRender = () => {
      const t1 = theta1Ref.current;
      const m1 = MEDIUMS[n1Ref.current];
      const m2 = MEDIUMS[n2Ref.current];

      m2Mat.color.setHex(m2.arColor);
      m2Mat.transmission = m2.opacity > 0.5 ? 0.8 : 1.0;

      const t1Rad = (t1 * Math.PI) / 180;
      const sinT2 = (m1.n * Math.sin(t1Rad)) / m2.n;

      const length = 2;
      const startX = -length * Math.sin(t1Rad);
      const startY = length * Math.cos(t1Rad);
      
      laser.position.set(startX/2, startY/2, 0);
      laser.rotation.z = -t1Rad;

      inBeamGeo.setFromPoints([new THREE.Vector3(startX, startY, 0), new THREE.Vector3(0, 0, 0)]);
      
      if (sinT2 > 1) {
        // Reflect
        const endX = length * Math.sin(t1Rad);
        const endY = length * Math.cos(t1Rad);
        outBeamGeo.setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(endX, endY, 0)]);
      } else {
        // Refract
        const t2Rad = Math.asin(sinT2);
        const endX = length * Math.sin(t2Rad);
        const endY = -length * Math.cos(t2Rad);
        outBeamGeo.setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(endX, endY, 0)]);
      }
    };
  }, []);

  const m1 = MEDIUMS[n1Key];
  const m2 = MEDIUMS[n2Key];
  const sinT2 = (m1.n * Math.sin((theta1 * Math.PI) / 180)) / m2.n;
  const isTIR = sinT2 > 1;
  const theta2 = isTIR ? theta1 : (Math.asin(sinT2) * 180 / Math.PI);

  return (
    <ExperimentLayout title="Pembiasan Cahaya" mode={mode} setMode={setMode}>
      {mode === 'sim' && (
        <div className="flex-1 overflow-y-auto px-4 pb-12">
          <SimCanvas draw={drawSimulation} isPlaying={false} width={800} height={500} />
          
          <ControlPanel>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Medium 1 (Atas)</label>
              <select 
                value={n1Key} onChange={(e) => setN1Key(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              >
                {Object.entries(MEDIUMS).map(([k, v]) => <option key={k} value={k}>{v.name} (n={v.n})</option>)}
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Medium 2 (Bawah)</label>
              <select 
                value={n2Key} onChange={(e) => setN2Key(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              >
                {Object.entries(MEDIUMS).map(([k, v]) => <option key={k} value={k}>{v.name} (n={v.n})</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Sudut Datang (θ₁): <span className="font-mono text-primary">{theta1}°</span>
              </label>
              <input 
                type="range" min="0" max="89" step="1" 
                value={theta1} onChange={(e) => setTheta1(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </ControlPanel>

          <DataBar data={{
            "Sudut Bias (θ₂)": isTIR ? "-" : `${theta2.toFixed(1)}°`,
            "Status": isTIR ? "Refleksi Internal" : "Dibiaskan",
            "Indeks Relatif (n₂/n₁)": (m2.n / m1.n).toFixed(2),
            "Hukum Snell": "n₁ sinθ₁ = n₂ sinθ₂"
          }} />
        </div>
      )}

      {mode === 'ar' && (
        <>
          {document.getElementById('ar-hud-bottom') && createPortal(
            <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-4 w-full max-w-sm shadow-2xl flex flex-col gap-4 pointer-events-auto">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-white flex justify-between">
                  <span>Sudut Datang (θ₁):</span>
                  <span>{theta1}°</span>
                </label>
                <input 
                  type="range" min="0" max="89" step="1" 
                  value={theta1} onChange={(e) => setTheta1(parseInt(e.target.value))}
                  className="w-full accent-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-200">Medium Atas</label>
                  <select 
                    value={n1Key} onChange={(e) => setN1Key(e.target.value)}
                    className="p-1 text-xs rounded bg-white/50 text-slate-900 border border-white/30"
                  >
                    {Object.entries(MEDIUMS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-200">Medium Bawah</label>
                  <select 
                    value={n2Key} onChange={(e) => setN2Key(e.target.value)}
                    className="p-1 text-xs rounded bg-white/50 text-slate-900 border border-white/30"
                  >
                    {Object.entries(MEDIUMS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
                  </select>
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
