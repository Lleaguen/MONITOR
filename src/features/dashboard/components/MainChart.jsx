import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';

const BarLabel = ({ x, y, width, value, fill }) => {
  if (!value || value === 0) return null;
  return (
    <text x={x + width / 2} y={y - 4} textAnchor="middle"
      fill={fill} fontSize={8} fontWeight="900">
      {value > 999 ? `${(value / 1000).toFixed(1)}k` : value}
    </text>
  );
};

// Barra naranja con shape personalizado: se dibuja desde la base con altura proporcional al arribo
// x, y, width, height corresponden a la barra de "voluminoso" en su propio chart de un solo dataKey
// Pero como el chart naranja tiene el mismo dominio Y que el rojo, la altura ya es proporcional
const VoluminosoShape = (props) => {
  const { x, y, width, height, pctVoluminoso } = props;
  if (!height || height <= 0 || width <= 0) return null;

  const cx = x + width / 2;
  const label = `${pctVoluminoso}%`;

  // Dimensiones de la pastilla
  const padX = 3;
  const padY = 2;
  const fontSize = 8;
  // Estimamos el ancho del texto (≈5.5px por carácter a fontSize 8)
  const textW = label.length * 5.5;
  const badgeW = textW + padX * 2;
  const badgeH = fontSize + padY * 2;
  const badgeX = cx - badgeW / 2;
  const badgeY = y - badgeH - 3; // 3px de margen sobre la barra

  return (
    <g>
      {/* Barra naranja */}
      <rect x={x} y={y} width={width} height={height}
        fill="#f97316" fillOpacity={0.9} rx={2} ry={2} />

      {/* Badge con % encima */}
      {pctVoluminoso > 0 && (
        <g>
          {/* Fondo oscuro con borde naranja */}
          <rect
            x={badgeX} y={badgeY}
            width={badgeW} height={badgeH}
            fill="#0f172a" fillOpacity={0.92}
            stroke="#f97316" strokeWidth={0.8}
            rx={3} ry={3}
          />
          {/* Texto del porcentaje */}
          <text
            x={cx}
            y={badgeY + padY + fontSize - 1}
            textAnchor="middle"
            fill="#f97316"
            fontSize={fontSize}
            fontWeight="900"
            letterSpacing="0.3"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
};

// Wrapper: recalcula altura y posición Y para que represente solo la fracción voluminoso
const VoluminosoShapeWrapper = (props) => {
  // En Recharts 3.x el payload puede venir directo en props o en props.payload
  const entry = props?.payload ?? props;
  const { height, y } = props;

  const arribo     = entry?.arribo     || props?.arribo     || 0;
  const voluminoso = entry?.voluminoso || props?.voluminoso || 0;
  const pct        = entry?.pctVoluminoso ?? props?.pctVoluminoso ?? 0;

  if (!arribo || !voluminoso || !height) return null;

  const ratio = voluminoso / arribo;
  const volH  = Math.round(height * ratio);
  const volY  = y + height - volH;

  return <VoluminosoShape {...props} y={volY} height={volH} pctVoluminoso={pct} />;
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{ backgroundColor: '#080c14', borderRadius: 8, fontSize: 11, padding: '8px 12px' }}>
      <p style={{ color: '#94a3b8', fontWeight: 900, fontSize: 9, textTransform: 'uppercase', marginBottom: 6 }}>{d.hora}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ color: '#ef4444', fontSize: 9, fontWeight: 700 }}>Arribo</span>
          <span style={{ color: '#ef4444', fontWeight: 900 }}>{d.arribo}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ color: '#f97316', fontSize: 9, fontWeight: 700 }}>Voluminoso</span>
          <span style={{ color: '#f97316', fontWeight: 900 }}>
            {d.voluminoso}{d.pctVoluminoso ? ` (${d.pctVoluminoso}%)` : ''}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ color: '#34d399', fontSize: 9, fontWeight: 700 }}>Bipeo</span>
          <span style={{ color: '#34d399', fontWeight: 900 }}>{d.bipeo}</span>
        </div>
      </div>
    </div>
  );
};

// Margen compartido por ambos charts para que los ejes coincidan exactamente
const MARGIN = { top: 18, right: 4, bottom: 20, left: 0 };

const MainChart = ({ chartData }) => {
  // Dominio Y compartido: máximo entre arribo y bipeo para que ambos charts tengan la misma escala
  const maxVal = Math.max(
    ...((chartData || []).map(d => Math.max(d.arribo || 0, d.bipeo || 0))),
    1
  );

  return (
    <div className="bg-[#111827]/20 p-4 md:p-6 rounded-2xl border border-white/5">
      <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
        <div className="flex items-center gap-3">
          <img src={`${process.env.PUBLIC_URL}/Ocasa.png`} alt="" className="h-12 w-auto opacity-90" />
          <div className="w-px h-8 bg-white/10" />
          <div>
            <h3 className="text-base md:text-lg font-black text-white mb-1 tracking-tight">Pulso de Descarga</h3>
            <p className="text-[11px] text-slate-500 font-medium italic">Paquetes arribados vs bipeados por hora</p>
          </div>
        </div>
        <div className="flex gap-4 text-[9px] font-black tracking-widest">
          <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-red-500 opacity-50" /> ARRIBO</span>
          <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-orange-400 opacity-80" /> VOLUMINOSO</span>
          <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 opacity-50" /> BIPEO</span>
        </div>
      </div>

      {/* Contenedor relativo: apilamos dos charts exactamente uno encima del otro */}
      <div className="relative h-48 sm:h-56 md:h-64">

        {/* Chart 1 (fondo): barras roja y verde */}
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4} margin={MARGIN}>
              <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="hora" axisLine={false} tickLine={false}
                tick={{ fill: '#475569', fontSize: 9, fontWeight: 'bold' }} dy={8} />
              <YAxis hide domain={[0, maxVal]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
              <Bar dataKey="arribo" name="Arribo" fill="#ef4444" fillOpacity={0.75} radius={[2, 2, 0, 0]}>
                <LabelList content={(p) => <BarLabel {...p} fill="#ef4444" />} />
              </Bar>
              <Bar dataKey="bipeo" name="Bipeo" fill="#34d399" fillOpacity={0.75} radius={[2, 2, 0, 0]}>
                <LabelList content={(p) => <BarLabel {...p} fill="#34d399" />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2 (frente): barra naranja superpuesta, pointer-events none para no bloquear tooltip */}
        <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4} margin={MARGIN}>
              <XAxis dataKey="hora" axisLine={false} tickLine={false}
                tick={{ fill: 'transparent', fontSize: 9 }} dy={8} />
              <YAxis hide domain={[0, maxVal]} />
              {/*
                Declaramos las MISMAS 2 barras que el chart de fondo (mismo orden: arribo, bipeo)
                para que Recharts asigne exactamente el mismo ancho y posición X a cada una.
                La naranja ocupa el slot de "arribo". La segunda es invisible.
              */}
              <Bar
                dataKey="arribo"
                name="Voluminoso"
                shape={<VoluminosoShapeWrapper />}
                isAnimationActive={false}
              />
              <Bar
                dataKey="bipeo"
                name="_hidden"
                shape={() => null}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default MainChart;
