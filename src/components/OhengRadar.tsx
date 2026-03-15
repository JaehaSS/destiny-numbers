import type { OhengDistribution } from '../types';
import { OHENG_NAMES, OHENG_ORDER } from '../utils/saju';

interface OhengRadarProps {
  distribution: OhengDistribution;
}

export default function OhengRadar({ distribution }: OhengRadarProps) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const maxVal = Math.max(...Object.values(distribution), 3);
  const levels = 3;

  function polarToCartesian(angle: number, radius: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  const angleStep = 360 / 5;
  const maxRadius = 80;

  // Grid lines
  const gridPaths = Array.from({ length: levels }, (_, i) => {
    const r = (maxRadius / levels) * (i + 1);
    const points = OHENG_ORDER.map((_, j) => {
      const p = polarToCartesian(j * angleStep, r);
      return `${p.x},${p.y}`;
    });
    return `M${points.join('L')}Z`;
  });

  // Axis lines
  const axes = OHENG_ORDER.map((_, i) => {
    const p = polarToCartesian(i * angleStep, maxRadius);
    return { x1: cx, y1: cy, x2: p.x, y2: p.y };
  });

  // Data polygon
  const dataPoints = OHENG_ORDER.map((key, i) => {
    const val = distribution[key];
    const r = (val / maxVal) * maxRadius;
    return polarToCartesian(i * angleStep, Math.max(r, 5));
  });
  const dataPath = `M${dataPoints.map(p => `${p.x},${p.y}`).join('L')}Z`;

  // Labels
  const labels = OHENG_ORDER.map((key, i) => {
    const p = polarToCartesian(i * angleStep, maxRadius + 22);
    const info = OHENG_NAMES[key];
    return { x: p.x, y: p.y, text: `${info.hanja}(${info.ko})`, color: info.color, count: distribution[key] };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid */}
        {gridPaths.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#2a2a4a" strokeWidth="0.5" />
        ))}

        {/* Axes */}
        {axes.map((a, i) => (
          <line key={i} {...a} stroke="#2a2a4a" strokeWidth="0.5" />
        ))}

        {/* Data */}
        <path d={dataPath} fill="rgba(212, 168, 83, 0.2)" stroke="#d4a853" strokeWidth="2" />
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill={OHENG_NAMES[OHENG_ORDER[i]].color} stroke="#0a0a1a" strokeWidth="1.5" />
        ))}

        {/* Labels */}
        {labels.map((l, i) => (
          <g key={i}>
            <text x={l.x} y={l.y - 6} textAnchor="middle" fill={l.color} fontSize="11" fontWeight="bold">
              {l.text}
            </text>
            <text x={l.x} y={l.y + 8} textAnchor="middle" fill={l.color} fontSize="13" fontWeight="bold">
              {l.count}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
