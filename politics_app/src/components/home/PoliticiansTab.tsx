// src/components/home/PoliticiansTab.tsx
import React, { useEffect, useState, useMemo } from "react";
import { Users, BarChart3, ChevronRight } from "lucide-react";
import { useData } from "../../context/DataContext";
import PoliticianCard from "../politicians/PoliticianCard";
import InlineAdBanner from "../ads/InlineAdBanner";
import PremiumBanner from "../common/PremiumBanner";
import LoadingAnimation from "../common/LoadingAnimation";
import { Politician } from "../../types";

const PoliticiansTab: React.FC = () => {
  const {
    globalPoliticians,
    dataInitialized,
    getSortedPoliticians,
    showAllPoliticiansList,
    handlePoliticianSelect,
  } = useData();

  const [loading, setLoading] = useState(true);

  // Use global data directly when initialized
  useEffect(() => {
    // Simply check if data is initialized
    if (dataInitialized) {
      setLoading(false);
    }
  }, [dataInitialized]);

  // Memoize sorted politicians to prevent unnecessary recomputation
  const topPoliticians = useMemo(() => {
    if (!globalPoliticians.length) return [];
    return getSortedPoliticians(globalPoliticians).slice(0, 3);
  }, [globalPoliticians, getSortedPoliticians]);

  // Memoize most active politicians
  const mostActivePoliticians = useMemo(() => {
    if (!globalPoliticians.length) return [];
    return [...globalPoliticians]
      .sort((a, b) => b.activity - a.activity)
      .slice(0, 3);
  }, [globalPoliticians]);

  // Skeleton loading display
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton: Premium banner */}
        <div className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>

        {/* Skeleton: Featured politicians card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="p-8 flex flex-col items-center justify-center">
            <LoadingAnimation
              type="spinner"
              message="政治家データを読み込んでいます"
            />
          </div>
        </div>

        {/* Skeleton: Activity ranking card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 p-4">
          <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="space-y-5">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse mr-3"></div>
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse mr-3"></div>
                <div className="flex-1">
                  <div className="w-full max-w-[180px] h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Premium banner */}
      <PremiumBanner />

      {/* Top politicians card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-fadeIn">
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
            onClick={() => showAllPoliticiansList()}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
          >
            全議員を見る
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>

        <div>
          {/* Display top politicians */}
          {topPoliticians.length > 0 ? (
            topPoliticians.map((politician, index) => (
              <PoliticianCard
                key={politician.id}
                politician={politician}
                index={index}
              />
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              データがありません
            </div>
          )}
        </div>

        {/* Ad banner */}
        <InlineAdBanner format="rectangle" showCloseButton={true} />
      </div>

      {/* Activity ranking card */}
      <div
        className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 p-4 animate-fadeIn"
        style={{ animationDelay: "0.2s" }}
      >
        <h2 className="text-lg font-bold text-gray-800 flex items-center mb-4">
          <BarChart3 size={18} className="mr-2 text-indigo-600" />
          活動指数ランキング
        </h2>
        <div className="space-y-4">
          {mostActivePoliticians.length > 0 ? (
            mostActivePoliticians.map((politician, index) => (
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
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              データがありません
            </div>
          )}

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
