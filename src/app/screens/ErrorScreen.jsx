const ErrorScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#080c14] text-white font-sans gap-4 p-4">
    <span className="w-3 h-3 rounded-full bg-red-500" />
    <p className="text-[11px] font-black uppercase tracking-widest text-red-400">No se pudieron cargar los datos del servidor</p>
    <p className="text-[10px] text-slate-600 font-medium">Intentá recargar la página o contactá al administrador.</p>
  </div>
);

export default ErrorScreen;
