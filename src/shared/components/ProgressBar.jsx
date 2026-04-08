/**
 * ProgressBar — barra de progreso con porcentaje.
 *
 * Props:
 *  value      number   — porcentaje (0-100)
 *  threshold  number   — umbral para cambiar color (default 99)
 *  colorOk    string   — clase de color cuando value >= threshold
 *  colorWarn  string   — clase de color cuando value < threshold
 *  showLabel  boolean  — mostrar el % al lado (default true)
 *  decimals   number   — decimales del label (default 2)
 */
const ProgressBar = ({
  value = 0,
  threshold = 99,
  colorOk   = 'bg-[#00f2ad]',
  colorWarn = 'bg-[#ff6b00]',
  showLabel = true,
  decimals  = 2,
}) => {
  const ok = value >= threshold;
  const color = ok ? colorOk : colorWarn;
  const textColor = ok
    ? colorOk.replace('bg-', 'text-')
    : colorWarn.replace('bg-', 'text-');

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-[2px] bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      {showLabel && (
        <span className={`w-14 text-right font-black text-xs ${textColor}`}>
          {value.toFixed(decimals)}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
