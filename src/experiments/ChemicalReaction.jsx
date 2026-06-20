import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ExperimentLayout from '../components/ExperimentLayout';
import SimCanvas from '../components/SimCanvas';
import ControlPanel from '../components/ControlPanel';
import DataBar from '../components/DataBar';
import ARScene from '../components/ARScene';

const REACTANTS_A = {
  hcl: { name: 'Asam Klorida (HCl)', ph: 1, color: '#f8fafc', arColor: 0xffffff },
  naoh: { name: 'Natrium Hidroksida (NaOH)', ph: 13, color: '#f8fafc', arColor: 0xffffff },
  air: { name: 'Air Murni (H₂O)', ph: 7, color: '#bae6fd', arColor: 0xbae6fd }
};

const REACTANTS_B = {
  naoh: { name: 'NaOH (Basa Kuat)', type: 'liquid' },
  mg: { name: 'Pita Magnesium (Mg)', type: 'solid' },
  pp: { name: 'Indikator Fenolftalein', type: 'liquid' }
};

export default function ChemicalReaction() {
  const [mode, setMode] = useState('sim');
  const [reactA, setReactA] = useState('hcl');
  const [reactB, setReactB] = useState('naoh');
  
  const [isReacting, setIsReacting] = useState(false);
  const [time, setTime] = useState(0);

  const reactARef = useRef(reactA);
  const reactBRef = useRef(reactB);
  const isReactingRef = useRef(isReacting);

  useEffect(() => {
    reactARef.current = reactA;
    reactBRef.current = reactB;
    isReactingRef.current = isReacting;
  }, [reactA, reactB, isReacting]);

  const resetSim = () => {
    setIsReacting(false);
    setTime(0);
  };

  const getReactionResult = (a, b, t) => {
    let result = {
      color: REACTANTS_A[a].color,
      arColor: REACTANTS_A[a].arColor,
      ph: REACTANTS_A[a].ph,
      temp: 25,
      bubbles: false,
      desc: 'Tidak ada reaksi khusus.'
    };

    const progress = Math.min(t / 2, 1); // 2 seconds to complete

    if (a === 'hcl' && b === 'naoh') {
      result.desc = 'Netralisasi (Eksotermik)';
      result.ph = 1 + (6 * progress); // Goes to 7
      result.temp = 25 + (15 * progress); // Heats up
    } else if (a === 'naoh' && b === 'hcl') {
      result.desc = 'Netralisasi (Eksotermik)';
      result.ph = 13 - (6 * progress); // Goes to 7
      result.temp = 25 + (15 * progress);
    } else if (a === 'hcl' && b === 'mg') {
      result.desc = 'Reaksi Logam & Asam (Gas H₂)';
      result.bubbles = t > 0 && t < 3;
      result.ph = 1 + (3 * progress);
      result.temp = 25 + (20 * progress);
    } else if ((a === 'naoh' || a === 'air') && b === 'pp') {
      if (a === 'naoh') {
        result.desc = 'Indikator Basa (Merah Muda)';
        // interpolate color to pink
        result.color = `rgba(236, 72, 153, ${progress})`;
        result.arColor = 0xec4899;
      } else {
        result.desc = 'Indikator Netral (Bening)';
      }
    } else if (a === 'hcl' && b === 'pp') {
      result.desc = 'Indikator Asam (Bening)';
    }

    return { ...result, progress };
  };

  const drawSimulation = useCallback((ctx, deltaTime) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.clearRect(0, 0, width, height);

    const a = reactARef.current;
    const b = reactBRef.current;
    
    if (isReactingRef.current) {
      setTime(t => {
        if (t > 4) return 4;
        return t + 1/60;
      });
    }

    const t = time;
    const res = getReactionResult(a, b, t);

    const originX = width / 2;
    const originY = height / 2 + 100;

    // Beaker Glass
    ctx.beginPath();
    ctx.moveTo(originX - 60, originY - 150);
    ctx.lineTo(originX - 60, originY);
    ctx.arc(originX, originY, 60, Math.PI, 0, true);
    ctx.lineTo(originX + 60, originY - 150);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Liquid inside
    ctx.beginPath();
    ctx.moveTo(originX - 58, originY - 100);
    ctx.lineTo(originX - 58, originY);
    ctx.arc(originX, originY, 58, Math.PI, 0, true);
    ctx.lineTo(originX + 58, originY - 100);
    
    // Draw base color
    ctx.fillStyle = REACTANTS_A[a].color;
    ctx.fill();

    // Draw reaction color overlay
    if (res.color.startsWith('rgba')) {
      ctx.fillStyle = res.color;
      ctx.fill();
    } else {
      // Lerp color manually? For simplicity, we just use the overlay or keep it.
      ctx.fillStyle = res.color;
      ctx.globalAlpha = res.progress;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Bubbles
    if (res.bubbles) {
      ctx.fillStyle = '#ffffff';
      for(let i=0; i<15; i++) {
        const bx = originX - 40 + Math.random()*80;
        const by = originY - (time * 50 + i * 10) % 100;
        ctx.beginPath();
        ctx.arc(bx, by, Math.random()*3+1, 0, 2*Math.PI);
        ctx.fill();
      }
    }

    // Metal ribbon
    if (b === 'mg' && t > 0) {
      ctx.fillStyle = '#94a3b8';
      const mWidth = Math.max(0, 30 - t*10); // shrinks as it reacts
      if (mWidth > 0) {
        ctx.fillRect(originX - mWidth/2, originY - 20, mWidth, 10);
      }
    }

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

    // Beaker
    const beakerGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 32);
    const beakerMat = new THREE.MeshPhysicalMaterial({ 
      color: 0xffffff, transmission: 0.9, opacity: 1, transparent: true, side: THREE.DoubleSide, roughness: 0.1
    });
    const beaker = new THREE.Mesh(beakerGeo, beakerMat);
    beaker.position.y = 0.3;
    beaker.castShadow = true;
    beaker.receiveShadow = true;
    group.add(beaker);

    // Liquid
    const liquidGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.4, 32);
    const liquidMat = new THREE.MeshPhysicalMaterial({ 
      color: 0xffffff, transmission: 0.5, opacity: 1, transparent: true, roughness: 0.2
    });
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.y = 0.2;
    liquid.castShadow = true;
    group.add(liquid);

    group.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(1, 3, 2);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    group.add(dirLight);
    anchor.group.add(group);

    const clock = new THREE.Clock();
    let arTime = 0;
    
    liquid.onBeforeRender = () => {
      const delta = clock.getDelta();
      if (isReactingRef.current) {
        arTime += delta;
        const a = reactARef.current;
        const b = reactBRef.current;
        const res = getReactionResult(a, b, arTime);
        
        liquidMat.color.setHex(res.arColor);
        if (a === 'naoh' && b === 'pp') {
          // fade to pink
          liquidMat.color.lerp(new THREE.Color(0xec4899), res.progress);
        }
      } else {
        arTime = 0;
        liquidMat.color.setHex(REACTANTS_A[reactARef.current].arColor);
      }
    };
  }, []);

  const res = getReactionResult(reactA, reactB, time);

  return (
    <ExperimentLayout title="Reaksi Kimia" mode={mode} setMode={setMode}>
      {mode === 'sim' && (
        <div className="flex-1 overflow-y-auto px-4 pb-12">
          <SimCanvas draw={drawSimulation} isPlaying={true} width={800} height={500} />
          
          <ControlPanel>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Zat Utama (Di Gelas)</label>
              <select 
                value={reactA} onChange={(e) => { setReactA(e.target.value); resetSim(); }} disabled={isReacting}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              >
                {Object.entries(REACTANTS_A).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Zat Tambahan (Diteteskan/Dimasukkan)</label>
              <select 
                value={reactB} onChange={(e) => { setReactB(e.target.value); resetSim(); }} disabled={isReacting}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              >
                {Object.entries(REACTANTS_B).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
              </select>
            </div>

            <div className="flex items-center justify-end md:col-span-2 lg:col-span-1">
              <button 
                onClick={() => { if(isReacting) resetSim(); else setIsReacting(true); }}
                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${
                  isReacting ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-500 hover:bg-primary-600'
                }`}
              >
                {isReacting ? '⏹ Bersihkan Gelas' : '🧪 Campurkan Zat'}
              </button>
            </div>
          </ControlPanel>

          <DataBar data={{
            "Status Reaksi": res.desc,
            "Suhu Terkini": `${res.temp.toFixed(1)} °C`,
            "pH Larutan": res.ph.toFixed(1),
            "Gelembung Gas": res.bubbles ? "Ada (H₂)" : "Tidak Ada"
          }} />
        </div>
      )}

      {mode === 'ar' && (
        <>
          {document.getElementById('ar-hud-bottom') && createPortal(
            <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-4 w-full max-w-sm shadow-2xl flex flex-col gap-3">
              <button 
                onClick={() => { if(isReacting) resetSim(); else setIsReacting(true); }}
                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${
                  isReacting ? 'bg-red-500/90 hover:bg-red-600/90' : 'bg-primary-500/90 hover:bg-primary-600/90'
                }`}
              >
                {isReacting ? '⏹ Reset Gelas' : '🧪 Campurkan Zat!'}
              </button>
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
