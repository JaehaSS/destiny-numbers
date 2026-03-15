import type { GeneratedSet } from '../types';
import LottoBall from './LottoBall';
import AdBanner from './AdBanner';

interface HistorySectionProps {
  history: GeneratedSet[];
  onStartVerify: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export default function HistorySection({ history, onStartVerify, onDelete, onClearAll }: HistorySectionProps) {
  if (history.length === 0) {
    return (
      <section className="py-12">
        <div className="text-center">
          <div className="text-5xl mb-4 opacity-30">📋</div>
          <h2 className="text-xl font-bold text-slate-400 mb-2">아직 생성한 번호가 없습니다</h2>
          <p className="text-slate-500 text-sm">
            사주를 입력하고 운명의 번호를 뽑아보세요!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12">
      {/* Saju verification button */}
      <div className="mb-6 text-center">
        <button
          onClick={onStartVerify}
          className="px-6 py-2.5 rounded-xl text-sm font-medium bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 hover:border-purple-500/50 transition-all cursor-pointer"
        >
          📊 내 사주로 역대 당첨 시뮬레이션
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold">
          <span className="bg-gradient-to-r from-gold to-yellow-300 bg-clip-text text-transparent">
            생성 이력
          </span>
          <span className="text-sm text-slate-500 font-normal ml-2">
            ({history.length}건)
          </span>
        </h2>
        <button
          onClick={onClearAll}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors px-3 py-1 border border-dark-border rounded-lg hover:border-red-400/30 cursor-pointer"
        >
          전체 삭제
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* History list */}
        <div className="flex-1 space-y-3">
          {history.map((set, idx) => (
            <div key={set.id}>
              <div className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-dark-border/80 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs text-slate-500">
                      {new Date(set.timestamp).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onDelete(set.id)}
                      className="text-[10px] text-slate-400 hover:text-red-400 px-2 py-1 border border-dark-border rounded hover:border-red-400/30 transition-colors cursor-pointer"
                    >
                      삭제
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {set.numbers.map(n => (
                    <LottoBall key={n} number={n} size="sm" />
                  ))}
                </div>
              </div>

              {/* Inline ad every 5 items */}
              {(idx + 1) % 5 === 0 && idx < history.length - 1 && (
                <AdBanner type="inline" className="my-3" />
              )}
            </div>
          ))}
        </div>

        {/* Sidebar ad (desktop) */}
        <div className="hidden lg:block shrink-0">
          <div className="sticky top-20">
            <AdBanner type="sidebar" />
          </div>
        </div>
      </div>
    </section>
  );
}
