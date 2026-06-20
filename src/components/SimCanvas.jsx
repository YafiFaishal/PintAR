import { useEffect, useRef } from 'react';

export default function SimCanvas({ draw, isPlaying = true, width = 800, height = 600 }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let time = 0;
    
    const render = () => {
      draw(ctx, time);
      if (isPlaying) {
        time += 1/60; // assume 60fps
      }
      animationFrameId = window.requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw, isPlaying]);

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700 overflow-hidden flex justify-center items-center p-2 relative aspect-video">
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height}
        className="w-full h-auto object-contain rounded bg-slate-50 dark:bg-slate-900"
      />
    </div>
  );
}
