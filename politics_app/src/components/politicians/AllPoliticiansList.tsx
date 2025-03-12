// src/components/politicians/AllPoliticiansList.tsx の一部を修正

import React, { useEffect, useState } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { useData } from "../../context/DataContext";
import PoliticianCard from "./PoliticianCard";
import SortDropdown from "../common/SortDropdown";
import PremiumBanner from "../common/PremiumBanner";
import InlineAdBanner from "../ads/InlineAdBanner";
import LoadingAnimation from "../common/LoadingAnimation"; // ローディングアニメーションをインポート
import { processPoliticiansData } from "../../utils/dataUtils";
import { Politician } from "../../types";

const AllPoliticiansList: React.FC = () => {
  const { handleBackToPoliticians, getSortedPoliticians, selectedPolitician } =
    useData();

  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // バックエンドAPIの代わりにJSONファイルからデータを読み込む
    const loadPoliticians = () => {
      try {
        setLoading(true);
        // 意図的に少し遅延を入れてローディングアニメーションを表示（実際の環境では不要）
        setTimeout(() => {
          const data = processPoliticiansData();
          setPoliticians(data);
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error("政治家データの読み込みに失敗しました:", error);
        setLoading(false);
      }
    };

    loadPoliticians();
  }, []);

  // Get sorted politicians based on the current sort method
  const sortedPoliticians = getSortedPoliticians(politicians);

  // モダンなローディング表示に変更
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px] bg-white rounded-lg shadow-sm p-6">
        <LoadingAnimation
          type="spinner"
          message="政治家データを読み込んでいます"
          color="#4361EE"
        />
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {/* 以下は元のコード */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={handleBackToPoliticians}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>戻る</span>
        </button>

        {/* Sort dropdown */}
        <SortDropdown dropdownId="sort-dropdown" />
      </div>

      {/* Premium banner */}
      <PremiumBanner />

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <Users size={18} className="mr-2 text-indigo-600" />
            全政治家一覧
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            評価順に並べ替えてランキング表示
          </p>
        </div>

        <div>
          {sortedPoliticians.map((politician, index) => (
            <React.Fragment key={politician.id}>
              <PoliticianCard politician={politician} index={index} />

              {/* Show ad after 3rd politician */}
              {index === 2 && (
                <div className="flex justify-center py-3 border-b border-gray-100">
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

export default AllPoliticiansList;
