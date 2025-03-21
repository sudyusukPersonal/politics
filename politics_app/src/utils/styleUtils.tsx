// src/utils/styleUtils.ts
import { LucideIcon } from "lucide-react";

// 政党カラーに基づくスタイル生成関数
export const getPartyColorStyles = (color: string) => {
  // カラーに透明度を付けたり、微妙に異なる色合いを作成
  const lighterColor = color.replace(/^#/, "");
  const r = parseInt(lighterColor.substr(0, 2), 16);
  const g = parseInt(lighterColor.substr(2, 2), 16);
  const b = parseInt(lighterColor.substr(4, 2), 16);

  // 明るい色と暗めの色を生成する
  const lighter = `rgba(${Math.min(r + 20, 255)}, ${Math.min(
    g + 20,
    255
  )}, ${Math.min(b + 20, 255)}, 1)`;
  const darker = `rgba(${Math.max(r - 50, 0)}, ${Math.max(
    g - 50,
    0
  )}, ${Math.max(b - 50, 0)}, 1)`;

  return {
    mainColor: color,
    gradient: `from-[${color}] via-[${lighter}] to-[${darker}]`,
    heroBg: `linear-gradient(to bottom right, ${darker}, ${color}, ${darker})`,
    lightBg: `${color}10`,
    mediumBg: `${color}20`,
    borderColor: `${color}30`,
    textColor: `${color}`,
    lightGradient: `linear-gradient(to right, ${color}10, ${lighter}10)`,
  };
};

// 共通のCSSアニメーション定義
export const commonAnimations = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes expand {
    from { width: 0%; }
    to { width: 100%; }
  }
  
  @keyframes pulse-subtle {
    0% { opacity: 0.7; }
    50% { opacity: 1; }
    100% { opacity: 0.7; }
  }
  
  @keyframes gradient-slide {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  }
  
  @keyframes highlight-pulse {
    0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
    100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
  }
  
  .animate-expand {
    animation: expand 1s ease-out forwards;
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
  
  .animate-slideUp {
    animation: slideUp 0.5s ease-out forwards;
  }
  
  .animate-pulse-subtle {
    animation: pulse-subtle 2s infinite;
  }
  
  .comment-highlight {
    animation: highlight-pulse 2s 1;
    scroll-margin-top: 80px;
  }
`;

// 共通のボタンスタイル
export const buttonStyles = {
  primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
  support: "bg-green-500 hover:bg-green-600 text-white",
  oppose: "bg-red-500 hover:bg-red-600 text-white",
  neutral: "bg-gray-200 hover:bg-gray-300 text-gray-800",
  outline: "border border-gray-300 hover:bg-gray-100 text-gray-700",
  base: "py-2 px-4 rounded-lg transition font-medium focus:outline-none focus:ring-2 focus:ring-offset-2",
};

// アイコン付きのボタンを作成する関数
export const createIconButton = (
  text: string,
  styleType: keyof typeof buttonStyles,
  Icon?: React.ElementType,
  iconPosition: "left" | "right" = "left"
) => {
  const className = `${buttonStyles.base} ${buttonStyles[styleType]} flex items-center justify-center`;

  return (
    <button className={className}>
      {Icon && iconPosition === "left" && <Icon size={16} className="mr-2" />}
      {text}
      {Icon && iconPosition === "right" && <Icon size={16} className="ml-2" />}
    </button>
  );
};

// 投票率の進捗バーコンポーネント用のスタイル
export const ratingBarStyles = {
  supportBarClass:
    "bg-green-500 h-full rounded-l-full transition-all duration-700 ease-in-out",
  opposeBarClass:
    "bg-red-500 h-full rounded-r-full transition-all duration-700 ease-in-out",
  containerClass:
    "w-full h-3 bg-gray-200 rounded-full overflow-hidden flex my-3",
};

// スタイル定義を分類してオブジェクトとして提供
export const styles = {
  cards: {
    base: "bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100",
    innerSection: "p-5 border-b border-gray-100",
    sectionTitle: "font-bold text-gray-800 mb-3",
  },
  gradients: {
    indigo: "bg-gradient-to-r from-indigo-600 to-indigo-800",
    green: "bg-gradient-to-r from-green-500 to-emerald-600",
    red: "bg-gradient-to-r from-red-500 to-rose-600",
    gray: "bg-gradient-to-r from-gray-50 to-gray-100",
  },
};

// 共通のコメントスタイル
export const commentStyles = {
  likeButton: (isLiked: boolean) =>
    `flex items-center text-xs ${
      isLiked
        ? "bg-indigo-100 text-indigo-600 cursor-default"
        : "bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
    } px-2 py-1 rounded-full shadow-sm transition`,
  commentBase: (highlighted: boolean, type: string) =>
    `rounded-xl p-4 border transition duration-500 ${
      highlighted
        ? type === "support"
          ? "bg-green-100 border-green-300 shadow-md animate-pulse"
          : "bg-red-100 border-red-300 shadow-md animate-pulse"
        : type === "support"
        ? "bg-green-50 border-green-100 hover:shadow-md"
        : "bg-red-50 border-red-100 hover:shadow-md"
    }`,
};
