// src/components/politicians/AllPoliticiansList.tsx
import React, { useEffect, useState } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Politician } from "../../types";
import { useData } from "../../context/DataContext";
import PoliticianCard from "./PoliticianCard";
import SortDropdown from "../common/SortDropdown";
import PremiumBanner from "../common/PremiumBanner";
import InlineAdBanner from "../ads/InlineAdBanner";
import LoadingAnimation from "../common/LoadingAnimation";
import { fetchPoliticiansWithPagination } from "../../services/politicianService";

const AllPoliticiansList: React.FC = () => {
  const { handleBackToPoliticians, sortMethod, getSortedPoliticians } =
    useData();

  // ルーターのフック
  const navigate = useNavigate();
  const location = useLocation();

  // URLクエリパラメータからページ番号を取得
  const getPageFromUrl = (): number => {
    const searchParams = new URLSearchParams(location.search);
    const pageParam = searchParams.get("page");

    if (pageParam) {
      const pageNumber = parseInt(pageParam, 10);
      if (!isNaN(pageNumber) && pageNumber > 0) {
        return pageNumber;
      }
    }

    return 1;
  };

  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [lastDocumentId, setLastDocumentId] = useState<string | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(getPageFromUrl());

  // 政治家読み込み関数
  const loadMorePoliticians = async () => {
    if (!isLoading && hasMore) {
      try {
        setIsLoading(true);

        // 次のページ番号を計算
        const nextPage = currentPage + 1;

        const result = await fetchPoliticiansWithPagination(
          lastDocumentId,
          15,
          nextPage
        );

        // 無限スクロールのため、新しい政治家を既存のリストに追加
        setPoliticians((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNewPoliticians = result.politicians.filter(
            (p) => !existingIds.has(p.id)
          );
          return [...prev, ...uniqueNewPoliticians];
        });

        setLastDocumentId(result.lastDocumentId);
        setHasMore(result.hasMore);
        setCurrentPage(nextPage);

        // URLを更新（現在のURLを置き換える）
        navigate(`/politicians?page=${nextPage}`, { replace: true });
      } catch (error) {
        console.error("政治家の読み込みに失敗しました:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // URLのページパラメータが変わったときに再読み込み
  useEffect(() => {
    const urlPage = getPageFromUrl();
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
  }, [location.search]);

  // 初回読み込み
  useEffect(() => {
    const initialLoad = async () => {
      const urlPage = getPageFromUrl();
      const hasPageParam = location.search.includes("page=");

      // 初回読み込み時はURL操作をしない
      // パラメータが既にある場合のみそのページを読み込む
      setIsLoading(true);

      try {
        if (hasPageParam && urlPage > 1) {
          // URLに指定されたページまで、必要なデータを全て読み込む
          let tempLastDocId: string | undefined = undefined;
          let allPoliticians: Politician[] = [];

          for (let i = 1; i <= urlPage; i++) {
            const result = await fetchPoliticiansWithPagination(
              tempLastDocId,
              15,
              i
            );

            // 全ページのデータを蓄積
            allPoliticians = [...allPoliticians, ...result.politicians];
            tempLastDocId = result.lastDocumentId;

            // 最後のページの状態を設定
            if (i === urlPage) {
              setPoliticians(allPoliticians);
              setLastDocumentId(result.lastDocumentId);
              setHasMore(result.hasMore);
              setCurrentPage(i);
            }

            // データがない場合は中断
            if (!result.hasMore) {
              setHasMore(false);
              break;
            }
          }
        } else {
          // パラメータがない場合またはpage=1の場合は最初のページだけ読み込む
          const result = await fetchPoliticiansWithPagination(undefined, 15, 1);
          setPoliticians(result.politicians);
          setLastDocumentId(result.lastDocumentId);
          setHasMore(result.hasMore);
          setCurrentPage(1);

          // もしURLにパラメータがある場合でpage=1なら、それをクリア
          if (hasPageParam && urlPage === 1) {
            navigate("/politicians", { replace: true });
          }
        }
      } catch (error) {
        console.error("初期データの読み込みに失敗しました:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialLoad();
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
            {politicians.map((politician, index) => {
              const uniqueKey = `${politician.id}-${index}`;

              return (
                <React.Fragment key={uniqueKey}>
                  <PoliticianCard politician={politician} index={index} />

                  {/* Show ad after 3rd politician */}
                  {index === 2 && (
                    <div className="flex justify-center py-3 border-b border-gray-100">
                      <InlineAdBanner
                        format="rectangle"
                        showCloseButton={true}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}

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
