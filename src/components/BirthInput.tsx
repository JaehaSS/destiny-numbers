import { useState, useMemo } from 'react';
import { KOREAN_CITIES, SEOUL, filterCities, formatCityName } from '@orrery/core';
import type { City } from '@orrery/core';

export interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: 'M' | 'F';
  lat: number;
  lon: number;
  cityName: string;
}

interface BirthInputProps {
  onSubmit: (data: BirthData) => void;
  birthData: BirthData | null;
}

const currentYear = new Date().getFullYear();

export default function BirthInput({ onSubmit, birthData }: BirthInputProps) {
  const [year, setYear] = useState(birthData?.year ?? 1990);
  const [month, setMonth] = useState(birthData?.month ?? 1);
  const [day, setDay] = useState(birthData?.day ?? 1);
  const [hour, setHour] = useState(birthData?.hour ?? 12);
  const [minute, setMinute] = useState(birthData?.minute ?? 0);
  const [gender, setGender] = useState<'M' | 'F'>(birthData?.gender ?? 'M');
  const [selectedCity, setSelectedCity] = useState<City>(
    birthData ? { name: birthData.cityName, lat: birthData.lat, lon: birthData.lon } : SEOUL
  );
  const [cityQuery, setCityQuery] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [useCustomCoords, setUseCustomCoords] = useState(false);
  const [customLat, setCustomLat] = useState(birthData?.lat?.toString() ?? '37.5194');
  const [customLon, setCustomLon] = useState(birthData?.lon?.toString() ?? '127.0992');
  const [isCollapsed, setIsCollapsed] = useState(!!birthData);

  const filteredCities = useMemo(() => {
    if (!cityQuery.trim()) return [...KOREAN_CITIES].slice(0, 8);
    return filterCities(cityQuery);
  }, [cityQuery]);

  const daysInMonth = useMemo(() => {
    return new Date(year, month, 0).getDate();
  }, [year, month]);

  const handleSubmit = () => {
    const lat = useCustomCoords ? parseFloat(customLat) || SEOUL.lat : selectedCity.lat;
    const lon = useCustomCoords ? parseFloat(customLon) || SEOUL.lon : selectedCity.lon;
    const cityName = useCustomCoords
      ? `(${lat.toFixed(2)}, ${lon.toFixed(2)})`
      : formatCityName(selectedCity);

    const data: BirthData = {
      year, month, day, hour, minute, gender, lat, lon, cityName,
    };
    onSubmit(data);
    setIsCollapsed(true);
  };

  const selectClass = 'w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold/50 transition-colors appearance-none cursor-pointer';
  const labelClass = 'text-[10px] text-slate-500 uppercase tracking-wider mb-1 block';

  if (isCollapsed && birthData) {
    return (
      <section className="py-4">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-gold text-sm font-medium">
                {birthData.year}년 {birthData.month}월 {birthData.day}일 {String(birthData.hour).padStart(2, '0')}:{String(birthData.minute).padStart(2, '0')}
              </span>
              <span className="text-xs text-slate-400">
                {birthData.gender === 'M' ? '남' : '여'} / {birthData.cityName}
              </span>
            </div>
            <button
              onClick={() => setIsCollapsed(false)}
              className="px-3 py-1.5 text-xs text-slate-400 border border-dark-border rounded-lg hover:text-gold hover:border-gold/30 transition-colors cursor-pointer"
            >
              수정
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 md:py-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-gold to-yellow-300 bg-clip-text text-transparent">
            생년월일시 입력
          </span>
        </h2>
        <p className="text-slate-400 text-sm">
          사주, 자미두수, 출생차트 분석을 위한 정보를 입력하세요
        </p>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl p-5 md:p-6 space-y-5">
        {/* Date & Time Row */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {/* Year */}
          <div>
            <label className={labelClass}>년</label>
            <select value={year} onChange={e => setYear(Number(e.target.value))} className={selectClass}>
              {Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className={labelClass}>월</label>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className={selectClass}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
          </div>

          {/* Day */}
          <div>
            <label className={labelClass}>일</label>
            <select
              value={day > daysInMonth ? daysInMonth : day}
              onChange={e => setDay(Number(e.target.value))}
              className={selectClass}
            >
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{d}일</option>
              ))}
            </select>
          </div>

          {/* Hour */}
          <div>
            <label className={labelClass}>시</label>
            <select value={hour} onChange={e => setHour(Number(e.target.value))} className={selectClass}>
              {Array.from({ length: 24 }, (_, i) => i).map(h => (
                <option key={h} value={h}>{String(h).padStart(2, '0')}시</option>
              ))}
            </select>
          </div>

          {/* Minute */}
          <div>
            <label className={labelClass}>분</label>
            <select value={minute} onChange={e => setMinute(Number(e.target.value))} className={selectClass}>
              {Array.from({ length: 60 }, (_, i) => i).map(m => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}분</option>
              ))}
            </select>
          </div>
        </div>

        {/* Gender & City Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gender */}
          <div>
            <label className={labelClass}>성별</label>
            <div className="flex gap-2">
              {([['M', '남'], ['F', '여']] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setGender(val)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    gender === val
                      ? 'bg-gold/20 text-gold border border-gold/30'
                      : 'bg-dark-surface text-slate-400 border border-dark-border hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div>
            <label className={labelClass}>
              출생 도시
              <button
                onClick={() => setUseCustomCoords(!useCustomCoords)}
                className="ml-2 text-gold/60 hover:text-gold transition-colors cursor-pointer"
              >
                [{useCustomCoords ? '도시 선택' : '직접 입력'}]
              </button>
            </label>
            {useCustomCoords ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customLat}
                  onChange={e => setCustomLat(e.target.value)}
                  placeholder="위도"
                  step="0.01"
                  className="flex-1 bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold/50"
                />
                <input
                  type="number"
                  value={customLon}
                  onChange={e => setCustomLon(e.target.value)}
                  placeholder="경도"
                  step="0.01"
                  className="flex-1 bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold/50"
                />
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={cityQuery || formatCityName(selectedCity)}
                  onChange={e => { setCityQuery(e.target.value); setShowCityDropdown(true); }}
                  onFocus={() => { setCityQuery(''); setShowCityDropdown(true); }}
                  onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                  placeholder="도시 검색..."
                  className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold/50"
                />
                {showCityDropdown && filteredCities.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-dark-card border border-dark-border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                    {filteredCities.map((city, i) => (
                      <button
                        key={`${city.name}-${i}`}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => {
                          setSelectedCity(city);
                          setCityQuery('');
                          setShowCityDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-dark-surface hover:text-gold transition-colors cursor-pointer"
                      >
                        {formatCityName(city)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center pt-2">
          <button
            onClick={handleSubmit}
            className="px-8 py-3 rounded-xl font-bold text-sm transition-all bg-gradient-to-r from-gold to-yellow-500 text-dark-bg hover:shadow-lg hover:shadow-gold/30 glow-gold cursor-pointer"
          >
            분석하기
          </button>
        </div>
      </div>
    </section>
  );
}
