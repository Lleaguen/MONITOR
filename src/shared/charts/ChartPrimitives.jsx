export const CustomDot = ({ cx, cy, stroke }) => (
  <circle cx={cx} cy={cy} r={3} fill={stroke} stroke="none" />
);

export const PillLabel = ({ x, y, value, color }) => {
  if (!value || value === 0) return null;
  const w = value > 9 ? 22 : 18;
  const h = 14;
  return (
    <g>
      <rect x={x - w / 2} y={y - h - 6} width={w} height={h} rx={4} fill={color} opacity={0.9} />
      <text x={x} y={y - h / 2 - 6} textAnchor="middle" dominantBaseline="middle"
        fill="white" fontSize={8} fontWeight="900">{value}</text>
    </g>
  );
};

export const BarLabel = ({ x, y, width, value, fill }) => {
  if (!value || value === 0) return null;
  return (
    <text x={x + width / 2} y={y - 4} textAnchor="middle"
      fill={fill} fontSize={8} fontWeight="900">
      {value > 999 ? `${(value / 1000).toFixed(1)}k` : value}
    </text>
  );
};
