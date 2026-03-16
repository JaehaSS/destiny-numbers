export type TabId = 'lotto' | 'saju' | 'ziwei' | 'natal' | 'history';

interface HeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'lotto', label: '로또' },
  { id: 'saju', label: '사주' },
  { id: 'ziwei', label: '자미두수' },
  { id: 'natal', label: '출생차트' },
  { id: 'history', label: '이력' },
];

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-dark-bg/80 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-4xl mx-auto px-4">
        {/* Top row: Logo */}
        <div className="h-12 flex items-center justify-between">
          <button
            onClick={() => onTabChange('lotto')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">&#x1F52E;</span>
            <h1 className="text-lg font-bold bg-gradient-to-r from-gold to-yellow-300 bg-clip-text text-transparent">
              운명의 번호
            </h1>
          </button>
        </div>

        {/* Tab bar */}
        <nav className="flex items-center gap-0.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gold/20 text-gold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-dark-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
