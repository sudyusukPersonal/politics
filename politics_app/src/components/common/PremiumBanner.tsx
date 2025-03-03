import React, { useRef, useEffect } from "react";
import { Crown, XCircle } from "lucide-react";
import { useData } from "../../context/DataContext";

const PremiumBanner: React.FC = () => {
  const { showPremiumBanner, setShowPremiumBanner } = useData();
  const bannerRef = useRef<HTMLDivElement>(null);

  // Run once on mount to add the animation class
  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner) return;
    banner.classList.add("premium-reveal-animation");
  }, []);

  if (!showPremiumBanner) return null;

  return (
    <div
      ref={bannerRef}
      className="mb-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-lg shadow-md p-3 relative opacity-0"
    >
      <button
        onClick={() => setShowPremiumBanner(false)}
        className="absolute -top-2 -right-2 bg-white rounded-full shadow-md"
        aria-label="バナーを閉じる"
      >
        <XCircle size={16} className="text-amber-500" />
      </button>
      <div className="flex items-center">
        <div className="p-2 bg-white rounded-full">
          <Crown size={20} className="text-amber-500" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-white font-bold text-sm">
            プレミアム会員になると広告非表示
          </h3>
          <p className="text-white text-xs opacity-90 mt-0.5">
            月額¥500で全ての広告を非表示にできます
          </p>
        </div>
        <button className="bg-white text-amber-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-50 transition shadow-sm">
          詳細を見る
        </button>
      </div>
    </div>
  );
};

export default PremiumBanner;
