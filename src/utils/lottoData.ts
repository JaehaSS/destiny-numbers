import type { LottoRound, MatchResult, VerificationResult, SajuVerificationResult, SajuInput, ExtendedSaju } from '../types';
import { generateDateAwareLottoNumbers } from './lottoGenerator';

// 샘플 로또 데이터 (실제로는 동행복권 API에서 가져와 빌드타임 번들링)
function generateSampleData(): LottoRound[] {
  const rounds: LottoRound[] = [];
  const baseDate = new Date('2002-12-07');

  for (let i = 1; i <= 1200; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + (i - 1) * 7);

    const seed = i * 2654435761;
    const nums: number[] = [];
    let s = seed;
    while (nums.length < 6) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const n = (s % 45) + 1;
      if (!nums.includes(n)) nums.push(n);
    }
    nums.sort((a, b) => a - b);

    s = (s * 1103515245 + 12345) & 0x7fffffff;
    let bonus = (s % 45) + 1;
    while (nums.includes(bonus)) {
      bonus = (bonus % 45) + 1;
    }

    rounds.push({
      round: i,
      date: date.toISOString().split('T')[0],
      numbers: nums,
      bonus,
    });
  }

  return rounds;
}

let cachedData: LottoRound[] | null = null;

export function getLottoData(): LottoRound[] {
  if (!cachedData) {
    cachedData = generateSampleData();
  }
  return cachedData;
}

/**
 * 기존: 고정 번호로 전 회차 비교
 */
export function verifyNumbers(targetNumbers: number[]): VerificationResult {
  const data = getLottoData();
  const matches: MatchResult[] = [];
  const distribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const rankCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let bestMatch: MatchResult | null = null;

  for (const round of data) {
    const matched = targetNumbers.filter(n => round.numbers.includes(n));
    const matchCount = matched.length;
    const bonusMatched = targetNumbers.includes(round.bonus);

    distribution[matchCount] = (distribution[matchCount] || 0) + 1;

    let rank: number | null = null;
    if (matchCount === 6) rank = 1;
    else if (matchCount === 5 && bonusMatched) rank = 2;
    else if (matchCount === 5) rank = 3;
    else if (matchCount === 4) rank = 4;
    else if (matchCount === 3) rank = 5;

    if (rank) rankCounts[rank]++;

    const result: MatchResult = {
      round: round.round,
      date: round.date,
      winningNumbers: round.numbers,
      bonusNumber: round.bonus,
      generatedNumbers: targetNumbers,
      matchedNumbers: matched,
      matchCount,
      rank,
      bonusMatched,
    };

    if (matchCount >= 3) matches.push(result);

    if (!bestMatch || matchCount > bestMatch.matchCount ||
        (matchCount === bestMatch.matchCount && bonusMatched && !bestMatch.bonusMatched)) {
      bestMatch = result;
    }
  }

  matches.sort((a, b) => b.matchCount - a.matchCount || a.round - b.round);

  return {
    targetNumbers,
    totalRounds: data.length,
    matches,
    distribution,
    bestMatch,
    rankCounts,
  };
}

/**
 * 사주 기반 회차별 검증
 * 매 회차마다 해당 날짜+사주로 고유 번호를 생성하여 당첨번호와 비교
 */
export function verifySajuBased(
  saju: SajuInput,
  extended?: ExtendedSaju | null,
  onProgress?: (current: number, total: number) => void
): SajuVerificationResult {
  const data = getLottoData();
  const matches: MatchResult[] = [];
  const distribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const rankCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let bestMatch: MatchResult | null = null;

  for (let idx = 0; idx < data.length; idx++) {
    const round = data[idx];

    // 해당 회차 날짜로 사주 기반 번호 생성 (결정적)
    const generated = generateDateAwareLottoNumbers(saju, round.date, extended);

    const matched = generated.filter(n => round.numbers.includes(n));
    const matchCount = matched.length;
    const bonusMatched = generated.includes(round.bonus);

    distribution[matchCount] = (distribution[matchCount] || 0) + 1;

    let rank: number | null = null;
    if (matchCount === 6) rank = 1;
    else if (matchCount === 5 && bonusMatched) rank = 2;
    else if (matchCount === 5) rank = 3;
    else if (matchCount === 4) rank = 4;
    else if (matchCount === 3) rank = 5;

    if (rank) rankCounts[rank]++;

    const result: MatchResult = {
      round: round.round,
      date: round.date,
      winningNumbers: round.numbers,
      bonusNumber: round.bonus,
      generatedNumbers: generated,
      matchedNumbers: matched,
      matchCount,
      rank,
      bonusMatched,
    };

    if (matchCount >= 3) matches.push(result);

    if (!bestMatch || matchCount > bestMatch.matchCount ||
        (matchCount === bestMatch.matchCount && bonusMatched && !bestMatch.bonusMatched)) {
      bestMatch = result;
    }

    if (onProgress && idx % 100 === 0) {
      onProgress(idx, data.length);
    }
  }

  matches.sort((a, b) => b.matchCount - a.matchCount || a.round - b.round);

  return {
    totalRounds: data.length,
    matches,
    distribution,
    bestMatch,
    rankCounts,
  };
}
