import { useEffect, useRef, useState } from 'react';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import * as THREE from 'three';

export default function ARScene({ targetSrc, onSceneReady, onStop }) {
  const containerRef = useRef(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (rear) or 'user' (front)

  useEffect(() => {
    let mindarThree = null;

    const startAR = async () => {
      try {
        mindarThree = new MindARThree({
          container: containerRef.current,
          imageTargetSrc: targetSrc + '?v=3',
          uiScanning: 'yes',
          uiLoading: 'yes',
          facingMode: facingMode
        });
        
        const { renderer, scene, camera } = mindarThree;

        // Enable shadows for realism
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add soft ambient light globally
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        // Anchor 0 is the first target in the .mind file
        const anchor = mindarThree.addAnchor(0);
        
        if (onSceneReady) {
          onSceneReady({ scene, camera, renderer, anchor, THREE });
        }

        await mindarThree.start();
        
        // FIX: Force MindAR to recalculate video dimensions on iOS Safari robustly
        // Safari sometimes takes a moment to update the video metadata/viewport
        const resizeInterval = setInterval(() => {
          window.dispatchEvent(new Event('resize'));
        }, 300);
        setTimeout(() => clearInterval(resizeInterval), 3000);
        
        renderer.setAnimationLoop(() => {
          renderer.render(scene, camera);
        });
      } catch (err) {
        console.error("MindAR Failed to start", err);
      }
    };

    startAR();

    return () => {
      if (mindarThree) {
        mindarThree.stop();
        if (mindarThree.renderer) {
          mindarThree.renderer.setAnimationLoop(null);
          mindarThree.renderer.dispose();
        }
      }
      
      // Cleanup video elements
      const videos = document.querySelectorAll('video');
      videos.forEach(v => {
        if (v.srcObject) {
          v.srcObject.getTracks().forEach(track => track.stop());
        }
        v.remove();
      });
      
      // Cleanup MindAR UI overlays that are injected into document.body
      const overlays = document.querySelectorAll('.mindar-ui-overlay');
      overlays.forEach(el => el.remove());
    };
  }, [targetSrc, onSceneReady, facingMode]); // Re-run when facingMode changes

  // Set global CSS for fullscreen AR
  useEffect(() => {
    document.body.classList.add('ar-active');
    document.documentElement.classList.add('ar-active');
    return () => {
      document.body.classList.remove('ar-active');
      document.documentElement.classList.remove('ar-active');
    };
  }, []);

  return (
    <>
      <div 
        ref={containerRef} 
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', zIndex: 40, backgroundColor: 'black', overflow: 'hidden' }} 
      />
      
      {/* Modern AR HUD / UI Overlay */}
      <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between p-4 sm:p-6 pb-8">
        
        {/* Top Navigation Bar */}
        <div className="flex justify-between items-start">
          <div className="flex gap-2">
            <button 
              onClick={onStop}
              className="pointer-events-auto bg-white/20 backdrop-blur-lg border border-white/30 text-white rounded-full p-3 shadow-lg hover:bg-white/30 transition-colors"
              aria-label="Tutup AR"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>

            <button 
              onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
              className="pointer-events-auto bg-white/20 backdrop-blur-lg border border-white/30 text-white rounded-full px-4 py-3 shadow-lg hover:bg-white/30 transition-colors flex items-center gap-2 font-bold text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3h4v4"/><path d="M21 3l-6 6"/><path d="M7 21H3v-4"/><path d="M3 21l6-6"/><path d="M21 16v4h-4"/><path d="M21 21l-6-6"/><path d="M3 8V4h4"/><path d="M3 4l6 6"/></svg>
              {facingMode === 'environment' ? 'Kamera Belakang' : 'Kamera Depan'}
            </button>
          </div>
          
          <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
            <span className="text-white text-sm font-bold tracking-wider uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Live AR
            </span>
          </div>
        </div>

        {/* The bottom area can be used by experiments to portal their own HUD controls */}
        <div id="ar-hud-bottom" className="w-full flex flex-col items-center gap-3 pointer-events-auto"></div>
        
      </div>
    </>
  );
}
