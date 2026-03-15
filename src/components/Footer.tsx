export default function Footer() {
  return (
    <footer className="border-t border-dark-border py-6 mt-8">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-xs text-slate-500 mb-2">
          ※ 본 서비스는 순수 오락 목적으로 제작되었으며, 로또 당첨을 보장하거나 사행성을 조장하지 않습니다.
        </p>
        <p className="text-xs text-slate-600">
          사주팔자 기반 번호 생성은 전통 오행 이론을 참고한 것이며 과학적 근거가 있지 않습니다.
        </p>
        <p className="text-xs text-slate-700 mt-4">
          &copy; 2026 운명의 번호 · Destiny Numbers
        </p>
      </div>
    </footer>
  );
}
