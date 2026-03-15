import type { Oheng } from '../types';

// 천간 (Heavenly Stems) - 10 cycle
const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
const STEM_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const STEM_OHENG: Oheng[] = ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water'];

// 지지 (Earthly Branches) - 12 cycle
const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;
const BRANCH_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const BRANCH_OHENG: Oheng[] = ['water', 'earth', 'wood', 'wood', 'earth', 'fire', 'fire', 'earth', 'metal', 'metal', 'earth', 'water'];

export interface DailyPillar {
  stemIndex: number;
  branchIndex: number;
  stem: string;
  branch: string;
  stemHanja: string;
  branchHanja: string;
  stemOheng: Oheng;
  branchOheng: Oheng;
  cycleIndex: number; // 0-59 (sexagenary cycle)
}

/**
 * 율리우스 일수(Julian Day Number) 계산
 */
function toJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

/**
 * 날짜의 일진(日辰) 계산
 * 참고: JDN 기반 60갑자 매핑
 */
export function getDailyPillar(date: Date): DailyPillar;
export function getDailyPillar(dateStr: string): DailyPillar;
export function getDailyPillar(input: Date | string): DailyPillar {
  const date = typeof input === 'string' ? new Date(input) : input;
  const jdn = toJDN(date.getFullYear(), date.getMonth() + 1, date.getDate());

  // 60갑자 인덱스 (JDN 보정 - 甲子 기준점)
  // JDN 0 (기원전 4713년 1월 1일)은 갑인(甲寅)일이므로 보정값 적용
  const cycleIndex = ((jdn + 9) % 60 + 60) % 60;
  const stemIndex = cycleIndex % 10;
  const branchIndex = cycleIndex % 12;

  return {
    stemIndex,
    branchIndex,
    stem: STEMS[stemIndex],
    branch: BRANCHES[branchIndex],
    stemHanja: STEM_HANJA[stemIndex],
    branchHanja: BRANCH_HANJA[branchIndex],
    stemOheng: STEM_OHENG[stemIndex],
    branchOheng: BRANCH_OHENG[branchIndex],
    cycleIndex,
  };
}

/**
 * 간단한 시드 기반 PRNG (Mulberry32)
 * 같은 seed → 항상 같은 난수 시퀀스
 */
export function createSeededRng(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 사주 + 날짜로 결정적 시드 생성
 */
export function generateSeed(sajuStr: string, dateStr: string): number {
  const combined = sajuStr + '|' + dateStr;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash | 0; // 32bit integer
  }
  return hash;
}
