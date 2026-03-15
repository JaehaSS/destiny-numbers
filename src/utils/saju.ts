import type { Oheng, CheonGan, JiJi, SajuInput, OhengDistribution } from '../types';

export const CHEONGAN_LIST: CheonGan[] = [
  { name: '갑', hanja: '甲', oheng: 'wood' },
  { name: '을', hanja: '乙', oheng: 'wood' },
  { name: '병', hanja: '丙', oheng: 'fire' },
  { name: '정', hanja: '丁', oheng: 'fire' },
  { name: '무', hanja: '戊', oheng: 'earth' },
  { name: '기', hanja: '己', oheng: 'earth' },
  { name: '경', hanja: '庚', oheng: 'metal' },
  { name: '신', hanja: '辛', oheng: 'metal' },
  { name: '임', hanja: '壬', oheng: 'water' },
  { name: '계', hanja: '癸', oheng: 'water' },
];

export const JIJI_LIST: JiJi[] = [
  { name: '자', hanja: '子', oheng: 'water' },
  { name: '축', hanja: '丑', oheng: 'earth' },
  { name: '인', hanja: '寅', oheng: 'wood' },
  { name: '묘', hanja: '卯', oheng: 'wood' },
  { name: '진', hanja: '辰', oheng: 'earth' },
  { name: '사', hanja: '巳', oheng: 'fire' },
  { name: '오', hanja: '午', oheng: 'fire' },
  { name: '미', hanja: '未', oheng: 'earth' },
  { name: '신', hanja: '申', oheng: 'metal' },
  { name: '유', hanja: '酉', oheng: 'metal' },
  { name: '술', hanja: '戌', oheng: 'earth' },
  { name: '해', hanja: '亥', oheng: 'water' },
];

export const OHENG_NAMES: Record<Oheng, { ko: string; hanja: string; color: string }> = {
  wood:  { ko: '목', hanja: '木', color: '#22c55e' },
  fire:  { ko: '화', hanja: '火', color: '#ef4444' },
  earth: { ko: '토', hanja: '土', color: '#eab308' },
  metal: { ko: '금', hanja: '金', color: '#9ca3af' },
  water: { ko: '수', hanja: '水', color: '#3b82f6' },
};

export const OHENG_ORDER: Oheng[] = ['wood', 'fire', 'earth', 'metal', 'water'];

export function getCheonganOheng(name: string): Oheng | null {
  return CHEONGAN_LIST.find(c => c.name === name)?.oheng ?? null;
}

export function getJijiOheng(name: string): Oheng | null {
  return JIJI_LIST.find(j => j.name === name)?.oheng ?? null;
}

export function analyzeSaju(saju: SajuInput): OhengDistribution {
  const dist: OhengDistribution = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const pillars = [saju.year, saju.month, saju.day, saju.hour];

  for (const p of pillars) {
    const cOheng = getCheonganOheng(p.cheongan);
    const jOheng = getJijiOheng(p.jiji);
    if (cOheng) dist[cOheng]++;
    if (jOheng) dist[jOheng]++;
  }

  return dist;
}

export function isSajuComplete(saju: SajuInput): boolean {
  const pillars = [saju.year, saju.month, saju.day, saju.hour];
  return pillars.every(p => p.cheongan !== '' && p.jiji !== '');
}
