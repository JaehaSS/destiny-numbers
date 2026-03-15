import { getOhengForNumber } from '../utils/lottoGenerator';
import { OHENG_NAMES } from '../utils/saju';

interface LottoBallProps {
  number: number;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  delay?: number;
  highlighted?: boolean;
  dimmed?: boolean;
}

const SIZE_MAP = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-lg',
};

const OHENG_BG: Record<string, string> = {
  wood: 'bg-gradient-to-br from-green-500 to-green-700',
  fire: 'bg-gradient-to-br from-red-500 to-red-700',
  earth: 'bg-gradient-to-br from-yellow-500 to-yellow-700',
  metal: 'bg-gradient-to-br from-gray-400 to-gray-600',
  water: 'bg-gradient-to-br from-blue-500 to-blue-700',
};

export default function LottoBall({ number, size = 'md', animate = false, delay = 0, highlighted = false, dimmed = false }: LottoBallProps) {
  const oheng = getOhengForNumber(number);
  const ohengInfo = OHENG_NAMES[oheng];

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`
          ${SIZE_MAP[size]}
          ${OHENG_BG[oheng]}
          ${animate ? 'ball-animate' : ''}
          ${highlighted ? 'ring-2 ring-gold ring-offset-2 ring-offset-dark-bg' : ''}
          ${dimmed ? 'opacity-30' : ''}
          rounded-full flex items-center justify-center font-bold text-white
          shadow-lg transition-all
        `}
        style={animate ? { animationDelay: `${delay}ms` } : {}}
      >
        {number}
      </div>
      {size !== 'sm' && (
        <span className={`text-[10px] font-medium ${dimmed ? 'opacity-30' : ''}`} style={{ color: ohengInfo.color }}>
          {ohengInfo.hanja}
        </span>
      )}
    </div>
  );
}
