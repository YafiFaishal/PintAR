export default function DataBar({ data }) {
  return (
    <div className="w-full mt-6 bg-gradient-to-r from-primary-900 to-slate-900 rounded-2xl shadow-lg p-6 border border-primary-800 relative overflow-hidden">
      {/* Decorative blur */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500 rounded-full mix-blend-overlay filter blur-3xl opacity-50"></div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
        {Object.entries(data).map(([key, value], index) => (
          <div key={index} className="flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-primary-300 uppercase tracking-wider mb-1">
              {key}
            </span>
            <span className="text-xl font-display font-extrabold text-white bg-white/10 px-4 py-1 rounded-lg backdrop-blur-sm border border-white/5">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
