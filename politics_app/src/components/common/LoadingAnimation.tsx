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
  color = "#4361EE", // Default color (close to indigo-600)
}) => {
  // Modern dots animation
  const DotsAnimation = () => (
    <div className="flex space-x-2 justify-center items-center mb-4">
      {[1, 2, 3].map((_, index) => (
        <div
          key={index}
          className="w-3 h-3 rounded-full"
          style={{
            backgroundColor: color,
            animation: `bounce 1.4s infinite ease-in-out both`,
            animationDelay: `${index * 0.16}s`,
          }}
        ></div>
      ))}
    </div>
  );

  // Modern spinner animation
  const SpinnerAnimation = () => (
    <div className="flex justify-center mb-4">
      <div
        className="w-12 h-12 rounded-full"
        style={{
          borderWidth: "3px",
          borderStyle: "solid",
          borderColor: `${color} transparent ${color} transparent`,
          animation: "dual-ring 1.2s linear infinite",
        }}
      ></div>
    </div>
  );

  // Modern pulse animation with shadow
  const PulseAnimation = () => (
    <div className="flex justify-center mb-4">
      <div className="relative w-16 h-16">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: color,
            opacity: 0.3,
            animation: "pulse-shadow 1.5s ease-in-out infinite",
          }}
        ></div>
        <div
          className="relative rounded-full w-16 h-16 flex items-center justify-center"
          style={{
            backgroundColor: color,
            animation: "pulse-scale 1.5s ease-in-out infinite",
          }}
        >
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
      </div>
    </div>
  );

  // Modern bar animation with shimmer effect
  const BarAnimation = () => (
    <div className="flex justify-center items-center mb-4">
      <div className="relative w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white to-transparent"
          style={{ animation: "shimmer 1.5s infinite" }}
        ></div>
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            backgroundColor: color,
            width: "40%",
            animation: "indeterminate 1.5s infinite ease-in-out",
          }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 rounded-lg">
      {/* Animation based on type */}
      {type === "dots" && <DotsAnimation />}
      {type === "spinner" && <SpinnerAnimation />}
      {type === "pulse" && <PulseAnimation />}
      {type === "bar" && <BarAnimation />}

      {/* Message section with fixed width to prevent movement */}
      <div className="text-center h-6 flex items-center justify-center">
        <p className="text-gray-700 font-medium">{message}</p>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes dual-ring {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-shadow {
          0% {
            transform: scale(0.95);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.3;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.7;
          }
        }

        @keyframes pulse-scale {
          0% {
            transform: scale(0.85);
            opacity: 0.9;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0.85);
            opacity: 0.9;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes indeterminate {
          0% {
            left: -40%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation;
