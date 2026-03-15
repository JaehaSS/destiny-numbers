interface HeaderProps {
  activeTab: 'home' | 'history';
  onTabChange: (tab: 'home' | 'history') => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-dark-bg/80 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onTabChange('home')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl">🔮</span>
          <h1 className="text-lg font-bold bg-gradient-to-r from-gold to-yellow-300 bg-clip-text text-transparent">
            운명의 번호
          </h1>
        </button>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => onTabChange('home')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'home'
                ? 'bg-gold/20 text-gold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-dark-surface'
            }`}
          >
            홈
          </button>
          <button
            onClick={() => onTabChange('history')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-gold/20 text-gold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-dark-surface'
            }`}
          >
            이력
          </button>
        </nav>
      </div>
    </header>
  );
}
