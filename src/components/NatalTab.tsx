import { useState } from 'react';
import type { NatalChart, PlanetPosition, NatalHouse, NatalAspect } from '@orrery/core';
import { ZODIAC_SYMBOLS, ZODIAC_KO, PLANET_SYMBOLS, PLANET_KO, ASPECT_SYMBOLS, formatDegree, ROMAN } from '@orrery/core';

interface NatalTabProps {
  result: NatalChart | null;
  loading?: boolean;
  error?: string | null;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

const ASPECT_KO: Record<string, string> = {
  conjunction: '합(0)',
  sextile: '육합(60)',
  square: '사각(90)',
  trine: '삼합(120)',
  opposition: '충(180)',
};

export function buildNatalCopyText(result: NatalChart): string {
  const lines: string[] = [];
  lines.push('=== 출생차트 (Natal Chart) 분석 결과 ===');
  lines.push('');
  lines.push(`생년월일시: ${result.input.year}년 ${result.input.month}월 ${result.input.day}일 ${result.input.hour}시 ${result.input.minute}분`);
  lines.push(`위치: ${result.input.latitude ?? 37.5194}, ${result.input.longitude ?? 127.0992}`);
  lines.push('');

  // Angles
  lines.push('[앵글]');
  lines.push(`ASC (상승점): ${ZODIAC_KO[result.angles.asc.sign]} ${formatDegree(result.angles.asc.degreeInSign)}`);
  lines.push(`MC (천정): ${ZODIAC_KO[result.angles.mc.sign]} ${formatDegree(result.angles.mc.degreeInSign)}`);
  lines.push(`DESC (하강점): ${ZODIAC_KO[result.angles.desc.sign]} ${formatDegree(result.angles.desc.degreeInSign)}`);
  lines.push(`IC (천저): ${ZODIAC_KO[result.angles.ic.sign]} ${formatDegree(result.angles.ic.degreeInSign)}`);
  lines.push('');

  // Planets
  lines.push('[행성 위치]');
  result.planets.forEach(p => {
    const retro = p.isRetrograde ? ' (R)' : '';
    lines.push(`${PLANET_KO[p.id]}: ${ZODIAC_KO[p.sign]} ${formatDegree(p.degreeInSign)}${retro} / ${p.house}하우스`);
  });
  lines.push('');

  // Houses
  lines.push('[하우스]');
  result.houses.forEach(h => {
    lines.push(`${ROMAN[h.number - 1] ?? h.number}하우스: ${ZODIAC_KO[h.sign]} ${formatDegree(h.degreeInSign)}`);
  });
  lines.push('');

  // Aspects
  lines.push('[애스펙트]');
  result.aspects.forEach(a => {
    lines.push(`${PLANET_KO[a.planet1]} ${ASPECT_KO[a.type] ?? a.type} ${PLANET_KO[a.planet2]} (오브: ${a.orb.toFixed(1)})`);
  });

  return lines.join('\n');
}

export default function NatalTab({ result, loading, error }: NatalTabProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!result) return;
    copyToClipboard(buildNatalCopyText(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4 animate-pulse">&#x2609;</div>
        <p className="text-slate-400 text-sm">출생차트 계산 중...</p>
        <p className="text-slate-600 text-xs mt-1">천체 위치를 계산하고 있습니다</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
        <p className="text-red-400 text-sm mb-2">출생차트 계산 중 오류가 발생했습니다</p>
        <p className="text-red-500/60 text-xs">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4 opacity-30">&#x2609;</div>
        <p className="text-slate-500 text-sm">생년월일시를 입력하면 출생차트를 분석합니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Copy Button */}
      <div className="flex justify-end">
        <button
          onClick={handleCopy}
          className="px-4 py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer bg-dark-surface text-slate-400 border-dark-border hover:text-gold hover:border-gold/30"
        >
          {copied ? 'AI 해석용 복사 완료!' : 'AI 해석용 복사'}
        </button>
      </div>

      {/* Angles */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
        <h3 className="text-lg font-bold text-gold mb-4">앵글</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'ASC (상승점)', data: result.angles.asc },
            { label: 'MC (천정)', data: result.angles.mc },
            { label: 'DESC (하강점)', data: result.angles.desc },
            { label: 'IC (천저)', data: result.angles.ic },
          ].map(({ label, data }) => (
            <div key={label} className="p-3 bg-dark-surface rounded-lg text-center">
              <div className="text-[10px] text-slate-500 mb-1">{label}</div>
              <div className="text-xl mb-0.5">{ZODIAC_SYMBOLS[data.sign]}</div>
              <div className="text-xs text-slate-200">{ZODIAC_KO[data.sign]}</div>
              <div className="text-[10px] text-slate-400">{formatDegree(data.degreeInSign)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Planets Table */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
        <h3 className="text-lg font-bold text-gold mb-4">행성 위치</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="px-3 py-2 text-left text-xs text-slate-500">행성</th>
                <th className="px-3 py-2 text-left text-xs text-slate-500">별자리</th>
                <th className="px-3 py-2 text-left text-xs text-slate-500">도수</th>
                <th className="px-3 py-2 text-center text-xs text-slate-500">하우스</th>
                <th className="px-3 py-2 text-center text-xs text-slate-500">역행</th>
              </tr>
            </thead>
            <tbody>
              {result.planets.map((planet: PlanetPosition) => (
                <tr key={planet.id} className="border-b border-dark-border/30 hover:bg-dark-surface/50">
                  <td className="px-3 py-2">
                    <span className="text-lg mr-1">{PLANET_SYMBOLS[planet.id]}</span>
                    <span className="text-slate-200">{PLANET_KO[planet.id]}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="mr-1">{ZODIAC_SYMBOLS[planet.sign]}</span>
                    <span className="text-slate-300">{ZODIAC_KO[planet.sign]}</span>
                  </td>
                  <td className="px-3 py-2 text-slate-400">{formatDegree(planet.degreeInSign)}</td>
                  <td className="px-3 py-2 text-center text-slate-300">{ROMAN[planet.house - 1] ?? planet.house}</td>
                  <td className="px-3 py-2 text-center">
                    {planet.isRetrograde ? (
                      <span className="text-red-400 font-bold">R</span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Houses Table */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
        <h3 className="text-lg font-bold text-gold mb-4">하우스</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {result.houses.map((house: NatalHouse) => (
            <div key={house.number} className="p-2 bg-dark-surface rounded-lg flex items-center gap-2">
              <span className="text-xs text-gold font-bold w-8 text-right">{ROMAN[house.number - 1] ?? house.number}</span>
              <span className="text-sm">{ZODIAC_SYMBOLS[house.sign]}</span>
              <span className="text-xs text-slate-300">{ZODIAC_KO[house.sign]}</span>
              <span className="text-[10px] text-slate-500 ml-auto">{formatDegree(house.degreeInSign)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Aspects List */}
      {result.aspects.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
          <h3 className="text-lg font-bold text-gold mb-4">애스펙트</h3>
          <div className="space-y-1.5">
            {result.aspects.map((aspect: NatalAspect, i: number) => (
              <AspectRow key={i} aspect={aspect} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AspectRow({ aspect }: { aspect: NatalAspect }) {
  const typeColors: Record<string, string> = {
    conjunction: 'text-yellow-400 bg-yellow-500/10',
    sextile: 'text-blue-400 bg-blue-500/10',
    square: 'text-red-400 bg-red-500/10',
    trine: 'text-green-400 bg-green-500/10',
    opposition: 'text-orange-400 bg-orange-500/10',
  };

  const color = typeColors[aspect.type] ?? 'text-slate-400 bg-slate-500/10';

  return (
    <div className="flex items-center gap-2 p-2 bg-dark-surface rounded-lg text-xs">
      <span className="w-6 text-center">{PLANET_SYMBOLS[aspect.planet1]}</span>
      <span className="text-slate-300">{PLANET_KO[aspect.planet1]}</span>
      <span className={`px-2 py-0.5 rounded ${color} font-medium`}>
        {ASPECT_SYMBOLS[aspect.type]} {ASPECT_KO[aspect.type] ?? aspect.type}
      </span>
      <span className="w-6 text-center">{PLANET_SYMBOLS[aspect.planet2]}</span>
      <span className="text-slate-300">{PLANET_KO[aspect.planet2]}</span>
      <span className="ml-auto text-slate-500">orb: {aspect.orb.toFixed(1)}</span>
    </div>
  );
}
