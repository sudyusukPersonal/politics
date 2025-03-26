// src/components/home/PartiesTab.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Users,
  Activity,
  ChevronRight,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import InlineAdBanner from "../ads/InlineAdBanner";
import PremiumBanner from "../common/PremiumBanner";
import LoadingAnimation from "../common/LoadingAnimation";
import { Party } from "../../types";

const PartiesTab: React.FC = () => {
  const {
    globalParties,
    dataInitialized,
    getPoliticiansByParty,
    handlePartySelect,
  } = useData();

  const [loading, setLoading] = useState(true);

  // グローバルデータが初期化されたらロード完了とみなす
  useEffect(() => {
    if (dataInitialized) {
      setLoading(false);
    }
  }, [dataInitialized]);

  // スケルトンローディング表示
  if (loading) {
    return (
      <div className="space-y-6">
        {/* スケルトン：プレミアムバナー */}
        <div className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>

        {/* スケルトン：政党カード */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="w-72 h-4 bg-gray-100 rounded animate-pulse"></div>
          </div>

          <div className="p-8 flex flex-col items-center justify-center">
            <LoadingAnimation
              type="bar"
              message="政党データを読み込んでいます"
            />
          </div>
        </div>
      </div>
    );
  }

  // 政党データが空の場合
  if (!globalParties.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <div className="text-indigo-500 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          政党データがありません
        </h3>
        <p className="mt-2 text-gray-600">
          政党情報を読み込めませんでした。再読み込みをお試しください。
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Premium banner */}
      <PremiumBanner />

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-fadeIn">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <TrendingUp size={18} className="mr-2 text-indigo-600" />
            政党支持率
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            市民による評価に基づく政党支持率
          </p>
        </div>

        <div className="p-4 space-y-6">
          {globalParties.map((party, index) => (
            <React.Fragment key={party.id}>
              <div
                className="relative hover:bg-gray-50 p-2 rounded-lg transition cursor-pointer"
                onClick={() => handlePartySelect(party)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <img
                        src={party.image}
                        alt={party.name}
                        className="w-6 h-6 rounded-full mr-2 flex-shrink-0 object-cover border"
                        style={{ borderColor: party.color }}
                        onError={(e) => {
                          // エラー時に元の色付き円に戻す
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <span className="font-bold truncate">{party.name}</span>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-400 flex-shrink-0"
                  />
                </div>

                {/* Support/Oppose stats */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="flex items-center">
                      <ThumbsUp
                        size={14}
                        className="text-green-500 mr-1 flex-shrink-0"
                      />
                      <span className="font-medium text-green-700">
                        {party.supportRate}% %
                      </span>
                    </div>
                    <div className="flex items-center">
                      <ThumbsDown
                        size={14}
                        className="text-red-500 mr-1 flex-shrink-0"
                      />
                      <span className="font-medium text-red-700">
                        {party.opposeRate}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {party.totalVotes.toLocaleString()}票
                  </span>
                </div>

                {/* Progress bar with animation */}
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
                  {/* 支持率と不支持率の合計を計算 */}
                  {(() => {
                    return (
                      <>
                        <div
                          className="h-full rounded-l-full transition-all duration-700 ease-in-out"
                          style={{
                            width: `${party.supportRate}%`,
                            backgroundColor: "#10B981",
                          }}
                        ></div>
                        <div
                          className="h-full rounded-r-full transition-all duration-700 ease-in-out"
                          style={{
                            width: `${party.opposeRate}%`,
                            backgroundColor: "#EF4444",
                          }}
                        ></div>
                      </>
                    );
                  })()}
                </div>

                {/* Party details */}
                <div className="bg-gray-50 rounded-lg p-3 mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 mb-2">
                    <div className="flex items-center mb-1 sm:mb-0">
                      <Users size={12} className="mr-1 flex-shrink-0" />
                      <span>所属議員: {party.members}名</span>
                    </div>
                    <span className="flex items-center">
                      <Activity size={12} className="mr-1 flex-shrink-0" />
                      <span>政策数: {party.keyPolicies.length}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {party.keyPolicies.map((policy, i) => (
                      <span
                        key={i}
                        className="text-xs py-1 px-2 rounded-full bg-white border border-gray-200"
                        style={{ color: party.color }}
                      >
                        {policy}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ad after first party */}
              {index === 0 && (
                <div className="flex justify-center py-2">
                  <InlineAdBanner format="rectangle" showCloseButton={true} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartiesTab;
