import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ExperimentLayout from '../components/ExperimentLayout';
import SimCanvas from '../components/SimCanvas';
import ControlPanel from '../components/ControlPanel';
import DataBar from '../components/DataBar';
import ARScene from '../components/ARScene';

export default function Archimedes() {
  const [mode, setMode] = useState('sim');
  const [rhoObject, setRhoObject] = useState(800); // kg/m3 (e.g. Wood)
  const [rhoFluid, setRhoFluid] = useState(1000);  // kg/m3 (e.g. Water)

  const rhoObjectRef = useRef(rhoObject);
  const rhoFluidRef = useRef(rhoFluid);

  useEffect(() => {
    rhoObjectRef.current = rhoObject;
    rhoFluidRef.current = rhoFluid;
  }, [rhoObject, rhoFluid]);

  const drawSimulation = useCallback((ctx, time) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.clearRect(0, 0, width, height);

    const rhoO = rhoObjectRef.current;
    const rhoF = rhoFluidRef.current;

    // Draw Fluid Container
    const containerWidth = 300;
    const containerHeight = 300;
    const originX = width / 2;
    const originY = height - 50; // bottom of container

    ctx.fillStyle = '#bae6fd'; // light blue fluid
    ctx.fillRect(originX - containerWidth/2, originY - containerHeight, containerWidth, containerHeight);
    
    // Draw waves
    ctx.beginPath();
    ctx.moveTo(originX - containerWidth/2, originY - containerHeight);
    for (let i = 0; i <= containerWidth; i += 10) {
      ctx.lineTo((originX - containerWidth/2) + i, (originY - containerHeight) + Math.sin(time*2 + i*0.1)*5);
    }
    ctx.lineTo(originX + containerWidth/2, originY);
    ctx.lineTo(originX - containerWidth/2, originY);
    ctx.fillStyle = '#7dd3fc';
    ctx.fill();

    // Container borders
    ctx.beginPath();
    ctx.moveTo(originX - containerWidth/2, originY - containerHeight);
    ctx.lineTo(originX - containerWidth/2, originY);
    ctx.lineTo(originX + containerWidth/2, originY);
    ctx.lineTo(originX + containerWidth/2, originY - containerHeight);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Physics Animation for Block
    // Target Y calculation
    const blockSide = 80;
    let targetY = 0;
    
    const waterLevelY = originY - containerHeight; // Y coordinate of water surface
    const bottomY = originY - blockSide/2;         // Y coordinate of bottom

    if (rhoO < rhoF) {
      // Float
      const submergedRatio = rhoO / rhoF;
      // y is center of block. waterLevelY is surface.
      // submergedRatio = (bottom_of_block - surface) / blockSide
      // bottom_of_block = y + blockSide/2
      // (y + blockSide/2 - waterLevelY) = submergedRatio * blockSide
      targetY = waterLevelY + (submergedRatio - 0.5) * blockSide;
      
      // Add slight bobbing
      targetY += Math.sin(time * 3) * 3;
    } else if (rhoO === rhoF) {
      // Neutral (Melayang)
      targetY = waterLevelY + containerHeight/2; // Middle of fluid
    } else {
      // Sink
      targetY = bottomY;
    }

    // Smooth animation towards targetY using lerp (pseudo-physics)
    // For a stateless canvas draw, we'll just let it jump, or compute a fall.
    // To make it simple, we just draw at targetY.
    
    const blockColor = rhoO < 500 ? '#fde047' : (rhoO < 1000 ? '#fb923c' : '#94a3b8');

    ctx.fillStyle = blockColor;
    ctx.fillRect(originX - blockSide/2, targetY - blockSide/2, blockSide, blockSide);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(originX - blockSide/2, targetY - blockSide/2, blockSide, blockSide);

    // Labels
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('ρ=' + rhoO, originX - 25, targetY + 5);

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

    // Fluid Box
    const fluidGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const fluidMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x3b82f6, transmission: 0.9, opacity: 1, transparent: true, roughness: 0.1 
    });
    const fluid = new THREE.Mesh(fluidGeo, fluidMat);
    fluid.position.y = 0.4; // bottom at 0
    fluid.receiveShadow = true;
    fluid.castShadow = true;
    group.add(fluid);

    // Block
    const blockGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const blockMat = new THREE.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.3 });
    const block = new THREE.Mesh(blockGeo, blockMat);
    block.castShadow = true;
    group.add(block);

    group.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(1, 3, 2);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    group.add(dirLight);

    anchor.group.add(group);

    const clock = new THREE.Clock();
    
    block.onBeforeRender = () => {
      const time = clock.getElapsedTime();
      const rhoO = rhoObjectRef.current;
      const rhoF = rhoFluidRef.current;

      let targetY = 0;
      const surfaceY = 0.8;
      const blockSide = 0.2;

      if (rhoO < rhoF) {
        const submergedRatio = rhoO / rhoF;
        targetY = surfaceY - blockSide/2 + (submergedRatio - 0.5) * blockSide;
        targetY += Math.sin(time * 3) * 0.01; // Bobbing
      } else if (rhoO === rhoF) {
        targetY = 0.4;
      } else {
        targetY = 0.1; // Sink
      }

      // Update color based on density
      blockMat.color.setHex(rhoO < 500 ? 0xfde047 : (rhoO < 1000 ? 0xfb923c : 0x94a3b8));

      // Simple smooth interpolation
      block.position.y += (targetY - block.position.y) * 0.1;
    };
  }, []);

  const V = 1; // m3 (for reference)
  const mass = rhoObject * V;
  const W = mass * 9.8;
  const F_apung = rhoFluid * V * 9.8;
  
  let status = "Terapung";
  if (rhoObject === rhoFluid) status = "Melayang";
  else if (rhoObject > rhoFluid) status = "Tenggelam";

  return (
    <ExperimentLayout title="Hukum Archimedes" mode={mode} setMode={setMode}>
      {mode === 'sim' && (
        <div className="flex-1 overflow-y-auto px-4 pb-12">
          <SimCanvas draw={drawSimulation} isPlaying={true} width={800} height={500} />
          
          <ControlPanel>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Massa Jenis Benda (ρ_b): <span className="font-mono text-primary">{rhoObject} kg/m³</span>
              </label>
              <input 
                type="range" min="100" max="2000" step="50" 
                value={rhoObject} onChange={(e) => setRhoObject(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Massa Jenis Fluida (ρ_f): <span className="font-mono text-primary">{rhoFluid} kg/m³</span>
              </label>
              <input 
                type="range" min="500" max="2000" step="50" 
                value={rhoFluid} onChange={(e) => setRhoFluid(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </ControlPanel>

          <DataBar data={{
            "Status Benda": status,
            "Gaya Berat (W)": `~${Math.round(W)} N`,
            "Maks. Gaya Apung (Fa)": `~${Math.round(F_apung)} N`,
            "Hukum": "Fa = ρf × Vc × g"
          }} />
        </div>
      )}

      {mode === 'ar' && (
        <>
          {document.getElementById('ar-hud-bottom') && createPortal(
            <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-4 w-full max-w-sm shadow-2xl flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-white flex justify-between">
                  <span>Massa Jenis Benda:</span>
                  <span>{rhoObject} kg/m³</span>
                </label>
                <input 
                  type="range" min="100" max="2000" step="50" 
                  value={rhoObject} onChange={(e) => setRhoObject(parseInt(e.target.value))}
                  className="w-full accent-orange-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-white flex justify-between">
                  <span>Massa Jenis Fluida:</span>
                  <span>{rhoFluid} kg/m³</span>
                </label>
                <input 
                  type="range" min="500" max="2000" step="50" 
                  value={rhoFluid} onChange={(e) => setRhoFluid(parseInt(e.target.value))}
                  className="w-full accent-blue-400"
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
