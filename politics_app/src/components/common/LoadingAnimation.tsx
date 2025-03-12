// src/components/common/LoadingAnimation.tsx
import React from "react";

interface LoadingAnimationProps {
  message?: string;
  type?: "dots" | "spinner" | "pulse" | "bar";
  color?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  message = "データを読み込んでいます",
  type = "pulse",
  color = "#4361EE", // デフォルトカラー（indigo-600に近い色）
}) => {
  // ドットアニメーション
  const DotsAnimation = () => (
    <div className="flex space-x-2 justify-center items-center mb-3">
      {[1, 2, 3].map((_, index) => (
        <div
          key={index}
          className={`w-2.5 h-2.5 rounded-full animate-bounce`}
          // 少しずつ遅延を付ける
          style={{
            backgroundColor: color,
            animationDelay: `${index * 0.15}s`,
          }}
        ></div>
      ))}
    </div>
  );

  // スピナーアニメーション
  const SpinnerAnimation = () => (
    <div className="flex justify-center mb-3">
      <div
        className="w-10 h-10 border-4 rounded-full animate-spin mb-3"
        style={{
          borderColor: `${color} transparent transparent transparent`,
          animationDuration: "1s",
        }}
      ></div>
    </div>
  );

  // パルスアニメーション
  const PulseAnimation = () => (
    <div className="flex justify-center mb-3">
      <div className="relative w-16 h-16 mb-3">
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-75"
          style={{ backgroundColor: color }}
        ></div>
        <div
          className="relative rounded-full w-16 h-16 opacity-90"
          style={{ backgroundColor: color }}
        ></div>
      </div>
    </div>
  );

  // バーアニメーション
  const BarAnimation = () => (
    <div className="flex justify-center items-center mb-3">
      <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full animate-loadingBar"
          style={{
            backgroundColor: color,
            width: "30%",
          }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 rounded-lg">
      {/* アニメーションタイプに基づいて表示 */}
      {type === "dots" && <DotsAnimation />}
      {type === "spinner" && <SpinnerAnimation />}
      {type === "pulse" && <PulseAnimation />}
      {type === "bar" && <BarAnimation />}

      {/* メッセージ部分 */}
      <div className="text-center">
        <p className="text-gray-700 font-medium">
          {message}
          <span className="animate-ellipsis">...</span>
        </p>
      </div>
    </div>
  );
};

export default LoadingAnimation;
