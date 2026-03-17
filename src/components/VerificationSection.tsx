import { useState, useEffect } from 'react';
import type { SajuInput, ExtendedSaju, SajuVerificationResult } from '../types';
import { verifySajuBased } from '../utils/lottoData';
import { isSajuComplete } from '../utils/saju';
import LottoBall from './LottoBall';

interface VerificationSectionProps {
  saju: SajuInput;
  extendedSaju: ExtendedSaju | null;
  triggerVerify: number; // 변경될 때마다 검증 실행
  setCount: number;
}

const RANK_LABELS: Record<number, { label: string; color: string; emoji: string }> = {
  1: { label: '1등', color: 'text-yellow-400', emoji: '🏆' },
  2: { label: '2등', color: 'text-slate-300', emoji: '🥈' },
  3: { label: '3등', color: 'text-amber-600', emoji: '🥉' },
  4: { label: '4등', color: 'text-blue-400', emoji: '🎯' },
  5: { label: '5등', color: 'text-green-400', emoji: '✅' },
};

export default function VerificationSection({ saju, extendedSaju, triggerVerify, setCount }: VerificationSectionProps) {
  const [result, setResult] = useState<SajuVerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showDetail, setShowDetail] = useState(false);

  const complete = isSajuComplete(saju);

  useEffect(() => {
    if (triggerVerify === 0 || !complete) return;

    setLoading(true);
    setProgress(0);
    setResult(null);
    setShowDetail(false);

    // 프로그레스 시뮬레이션
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 20, 90));
    }, 150);

    // 약간의 딜레이 후 검증 실행 (UI 반응성)
    setTimeout(() => {
      const res = verifySajuBased(saju, extendedSaju, undefined, setCount);
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setResult(res);
        setLoading(false);
      }, 300);
    }, 500);

    return () => clearInterval(interval);
  }, [triggerVerify, saju, extendedSaju, complete]);

  if (triggerVerify === 0 && !result) return null;

  return (
    <section id="verification" className="py-8 md:py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-gold to-yellow-300 bg-clip-text text-transparent">
            사주 기반 과거 당첨 검증
          </span>
        </h2>
        <p className="text-slate-400 text-sm">
          매 회차 추첨일의 일진(日辰) + 내 사주로 번호를 생성하여 당첨 여부를 확인합니다
        </p>
        <p className="text-slate-500 text-xs mt-1">
          같은 사주 + 같은 날짜 = 항상 같은 번호 (결정적 알고리즘)
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
          <div className="text-center mb-4">
            <span className="text-sm text-slate-300">
              {Math.floor(progress * 12)}회차 분석 중... (회차별 번호 생성 + 비교)
            </span>
          </div>
          <div className="w-full h-3 bg-dark-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold to-yellow-400 rounded-full transition-all duration-300 progress-animated"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4">
          {/* Info banner */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
            <p className="text-xs text-purple-300">
              총 <span className="font-bold text-purple-200">{result.totalRounds}</span>회차 × 각 회차별 고유 번호 생성 완료
              {extendedSaju && ' (확장 데이터 반영)'}
            </p>
          </div>

          {/* Rank Summary Cards */}
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {[1, 2, 3, 4, 5].map(rank => {
              const info = RANK_LABELS[rank];
              const count = result.rankCounts[rank] || 0;
              return (
                <div
                  key={rank}
                  className={`bg-dark-card border rounded-xl p-3 text-center transition-all ${
                    count > 0 ? 'border-gold/50' : 'border-dark-border'
                  }`}
                >
                  <div className="text-lg md:text-xl mb-1">{info.emoji}</div>
                  <div className={`text-lg md:text-2xl font-bold ${count > 0 ? info.color : 'text-slate-600'}`}>
                    {count}
                  </div>
                  <div className="text-[10px] text-slate-500">{info.label}</div>
                </div>
              );
            })}
          </div>

          {/* Match Distribution */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5 md:p-6">
            <h3 className="text-sm font-bold text-slate-300 mb-4">일치 번호 분포</h3>
            <div className="space-y-2">
              {[6, 5, 4, 3, 2, 1, 0].map(count => {
                const rounds = result.distribution[count] || 0;
                const pct = (rounds / result.totalRounds) * 100;
                const isHighlight = count >= 3;
                return (
                  <div key={count} className="flex items-center gap-3">
                    <span className={`w-16 text-right text-xs font-medium ${isHighlight ? 'text-gold' : 'text-slate-500'}`}>
                      {count}개 일치
                    </span>
                    <div className="flex-1 h-5 bg-dark-surface rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          isHighlight
                            ? 'bg-gradient-to-r from-gold/80 to-yellow-400'
                            : 'bg-slate-700'
                        }`}
                        style={{ width: `${Math.max(pct, 0.5)}%` }}
                      />
                    </div>
                    <span className={`w-16 text-xs ${isHighlight ? 'text-gold font-bold' : 'text-slate-600'}`}>
                      {rounds}회차
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Best Match */}
          {result.bestMatch && result.bestMatch.matchCount >= 3 && (
            <div className="bg-gradient-to-r from-gold/10 to-yellow-500/10 border border-gold/30 rounded-2xl p-5 md:p-6">
              <h3 className="text-sm font-bold text-gold mb-3">
                🎯 가장 아까웠던 회차
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-slate-400">제 {result.bestMatch.round}회</span>
                  <span className="text-xs text-slate-500 ml-2">{result.bestMatch.date}</span>
                  {result.bestMatch.rank && (
                    <span className={`ml-2 text-xs font-bold ${RANK_LABELS[result.bestMatch.rank].color}`}>
                      {RANK_LABELS[result.bestMatch.rank].emoji} {RANK_LABELS[result.bestMatch.rank].label}
                    </span>
                  )}
                </div>

                {/* 생성된 번호 */}
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">그날 생성된 번호:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {result.bestMatch.generatedNumbers.map(n => (
                      <LottoBall
                        key={`gen-${n}`}
                        number={n}
                        size="sm"
                        highlighted={result.bestMatch!.matchedNumbers.includes(n)}
                      />
                    ))}
                  </div>
                </div>

                {/* 당첨 번호 */}
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">실제 당첨 번호:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {result.bestMatch.winningNumbers.map(n => (
                      <LottoBall
                        key={`win-${n}`}
                        number={n}
                        size="sm"
                        highlighted={result.bestMatch!.matchedNumbers.includes(n)}
                        dimmed={!result.bestMatch!.matchedNumbers.includes(n)}
                      />
                    ))}
                    <span className="text-slate-500 text-xs self-center mx-1">+</span>
                    <LottoBall
                      number={result.bestMatch.bonusNumber}
                      size="sm"
                      highlighted={result.bestMatch.bonusMatched}
                      dimmed={!result.bestMatch.bonusMatched}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  {result.bestMatch.matchCount}개 번호 일치
                  {result.bestMatch.bonusMatched ? ' + 보너스 일치!' : ''}
                </p>
              </div>
            </div>
          )}

          {/* No significant matches */}
          {result.bestMatch && result.bestMatch.matchCount < 3 && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3 opacity-50">🌙</div>
              <p className="text-slate-400 text-sm">
                아직 인연이 없었네요! 하지만 미래에는...
              </p>
              <p className="text-slate-500 text-xs mt-1">
                최대 {result.bestMatch.matchCount}개 일치가 가장 가까웠습니다
              </p>
            </div>
          )}

          {/* Detail toggle */}
          {result.matches.length > 0 && (
            <>
              <div className="text-center">
                <button
                  onClick={() => setShowDetail(!showDetail)}
                  className="text-xs text-slate-500 hover:text-gold transition-colors cursor-pointer"
                >
                  {showDetail ? '▲ 상세 목록 닫기' : `▼ 3개 이상 일치 회차 상세 보기 (${result.matches.length}건)`}
                </button>
              </div>

              {showDetail && (
                <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-dark-border bg-dark-surface">
                          <th className="px-3 py-2 text-left text-slate-400">회차</th>
                          <th className="px-3 py-2 text-left text-slate-400">날짜</th>
                          <th className="px-3 py-2 text-left text-slate-400">생성번호</th>
                          <th className="px-3 py-2 text-left text-slate-400">당첨번호</th>
                          <th className="px-3 py-2 text-center text-slate-400">일치</th>
                          <th className="px-3 py-2 text-center text-slate-400">등수</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.matches.slice(0, 30).map(m => (
                          <tr key={m.round} className="border-b border-dark-border/50 hover:bg-dark-surface/50">
                            <td className="px-3 py-2 text-slate-300">{m.round}</td>
                            <td className="px-3 py-2 text-slate-400">{m.date}</td>
                            <td className="px-3 py-2">
                              <div className="flex gap-0.5">
                                {m.generatedNumbers.map(n => (
                                  <span
                                    key={`g${n}`}
                                    className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                                      m.matchedNumbers.includes(n)
                                        ? 'bg-gold text-dark-bg'
                                        : 'bg-dark-surface text-slate-500'
                                    }`}
                                  >
                                    {n}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex gap-0.5">
                                {m.winningNumbers.map(n => (
                                  <span
                                    key={`w${n}`}
                                    className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                                      m.matchedNumbers.includes(n)
                                        ? 'bg-green-600 text-white'
                                        : 'bg-dark-surface text-slate-600'
                                    }`}
                                  >
                                    {n}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center text-gold font-bold">{m.matchCount}</td>
                            <td className="px-3 py-2 text-center">
                              {m.rank ? (
                                <span className={RANK_LABELS[m.rank].color}>
                                  {RANK_LABELS[m.rank].label}
                                </span>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {result.matches.length > 30 && (
                    <div className="px-3 py-2 text-center text-slate-500 text-xs border-t border-dark-border">
                      외 {result.matches.length - 30}건 더 있음
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Total info */}
          <div className="text-center">
            <p className="text-xs text-slate-600">
              총 {result.totalRounds}회차 · 회차별 사주+일진 기반 번호 생성 후 비교 (시뮬레이션)
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
