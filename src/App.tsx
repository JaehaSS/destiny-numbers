import { useState, useCallback, useEffect } from 'react';
import type { SajuInput, GeneratedSet, ExtendedSaju } from './types';
import type { SajuResult, ZiweiChart, NatalChart } from '@orrery/core';
import { calculateSaju, createChart, calculateNatal } from '@orrery/core';
import { useLocalStorage } from './hooks/useLocalStorage';
import { CHEONGAN_LIST, JIJI_LIST } from './utils/saju';
import Header from './components/Header';
import type { TabId } from './components/Header';
import AdBanner from './components/AdBanner';

import LottoResultSection from './components/LottoResultSection';
import VerificationSection from './components/VerificationSection';
import Footer from './components/Footer';
import BirthInput from './components/BirthInput';
import type { BirthData } from './components/BirthInput';
import SajuDetailTab from './components/SajuDetailTab';
import { buildSajuCopyText } from './components/SajuDetailTab';
import ZiweiTab from './components/ZiweiTab';
import { buildZiweiCopyText } from './components/ZiweiTab';
import NatalTab from './components/NatalTab';
import { buildNatalCopyText } from './components/NatalTab';

const EMPTY_SAJU: SajuInput = {
  year: { cheongan: '', jiji: '' },
  month: { cheongan: '', jiji: '' },
  day: { cheongan: '', jiji: '' },
  hour: { cheongan: '', jiji: '' },
};

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

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('lotto');
  const [saju, setSaju] = useLocalStorage<SajuInput>('destiny-saju', EMPTY_SAJU);
  const [extendedSaju] = useLocalStorage<ExtendedSaju | null>('destiny-extended', null);
  const [generatedSets, setGeneratedSets] = useState<GeneratedSet[]>([]);
  const [triggerVerify, setTriggerVerify] = useState(0);
  const [setCount, setSetCount] = useState(1);

  // @orrery/core results
  const [birthData, setBirthData] = useLocalStorage<BirthData | null>('destiny-birth', null);
  const [sajuResult, setSajuResult] = useState<SajuResult | null>(null);
  const [ziweiResult, setZiweiResult] = useState<ZiweiChart | null>(null);
  const [natalResult, setNatalResult] = useState<NatalChart | null>(null);
  const [natalLoading, setNatalLoading] = useState(false);
  const [natalError, setNatalError] = useState<string | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  const handleBirthSubmit = useCallback((data: BirthData) => {
    setBirthData(data);

    // Calculate saju
    try {
      const sr = calculateSaju({
        year: data.year,
        month: data.month,
        day: data.day,
        hour: data.hour,
        minute: data.minute,
        gender: data.gender,
      });
      setSajuResult(sr);

      // @orrery/core 결과 → 기존 SajuInput 자동 매핑 (로또 로직 연동)
      const pillarNames = ['year', 'month', 'day', 'hour'] as const;
      const mapped: SajuInput = { ...EMPTY_SAJU };
      sr.pillars.forEach((p: { pillar: { stem: string; branch: string } }, i: number) => {
        const stem = CHEONGAN_LIST.find(c => c.hanja === p.pillar.stem);
        const branch = JIJI_LIST.find(j => j.hanja === p.pillar.branch);
        if (stem && branch) {
          mapped[pillarNames[i]] = { cheongan: stem.name, jiji: branch.name };
        }
      });
      setSaju(mapped);
    } catch (e) {
      console.error('Saju calculation error:', e);
      setSajuResult(null);
    }

    // Calculate ziwei
    try {
      const zr = createChart(data.year, data.month, data.day, data.hour, data.minute, data.gender === 'M');
      setZiweiResult(zr);
    } catch (e) {
      console.error('Ziwei calculation error:', e);
      setZiweiResult(null);
    }

    // Calculate natal (async)
    setNatalLoading(true);
    setNatalError(null);
    calculateNatal({
      year: data.year,
      month: data.month,
      day: data.day,
      hour: data.hour,
      minute: data.minute,
      gender: data.gender,
      latitude: data.lat,
      longitude: data.lon,
    })
      .then(nr => {
        setNatalResult(nr);
        setNatalLoading(false);
      })
      .catch(e => {
        console.error('Natal calculation error:', e);
        setNatalError(e instanceof Error ? e.message : String(e));
        setNatalResult(null);
        setNatalLoading(false);
      });
  }, [setBirthData]);

  // Re-calculate on mount if birthData exists
  useEffect(() => {
    if (birthData && !sajuResult) {
      handleBirthSubmit(birthData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = useCallback((sets: GeneratedSet[]) => {
    setGeneratedSets(sets);
  }, []);

  const handleStartVerify = useCallback(() => {
    setTriggerVerify(prev => prev + 1);
    setActiveTab('lotto');

    setTimeout(() => {
      document.getElementById('verification')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const handleCopyAll = useCallback(() => {
    const parts: string[] = [];
    if (sajuResult) parts.push(buildSajuCopyText(sajuResult));
    if (ziweiResult) parts.push(buildZiweiCopyText(ziweiResult));
    if (natalResult) parts.push(buildNatalCopyText(natalResult));

    if (parts.length === 0) return;
    copyToClipboard(parts.join('\n\n---\n\n'));
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  }, [sajuResult, ziweiResult, natalResult]);

  const hasAnyResult = sajuResult || ziweiResult || natalResult;

  return (
    <div className="min-h-screen pb-16 md:pb-24">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <AdBanner type="top" />

      <main className="max-w-4xl mx-auto px-4">
        <BirthInput onSubmit={handleBirthSubmit} birthData={birthData} />

        {/* Copy All Button */}
        {hasAnyResult && (
          <div className="flex justify-center mb-4">
            <button
              onClick={handleCopyAll}
              className="px-5 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer bg-gold/10 text-gold border-gold/30 hover:bg-gold/20"
            >
              {allCopied ? '전체 복사 완료!' : 'AI 해석용 전부 복사 (사주 + 자미두수 + 출생차트)'}
            </button>
          </div>
        )}

        {/* Tab Contents */}
        {activeTab === 'lotto' && (
          <>
            {/* Hero */}
            <div className="text-center pt-2 md:pt-4 pb-4">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
                운명의 번호
              </h1>
              <p className="text-slate-400 text-sm md:text-base">
                사주팔자의 오행으로 찾는 나만의 로또 번호
              </p>
            </div>

            <AdBanner type="inline" />

            {/* S-02: 번호 생성 결과 */}
            <LottoResultSection
              saju={saju}
              extendedSaju={extendedSaju}
              onGenerate={handleGenerate}
              generatedSets={generatedSets}
              onStartVerify={handleStartVerify}
              setCount={setCount}
              onSetCountChange={setSetCount}
            />

            <AdBanner type="inline" />

            {/* S-03: 사주 기반 과거 당첨 검증 */}
            <VerificationSection
              saju={saju}
              extendedSaju={extendedSaju}
              triggerVerify={triggerVerify}
              setCount={setCount}
            />
          </>
        )}

        {activeTab === 'saju' && (
          <section className="py-6 md:py-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-gold to-yellow-300 bg-clip-text text-transparent">
                  사주팔자 상세 분석
                </span>
              </h2>
              <p className="text-slate-400 text-sm">
                4주, 대운, 합충형파해, 신살 분석
              </p>
            </div>

            {sajuResult ? (
              <SajuDetailTab result={sajuResult} />
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4 opacity-30">&#x2630;</div>
                <p className="text-slate-500 text-sm">생년월일시를 입력하고 "분석하기"를 눌러주세요</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'ziwei' && (
          <section className="py-6 md:py-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-gold to-yellow-300 bg-clip-text text-transparent">
                  자미두수 명반
                </span>
              </h2>
              <p className="text-slate-400 text-sm">
                12궁 배치, 성요 분석
              </p>
            </div>

            {ziweiResult ? (
              <ZiweiTab result={ziweiResult} />
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4 opacity-30">&#x2606;</div>
                <p className="text-slate-500 text-sm">생년월일시를 입력하고 "분석하기"를 눌러주세요</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'natal' && (
          <section className="py-6 md:py-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-gold to-yellow-300 bg-clip-text text-transparent">
                  출생차트 (Natal Chart)
                </span>
              </h2>
              <p className="text-slate-400 text-sm">
                행성 위치, 하우스, 애스펙트 분석
              </p>
            </div>

            <NatalTab result={natalResult} loading={natalLoading} error={natalError} />
          </section>
        )}

      </main>

      <Footer />

      <AdBanner type="sticky" />
    </div>
  );
}

export default App;
