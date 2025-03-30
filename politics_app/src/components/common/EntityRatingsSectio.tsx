// src/components/common/EntityRatingsSection.tsx
import React from "react";
import { ThumbsUp, ThumbsDown, Activity, Eye } from "lucide-react";
import { ratingBarStyles } from "../../utils/styleUtils";

interface EntityRatingsSectionProps {
  supportRate: number;
  opposeRate: number;
  totalVotes: number;
  activity?: number;
  recentActivity?: string;
  customMetrics?: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
  }[];
}

/**
 * 政治家や政策の評価（支持率/不支持率）を表示する共通コンポーネント
 * PoliticianDetailとPolicyDetailで使用される市民評価セクションを統一
 */
const EntityRatingsSection: React.FC<EntityRatingsSectionProps> = ({
  supportRate,
  opposeRate,
  totalVotes,
  activity,
  recentActivity,
  customMetrics,
}) => {
  return (
    <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
        <h3 className="font-bold text-gray-700 mb-1 sm:mb-0">国民評価</h3>
        <span className="text-sm text-gray-500">
          総投票数: {totalVotes.toLocaleString()}
        </span>
      </div>

      {/* Support/Oppose stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-green-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ThumbsUp size={16} className="text-green-500 mr-2" />
              <span className="text-sm font-medium">支持</span>
            </div>
            <span className="text-xl font-bold text-green-600">
              {supportRate}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div
              className="h-full rounded-full bg-green-500"
              style={{ width: `${supportRate}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-sm border border-red-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ThumbsDown size={16} className="text-red-500 mr-2" />
              <span className="text-sm font-medium">不支持</span>
            </div>
            <span className="text-xl font-bold text-red-600">
              {opposeRate}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div
              className="h-full rounded-full bg-red-500"
              style={{ width: `${opposeRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Combined progress bar */}
      <div className={ratingBarStyles.containerClass}>
        <div
          className={ratingBarStyles.supportBarClass}
          style={{ width: `${supportRate}%` }}
        ></div>
        <div
          className={ratingBarStyles.opposeBarClass}
          style={{ width: `${opposeRate}%` }}
        ></div>
      </div>

      {/* Optional metrics (activity, recent activity, etc.) */}
      {(activity || recentActivity || customMetrics) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500">
          {recentActivity && (
            <span className="flex items-center mb-1 sm:mb-0">
              <Eye size={12} className="mr-1" />
              最近の活動: {recentActivity}
            </span>
          )}

          {activity && (
            <span className="flex items-center">
              <Activity size={12} className="mr-1" />
              活動指数: {activity}
            </span>
          )}

          {customMetrics &&
            customMetrics.map((metric, index) => (
              <span key={index} className="flex items-center mb-1 sm:mb-0">
                {metric.icon}
                {metric.label}: {metric.value}
              </span>
            ))}
        </div>
      )}
    </div>
  );
};

export default EntityRatingsSection;
