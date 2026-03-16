import { useState } from 'react';
import type { ZiweiChart, ZiweiPalace, ZiweiStar } from '@orrery/core';
import { toHangul } from '@orrery/core';

interface ZiweiTabProps {
  result: ZiweiChart;
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

export function buildZiweiCopyText(result: ZiweiChart): string {
  const lines: string[] = [];
  lines.push('=== 자미두수 명반 분석 결과 ===');
  lines.push('');
  lines.push(`양력: ${result.solarYear}년 ${result.solarMonth}월 ${result.solarDay}일 ${result.hour}시 ${result.minute}분`);
  lines.push(`음력: ${result.lunarYear}년 ${result.lunarMonth}월 ${result.lunarDay}일${result.isLeapMonth ? ' (윤달)' : ''}`);
  lines.push(`성별: ${result.isMale ? '남' : '여'}`);
  lines.push(`년간: ${result.yearGan}(${toHangul(result.yearGan)}) / 년지: ${result.yearZhi}(${toHangul(result.yearZhi)})`);
  lines.push(`명궁지: ${result.mingGongZhi}(${toHangul(result.mingGongZhi)}) / 신궁지: ${result.shenGongZhi}(${toHangul(result.shenGongZhi)})`);
  lines.push(`오행국: ${result.wuXingJu.name}(${toHangul(result.wuXingJu.name)})`);
  lines.push(`대한 시작 나이: ${result.daXianStartAge}세`);
  lines.push('');

  lines.push('[12궁 배치]');
  for (const [palaceName, palace] of Object.entries(result.palaces)) {
    const pName = `${palaceName}(${toHangul(palaceName)})`;
    const stars = palace.stars.map(s => {
      let desc = `${s.name}(${toHangul(s.name)})`;
      if (s.brightness) desc += ` [${s.brightness}]`;
      if (s.siHua) desc += ` {${s.siHua}(${toHangul(s.siHua)})}`;
      return desc;
    }).join(', ');
    const extra = palace.isShenGong ? ' [신궁]' : '';
    lines.push(`${pName}: ${palace.ganZhi}(${toHangul(palace.ganZhi)})${extra}`);
    if (stars) lines.push(`  성요: ${stars}`);
  }

  return lines.join('\n');
}

// 전통 자미두수 명반에서 12궁의 배치 순서 (4x3 grid, 반시계 방향)
// 지지 순서: 巳午未申 (top), 辰(left-2), 酉(right-2), 卯(left-3), 戌(right-3), 寅丑子亥 (bottom)
const GRID_ZHI_ORDER = [
  ['巳', '午', '未', '申'],
  ['辰', null, null, '酉'],
  ['卯', null, null, '戌'],
  ['寅', '丑', '子', '亥'],
];

export default function ZiweiTab({ result }: ZiweiTabProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyToClipboard(buildZiweiCopyText(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build a map from zhi to palace
  const zhiToPalace: Record<string, ZiweiPalace> = {};
  for (const palace of Object.values(result.palaces)) {
    // ganZhi는 2글자: 간+지
    const zhi = palace.ganZhi.length >= 2 ? palace.ganZhi[1] : palace.zhi;
    zhiToPalace[zhi] = palace;
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

      {/* 기본 정보 */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
        <h3 className="text-lg font-bold text-gold mb-4">기본 정보</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <InfoItem label="음력" value={`${result.lunarYear}년 ${result.lunarMonth}월 ${result.lunarDay}일${result.isLeapMonth ? ' (윤)' : ''}`} />
          <InfoItem label="오행국" value={`${result.wuXingJu.name} (${toHangul(result.wuXingJu.name)})`} />
          <InfoItem label="명궁" value={`${result.mingGongZhi} (${toHangul(result.mingGongZhi)})`} />
          <InfoItem label="대한 시작" value={`${result.daXianStartAge}세`} />
        </div>
      </div>

      {/* 12궁 Grid */}
      <div>
        <h3 className="text-lg font-bold text-gold mb-4">명반 12궁</h3>

        {/* Desktop: 4x4 traditional grid */}
        <div className="hidden md:grid grid-cols-4 gap-1">
          {GRID_ZHI_ORDER.flat().map((zhi, idx) => {
            if (zhi === null) {
              // center cells: show basic info
              if (idx === 5) {
                return (
                  <div key={`center-${idx}`} className="bg-dark-surface border border-dark-border rounded-lg p-3 col-span-1 row-span-1 flex flex-col items-center justify-center">
                    <div className="text-gold text-xs font-bold mb-1">자미두수</div>
                    <div className="text-[10px] text-slate-400">명반</div>
                    <div className="text-xs text-slate-300 mt-2">
                      {result.wuXingJu.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {toHangul(result.wuXingJu.name)}
                    </div>
                  </div>
                );
              }
              if (idx === 6) {
                return (
                  <div key={`center-${idx}`} className="bg-dark-surface border border-dark-border rounded-lg p-3 col-span-1 row-span-1 flex flex-col items-center justify-center">
                    <div className="text-xs text-slate-400 mb-1">{result.isMale ? '남' : '여'}명</div>
                    <div className="text-xs text-slate-300">
                      {result.solarYear}.{result.solarMonth}.{result.solarDay}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      대한 {result.daXianStartAge}세
                    </div>
                  </div>
                );
              }
              if (idx === 9) {
                return (
                  <div key={`center-${idx}`} className="bg-dark-surface border border-dark-border rounded-lg p-3 col-span-1 row-span-1 flex flex-col items-center justify-center">
                    <div className="text-[10px] text-slate-500">년간지</div>
                    <div className="text-sm text-slate-300">
                      {result.yearGan}{result.yearZhi}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      ({toHangul(result.yearGan + result.yearZhi)})
                    </div>
                  </div>
                );
              }
              if (idx === 10) {
                return (
                  <div key={`center-${idx}`} className="bg-dark-surface border border-dark-border rounded-lg p-3 col-span-1 row-span-1 flex flex-col items-center justify-center">
                    <div className="text-[10px] text-slate-500">신궁</div>
                    <div className="text-sm text-slate-300">
                      {result.shenGongZhi}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      ({toHangul(result.shenGongZhi)})
                    </div>
                  </div>
                );
              }
              return <div key={`empty-${idx}`} className="bg-dark-surface border border-dark-border rounded-lg p-3" />;
            }

            const palace = zhiToPalace[zhi];
            if (!palace) {
              return (
                <div key={zhi} className="bg-dark-card border border-dark-border rounded-lg p-2 min-h-[120px]">
                  <div className="text-xs text-slate-500">{zhi} ({toHangul(zhi)})</div>
                </div>
              );
            }

            const isMingGong = palace.name === '命宮';
            const isShenGong = palace.isShenGong;

            return (
              <PalaceCell
                key={zhi}
                palace={palace}
                isMingGong={isMingGong}
                isShenGong={isShenGong}
                mingGongZhi={result.mingGongZhi}
              />
            );
          })}
        </div>

        {/* Mobile: vertical list */}
        <div className="md:hidden space-y-2">
          {Object.entries(result.palaces).map(([, palace]) => {
            const isMingGong = palace.name === '命宮';
            const isShenGong = palace.isShenGong;
            return (
              <PalaceMobileCard
                key={palace.name}
                palace={palace}
                isMingGong={isMingGong}
                isShenGong={isShenGong}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* --- Sub Components --- */

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 bg-dark-surface rounded-lg">
      <span className="text-[10px] text-slate-500 block">{label}</span>
      <span className="text-xs text-slate-200">{value}</span>
    </div>
  );
}

function PalaceCell({ palace, isMingGong, isShenGong }: {
  palace: ZiweiPalace;
  isMingGong: boolean;
  isShenGong: boolean;
  mingGongZhi: string;
}) {
  return (
    <div className={`bg-dark-card border rounded-lg p-2 min-h-[120px] overflow-hidden ${
      isMingGong ? 'border-gold/50 ring-1 ring-gold/20' : 'border-dark-border'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[10px] font-bold ${isMingGong ? 'text-gold' : 'text-slate-400'}`}>
          {palace.name}
          <span className="opacity-60 ml-0.5">({toHangul(palace.name)})</span>
        </span>
        {isShenGong && (
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
            신궁
          </span>
        )}
      </div>

      {/* GanZhi */}
      <div className="text-[10px] text-slate-500 mb-1.5">
        {palace.ganZhi} ({toHangul(palace.ganZhi)})
      </div>

      {/* Stars */}
      <div className="space-y-0.5">
        {palace.stars.slice(0, 6).map((star: ZiweiStar, i: number) => (
          <StarBadge key={`${star.name}-${i}`} star={star} />
        ))}
        {palace.stars.length > 6 && (
          <span className="text-[8px] text-slate-600">+{palace.stars.length - 6}...</span>
        )}
      </div>
    </div>
  );
}

function PalaceMobileCard({ palace, isMingGong, isShenGong }: {
  palace: ZiweiPalace;
  isMingGong: boolean;
  isShenGong: boolean;
}) {
  return (
    <div className={`bg-dark-card border rounded-xl p-3 ${
      isMingGong ? 'border-gold/50 ring-1 ring-gold/20' : 'border-dark-border'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${isMingGong ? 'text-gold' : 'text-slate-200'}`}>
            {palace.name} ({toHangul(palace.name)})
          </span>
          {isShenGong && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              신궁
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500">{palace.ganZhi} ({toHangul(palace.ganZhi)})</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {palace.stars.map((star: ZiweiStar, i: number) => (
          <StarBadge key={`${star.name}-${i}`} star={star} />
        ))}
      </div>
    </div>
  );
}

function StarBadge({ star }: { star: ZiweiStar }) {
  // 밝기 색상
  const brightnessColor: Record<string, string> = {
    '廟': 'text-yellow-400',
    '旺': 'text-orange-400',
    '得': 'text-green-400',
    '利': 'text-blue-400',
    '平': 'text-slate-400',
    '不': 'text-red-400',
    '陷': 'text-red-500',
  };

  // 사화 색상
  const sihuaColor: Record<string, string> = {
    '化祿': 'bg-green-500/20 text-green-400',
    '化權': 'bg-orange-500/20 text-orange-400',
    '化科': 'bg-blue-500/20 text-blue-400',
    '化忌': 'bg-red-500/20 text-red-400',
  };

  const bColor = brightnessColor[star.brightness] ?? 'text-slate-400';

  return (
    <span className="inline-flex items-center gap-0.5 text-[10px]">
      <span className="text-slate-300">{star.name}</span>
      <span className="text-slate-500">({toHangul(star.name)})</span>
      {star.brightness && (
        <span className={`${bColor} font-medium`}>{star.brightness}</span>
      )}
      {star.siHua && (
        <span className={`px-1 rounded ${sihuaColor[star.siHua] ?? 'bg-slate-500/20 text-slate-400'}`}>
          {star.siHua}
        </span>
      )}
    </span>
  );
}
