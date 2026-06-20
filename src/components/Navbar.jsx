import { Link } from 'react-router-dom';
import { ArrowLeft, Atom } from 'lucide-react';

export default function Navbar({ title, backTo = "/" }) {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm w-full z-30 sticky top-0 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            {backTo && (
              <Link 
                to={backTo} 
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-primary-900/50 dark:hover:text-primary-400 transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
            )}
            
            <div className="flex items-center gap-3">
              {!backTo && (
                <div className="p-2 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl text-white shadow-lg shadow-primary-500/20">
                  <Atom size={24} className="animate-[spin_10s_linear_infinite]" />
                </div>
              )}
              <h1 className="text-xl font-bold font-display tracking-tight text-slate-800 dark:text-white">
                {title}
              </h1>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center space-x-4">
            {/* Can add user profile or dark mode toggle here later */}
          </div>
        </div>
      </div>
    </header>
  );
}
