import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendIconProps {
  trend: string;
}

const TrendIcon: React.FC<TrendIconProps> = ({ trend }) => {
  if (trend === "up") {
    return (
      <div className="inline-flex items-center text-green-500">
        <TrendingUp size={14} className="flex-shrink-0" />
        <span className="ml-1 text-xs whitespace-nowrap">上昇中</span>
      </div>
    );
  } else if (trend === "down") {
    return (
      <div className="inline-flex items-center text-red-500">
        <TrendingDown size={14} className="flex-shrink-0" />
        <span className="ml-1 text-xs whitespace-nowrap">下降中</span>
      </div>
    );
  } else {
    // For "none" trend
    return (
      <div className="inline-flex items-center text-blue-500">
        <Minus size={14} className="flex-shrink-0" />
        <span className="ml-1 text-xs whitespace-nowrap">安定中</span>
      </div>
    );
  }
};

export default TrendIcon;
