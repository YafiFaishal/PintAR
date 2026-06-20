import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ExperimentLayout from '../components/ExperimentLayout';
import SimCanvas from '../components/SimCanvas';
import ControlPanel from '../components/ControlPanel';
import DataBar from '../components/DataBar';
import ARScene from '../components/ARScene';

const METALS = {
  mg: { name: 'Magnesium (Mg)', e0: -2.37, color: '#e2e8f0', ion: 'Mg²⁺' },
  al: { name: 'Aluminium (Al)', e0: -1.66, color: '#cbd5e1', ion: 'Al³⁺' },
  zn: { name: 'Seng (Zn)', e0: -0.76, color: '#94a3b8', ion: 'Zn²⁺' },
  fe: { name: 'Besi (Fe)', e0: -0.44, color: '#64748b', ion: 'Fe²⁺' },
  cu: { name: 'Tembaga (Cu)', e0: 0.34, color: '#b45309', ion: 'Cu²⁺' },
  ag: { name: 'Perak (Ag)', e0: 0.80, color: '#f1f5f9', ion: 'Ag⁺' }
};

export default function Redox() {
  const [mode, setMode] = useState('sim');
  const [anode, setAnode] = useState('zn');
  const [cathode, setCathode] = useState('cu');

  const anodeRef = useRef(anode);
  const cathodeRef = useRef(cathode);

  useEffect(() => {
    anodeRef.current = anode;
    cathodeRef.current = cathode;
  }, [anode, cathode]);

  const drawSimulation = useCallback((ctx, time) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.clearRect(0, 0, width, height);

    const a = METALS[anodeRef.current];
    const c = METALS[cathodeRef.current];
    const e0 = c.e0 - a.e0;
    const isSpontaneous = e0 > 0;

    const originX = width / 2;
    const originY = height / 2 + 50;

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;

    // Beaker Left (Anode)
    ctx.beginPath();
    ctx.moveTo(originX - 150, originY - 100);
    ctx.lineTo(originX - 150, originY + 50);
    ctx.lineTo(originX - 50, originY + 50);
    ctx.lineTo(originX - 50, originY - 100);
    ctx.stroke();

    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; // solution
    ctx.fillRect(originX - 148, originY - 50, 96, 98);
    ctx.fillStyle = '#333';
    ctx.font = '14px sans-serif';
    ctx.fillText(`${a.ion} (aq)`, originX - 110, originY + 20);

    // Beaker Right (Cathode)
    ctx.beginPath();
    ctx.moveTo(originX + 50, originY - 100);
    ctx.lineTo(originX + 50, originY + 50);
    ctx.lineTo(originX + 150, originY + 50);
    ctx.lineTo(originX + 150, originY - 100);
    ctx.stroke();

    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.fillRect(originX + 52, originY - 50, 96, 98);
    ctx.fillStyle = '#333';
    ctx.fillText(`${c.ion} (aq)`, originX + 90, originY + 20);

    // Salt Bridge
    ctx.beginPath();
    ctx.moveTo(originX - 70, originY - 20);
    ctx.lineTo(originX - 70, originY - 80);
    ctx.lineTo(originX + 70, originY - 80);
    ctx.lineTo(originX + 70, originY - 20);
    ctx.strokeStyle = '#fcd34d'; // yellow bridge
    ctx.lineWidth = 15;
    ctx.stroke();
    ctx.lineWidth = 3; // reset

    // Electrodes
    ctx.fillStyle = a.color;
    ctx.fillRect(originX - 120, originY - 80, 20, 100);
    ctx.fillStyle = '#333';
    ctx.fillText(`(-) ${a.name.split(' ')[0]}`, originX - 135, originY - 90);

    ctx.fillStyle = c.color;
    ctx.fillRect(originX + 100, originY - 80, 20, 100);
    ctx.fillStyle = '#333';
    ctx.fillText(`(+) ${c.name.split(' ')[0]}`, originX + 85, originY - 90);

    // Wires and Voltmeter
    ctx.beginPath();
    ctx.moveTo(originX - 110, originY - 80);
    ctx.lineTo(originX - 110, originY - 150);
    ctx.lineTo(originX - 30, originY - 150);
    
    ctx.moveTo(originX + 110, originY - 80);
    ctx.lineTo(originX + 110, originY - 150);
    ctx.lineTo(originX + 30, originY - 150);
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    // Voltmeter Dial
    ctx.beginPath();
    ctx.arc(originX, originY - 150, 30, 0, 2*Math.PI);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`${e0.toFixed(2)}V`, originX - 25, originY - 145);

    // Electron flow animation
    if (isSpontaneous) {
      ctx.fillStyle = '#ef4444';
      const speed = 50;
      const pathLen = 110 + 110 + 220; // up, across, down (approx)
      const pos = (time * speed) % 220; // just doing the top wire for simplicity
      
      // Moving from left wire to right wire
      ctx.beginPath();
      ctx.arc(originX - 110 + pos, originY - 150, 5, 0, 2*Math.PI);
      ctx.fill();
      ctx.fillText('e⁻', originX - 110 + pos - 5, originY - 160);
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

    // Voltmeter
    const meterGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32);
    const meterMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.2 });
    const meter = new THREE.Mesh(meterGeo, meterMat);
    meter.rotation.x = Math.PI/2;
    meter.position.y = 0.5;
    meter.castShadow = true;
    group.add(meter);

    // Left Electrode
    const leftElGeo = new THREE.BoxGeometry(0.1, 0.4, 0.1);
    const leftElMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });
    const leftEl = new THREE.Mesh(leftElGeo, leftElMat);
    leftEl.position.set(-0.3, 0.2, 0);
    leftEl.castShadow = true;
    group.add(leftEl);

    // Right Electrode
    const rightElGeo = new THREE.BoxGeometry(0.1, 0.4, 0.1);
    const rightElMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.5 });
    const rightEl = new THREE.Mesh(rightElGeo, rightElMat);
    rightEl.position.set(0.3, 0.2, 0);
    rightEl.castShadow = true;
    group.add(rightEl);

    group.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(1, 3, 2);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    group.add(dirLight);
    anchor.group.add(group);

    meter.onBeforeRender = () => {
      const a = METALS[anodeRef.current];
      const c = METALS[cathodeRef.current];
      
      // Update electrode colors based on selection
      leftElMat.color.set(a.color);
      rightElMat.color.set(c.color);
    };
  }, []);

  const a = METALS[anode];
  const c = METALS[cathode];
  const e0 = c.e0 - a.e0;
  const isSpontaneous = e0 > 0;

  return (
    <ExperimentLayout title="Reaksi Redoks (Sel Volta)" mode={mode} setMode={setMode}>
      {mode === 'sim' && (
        <div className="flex-1 overflow-y-auto px-4 pb-12">
          <SimCanvas draw={drawSimulation} isPlaying={true} width={800} height={500} />
          
          <ControlPanel>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Anoda (Oksidasi)</label>
              <select 
                value={anode} onChange={(e) => setAnode(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              >
                {Object.entries(METALS).map(([k, v]) => <option key={k} value={k}>{v.name} (E°={v.e0}V)</option>)}
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Katoda (Reduksi)</label>
              <select 
                value={cathode} onChange={(e) => setCathode(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              >
                {Object.entries(METALS).map(([k, v]) => <option key={k} value={k}>{v.name} (E°={v.e0}V)</option>)}
              </select>
            </div>
          </ControlPanel>

          <DataBar data={{
            "Potensial Sel (E°sel)": `${e0 > 0 ? '+' : ''}${e0.toFixed(2)} V`,
            "Status Reaksi": isSpontaneous ? "Spontan" : "Tidak Spontan",
            "Aliran Elektron": isSpontaneous ? "Anoda → Katoda" : "Terhenti",
            "Rumus": "E°sel = E°kat - E°ano"
          }} />
        </div>
      )}

      {mode === 'ar' && (
        <>
          {document.getElementById('ar-hud-bottom') && createPortal(
            <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-4 w-full max-w-sm shadow-2xl flex flex-col gap-4 pointer-events-auto">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-200">Anoda (-)</label>
                  <select 
                    value={anode} onChange={(e) => setAnode(e.target.value)}
                    className="p-1 text-xs rounded bg-white/50 text-slate-900 border border-white/30"
                  >
                    {Object.entries(METALS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-200">Katoda (+)</label>
                  <select 
                    value={cathode} onChange={(e) => setCathode(e.target.value)}
                    className="p-1 text-xs rounded bg-white/50 text-slate-900 border border-white/30"
                  >
                    {Object.entries(METALS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40">
                <span className="text-white text-xs font-bold">Potensial (E°sel)</span>
                <span className={`text-sm font-bold px-2 py-1 rounded ${e0 > 0 ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                  {e0 > 0 ? '+' : ''}{e0.toFixed(2)} V
                </span>
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
