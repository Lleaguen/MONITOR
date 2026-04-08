const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#080c14] text-white font-sans gap-4">
    <span className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Verificando servidor...</p>
  </div>
);

export default LoadingScreen;
