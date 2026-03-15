import { useState } from 'react';
import type { SajuInput, ExtendedSaju } from '../types';
import { CHEONGAN_LIST, JIJI_LIST, analyzeSaju, isSajuComplete, OHENG_NAMES } from '../utils/saju';
import { parseSajuText } from '../utils/sajuParser';
import OhengRadar from './OhengRadar';

interface SajuInputSectionProps {
  saju: SajuInput;
  onSajuChange: (saju: SajuInput) => void;
  extendedSaju: ExtendedSaju | null;
  onExtendedSajuChange: (data: ExtendedSaju | null) => void;
}

const PILLAR_NAMES = [
  { key: 'year' as const, ko: '년주', hanja: '年柱' },
  { key: 'month' as const, ko: '월주', hanja: '月柱' },
  { key: 'day' as const, ko: '일주', hanja: '日柱' },
  { key: 'hour' as const, ko: '시주', hanja: '時柱' },
];

export default function SajuInputSection({ saju, onSajuChange, extendedSaju, onExtendedSajuChange }: SajuInputSectionProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [parseError, setParseError] = useState('');
  const [inputMode, setInputMode] = useState<'select' | 'paste'>(extendedSaju ? 'paste' : 'select');

  const handleChange = (pillar: keyof SajuInput, type: 'cheongan' | 'jiji', value: string) => {
    const updated = {
      ...saju,
      [pillar]: { ...saju[pillar], [type]: value },
    };
    onSajuChange(updated);
    onExtendedSajuChange(null); // 수동 변경 시 확장 데이터 초기화
    setShowAnalysis(false);
  };

  const handlePaste = () => {
    setParseError('');
    const result = parseSajuText(pasteText);

    if (!result) {
      setParseError('사주 데이터를 인식할 수 없습니다. 천간/지지가 포함된 텍스트를 붙여넣어 주세요.');
      return;
    }

    const { basic } = result;
    if (!isSajuComplete(basic)) {
      setParseError('사주팔자 8자를 모두 인식하지 못했습니다. 데이터 형식을 확인해 주세요.');
      return;
    }

    onSajuChange(basic);
    onExtendedSajuChange(result);
    setShowPasteModal(false);
    setShowAnalysis(true);
    setInputMode('paste');
  };

  const handleAnalyze = () => {
    setShowAnalysis(true);
  };

  const complete = isSajuComplete(saju);
  const distribution = complete ? analyzeSaju(saju) : null;

  return (
    <section id="saju-input" className="py-8 md:py-12">
      {/* Section Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-gold to-yellow-300 bg-clip-text text-transparent">
            사주팔자 입력
          </span>
        </h2>
        <p className="text-slate-400 text-sm">
          직접 선택하거나, 외부 사주 데이터를 붙여넣을 수 있습니다
        </p>
      </div>

      {/* Input Mode Toggle */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setInputMode('select')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            inputMode === 'select'
              ? 'bg-gold/20 text-gold border border-gold/30'
              : 'bg-dark-surface text-slate-400 border border-dark-border hover:text-slate-200'
          }`}
        >
          직접 선택
        </button>
        <button
          onClick={() => setShowPasteModal(true)}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            inputMode === 'paste'
              ? 'bg-gold/20 text-gold border border-gold/30'
              : 'bg-dark-surface text-slate-400 border border-dark-border hover:text-slate-200'
          }`}
        >
          📋 데이터 붙여넣기
        </button>
      </div>

      {/* Extended data badge */}
      {extendedSaju && (
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-medium">
              확장 데이터 적용 중
              {extendedSaju.gender && ` (${extendedSaju.gender === 'male' ? '남' : '여'})`}
              {extendedSaju.janggan && ' · 장간'}
              {extendedSaju.daeun && ' · 대운'}
              {extendedSaju.sinsal && ' · 신살'}
            </span>
            <button
              onClick={() => { onExtendedSajuChange(null); setInputMode('select'); }}
              className="text-green-500/50 hover:text-green-400 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 4 Pillars Input */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {PILLAR_NAMES.map(({ key, ko, hanja }) => {
          const cheonganOheng = CHEONGAN_LIST.find(c => c.name === saju[key].cheongan)?.oheng;
          const jijiOheng = JIJI_LIST.find(j => j.name === saju[key].jiji)?.oheng;
          const cheonganHanja = CHEONGAN_LIST.find(c => c.name === saju[key].cheongan)?.hanja;
          const jijiHanja = JIJI_LIST.find(j => j.name === saju[key].jiji)?.hanja;

          // 십신 정보
          const sipsinCg = extendedSaju?.sipsin?.[key]?.cheongan;
          const sipsinJj = extendedSaju?.sipsin?.[key]?.jiji;

          return (
            <div key={key} className="bg-dark-card border border-dark-border rounded-xl p-4">
              <div className="text-center mb-3">
                <span className="text-gold text-xs font-medium">{hanja}</span>
                <h3 className="text-sm font-bold text-slate-200">{ko}</h3>
                {/* 십신 표시 */}
                {sipsinCg && (
                  <span className="text-[10px] text-purple-400 block mt-0.5">{sipsinCg}</span>
                )}
              </div>

              {/* 천간 */}
              <div className="mb-2">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">천간</label>
                <select
                  value={saju[key].cheongan}
                  onChange={e => handleChange(key, 'cheongan', e.target.value)}
                  className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold/50 transition-colors appearance-none cursor-pointer"
                  style={cheonganOheng ? { borderLeftColor: OHENG_NAMES[cheonganOheng].color, borderLeftWidth: '3px' } : {}}
                >
                  <option value="">선택</option>
                  {CHEONGAN_LIST.map(c => (
                    <option key={c.name} value={c.name}>
                      {c.hanja} ({c.name}) - {OHENG_NAMES[c.oheng].hanja}
                    </option>
                  ))}
                </select>
                {cheonganHanja && cheonganOheng && (
                  <div className="flex items-center justify-between mt-1 px-1">
                    <span className="text-[10px] font-bold" style={{ color: OHENG_NAMES[cheonganOheng].color }}>
                      {cheonganHanja} {OHENG_NAMES[cheonganOheng].hanja}
                    </span>
                  </div>
                )}
              </div>

              {/* 지지 */}
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">지지</label>
                <select
                  value={saju[key].jiji}
                  onChange={e => handleChange(key, 'jiji', e.target.value)}
                  className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold/50 transition-colors appearance-none cursor-pointer"
                  style={jijiOheng ? { borderLeftColor: OHENG_NAMES[jijiOheng].color, borderLeftWidth: '3px' } : {}}
                >
                  <option value="">선택</option>
                  {JIJI_LIST.map(j => (
                    <option key={`${j.name}-${j.hanja}`} value={j.name}>
                      {j.hanja} ({j.name}) - {OHENG_NAMES[j.oheng].hanja}
                    </option>
                  ))}
                </select>
                {jijiHanja && jijiOheng && (
                  <div className="flex items-center justify-between mt-1 px-1">
                    <span className="text-[10px] font-bold" style={{ color: OHENG_NAMES[jijiOheng].color }}>
                      {jijiHanja} {OHENG_NAMES[jijiOheng].hanja}
                    </span>
                    {sipsinJj && (
                      <span className="text-[10px] text-purple-400">{sipsinJj}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Analyze Button */}
      <div className="text-center mb-8">
        <button
          onClick={handleAnalyze}
          disabled={!complete}
          className={`
            px-8 py-3 rounded-xl font-bold text-sm transition-all
            ${complete
              ? 'bg-gradient-to-r from-gold to-yellow-500 text-dark-bg hover:shadow-lg hover:shadow-gold/30 glow-gold cursor-pointer'
              : 'bg-dark-surface text-slate-600 cursor-not-allowed border border-dark-border'
            }
          `}
        >
          {complete ? '🔮 오행 분석하기' : '사주팔자 8자를 모두 선택해주세요'}
        </button>
      </div>

      {/* Analysis Result */}
      {showAnalysis && distribution && (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8">
          <h3 className="text-lg font-bold text-center text-gold mb-6">오행 분석 결과</h3>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <OhengRadar distribution={distribution} />

            <div className="flex-1 w-full max-w-xs space-y-3">
              {(['wood', 'fire', 'earth', 'metal', 'water'] as const).map(key => {
                const info = OHENG_NAMES[key];
                const val = distribution[key];
                const pct = (val / 8) * 100;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-16 text-right text-sm font-medium" style={{ color: info.color }}>
                      {info.hanja}({info.ko})
                    </span>
                    <div className="flex-1 h-6 bg-dark-surface rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: info.color }}
                      >
                        <span className="text-[10px] font-bold text-white">{val}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 용신 분석 */}
              <div className="mt-4 p-3 bg-dark-surface rounded-lg border border-dark-border">
                <p className="text-xs text-slate-400">
                  <span className="text-gold font-medium">용신(用神) 분석:</span>{' '}
                  {(() => {
                    const min = Math.min(...Object.values(distribution));
                    const weak = Object.entries(distribution)
                      .filter(([, v]) => v === min)
                      .map(([k]) => OHENG_NAMES[k as keyof typeof OHENG_NAMES].hanja);
                    return `부족한 오행은 ${weak.join(', ')}입니다. 이 오행의 번호에 가중치를 부여합니다.`;
                  })()}
                </p>
              </div>

              {/* 확장 데이터: 현재 대운 */}
              {extendedSaju?.daeun && (
                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <p className="text-xs text-purple-300">
                    <span className="font-medium">현재 대운:</span>{' '}
                    {(() => {
                      const currentYear = new Date().getFullYear();
                      const current = extendedSaju.daeun.find((d, i, arr) =>
                        currentYear >= d.year && (i === arr.length - 1 || currentYear < arr[i + 1].year)
                      );
                      return current
                        ? `${current.cheongan}${current.jiji} (${current.age}세~, ${current.year}년~)`
                        : '확인 불가';
                    })()}
                  </p>
                </div>
              )}

              {/* 확장 데이터: 신살 */}
              {extendedSaju?.sinsal && extendedSaju.sinsal.length > 0 && (
                <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <p className="text-xs text-amber-300">
                    <span className="font-medium">신살:</span>{' '}
                    {extendedSaju.sinsal.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!showAnalysis && !complete && (
        <div className="text-center py-8">
          <div className="text-5xl mb-4 opacity-30">☯️</div>
          <p className="text-slate-500 text-sm">
            사주팔자를 입력하면 당신의 오행 운명을 분석해 드립니다
          </p>
          <p className="text-slate-600 text-xs mt-2">
            외부 사주 앱에서 결과를 복사하여 붙여넣기 할 수도 있습니다
          </p>
        </div>
      )}

      {/* Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 max-w-lg w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-200">📋 사주 데이터 붙여넣기</h3>
              <button
                onClick={() => { setShowPasteModal(false); setParseError(''); }}
                className="text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              사주 앱이나 명리학 프로그램에서 복사한 텍스트를 아래에 붙여넣으세요.
              천간(天干)과 지지(地支)가 포함된 텍스트를 자동으로 인식합니다.
            </p>

            <div className="mb-3">
              <textarea
                value={pasteText}
                onChange={e => { setPasteText(e.target.value); setParseError(''); }}
                placeholder={`예시:\n四柱八字\n       時柱    日柱    月柱    年柱\n천간     戊      庚      己      乙\n지지     寅      申      卯      亥\n\n또는 간단히:\n乙亥 己卯 庚申 戊寅`}
                className="w-full h-48 bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-gold/50 resize-none font-mono"
              />
            </div>

            {parseError && (
              <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-xs text-red-400">{parseError}</p>
              </div>
            )}

            <div className="text-xs text-slate-500 mb-4 space-y-1">
              <p>지원하는 형식:</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                <li>천간/지지 행이 있는 테이블 형식</li>
                <li>年柱: 乙亥 형식</li>
                <li>한자 천간+지지 2자 연속 패턴 (예: 乙亥 己卯 庚申 戊寅)</li>
                <li>십신, 장간, 대운 정보도 자동 인식</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowPasteModal(false); setParseError(''); }}
                className="px-4 py-2 text-sm text-slate-400 border border-dark-border rounded-lg hover:bg-dark-surface transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handlePaste}
                disabled={!pasteText.trim()}
                className={`px-6 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  pasteText.trim()
                    ? 'bg-gradient-to-r from-gold to-yellow-500 text-dark-bg hover:shadow-lg'
                    : 'bg-dark-surface text-slate-600 cursor-not-allowed'
                }`}
              >
                분석하기
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
