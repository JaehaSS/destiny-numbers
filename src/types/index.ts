export type Oheng = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export interface CheonGan {
  name: string;
  hanja: string;
  oheng: Oheng;
}

export interface JiJi {
  name: string;
  hanja: string;
  oheng: Oheng;
}

export interface SajuPillar {
  cheongan: string;
  jiji: string;
}

export interface SajuInput {
  year: SajuPillar;
  month: SajuPillar;
  day: SajuPillar;
  hour: SajuPillar;
}

// 확장 사주 데이터 (외부 데이터 붙여넣기용)
export interface ExtendedSaju {
  basic: SajuInput;
  sipsin?: {
    year: { cheongan: string; jiji: string };
    month: { cheongan: string; jiji: string };
    day: { cheongan: string; jiji: string };
    hour: { cheongan: string; jiji: string };
  };
  janggan?: {
    year: string[];
    month: string[];
    day: string[];
    hour: string[];
  };
  sinsal?: string[];
  daeun?: { age: number; cheongan: string; jiji: string; year: number }[];
  gender?: 'male' | 'female';
  rawText?: string;
}

export interface OhengDistribution {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface GeneratedSet {
  id: string;
  numbers: number[];
  timestamp: number;
  saju: SajuInput;
  ohengDist: OhengDistribution;
}

export interface MatchResult {
  round: number;
  date: string;
  winningNumbers: number[];
  bonusNumber: number;
  generatedNumbers: number[]; // 해당 회차에서 사주+날짜로 생성된 번호
  matchedNumbers: number[];
  matchCount: number;
  rank: number | null; // 1~5등 or null
  bonusMatched: boolean;
}

export interface SajuVerificationResult {
  totalRounds: number;
  matches: MatchResult[]; // 3개 이상 일치 회차
  distribution: Record<number, number>; // matchCount → round count
  bestMatch: MatchResult | null;
  rankCounts: Record<number, number>; // rank → count
}

// 기존 고정번호 검증용 (유지)
export interface VerificationResult {
  targetNumbers: number[];
  totalRounds: number;
  matches: MatchResult[];
  distribution: Record<number, number>;
  bestMatch: MatchResult | null;
  rankCounts: Record<number, number>;
}

export interface LottoRound {
  round: number;
  date: string;
  numbers: number[];
  bonus: number;
}
