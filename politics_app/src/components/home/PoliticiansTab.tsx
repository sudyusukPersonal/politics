// src/components/home/PoliticiansTab.tsx
import React, { useEffect, useState } from "react";
import { Users, BarChart3, ChevronRight } from "lucide-react";
import { useData } from "../../context/DataContext";
import PoliticianCard from "../politicians/PoliticianCard";
import InlineAdBanner from "../ads/InlineAdBanner";
import PremiumBanner from "../common/PremiumBanner";
import { processPoliticiansData } from "../../utils/dataUtils"; // 新しいユーティリティをインポート
import { Politician } from "../../types";

const PoliticiansTab: React.FC = () => {
  const {
    getSortedPoliticians,
    showAllPoliticiansList,
    handlePoliticianSelect,
  } = useData();

  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // バックエンドAPIの代わりにJSONファイルからデータを読み込む
    const loadPoliticians = () => {
      try {
        setLoading(true);
        const data = processPoliticiansData();
        setPoliticians(data);
      } catch (error) {
        console.error("政治家データの読み込みに失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPoliticians();
  }, []);

  // 支持率順にトップの政治家を取得
  const topPoliticians = getSortedPoliticians(politicians).slice(0, 3);

  // 活動指数順に政治家を取得
  const mostActivePoliticians = [...politicians]
    .sort((a, b) => b.activity - a.activity)
    .slice(0, 3);

  if (loading) {
    return <div className="text-center py-4">データを読み込んでいます...</div>;
  }

  return (
    <section className="space-y-6">
      {/* Premium banner */}
      <PremiumBanner />

      {/* Top politicians card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <Users size={18} className="mr-2 text-indigo-600" />
              注目の政治家
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              市民による評価が高い政治家
            </p>
          </div>

          <button
            onClick={showAllPoliticiansList}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
          >
            全議員を見る
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>

        <div>
          {/* Display top politicians */}
          {topPoliticians.map((politician, index) => (
            <PoliticianCard
              key={politician.id}
              politician={politician}
              index={index}
            />
          ))}
        </div>

        {/* Ad banner */}
        <InlineAdBanner format="rectangle" showCloseButton={true} />
      </div>

      {/* Activity ranking card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 p-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center mb-4">
          <BarChart3 size={18} className="mr-2 text-indigo-600" />
          活動指数ランキング
        </h2>
        <div className="space-y-4">
          {mostActivePoliticians.map((politician, index) => (
            <div
              key={politician.id}
              className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
              onClick={() => handlePoliticianSelect(politician)}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-bold text-gray-700 mr-3 flex-shrink-0">
                {index + 1}
              </div>
              <img
                src={politician.image}
                alt={politician.name}
                className="w-10 h-10 rounded-full object-cover border border-gray-200 mr-3 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-sm truncate">
                    {politician.name}
                  </h3>
                  <span className="font-bold text-indigo-600 flex-shrink-0">
                    {politician.activity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="rounded-full h-full transition-all duration-500"
                    style={{
                      width: `${politician.activity}%`,
                      backgroundColor: politician.party.color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Sponsored content */}
          <div className="flex items-center p-2 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-500 mr-3 flex-shrink-0">
              <span className="text-xs">PR</span>
            </div>
            <img
              src="/api/placeholder/40/40"
              alt="広告"
              className="w-10 h-10 rounded-full object-cover border border-gray-200 mr-3 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <h3 className="font-medium text-sm truncate">
                  選挙・政治情報アプリ
                </h3>
              </div>
              <div className="text-xs text-gray-500 mt-0.5 truncate">
                政治に関する詳しい情報はこちらから
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PoliticiansTab;
