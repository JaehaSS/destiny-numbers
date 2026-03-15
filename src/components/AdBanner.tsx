interface AdBannerProps {
  type: 'top' | 'inline' | 'sidebar' | 'sticky';
  className?: string;
}

const AD_SIZES = {
  top: { mobile: '320×100', desktop: '728×90' },
  inline: { mobile: '320×100', desktop: '728×90' },
  sidebar: { mobile: '300×250', desktop: '300×250' },
  sticky: { mobile: '320×50', desktop: '728×90' },
};

export default function AdBanner({ type, className = '' }: AdBannerProps) {
  const sizes = AD_SIZES[type];

  if (type === 'sticky') {
    return (
      <div className={`fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none py-1 md:py-2 ${className}`}>
        <div className="ad-slot rounded h-[50px] w-[320px] md:h-[90px] md:w-[728px] pointer-events-auto bg-dark-bg/95 backdrop-blur-sm border border-dark-border">
          <span className="text-xs text-slate-600">AD {sizes.mobile} / {sizes.desktop}</span>
        </div>
      </div>
    );
  }

  if (type === 'sidebar') {
    return (
      <div className={`hidden lg:block ${className}`}>
        <div className="ad-slot rounded-lg w-[300px] h-[250px]">
          <span className="text-xs text-slate-600">AD {sizes.desktop}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex justify-center my-4 md:my-6 ${className}`}>
      <div className="ad-slot rounded-lg h-[100px] w-[320px] md:h-[90px] md:w-[728px]">
        <span className="text-xs text-slate-600">AD {sizes.mobile} / {sizes.desktop}</span>
      </div>
    </div>
  );
}
