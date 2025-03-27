// src/components/policies/PolicyCard.tsx
import React from "react";
import { FileText, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PolicyCardProps {
  policy: any;
  index: number;
}

const PolicyCard: React.FC<PolicyCardProps> = ({ policy, index }) => {
  const navigate = useNavigate();

  return (
    <div
      key={policy.id}
      className={`border-b border-gray-100 last:border-0 hover:bg-indigo-50/30 transition-colors ${
        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
      }`}
      onClick={() => navigate(`/policy/${policy.id}`)}
    >
      <div className="p-4 flex items-center">
        <div className="relative flex-shrink-0">
          <div
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white overflow-hidden"
            style={{
              backgroundColor: policy.proposingParty?.color || "#4F46E5",
            }}
          >
            {/* 政党画像を直接参照 */}
            <img
              src={`/cm_parly_images/${encodeURIComponent(
                policy.proposingParty?.name
              )}.jpg`}
              alt={policy.proposingParty?.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="ml-3 sm:ml-4 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base truncate">
              {policy.title}
            </h3>
          </div>

          <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
            {policy.proposingParty && (
              <>
                <span className="truncate">{policy.proposingParty.name}</span>
              </>
            )}
          </div>

          <div className="mt-2">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center">
                  <ThumbsUpIcon className="text-green-500 mr-1 flex-shrink-0" />
                  <span className="font-medium text-green-700">
                    {policy.supportRate}%
                  </span>
                </div>
                <div className="flex items-center">
                  <ThumbsDownIcon className="text-red-500 mr-1 flex-shrink-0" />
                  <span className="font-medium text-red-700">
                    {policy.opposeRate}%
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {policy.totalVotes?.toLocaleString()}票
              </span>
            </div>

            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden flex">
              <div
                className="h-full rounded-l-full"
                style={{
                  width: `${policy.supportRate}%`,
                  backgroundColor: "#10B981", // 緑色
                }}
              ></div>
              <div
                className="h-full rounded-r-full"
                style={{
                  width: `${policy.opposeRate}%`,
                  backgroundColor: "#EF4444", // 赤色
                }}
              ></div>
            </div>
          </div>
        </div>

        <ChevronRight size={18} className="text-gray-400 ml-2 flex-shrink-0" />
      </div>
    </div>
  );
};

// アイコンコンポーネント
const ThumbsUpIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

const ThumbsDownIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17 14V2" />
    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
  </svg>
);

export default PolicyCard;
