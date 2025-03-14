// src/components/politicians/AllPoliticiansList.tsx
import React, { useEffect, useState } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { Politician } from "../../types";
import { useData } from "../../context/DataContext";
import PoliticianCard from "./PoliticianCard";
import SortDropdown from "../common/SortDropdown";
import PremiumBanner from "../common/PremiumBanner";
import InlineAdBanner from "../ads/InlineAdBanner";
import LoadingAnimation from "../common/LoadingAnimation";
import { fetchPoliticiansWithPagination } from "../../services/politicianService"; // Assume this service is implemented

const AllPoliticiansList: React.FC = () => {
  const { handleBackToPoliticians, sortMethod, getSortedPoliticians } =
    useData();

  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [lastDocumentId, setLastDocumentId] = useState<string | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 政治家読み込み関数
  const loadMorePoliticians = async () => {
    if (!isLoading && hasMore) {
      try {
        setIsLoading(true);
        const result = await fetchPoliticiansWithPagination(lastDocumentId);

        // マージソート方法を使用して新しく読み込んだ政治家をソート
        const newPoliticians = getSortedPoliticians([
          ...politicians,
          ...result.politicians,
        ]);

        setPoliticians(newPoliticians);
        setLastDocumentId(result.lastDocumentId);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error("政治家の読み込みに失敗しました:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 初回読み込み
  useEffect(() => {
    loadMorePoliticians();
  }, []);

  // スクロール検出
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
          document.documentElement.offsetHeight &&
        !isLoading &&
        hasMore
      ) {
        loadMorePoliticians();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastDocumentId, isLoading, hasMore]);

  return (
    <section className="space-y-4">
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

        {politicians.length > 0 ? (
          <div>
            {politicians.map((politician, index) => (
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

            {/* ローディング中のインジケーター */}
            {isLoading && (
              <div className="flex justify-center py-4">
                <LoadingAnimation
                  type="dots"
                  message="政治家を読み込んでいます"
                />
              </div>
            )}

            {/* すべての政治家を読み込んだ場合のメッセージ */}
            {!hasMore && (
              <div className="text-center py-4 text-gray-500 text-sm">
                すべての政治家を表示しました
              </div>
            )}
          </div>
        ) : (
          !isLoading && (
            <div className="p-8 text-center text-gray-500">
              表示できる政治家データがありません
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default AllPoliticiansList;
