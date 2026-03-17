import { useState, useCallback } from 'react';
import type { SajuInput, GeneratedSet, ExtendedSaju } from '../types';
import { analyzeSaju, isSajuComplete } from '../utils/saju';
import { generateEnhancedLottoNumbers } from '../utils/lottoGenerator';
import LottoBall from './LottoBall';

interface LottoResultSectionProps {
  saju: SajuInput;
  extendedSaju: ExtendedSaju | null;
  onGenerate: (sets: GeneratedSet[]) => void;
  generatedSets: GeneratedSet[];
  onStartVerify: () => void;
  setCount: number;
  onSetCountChange: (count: number) => void;
}

export default function LottoResultSection({ saju, extendedSaju, onGenerate, generatedSets, onStartVerify, setCount, onSetCountChange }: LottoResultSectionProps) {
  const [animating, setAnimating] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const complete = isSajuComplete(saju);

  const handleGenerate = useCallback(() => {
    if (!complete) return;
    setAnimating(true);
    const dist = analyzeSaju(saju);

    const sets: GeneratedSet[] = Array.from({ length: setCount }, () => ({
      id: crypto.randomUUID(),
      numbers: generateEnhancedLottoNumbers(dist, extendedSaju),
      timestamp: Date.now(),
      saju: { ...saju },
      ohengDist: { ...dist },
    }));

    onGenerate(sets);
    setTimeout(() => setAnimating(false), 2000);
  }, [complete, saju, extendedSaju, setCount, onGenerate]);

  return (
    <section id="lotto-result" className="py-8 md:py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-gold to-yellow-300 bg-clip-text text-transparent">
            운명의 번호 생성
          </span>
        </h2>
        <p className="text-slate-400 text-sm">
          오행 가중치 알고리즘으로 당신만의 로또 번호를 추천합니다
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        {/* Set count */}
        <div className="flex items-center gap-2 bg-dark-card border border-dark-border rounded-xl px-4 py-2">
          <span className="text-sm text-slate-400">세트 수:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => onSetCountChange(n)}
                className={`w-8 h-8 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  setCount === n
                    ? 'bg-gold text-dark-bg'
                    : 'bg-dark-surface text-slate-400 hover:text-slate-200'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!complete || animating}
          className={`
            px-8 py-3 rounded-xl font-bold text-sm transition-all
            ${complete && !animating
              ? 'bg-gradient-to-r from-gold to-yellow-500 text-dark-bg hover:shadow-lg hover:shadow-gold/30 glow-gold cursor-pointer'
              : 'bg-dark-surface text-slate-600 cursor-not-allowed border border-dark-border'
            }
          `}
        >
          {animating ? '✨ 생성 중...' : '🎱 번호 생성하기'}
        </button>
      </div>

      {/* Generated Sets */}
      {generatedSets.length > 0 ? (
        <div className="space-y-4">
          {generatedSets.map((set, idx) => (
            <div
              key={set.id}
              className="bg-dark-card border border-dark-border rounded-2xl p-5 md:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gold font-medium">세트 {idx + 1}</span>
              </div>

              {/* Balls */}
              <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
                {set.numbers.map((num, i) => (
                  <LottoBall
                    key={num}
                    number={num}
                    size="lg"
                    animate={animating}
                    delay={i * 300}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Saju-based verification button */}
          <div className="text-center">
            <button
              onClick={onStartVerify}
              className="px-6 py-2.5 rounded-xl text-sm font-medium bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 hover:border-purple-500/50 transition-all cursor-pointer"
            >
              📊 내 사주로 역대 당첨 시뮬레이션
            </button>
            <p className="text-[10px] text-slate-600 mt-1">
              매 회차 날짜 + 사주 데이터로 고유 번호를 생성하여 비교합니다
            </p>
          </div>

          {/* Explanation toggle */}
          <div className="text-center">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-xs text-slate-500 hover:text-gold transition-colors cursor-pointer"
            >
              {showExplanation ? '▲ 설명 닫기' : '▼ 왜 이 번호인가요?'}
            </button>
          </div>

          {showExplanation && (
            <div className="bg-dark-card border border-dark-border rounded-xl p-4 text-xs text-slate-400 space-y-2">
              <p>
                <span className="text-gold font-medium">알고리즘 원리:</span>{' '}
                사주팔자 8자의 오행(木火土金水) 분포를 분석하여, 부족한 오행(용신)의 번호에 3배 가중치를 부여합니다.
              </p>
              {extendedSaju && (
                <p>
                  <span className="text-purple-400 font-medium">확장 분석:</span>{' '}
                  {extendedSaju.janggan && '장간(藏干) 오행 분포 반영 · '}
                  {extendedSaju.daeun && '현재 대운 오행 보너스 적용 · '}
                  심층 데이터로 더 정밀한 가중치를 계산합니다.
                </p>
              )}
              <p>
                <span className="text-gold font-medium">번호-오행 매핑:</span>{' '}
                끝자리 1,2→木 / 3,4→火 / 5,6→土 / 7,8→金 / 9,0→水
              </p>
              <p className="text-slate-500 italic">
                ※ 본 서비스는 오락 목적이며, 당첨을 보장하지 않습니다.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Empty state */
        <div className="text-center py-8">
          <div className="text-5xl mb-4 opacity-30">🎱</div>
          <p className="text-slate-500 text-sm">
            {complete
              ? '위의 "번호 생성하기" 버튼을 클릭하세요'
              : '먼저 사주팔자를 입력해주세요'}
          </p>
        </div>
      )}
    </section>
  );
}
