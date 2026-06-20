export default function ControlPanel({ children }) {
  return (
    <div className="w-full mt-6 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-xl font-bold font-display mb-6 text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <span className="w-2 h-6 bg-primary-500 rounded-full inline-block"></span>
        Kontrol Eksperimen
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {children}
      </div>
    </div>
  );
}
