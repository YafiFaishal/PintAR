import Navbar from './Navbar';
import { Smartphone, Camera } from 'lucide-react';

export default function ExperimentLayout({ title, children, mode, setMode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans">
      <Navbar title={title} backTo="/" />
      
      {/* Mode Switcher */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 py-4 px-4 sticky top-16 z-20">
        <div className="max-w-3xl mx-auto flex justify-center gap-3">
          <button
            onClick={() => setMode('sim')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all duration-300 ${
              mode === 'sim' 
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 scale-105' 
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 hover:scale-105'
            }`}
          >
            <Smartphone size={18} /> Simulasi
          </button>
          <button
            onClick={() => setMode('ar')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all duration-300 ${
              mode === 'ar' 
                ? 'bg-gradient-to-r from-secondary-500 to-emerald-500 text-white shadow-lg shadow-secondary-500/30 scale-105' 
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 hover:scale-105'
            }`}
          >
            <Camera size={18} /> Mode AR
          </button>
        </div>
      </div>

      <main className="flex-grow flex flex-col relative w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* AR Instructions Helper - only shown when in AR mode */}
        {mode === 'ar' && (
          <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-5 shadow-sm text-center">
            <h3 className="font-bold font-display text-indigo-900 dark:text-indigo-200 mb-2">Penting: Cara Pakai AR</h3>
            <p className="text-indigo-700 dark:text-indigo-300 text-sm">
              Pastikan kamu menyorotkan kamera HP-mu ke <strong>Gambar Marker Rakun (MindAR)</strong>. 
              Objek simulasi akan muncul menempel persis di atas gambar tersebut!
            </p>
            <a 
              href="https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.1.4/examples/image-tracking/assets/card-example/card.png" 
              target="_blank" 
              rel="noreferrer"
              className="inline-block mt-3 px-4 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-full hover:bg-indigo-700 transition"
            >
              Lihat Gambar Marker
            </a>
          </div>
        )}

        <div className="w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
}
