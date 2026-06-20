import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Beaker, Orbit, ArrowRight, BookOpen, Smartphone, Activity, Apple, FlaskConical, Sun, Ship, Lightbulb, Zap, Camera, Compass, CheckCircle2 } from 'lucide-react';

const EXPERIMENTS = [
  {
    id: 'pendulum',
    title: 'Bandul (Pendulum)',
    description: 'Pelajari periode ayunan berdasarkan panjang tali dan gravitasi secara langsung!',
    icon: <Beaker size={48} className="text-white" />,
    color: 'from-pink-500 to-rose-500',
    path: '/experiment/pendulum'
  },
  {
    id: 'freefall',
    title: 'Gerak Jatuh Bebas',
    description: 'Buktikan percepatan gravitasi bumi! Bandingkan jatuh di ruang udara vs hampa.',
    icon: <Apple size={48} className="text-white" />,
    color: 'from-red-500 to-orange-500',
    path: '/experiment/freefall'
  },
  {
    id: 'chemical',
    title: 'Reaksi Kimia',
    description: 'Campurkan bahan kimia untuk mengamati perubahan suhu, pH, dan warna.',
    icon: <FlaskConical size={48} className="text-white" />,
    color: 'from-emerald-500 to-teal-500',
    path: '/experiment/chemical'
  },
  {
    id: 'refraction',
    title: 'Pembiasan Cahaya',
    description: 'Uji Hukum Snellius! Tembakkan laser ke berbagai medium transparan.',
    icon: <Sun size={48} className="text-white" />,
    color: 'from-amber-400 to-yellow-500',
    path: '/experiment/refraction'
  },
  {
    id: 'archimedes',
    title: 'Hukum Archimedes',
    description: 'Cari tahu kenapa benda bisa terapung, melayang, atau tenggelam di fluida.',
    icon: <Ship size={48} className="text-white" />,
    color: 'from-cyan-500 to-blue-500',
    path: '/experiment/archimedes'
  },
  {
    id: 'circuit',
    title: 'Rangkaian Listrik',
    description: 'Rangkai komponen elektronik dan uji Hukum Ohm secara interaktif.',
    icon: <Lightbulb size={48} className="text-white" />,
    color: 'from-yellow-400 to-orange-500',
    path: '/experiment/circuit'
  },
  {
    id: 'solarsystem',
    title: 'Tata Surya (Kepler)',
    description: 'Eksplorasi orbit planet-planet dengan simulasi fisika Hukum Kepler interaktif.',
    icon: <Orbit size={48} className="text-white" />,
    color: 'from-indigo-500 to-violet-500',
    path: '/experiment/solarsystem'
  },
  {
    id: 'redox',
    title: 'Reaksi Redoks',
    description: 'Simulasikan Sel Volta, hitung potensial sel, dan amati pertukaran elektron.',
    icon: <Zap size={48} className="text-white" />,
    color: 'from-violet-500 to-fuchsia-500',
    path: '/experiment/redox'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 selection:bg-primary-500 selection:text-white">
      <Navbar title="PintAR - Lab Sains" backTo={null} />
      
      <main className="flex-grow w-full">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-slate-950 dark:bg-slate-950 py-20 sm:py-28 border-b border-white/5">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          
          {/* Elegant background glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-md border border-slate-700 text-slate-300 mb-8 shadow-inner">
              <span className="flex h-2.5 w-2.5 rounded-full bg-secondary-400 animate-pulse shadow-glow"></span>
              <span className="text-xs font-semibold tracking-widest uppercase">WebAR Generasi Baru</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 font-display">
              Lab Sains <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Virtual</span><br />di Genggamanmu
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-10 leading-relaxed font-light">
              Ubah smartphone kamu menjadi laboratorium canggih. Lakukan praktikum fisika dan kimia yang interaktif dengan teknologi Augmented Reality.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#experiments" className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-full shadow-glow-lg hover:-translate-y-1 transition-all duration-300">
                🧪 Mulai Praktikum
              </a>
              <a href={import.meta.env.BASE_URL + "marker.png"} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-md border border-slate-600 text-slate-200 font-bold rounded-full shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
                Cetak Marker AR
              </a>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center gap-4 group hover:border-primary-500/50 transition-colors">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 text-primary-500 dark:text-primary-400 rounded-2xl group-hover:scale-110 transition-transform">
                <Smartphone size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-bold font-display text-xl text-slate-800 dark:text-slate-100">Tanpa Install</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-light">Langsung jalan di browser HP tanpa membebani memori perangkat.</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center gap-4 group hover:border-secondary-500/50 transition-colors">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 text-secondary-500 dark:text-secondary-400 rounded-2xl group-hover:scale-110 transition-transform">
                <Activity size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-bold font-display text-xl text-slate-800 dark:text-slate-100">Visual Memukau</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-light">Animasi 3D mulus dan interaktif yang meningkatkan ketertarikan belajar.</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center gap-4 group hover:border-accent-500/50 transition-colors">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 text-accent-500 dark:text-accent-400 rounded-2xl group-hover:scale-110 transition-transform">
                <BookOpen size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-bold font-display text-xl text-slate-800 dark:text-slate-100">Sesuai Kurikulum</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-light">Materi didesain khusus melengkapi kurikulum sains SMP & SMA.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Experiment Section */}
        <div id="experiments" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl font-display text-slate-800 dark:text-white">
              Pilih Eksperimen
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {EXPERIMENTS.map((exp) => (
              <Link 
                key={exp.id} 
                to={exp.path}
                className="group relative bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] p-1 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-200 dark:border-slate-800"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${exp.color} opacity-0 group-hover:opacity-5 rounded-[2rem] transition-opacity duration-300`}></div>
                
                <div className="p-8 h-full flex flex-col bg-transparent rounded-[2rem] relative z-10">
                  <div className={`inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br ${exp.color} shadow-lg mb-6 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 self-start`}>
                    {exp.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3 font-display group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors tracking-tight">
                    {exp.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 flex-grow leading-relaxed font-light text-sm">
                    {exp.description}
                  </p>
                  
                  <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-primary-500 transition-colors">Buka Lab</span>
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* System & Instructions Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Sensor & Cara Pakai */}
            <div className="flex flex-col gap-8">
              
              {/* Sensor */}
              <div>
                <h3 className="text-xl font-bold font-display text-white mb-4 flex items-center gap-2">
                  <Smartphone size={24} className="text-secondary-400" />
                  Sensor HP Kamu
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                      <Compass size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">Giroskop / Akselerometer</h4>
                      <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1"><CheckCircle2 size={12} /> Tersedia</p>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                      <Camera size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">Kamera (AR)</h4>
                      <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1"><CheckCircle2 size={12} /> Tersedia</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cara Pakai */}
              <div>
                <h3 className="text-xl font-bold font-display text-white mb-4 flex items-center gap-2">
                  <BookOpen size={24} className="text-primary-400" />
                  Cara Pakai
                </h3>
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
                  <ul className="space-y-4 text-sm text-slate-300 font-light">
                    <li className="flex gap-3">
                      <span className="font-bold text-primary-400">1.</span>
                      <p><strong className="text-white font-medium">Pilih Eksperimen</strong> dari daftar di atas.</p>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary-400">2.</span>
                      <p><strong className="text-white font-medium">Pilih Mode:</strong> AR (pakai kamera + marker) atau Simulasi (tanpa kamera).</p>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary-400">3.</span>
                      <p><strong className="text-white font-medium">Atur Parameter</strong> sesuai instruksi (kecepatan, massa jenis, tegangan, dll).</p>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary-400">4.</span>
                      <p><strong className="text-white font-medium">Jalankan</strong> dan amati hasilnya secara langsung di layar.</p>
                    </li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Mode AR Explanation */}
            <div>
              <h3 className="text-xl font-bold font-display text-white mb-4 flex items-center gap-2">
                <Camera size={24} className="text-accent-400" />
                Mode AR (Augmented Reality)
              </h3>
              <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 md:p-8 h-full flex flex-col justify-between">
                <div>
                  <p className="text-slate-300 text-sm leading-relaxed font-light mb-8">
                    Mode AR menampilkan <strong className="text-white font-medium">objek 3D virtual</strong> di atas marker yang kamu cetak. Arahkan kamera HP ke marker dan lihat eksperimen hidup di dunia nyata!
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-white font-bold flex items-center justify-center shadow-inner">1</div>
                      <p className="text-xs text-slate-300">Cetak/tampilkan marker</p>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white font-bold flex items-center justify-center shadow-inner shadow-primary-400/20">2</div>
                      <p className="text-xs text-slate-300">Pilih "Mode AR" di eksperimen</p>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary-500 to-secondary-700 text-white font-bold flex items-center justify-center shadow-inner shadow-secondary-400/20">3</div>
                      <p className="text-xs text-slate-300">Arahkan kamera → objek muncul!</p>
                    </div>
                  </div>
                </div>

                <a href={import.meta.env.BASE_URL + "marker.png"} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
                  Cetak / Lihat Marker AR →
                </a>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-slate-800/50 bg-slate-950 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 font-display text-sm mb-2">
            <span className="font-bold text-white">PintAR</span> — Laboratorium Sains Virtual
          </p>
          <p className="text-slate-500 text-xs font-light">
            Dibuat untuk siswa SMP/SMA Indonesia 🇮🇩
          </p>
        </div>
      </footer>
    </div>
  );
}
