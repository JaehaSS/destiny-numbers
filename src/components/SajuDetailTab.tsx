import { useState } from 'react';
import type { SajuResult, PillarDetail, DaewoonItem, AllRelations, RelationResult } from '@orrery/core';
import { toHangul } from '@orrery/core';

interface SajuDetailTabProps {
  result: SajuResult;
}

const PILLAR_LABELS = ['시주', '일주', '월주', '년주'];

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

export function buildSajuCopyText(result: SajuResult): string {
  const lines: string[] = [];
  lines.push('=== 사주팔자 분석 결과 ===');
  lines.push('');

  // 기본 정보
  const { input } = result;
  lines.push(`생년월일시: ${input.year}년 ${input.month}월 ${input.day}일 ${input.hour}시 ${input.minute}분`);
  lines.push(`성별: ${input.gender === 'M' ? '남' : '여'}`);
  lines.push('');

  // 4주
  lines.push('[사주 4주]');
  result.pillars.forEach((p, i) => {
    const label = PILLAR_LABELS[i];
    lines.push(`${label}: ${p.pillar.ganzi} (${toHangul(p.pillar.ganzi)})`);
    lines.push(`  천간: ${p.pillar.stem}(${toHangul(p.pillar.stem)}) - 십신: ${p.stemSipsin}(${toHangul(p.stemSipsin)})`);
    lines.push(`  지지: ${p.pillar.branch}(${toHangul(p.pillar.branch)}) - 십신: ${p.branchSipsin}(${toHangul(p.branchSipsin)})`);
    lines.push(`  12운성: ${p.unseong}(${toHangul(p.unseong)}) / 신살: ${p.sinsal}(${toHangul(p.sinsal)})`);
    lines.push(`  지장간: ${p.jigang} (${toHangul(p.jigang)})`);
  });
  lines.push('');

  // 대운
  lines.push('[대운]');
  result.daewoon.forEach(d => {
    lines.push(`${d.age}세~: ${d.ganzi}(${toHangul(d.ganzi)}) / 십신: ${d.stemSipsin}(${toHangul(d.stemSipsin)})-${d.branchSipsin}(${toHangul(d.branchSipsin)}) / 12운성: ${d.unseong}(${toHangul(d.unseong)})`);
  });
  lines.push('');

  // 관계
  lines.push('[합충형파해 관계]');
  const { relations } = result;
  relations.pairs.forEach((pair, key) => {
    const stemRels = pair.stem.filter(r => r.type !== '없음');
    const branchRels = pair.branch.filter(r => r.type !== '없음');
    if (stemRels.length > 0 || branchRels.length > 0) {
      lines.push(`${key}:`);
      stemRels.forEach(r => lines.push(`  천간: ${r.type}${r.detail ? ` (${r.detail})` : ''}`));
      branchRels.forEach(r => lines.push(`  지지: ${r.type}${r.detail ? ` (${r.detail})` : ''}`));
    }
  });
  if (relations.triple.length > 0) {
    lines.push(`삼합: ${relations.triple.map(r => `${r.type}${r.detail ? `(${r.detail})` : ''}`).join(', ')}`);
  }
  if (relations.directional.length > 0) {
    lines.push(`방합: ${relations.directional.map(r => `${r.type}${r.detail ? `(${r.detail})` : ''}`).join(', ')}`);
  }
  lines.push('');

  // 신살
  lines.push('[특수 신살]');
  if (result.specialSals.yangin.length > 0) lines.push(`양인: ${result.specialSals.yangin.join(', ')}번째 주`);
  if (result.specialSals.baekho) lines.push('백호살 있음');
  if (result.specialSals.goegang) lines.push('괴강살 있음');

  return lines.join('\n');
}

