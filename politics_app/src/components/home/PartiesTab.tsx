// src/components/home/PartiesTab.tsx
import React, { useEffect, useState } from "react";
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
import LoadingAnimation from "../common/LoadingAnimation"; // ローディングアニメーションをインポート
import { processPartiesData } from "../../utils/dataUtils";
import { Party } from "../../types";

const PartiesTab: React.FC = () => {
  const { getPoliticiansByParty, handlePartySelect } = useData();

  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // バックエンドAPIの代わりにJSONファイルからデータを読み込む
    const loadParties = () => {
      try {
        setLoading(true);
        // スケルトンローディング用の遅延（実際の環境では不要）
        setTimeout(() => {
          const data = processPartiesData();
          setParties(data);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("政党データの読み込みに失敗しました:", error);
        setLoading(false);
      }
    };

    loadParties();
  }, []);

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
          {parties.map((party, index) => (
            <React.Fragment key={party.id}>
              <div
                className="relative hover:bg-gray-50 p-2 rounded-lg transition cursor-pointer"
                onClick={() => handlePartySelect(party)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span
                      className="w-4 h-4 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: party.color }}
                    ></span>
                    <span className="font-bold truncate">{party.name}</span>
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
                        {party.supportRate}%
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
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex mb-2">
                  <div
                    className="h-full rounded-l-full transition-width duration-1000 ease-in-out"
                    style={{
                      width: `${party.supportRate}%`,
                      backgroundColor: "#10B981",
                    }}
                  ></div>
                  <div
                    className="h-full rounded-r-full transition-width duration-1000 ease-in-out"
                    style={{
                      width: `${party.opposeRate}%`,
                      backgroundColor: "#EF4444",
                    }}
                  ></div>
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
