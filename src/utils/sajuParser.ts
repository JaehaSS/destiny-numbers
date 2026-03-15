import type { SajuInput, ExtendedSaju } from '../types';
import { CHEONGAN_LIST, JIJI_LIST } from './saju';

// 한자 → 한글 매핑
const HANJA_TO_HANGUL_CG: Record<string, string> = {};
const HANJA_TO_HANGUL_JJ: Record<string, string> = {};

CHEONGAN_LIST.forEach(c => { HANJA_TO_HANGUL_CG[c.hanja] = c.name; });
JIJI_LIST.forEach(j => { HANJA_TO_HANGUL_JJ[j.hanja] = j.name; });

// 천간 한자 목록
const CG_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 지지 한자 목록
const JJ_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 사주팔자 텍스트를 파싱하여 SajuInput으로 변환
 * 지원하는 형식:
 * 1. "천간: 戊 庚 己 乙" + "지지: 寅 申 卯 亥" 형식
 * 2. 한자 2자씩 기둥 형식 (乙亥, 己卯, 庚申, 戊寅)
 * 3. 자유 텍스트에서 천간/지지 패턴 인식
 */
export function parseSajuText(text: string): ExtendedSaju | null {
  try {
    const result: ExtendedSaju = {
      basic: {
        year: { cheongan: '', jiji: '' },
        month: { cheongan: '', jiji: '' },
        day: { cheongan: '', jiji: '' },
        hour: { cheongan: '', jiji: '' },
      },
    };

    // 성별 감지
    if (text.includes('男')) result.gender = 'male';
    else if (text.includes('女')) result.gender = 'female';

    // rawText 저장
    result.rawText = text;

    // 방법 1: 천간/지지 행 파싱 (테이블 형식)
    // "천간     戊      庚      己      乙"
    // "지지     寅      申      卯      亥"
    const cheonganLine = text.match(/천간\s+([\u4E00-\u9FFF])\s+([\u4E00-\u9FFF])\s+([\u4E00-\u9FFF])\s+([\u4E00-\u9FFF])/);
    const jijiLine = text.match(/지지\s+([\u4E00-\u9FFF])\s+([\u4E00-\u9FFF])\s+([\u4E00-\u9FFF])\s+([\u4E00-\u9FFF])/);

    if (cheonganLine && jijiLine) {
      // 순서: 時柱, 日柱, 月柱, 年柱 (오른쪽→왼쪽이 전통이지만, 테이블은 왼→오)
      const cgOrder = [cheonganLine[1], cheonganLine[2], cheonganLine[3], cheonganLine[4]];
      const jjOrder = [jijiLine[1], jijiLine[2], jijiLine[3], jijiLine[4]];

      // 헤더에서 순서 확인
      const headerLine = text.match(/時柱\s+日柱\s+月柱\s+年柱/);
      if (headerLine) {
        // 時, 日, 月, 年 순서
        result.basic.hour = { cheongan: HANJA_TO_HANGUL_CG[cgOrder[0]] || '', jiji: HANJA_TO_HANGUL_JJ[jjOrder[0]] || '' };
        result.basic.day = { cheongan: HANJA_TO_HANGUL_CG[cgOrder[1]] || '', jiji: HANJA_TO_HANGUL_JJ[jjOrder[1]] || '' };
        result.basic.month = { cheongan: HANJA_TO_HANGUL_CG[cgOrder[2]] || '', jiji: HANJA_TO_HANGUL_JJ[jjOrder[2]] || '' };
        result.basic.year = { cheongan: HANJA_TO_HANGUL_CG[cgOrder[3]] || '', jiji: HANJA_TO_HANGUL_JJ[jjOrder[3]] || '' };
      } else {
        // 年, 月, 日, 時 순서 (기본)
        result.basic.year = { cheongan: HANJA_TO_HANGUL_CG[cgOrder[0]] || '', jiji: HANJA_TO_HANGUL_JJ[jjOrder[0]] || '' };
        result.basic.month = { cheongan: HANJA_TO_HANGUL_CG[cgOrder[1]] || '', jiji: HANJA_TO_HANGUL_JJ[jjOrder[1]] || '' };
        result.basic.day = { cheongan: HANJA_TO_HANGUL_CG[cgOrder[2]] || '', jiji: HANJA_TO_HANGUL_JJ[jjOrder[2]] || '' };
        result.basic.hour = { cheongan: HANJA_TO_HANGUL_CG[cgOrder[3]] || '', jiji: HANJA_TO_HANGUL_JJ[jjOrder[3]] || '' };
      }

      // 십신 파싱
      const sipsinLines = [...text.matchAll(/십신\s+([\u4E00-\u9FFF]+)\s+([\u4E00-\u9FFF]+)\s+([\u4E00-\u9FFF]+)\s+([\u4E00-\u9FFF]+)/g)];
      if (sipsinLines.length >= 2) {
        result.sipsin = {
          hour: { cheongan: sipsinLines[0][1], jiji: sipsinLines[1][1] },
          day: { cheongan: sipsinLines[0][2], jiji: sipsinLines[1][2] },
          month: { cheongan: sipsinLines[0][3], jiji: sipsinLines[1][3] },
          year: { cheongan: sipsinLines[0][4], jiji: sipsinLines[1][4] },
        };
      }

      // 장간 파싱
      const jangganLine = text.match(/장간\s+([\u4E00-\u9FFF]+)\s+([\u4E00-\u9FFF]+)\s+([\u4E00-\u9FFF\s]+?)\s+([\u4E00-\u9FFF]+)/);
      if (jangganLine) {
        result.janggan = {
          hour: jangganLine[1].split(''),
          day: jangganLine[2].split(''),
          month: jangganLine[3].trim().split(''),
          year: jangganLine[4].split(''),
        };
      }

      // 신살 파싱
      const sinsalMatch = text.match(/神殺[\s─]+\n(.+)/);
      if (sinsalMatch) {
        result.sinsal = sinsalMatch[1].split(/[·,，]/).map(s => s.trim()).filter(Boolean);
      }

      // 대운 파싱
      const daeunMatches = [...text.matchAll(/(\d+)運\s*\(\s*(\d+)세\)\s+([\u4E00-\u9FFF]+)\s+([\u4E00-\u9FFF])([\u4E00-\u9FFF])\s+([\u4E00-\u9FFF]+)\s+\((\d{4})年\)/g)];
      if (daeunMatches.length > 0) {
        result.daeun = daeunMatches.map(m => ({
          age: parseInt(m[2]),
          cheongan: m[4],
          jiji: m[5],
          year: parseInt(m[7]),
        }));
      }

      return result;
    }

    // 방법 2: "年柱: 乙亥" 형식
    const pillarPatterns = {
      year: /年柱[:\s]*([\u4E00-\u9FFF])([\u4E00-\u9FFF])/,
      month: /月柱[:\s]*([\u4E00-\u9FFF])([\u4E00-\u9FFF])/,
      day: /日柱[:\s]*([\u4E00-\u9FFF])([\u4E00-\u9FFF])/,
      hour: /時柱[:\s]*([\u4E00-\u9FFF])([\u4E00-\u9FFF])/,
    };

    let foundCount = 0;
    for (const [key, pattern] of Object.entries(pillarPatterns)) {
      const match = text.match(pattern);
      if (match) {
        const cg = match[1];
        const jj = match[2];
        if (CG_HANJA.includes(cg) && JJ_HANJA.includes(jj)) {
          result.basic[key as keyof SajuInput] = {
            cheongan: HANJA_TO_HANGUL_CG[cg] || '',
            jiji: HANJA_TO_HANGUL_JJ[jj] || '',
          };
          foundCount++;
        }
      }
    }

    if (foundCount >= 4) return result;

    // 방법 3: 연속된 천간+지지 2자 패턴 찾기
    const pairs: { cg: string; jj: string }[] = [];
    for (let i = 0; i < text.length - 1; i++) {
      const c1 = text[i];
      const c2 = text[i + 1];
      if (CG_HANJA.includes(c1) && JJ_HANJA.includes(c2)) {
        pairs.push({ cg: c1, jj: c2 });
      }
    }

    // 최소 4쌍 찾으면 (年, 月, 日, 時 순서로 가정)
    if (pairs.length >= 4) {
      const uniquePairs = pairs.filter((p, i, arr) =>
        i === arr.findIndex(q => q.cg === p.cg && q.jj === p.jj)
      );
      if (uniquePairs.length >= 4) {
        // 텍스트에서 年月日時 순서 감지
        const hasReverse = text.indexOf('時柱') < text.indexOf('年柱');
        const ordered = hasReverse
          ? [uniquePairs[3], uniquePairs[2], uniquePairs[1], uniquePairs[0]]
          : uniquePairs.slice(0, 4);

        result.basic.year = { cheongan: HANJA_TO_HANGUL_CG[ordered[0].cg] || '', jiji: HANJA_TO_HANGUL_JJ[ordered[0].jj] || '' };
        result.basic.month = { cheongan: HANJA_TO_HANGUL_CG[ordered[1].cg] || '', jiji: HANJA_TO_HANGUL_JJ[ordered[1].jj] || '' };
        result.basic.day = { cheongan: HANJA_TO_HANGUL_CG[ordered[2].cg] || '', jiji: HANJA_TO_HANGUL_JJ[ordered[2].jj] || '' };
        result.basic.hour = { cheongan: HANJA_TO_HANGUL_CG[ordered[3].cg] || '', jiji: HANJA_TO_HANGUL_JJ[ordered[3].jj] || '' };
        return result;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * 장간(藏干)에서 오행 분포 추출
 */
export function getJangganOheng(janggan: string[][]): Record<string, number> {
  const dist: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const charToOheng: Record<string, string> = {
    '甲': 'wood', '乙': 'wood',
    '丙': 'fire', '丁': 'fire',
    '戊': 'earth', '己': 'earth',
    '庚': 'metal', '辛': 'metal',
    '壬': 'water', '癸': 'water',
  };

  for (const pillar of janggan) {
    for (const char of pillar) {
      if (charToOheng[char]) {
        dist[charToOheng[char]]++;
      }
    }
  }

  return dist;
}

/**
 * 현재 대운 찾기
 */
export function getCurrentDaeun(daeun: ExtendedSaju['daeun']): typeof daeun extends undefined ? null : NonNullable<typeof daeun>[number] | null {
  if (!daeun || daeun.length === 0) return null;

  const currentYear = new Date().getFullYear();
  for (let i = daeun.length - 1; i >= 0; i--) {
    if (currentYear >= daeun[i].year) {
      return daeun[i];
    }
  }
  return daeun[0];
}
