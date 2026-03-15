import type { Oheng, OhengDistribution, ExtendedSaju, SajuInput } from '../types';
import { getJangganOheng, getCurrentDaeun } from './sajuParser';
import { CHEONGAN_LIST, analyzeSaju } from './saju';
import { getDailyPillar, createSeededRng, generateSeed } from './dailyPillar';

// 오행-번호 매핑 (끝자리 기반)
const OHENG_NUMBERS: Record<Oheng, number[]> = {
  wood:  [1, 2, 11, 12, 21, 22, 31, 32, 41, 42],
  fire:  [3, 4, 13, 14, 23, 24, 33, 34, 43, 44],
  earth: [5, 6, 15, 16, 25, 26, 35, 36, 45],
  metal: [7, 8, 17, 18, 27, 28, 37, 38],
  water: [9, 10, 19, 20, 29, 30, 39, 40],
};

export function getOhengForNumber(num: number): Oheng {
  const lastDigit = num % 10;
  if (lastDigit === 1 || lastDigit === 2) return 'wood';
  if (lastDigit === 3 || lastDigit === 4) return 'fire';
  if (lastDigit === 5 || lastDigit === 6) return 'earth';
  if (lastDigit === 7 || lastDigit === 8) return 'metal';
  return 'water'; // 9, 0
}

/**
 * 기본 번호 생성 (사주 기본 오행 분포만 사용, 비결정적)
 */
export function generateLottoNumbers(dist: OhengDistribution): number[] {
  return generateWithWeights(calculateBasicWeights(dist), Math.random);
}

/**
 * 확장 번호 생성 (장간, 대운까지 고려, 비결정적)
 */
export function generateEnhancedLottoNumbers(
  dist: OhengDistribution,
  extended?: ExtendedSaju | null
): number[] {
  const weights = calculateEnhancedWeights(dist, extended);
  return generateWithWeights(weights, Math.random);
}

/**
 * 날짜 인식 번호 생성 (사주 + 해당 날짜의 일진으로 결정적 생성)
 * 같은 사주 + 같은 날짜 → 항상 같은 번호
 */
export function generateDateAwareLottoNumbers(
  saju: SajuInput,
  dateStr: string,
  extended?: ExtendedSaju | null
): number[] {
  const dist = analyzeSaju(saju);
  const dailyPillar = getDailyPillar(dateStr);

  // 기본 가중치 계산
  const weights = calculateEnhancedWeights(dist, extended);

  // 일진의 오행이 사주의 부족한 오행을 보충하는지 판단
  const total = Object.values(dist).reduce((s, v) => s + v, 0);
  const avg = total / 5;

  // 일진 천간의 오행: 그 날의 에너지
  // 사주에서 부족한 오행과 같으면 → 큰 보너스 (날이 도와줌)
  // 사주에서 과다한 오행과 같으면 → 약간 감소 (에너지 중복)
  if (dist[dailyPillar.stemOheng] < avg) {
    weights[dailyPillar.stemOheng] += 2; // 부족한 걸 채워주는 날
  } else if (dist[dailyPillar.stemOheng] > avg) {
    weights[dailyPillar.stemOheng] = Math.max(1, weights[dailyPillar.stemOheng] - 1);
  }

  // 일진 지지의 오행도 반영 (천간보다 약하게)
  if (dist[dailyPillar.branchOheng] < avg) {
    weights[dailyPillar.branchOheng] += 1;
  }

  // 결정적 시드: 사주 문자열 + 날짜
  const sajuStr = `${saju.year.cheongan}${saju.year.jiji}${saju.month.cheongan}${saju.month.jiji}${saju.day.cheongan}${saju.day.jiji}${saju.hour.cheongan}${saju.hour.jiji}`;
  const seed = generateSeed(sajuStr, dateStr);
  const rng = createSeededRng(seed);

  return generateWithWeights(weights, rng);
}

function calculateBasicWeights(dist: OhengDistribution): Record<Oheng, number> {
  const total = Object.values(dist).reduce((s, v) => s + v, 0);
  const avg = total / 5;

  const weights: Record<Oheng, number> = {
    wood: 1, fire: 1, earth: 1, metal: 1, water: 1,
  };

  for (const [key, val] of Object.entries(dist) as [Oheng, number][]) {
    if (val < avg) weights[key] = 3;
    else if (val === avg) weights[key] = 2;
    else weights[key] = 1;
  }

  return weights;
}

function calculateEnhancedWeights(
  dist: OhengDistribution,
  extended?: ExtendedSaju | null
): Record<Oheng, number> {
  const weights = calculateBasicWeights(dist);

  if (extended) {
    if (extended.janggan) {
      const jgDist = getJangganOheng(Object.values(extended.janggan));
      const total = Object.values(jgDist).reduce((s, v) => s + v, 0);
      const avg = total / 5;
      for (const [key, val] of Object.entries(jgDist)) {
        if (val < avg) weights[key as Oheng] += 1;
      }
    }

    if (extended.daeun) {
      const current = getCurrentDaeun(extended.daeun);
      if (current) {
        const cgOheng = CHEONGAN_LIST.find(c => c.hanja === current.cheongan);
        if (cgOheng) weights[cgOheng.oheng] += 1;
      }
    }
  }

  return weights;
}

function generateWithWeights(
  weights: Record<Oheng, number>,
  random: () => number
): number[] {
  const pool: { num: number; weight: number }[] = [];
  for (const [oheng, nums] of Object.entries(OHENG_NUMBERS) as [Oheng, number[]][]) {
    for (const n of nums) {
      pool.push({ num: n, weight: weights[oheng] });
    }
  }

  const selected: number[] = [];
  const remaining = [...pool];

  while (selected.length < 6 && remaining.length > 0) {
    const totalWeight = remaining.reduce((s, p) => s + p.weight, 0);
    let rand = random() * totalWeight;

    for (let i = 0; i < remaining.length; i++) {
      rand -= remaining[i].weight;
      if (rand <= 0) {
        selected.push(remaining[i].num);
        remaining.splice(i, 1);
        break;
      }
    }
  }

  return selected.sort((a, b) => a - b);
}

export { OHENG_NUMBERS };
