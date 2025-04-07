// src/components/common/ScrollToTopButton.tsx
import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // モバイル判定とスクロール位置検出
  useEffect(() => {
    // モバイル判定
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px未満をモバイルとみなす
    };

    // スクロール位置の検出
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };

    // 初期チェック
    checkIfMobile();
    handleScroll();

    // イベントリスナーを設定
    window.addEventListener("resize", checkIfMobile);
    window.addEventListener("scroll", handleScroll);

    // クリーンアップ
    return () => {
      window.removeEventListener("resize", checkIfMobile);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // トップにスクロールする関数
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // モバイルでなければ、または表示条件を満たさなければ何も表示しない
  if (!isMobile || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        className="w-12 h-12 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 rounded-full shadow-lg flex items-center justify-center text-white"
        onClick={scrollToTop}
        aria-label="ページトップへ戻る"
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
};

export default ScrollToTopButton;