export default function SajuDetailTab({ result }: SajuDetailTabProps) {
  const [copied, setCopied] = useState(false);
  const [expandedDaewoon, setExpandedDaewoon] = useState(false);

  const currentAge = new Date().getFullYear() - result.input.year;

  const handleCopy = () => {
    copyToClipboard(buildSajuCopyText(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      {/* 4주 Table */}
      <div>
        <h3 className="text-lg font-bold text-gold mb-4">사주 4주</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {result.pillars.map((pillar: PillarDetail, i: number) => (
            <PillarCard key={i} pillar={pillar} label={PILLAR_LABELS[i]} isDay={i === 1} />
          ))}
        </div>
      </div>

      {/* 대운 Timeline */}
      <div>
        <h3 className="text-lg font-bold text-gold mb-4">대운 타임라인</h3>
        <div className="bg-dark-card border border-dark-border rounded-2xl p-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {(expandedDaewoon ? result.daewoon : result.daewoon.slice(0, 8)).map((dw: DaewoonItem) => {
              const isCurrentAge = currentAge >= dw.age && currentAge < dw.age + 10;
              return (
                <div
                  key={dw.index}
                  className={`flex-shrink-0 w-24 rounded-xl p-3 text-center border transition-all ${
                    isCurrentAge
                      ? 'bg-gold/20 border-gold/50 ring-2 ring-gold/30'
                      : 'bg-dark-surface border-dark-border'
                  }`}
                >
                  <div className={`text-lg font-bold mb-1 ${isCurrentAge ? 'text-gold' : 'text-slate-200'}`}>
                    {dw.ganzi}
                  </div>
                  <div className="text-[10px] text-slate-400 mb-1">
                    {toHangul(dw.ganzi)}
                  </div>
                  <div className={`text-xs font-medium ${isCurrentAge ? 'text-gold' : 'text-slate-400'}`}>
                    {dw.age}세~
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {toHangul(dw.stemSipsin)}/{toHangul(dw.branchSipsin)}
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5">
                    {toHangul(dw.unseong)}
                  </div>
                  {isCurrentAge && (
                    <div className="mt-1 text-[9px] text-gold font-bold">현재</div>
                  )}
                </div>
              );
            })}
          </div>
          {result.daewoon.length > 8 && (
            <div className="text-center mt-2">
              <button
                onClick={() => setExpandedDaewoon(!expandedDaewoon)}
                className="text-xs text-slate-500 hover:text-gold transition-colors cursor-pointer"
              >
                {expandedDaewoon ? '접기' : `+${result.daewoon.length - 8}개 더 보기`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 관계 분석 */}
      <div>
        <h3 className="text-lg font-bold text-gold mb-4">합충형파해 관계</h3>
        <RelationSection relations={result.relations} />
      </div>

      {/* 신살 */}
      <div>
        <h3 className="text-lg font-bold text-gold mb-4">특수 신살</h3>
        <div className="bg-dark-card border border-dark-border rounded-2xl p-4">
          <div className="flex flex-wrap gap-2">
            {result.specialSals.yangin.length > 0 && (
              <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                양인(羊刃) - {result.specialSals.yangin.map(n => PILLAR_LABELS[n] ?? `${n}번`).join(', ')}
              </span>
            )}
            {result.specialSals.baekho && (
              <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                백호살(白虎)
              </span>
            )}
            {result.specialSals.goegang && (
              <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                괴강살(魁罡)
              </span>
            )}
            {result.specialSals.yangin.length === 0 && !result.specialSals.baekho && !result.specialSals.goegang && (
              <span className="text-xs text-slate-500">특수 신살 없음</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Sub Components --- */

function PillarCard({ pillar, label, isDay }: { pillar: PillarDetail; label: string; isDay: boolean }) {
  return (
    <div className={`bg-dark-card border rounded-xl p-4 ${isDay ? 'border-gold/40 ring-1 ring-gold/20' : 'border-dark-border'}`}>
      <div className="text-center mb-3">
        <span className="text-gold text-xs font-medium">{label}</span>
        {isDay && <span className="text-[9px] text-gold/60 ml-1">(일간)</span>}
      </div>

      {/* 간지 */}
      <div className="text-center mb-3">
        <div className="text-2xl font-bold text-slate-100">{pillar.pillar.ganzi}</div>
        <div className="text-xs text-slate-400">{toHangul(pillar.pillar.ganzi)}</div>
      </div>

      {/* 천간 */}
      <div className="mb-2 p-2 bg-dark-surface rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">천간</span>
          <span className="text-sm font-bold text-slate-200">{pillar.pillar.stem} <span className="text-slate-400 font-normal">({toHangul(pillar.pillar.stem)})</span></span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-slate-600">십신</span>
          <span className="text-xs text-purple-400">{pillar.stemSipsin} ({toHangul(pillar.stemSipsin)})</span>
        </div>
      </div>

      {/* 지지 */}
      <div className="mb-2 p-2 bg-dark-surface rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">지지</span>
          <span className="text-sm font-bold text-slate-200">{pillar.pillar.branch} <span className="text-slate-400 font-normal">({toHangul(pillar.pillar.branch)})</span></span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-slate-600">십신</span>
          <span className="text-xs text-purple-400">{pillar.branchSipsin} ({toHangul(pillar.branchSipsin)})</span>
        </div>
      </div>

      {/* 12운성 */}
      <div className="flex items-center justify-between p-2 bg-dark-surface rounded-lg mb-2">
        <span className="text-[10px] text-slate-600">12운성</span>
        <span className="text-xs text-blue-400">{pillar.unseong} ({toHangul(pillar.unseong)})</span>
      </div>

      {/* 신살 */}
      <div className="flex items-center justify-between p-2 bg-dark-surface rounded-lg mb-2">
        <span className="text-[10px] text-slate-600">신살</span>
        <span className="text-xs text-amber-400">{pillar.sinsal} ({toHangul(pillar.sinsal)})</span>
      </div>

      {/* 지장간 */}
      <div className="flex items-center justify-between p-2 bg-dark-surface rounded-lg">
        <span className="text-[10px] text-slate-600">지장간</span>
        <span className="text-xs text-green-400">
          {pillar.jigang.split('').map((ch, j) => (
            <span key={j}>{ch}({toHangul(ch)}) </span>
          ))}
        </span>
      </div>
    </div>
  );
}

function RelationSection({ relations }: { relations: AllRelations }) {
  const pairEntries: [string, { stem: RelationResult[]; branch: RelationResult[] }][] = [];
  relations.pairs.forEach((value, key) => {
    pairEntries.push([key, value]);
  });

  const hasRelations = pairEntries.some(([, pair]) =>
    pair.stem.some(r => r.type !== '없음') || pair.branch.some(r => r.type !== '없음')
  ) || relations.triple.length > 0 || relations.directional.length > 0;

  if (!hasRelations) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-2xl p-4">
        <p className="text-sm text-slate-500 text-center">특별한 합충형파해 관계가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-4 space-y-3">
      {/* Pair relations */}
      {pairEntries.map(([key, pair]) => {
        const stemRels = pair.stem.filter(r => r.type !== '없음');
        const branchRels = pair.branch.filter(r => r.type !== '없음');
        if (stemRels.length === 0 && branchRels.length === 0) return null;

        return (
          <div key={key} className="p-3 bg-dark-surface rounded-lg">
            <div className="text-xs text-slate-400 font-medium mb-2">{key}</div>
            <div className="flex flex-wrap gap-1.5">
              {stemRels.map((r, i) => (
                <RelationBadge key={`s-${i}`} rel={r} type="천간" />
              ))}
              {branchRels.map((r, i) => (
                <RelationBadge key={`b-${i}`} rel={r} type="지지" />
              ))}
            </div>
          </div>
        );
      })}

      {/* Triple compose */}
      {relations.triple.length > 0 && (
        <div className="p-3 bg-dark-surface rounded-lg">
          <div className="text-xs text-slate-400 font-medium mb-2">삼합</div>
          <div className="flex flex-wrap gap-1.5">
            {relations.triple.map((r, i) => (
              <RelationBadge key={i} rel={r} type="삼합" />
            ))}
          </div>
        </div>
      )}

      {/* Directional compose */}
      {relations.directional.length > 0 && (
        <div className="p-3 bg-dark-surface rounded-lg">
          <div className="text-xs text-slate-400 font-medium mb-2">방합</div>
          <div className="flex flex-wrap gap-1.5">
            {relations.directional.map((r, i) => (
              <RelationBadge key={i} rel={r} type="방합" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RelationBadge({ rel, type }: { rel: RelationResult; type: string }) {
  const colorMap: Record<string, string> = {
    '합': 'bg-green-500/15 text-green-400 border-green-500/30',
    '충': 'bg-red-500/15 text-red-400 border-red-500/30',
    '형': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    '파': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    '해': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  };

  const color = Object.entries(colorMap).find(([k]) => rel.type.includes(k))?.[1]
    ?? 'bg-slate-500/15 text-slate-400 border-slate-500/30';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full border ${color}`}>
      <span className="opacity-60">[{type}]</span>
      {rel.type}
      {rel.detail && <span className="opacity-70">({rel.detail})</span>}
    </span>
  );
}
