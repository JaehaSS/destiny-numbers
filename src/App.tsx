import { useState, useCallback } from 'react';
import type { SajuInput, GeneratedSet, ExtendedSaju } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import AdBanner from './components/AdBanner';
import SajuInputSection from './components/SajuInputSection';
import LottoResultSection from './components/LottoResultSection';
import VerificationSection from './components/VerificationSection';
import HistorySection from './components/HistorySection';
import Footer from './components/Footer';

const EMPTY_SAJU: SajuInput = {
  year: { cheongan: '', jiji: '' },
  month: { cheongan: '', jiji: '' },
  day: { cheongan: '', jiji: '' },
  hour: { cheongan: '', jiji: '' },
};

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'history'>('home');
  const [saju, setSaju] = useLocalStorage<SajuInput>('destiny-saju', EMPTY_SAJU);
  const [extendedSaju, setExtendedSaju] = useLocalStorage<ExtendedSaju | null>('destiny-extended', null);
  const [generatedSets, setGeneratedSets] = useState<GeneratedSet[]>([]);
  const [history, setHistory] = useLocalStorage<GeneratedSet[]>('destiny-history', []);
  const [triggerVerify, setTriggerVerify] = useState(0);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const handleGenerate = useCallback((sets: GeneratedSet[]) => {
    setGeneratedSets(sets);

    setHistory(prev => {
      const updated = [...sets, ...prev];
      return updated.slice(0, 50);
    });
  }, [setHistory]);

  const handleStartVerify = useCallback(() => {
    setTriggerVerify(prev => prev + 1);
    setActiveTab('home');

    setTimeout(() => {
      document.getElementById('verification')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const handleDeleteHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(s => s.id !== id));
  }, [setHistory]);

  const handleClearAll = useCallback(() => {
    if (!showConfirmClear) {
      setShowConfirmClear(true);
      return;
    }
    setHistory([]);
    setShowConfirmClear(false);
  }, [showConfirmClear, setHistory]);

  return (
    <div className="min-h-screen pb-16 md:pb-24">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <AdBanner type="top" />

      <main className="max-w-4xl mx-auto px-4">
        {activeTab === 'home' ? (
          <>
            {/* Hero */}
            <div className="text-center pt-6 md:pt-10 pb-4">
              <div className="text-5xl md:text-6xl mb-3">🔮</div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
                운명의 번호
              </h1>
              <p className="text-slate-400 text-sm md:text-base">
                사주팔자의 오행으로 찾는 나만의 로또 번호
              </p>
            </div>

            {/* S-01: 사주 입력 & 오행 분석 */}
            <SajuInputSection
              saju={saju}
              onSajuChange={setSaju}
              extendedSaju={extendedSaju}
              onExtendedSajuChange={setExtendedSaju}
            />

            <AdBanner type="inline" />

            {/* S-02: 번호 생성 결과 */}
            <LottoResultSection
              saju={saju}
              extendedSaju={extendedSaju}
              onGenerate={handleGenerate}
              generatedSets={generatedSets}
              onStartVerify={handleStartVerify}
            />

            <AdBanner type="inline" />

            {/* S-03: 사주 기반 과거 당첨 검증 */}
            <VerificationSection
              saju={saju}
              extendedSaju={extendedSaju}
              triggerVerify={triggerVerify}
            />
          </>
        ) : (
          <HistorySection
            history={history}
            onStartVerify={handleStartVerify}
            onDelete={handleDeleteHistory}
            onClearAll={handleClearAll}
          />
        )}
      </main>

      <Footer />

      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-slate-200 mb-2">이력 전체 삭제</h3>
            <p className="text-sm text-slate-400 mb-6">
              모든 생성 이력이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 text-sm text-slate-400 border border-dark-border rounded-lg hover:bg-dark-surface transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-500 transition-colors cursor-pointer"
              >
                전체 삭제
              </button>
            </div>
          </div>
        </div>
      )}

      <AdBanner type="sticky" />
    </div>
  );
}

export default App;
