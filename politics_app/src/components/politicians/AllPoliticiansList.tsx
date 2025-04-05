// src/components/politicians/AllPoliticiansList.tsx
import React, { useEffect, useState } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Politician } from "../../types";
import PoliticianCard from "./PoliticianCard";
import SortDropdown from "../common/SortDropdown";
import PartyFilterDropdown from "../common/PartyFilterDropdown";
import PremiumBanner from "../common/PremiumBanner";
import InlineAdBanner from "../ads/InlineAdBanner";
import LoadingAnimation from "../common/LoadingAnimation";
import { fetchPoliticiansWithFilterAndSort } from "../../services/politicianService";

// アプリケーション側でデータを保持するための単一のグローバル変数
// Reactのレンダリングサイクルの外に保持するため、リロードされるまで維持される
const APP_STATE = {
  politicians: [] as Politician[],
  scrollPosition: 0,
  lastDocumentId: undefined as string | undefined,
  hasMore: true,
  sort: "",
  party: "",
};

const AllPoliticiansList: React.FC = () => {
  // Router hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Get URL parameters
  const getUrlParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      page: parseInt(searchParams.get("page") || "1", 10),
      sort: searchParams.get("sort") || "supportDesc",
      party: searchParams.get("party") || "all",
    };
  };

  // State
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [lastDocumentId, setLastDocumentId] = useState<string | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animateItems, setAnimateItems] = useState(true); // アニメーション状態の追加

  // Current filter/sort state
  const [currentPage, setCurrentPage] = useState(getUrlParams().page);
  const [currentSort, setCurrentSort] = useState(getUrlParams().sort);
  const [currentParty, setCurrentParty] = useState(getUrlParams().party);

  // アプリケーション状態にデータを保存
  const saveToAppState = (
    politicians: Politician[],
    lastDocId: string | undefined,
    hasMoreData: boolean,
    party: string,
    sort: string
  ) => {
    APP_STATE.politicians = politicians;
    APP_STATE.lastDocumentId = lastDocId;
    APP_STATE.hasMore = hasMoreData;
    APP_STATE.scrollPosition = window.scrollY;
    APP_STATE.sort = sort;
    APP_STATE.party = party;

    // APP_STATEの状態をテーブル形式でログ出力
    console.table({
      データ件数: APP_STATE.politicians.length,
      スクロール位置: APP_STATE.scrollPosition,
      ドキュメントID: APP_STATE.lastDocumentId,
      続きあり: APP_STATE.hasMore,
      ソート条件: APP_STATE.sort,
      政党フィルター: APP_STATE.party,
    });

    // 政治家データの最初の数件をテーブル形式で出力
    if (APP_STATE.politicians.length > 0) {
      console.log("政治家データサンプル:");
      console.table(
        APP_STATE.politicians.slice(0, 3).map((p) => ({
          id: p.id,
          name: p.name,
          party: p.party.name,
          support: p.supportRate,
        }))
      );
    }
  };

  // アプリケーション状態のリセット
  const resetAppState = () => {
    console.log("APP_STATEをリセットします");

    APP_STATE.politicians = [];
    APP_STATE.lastDocumentId = undefined;
    APP_STATE.hasMore = true;
    APP_STATE.scrollPosition = 0;
    APP_STATE.sort = "";
    APP_STATE.party = "";

    // リセット後の状態をログ出力
    console.table({
      データ件数: APP_STATE.politicians.length,
      スクロール位置: APP_STATE.scrollPosition,
      ドキュメントID: APP_STATE.lastDocumentId,
      続きあり: APP_STATE.hasMore,
      ソート条件: APP_STATE.sort,
      政党フィルター: APP_STATE.party,
    });
  };

  // Get display text for current filter
  const getFilterDisplayText = (): string => {
    if (currentParty === "all") {
      switch (currentSort) {
        case "supportDesc":
          return "全議員・支持率順（高い順）";
        case "supportAsc":
          return "全議員・支持率順（低い順）";
        case "totalVotesDesc":
          return "全議員・投票数順";
        case "commentCountDesc":
          return "全議員・コメント数順";
        default:
          return "全議員一覧";
      }
    } else {
      switch (currentSort) {
        case "supportDesc":
          return `${currentParty}・支持率順（高い順）`;
        case "supportAsc":
          return `${currentParty}・支持率順（低い順）`;
        case "totalVotesDesc":
          return `${currentParty}・投票数順`;
        case "commentCountDesc":
          return `${currentParty}・コメント数順`;
        default:
          return `${currentParty}所属議員一覧`;
      }
    }
  };

  // Update URL based on current filters
  const updateUrl = (page: number, sort: string, party: string) => {
    const url = `/politicians?page=${page}&sort=${sort}&party=${party}`;
    navigate(url, { replace: true });
  };

  // Handle party filter change
  const handlePartyFilterChange = (party: string) => {
    console.log(`Party filter changed to: ${party}`);
    setCurrentParty(party);
    // Reset to page 1 when filter changes
    updateUrl(1, currentSort, party);
    // Reset data and reload
    setPoliticians([]);
    setLastDocumentId(undefined);
    setHasMore(true);
    setCurrentPage(1);
    // アニメーションを再度有効化
    setAnimateItems(true);

    // アプリケーション状態をリセット（元の実装と同様に）
    resetAppState();

    loadPoliticians(1, currentSort, party, true);
  };

  // Handle sort change
  const handleSortChange = (sort: string) => {
    console.log(`Sort method changed to: ${sort}`);
    setCurrentSort(sort);
    // Reset to page 1 when sort changes
    updateUrl(1, sort, currentParty);
    // Reset data and reload
    setPoliticians([]);
    setLastDocumentId(undefined);
    setHasMore(true);
    setCurrentPage(1);
    // アニメーションを再度有効化
    setAnimateItems(true);

    // アプリケーション状態をリセット（元の実装と同様に）
    resetAppState();

    loadPoliticians(1, sort, currentParty, true);
  };

  // Load politicians with current filters
  const loadPoliticians = async (
    page: number,
    sort: string,
    party: string,
    refresh: boolean = false
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // If refresh is true, reset everything
      const docId = refresh ? undefined : lastDocumentId;

      console.log(
        `Loading politicians. Page: ${page}, Sort: ${sort}, Party: ${party}, LastDocId: ${
          docId || "none"
        }`
      );

      const result = await fetchPoliticiansWithFilterAndSort(
        party,
        sort,
        docId,
        15
      );

      let updatedPoliticians;

      if (refresh) {
        // Replace all politicians
        updatedPoliticians = result.politicians;
        setPoliticians(result.politicians);

        // アニメーションを一定時間後に無効化（アニメーション実行後）
        setTimeout(() => {
          setAnimateItems(false);
        }, 800); // アニメーションの時間より少し長めに設定
      } else {
        // Add to existing politicians (for infinite scroll)
        updatedPoliticians = [
          ...politicians,
          ...result.politicians.filter(
            (p) => !politicians.some((existing) => existing.id === p.id)
          ),
        ];

        setPoliticians(updatedPoliticians);
      }

      setLastDocumentId(result.lastDocumentId);
      setHasMore(result.hasMore);
      setCurrentPage(page);

      // アプリケーション状態を更新
      saveToAppState(
        updatedPoliticians,
        result.lastDocumentId,
        result.hasMore,
        party,
        sort
      );

      console.log(`Loaded ${result.politicians.length} politicians`);

      if (result.politicians.length === 0 && refresh) {
        console.log("No politicians found with current filters");
      }
    } catch (error) {
      console.error("Failed to load politicians:", error);
      setError(
        "政治家データの読み込みに失敗しました。もう一度お試しください。"
      );
      if (refresh) {
        setPoliticians([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load more politicians for infinite scroll
  const loadMorePoliticians = () => {
    if (!isLoading && hasMore) {
      setIsLoading(true); // 先にローディング状態にして、UI表示を即時反映

      // 意図的に読み込みを遅延させる（UXと過剰読み込み防止のため）
      setTimeout(() => {
        const nextPage = currentPage + 1;
        loadPoliticians(nextPage, currentSort, currentParty, false);
        // Update URL without triggering a reload
        updateUrl(nextPage, currentSort, currentParty);
      }, 300); // 0.3秒の読み込み遅延を設定
    }
  };

  // ブラウザバックでの状態復元用
  useEffect(() => {
    const params = getUrlParams();

    // 現在のURL条件をログ出力
    console.log("URLパラメータ:", params);

    // アプリケーション状態をログ出力
    console.table({
      データ件数: APP_STATE.politicians.length,
      スクロール位置: APP_STATE.scrollPosition,
      ドキュメントID: APP_STATE.lastDocumentId,
      続きあり: APP_STATE.hasMore,
      ソート条件: APP_STATE.sort,
      政党フィルター: APP_STATE.party,
      URL一致:
        APP_STATE.sort === params.sort && APP_STATE.party === params.party,
    });

    // アプリケーション状態とURLパラメータが一致する場合のみ復元
    if (
      APP_STATE.politicians.length > 0 &&
      APP_STATE.sort === params.sort &&
      APP_STATE.party === params.party
    ) {
      console.log("アプリケーション状態から復元します");
      setPoliticians(APP_STATE.politicians);
      setLastDocumentId(APP_STATE.lastDocumentId);
      setHasMore(APP_STATE.hasMore);
      setCurrentSort(params.sort);
      setCurrentParty(params.party);
      setAnimateItems(false); // アニメーションを無効化
      setIsLoading(false);

      // 少し遅延させてからスクロール位置を復元
      setTimeout(() => {
        window.scrollTo(0, APP_STATE.scrollPosition);
        console.log(`スクロール位置を復元: ${APP_STATE.scrollPosition}px`);
      }, 100);
    } else {
      // 保存データがない、または条件が変わった場合は通常ロード
      console.log("通常のデータロードを実行します");
      setAnimateItems(true);
      setCurrentSort(params.sort);
      setCurrentParty(params.party);
      setCurrentPage(params.page);
      loadPoliticians(params.page, params.sort, params.party, true);
    }
  }, []);

  // スクロール位置の保存と無限スクロール検知
  useEffect(() => {
    const handleScroll = () => {
      // スクロール位置の保存
      if (politicians.length > 0) {
        APP_STATE.scrollPosition = window.scrollY;

        // 100px毎にログ出力（頻繁すぎるログを避けるため）
        if (
          Math.floor(window.scrollY / 100) !==
          Math.floor(APP_STATE.scrollPosition / 100)
        ) {
          console.log(`スクロール位置: ${window.scrollY}px`);
        }
      }

      // 無限スクロール検知
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
          document.documentElement.offsetHeight &&
        !isLoading &&
        hasMore
      ) {
        console.log("画面下部に到達: 追加データをロードします");
        loadMorePoliticians();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [politicians, isLoading, hasMore]);

  // Watch for URL changes and reload data if needed
  useEffect(() => {
    const params = getUrlParams();
    console.log(
      `URL params changed: page=${params.page}, sort=${params.sort}, party=${params.party}`
    );

    if (params.sort !== currentSort || params.party !== currentParty) {
      console.log("Filter parameters changed, reloading data");
      console.table({
        変更前: { sort: currentSort, party: currentParty },
        変更後: { sort: params.sort, party: params.party },
      });

      setCurrentSort(params.sort);
      setCurrentParty(params.party);
      setPoliticians([]);
      setLastDocumentId(undefined);
      setHasMore(true);
      setCurrentPage(1);
      loadPoliticians(1, params.sort, params.party, true);

      // アプリケーション状態をリセット
      resetAppState();
    }
  }, [location.search]);
  return (
    <section className="space-y-4">
      <div className="flex justify-center space-x-2 mt-4">
        <PartyFilterDropdown
          currentFilter={currentParty}
          onFilterChange={handlePartyFilterChange}
        />
        <SortDropdown
          currentSort={currentSort}
          onSortChange={handleSortChange}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-fadeIn">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <Users size={18} className="mr-2 text-indigo-600" />
            全政治家一覧
          </h2>
          <p className="text-sm text-gray-500 mt-1">{getFilterDisplayText()}</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 border-b border-red-100">
            <p>{error}</p>
          </div>
        )}

        {politicians.length > 0 ? (
          <div>
            {politicians.map((politician, index) => {
              const uniqueKey = `${politician.id}-${index}`;
              // 順番にアニメーション表示するためのスタイル
              const animationStyle = animateItems
                ? {
                    animation: "fadeIn 0.3s ease-out forwards",
                    animationDelay: `${index * 0.05}s`,
                    opacity: 0, // 初期状態は非表示
                  }
                : {};

              return (
                <React.Fragment key={uniqueKey}>
                  <div style={animationStyle}>
                    <PoliticianCard politician={politician} index={index} />
                  </div>

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

            {/* Loading indicator - モダンなデザインに変更 */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-6 overflow-hidden">
                <div className="relative flex">
                  {/* モダンな波形アニメーション */}
                  <div className="flex space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-6 rounded-full bg-indigo-500"
                        style={{
                          animation: `waveAnimation 0.8s ease-in-out ${
                            i * 0.08
                          }s infinite alternate`,
                          opacity: 0.7 + i * 0.05,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 text-indigo-600 font-medium text-sm tracking-wider animate-pulse">
                  次のデータを読み込み中...
                </div>
              </div>
            )}

            {/* End of list message */}
            {!hasMore && !isLoading && (
              <div className="text-center py-4 text-gray-500 text-sm">
                すべての政治家を表示しました
              </div>
            )}
          </div>
        ) : !isLoading ? (
          <div className="p-8 text-center text-gray-500">
            {currentParty !== "all"
              ? `${currentParty}に所属する議員はいません`
              : "表示できる政治家データがありません"}
          </div>
        ) : (
          <div className="flex justify-center py-12">
            <LoadingAnimation type="dots" message="政治家を読み込んでいます" />
          </div>
        )}
        <style>{`
              @keyframes waveAnimation {
                0% {
                  height: 6px;
                  transform: translateY(10px);
                }
                50% {
                  height: 24px;
                  transform: translateY(0);
                }
                100% {
                  height: 6px;
                  transform: translateY(10px);
                }
              }
      `}</style>
      </div>
    </section>
  );
};

export default AllPoliticiansList;
