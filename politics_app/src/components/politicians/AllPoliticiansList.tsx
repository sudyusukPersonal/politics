// src/components/politicians/AllPoliticiansList.tsx
import React, { useEffect, useState } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Politician } from "../../types";
import { useData } from "../../context/DataContext";
import PoliticianCard from "./PoliticianCard";
import SortDropdown from "../common/SortDropdown";
import PartyFilterDropdown from "../common/PartyFilterDropdown";
import PremiumBanner from "../common/PremiumBanner";
import InlineAdBanner from "../ads/InlineAdBanner";
import LoadingAnimation from "../common/LoadingAnimation";
import { fetchPoliticiansWithFilterAndSort } from "../../services/politicianService";

const AllPoliticiansList: React.FC = () => {
  const { handleBackToPoliticians } = useData();

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
    loadPoliticians(1, currentSort, party, true);

    // ローカルストレージの保存データをクリア
    localStorage.removeItem("politicians_data");
    localStorage.removeItem("politicians_scroll");
    localStorage.removeItem("politicians_lastDocId");
    localStorage.removeItem("politicians_hasMore");
    localStorage.removeItem("politicians_sort");
    localStorage.removeItem("politicians_party");
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
    loadPoliticians(1, sort, currentParty, true);

    // ローカルストレージの保存データをクリア
    localStorage.removeItem("politicians_data");
    localStorage.removeItem("politicians_scroll");
    localStorage.removeItem("politicians_lastDocId");
    localStorage.removeItem("politicians_hasMore");
    localStorage.removeItem("politicians_sort");
    localStorage.removeItem("politicians_party");
  };

  // ブラウザバックでの状態復元用のuseEffect
  useEffect(() => {
    const params = getUrlParams();

    // ローカルストレージから保存データを取得
    const savedData = localStorage.getItem("politicians_data");
    const savedScrollPos = localStorage.getItem("politicians_scroll");
    const savedSort = localStorage.getItem("politicians_sort");
    const savedParty = localStorage.getItem("politicians_party");

    // データと設定が存在し、フィルター条件が一致する場合のみ復元
    if (
      savedData &&
      savedScrollPos &&
      savedSort === params.sort &&
      savedParty === params.party
    ) {
      console.log("保存されたデータから復元します");
      setPoliticians(JSON.parse(savedData));
      setLastDocumentId(
        localStorage.getItem("politicians_lastDocId") || undefined
      );
      setHasMore(localStorage.getItem("politicians_hasMore") === "true");
      setAnimateItems(false); // アニメーションを無効化
      setIsLoading(false);

      // 少し遅延させてからスクロール位置を復元
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPos, 10));
      }, 100);
    } else {
      // 保存データがない、または条件が変わった場合は通常ロード
      setAnimateItems(true);
      setCurrentSort(params.sort);
      setCurrentParty(params.party);
      setCurrentPage(params.page);
      loadPoliticians(params.page, params.sort, params.party, true);
    }
  }, []);

  // スクロール位置とデータをローカルストレージに保存
  useEffect(() => {
    if (politicians.length > 0) {
      localStorage.setItem("politicians_data", JSON.stringify(politicians));
      localStorage.setItem("politicians_lastDocId", lastDocumentId || "");
      localStorage.setItem("politicians_hasMore", hasMore.toString());
      localStorage.setItem("politicians_sort", currentSort);
      localStorage.setItem("politicians_party", currentParty);
    }
  }, [politicians, lastDocumentId, hasMore, currentSort, currentParty]);

  // スクロール位置を保存するリスナー
  useEffect(() => {
    const handleScroll = () => {
      if (politicians.length > 0) {
        localStorage.setItem("politicians_scroll", window.scrollY.toString());
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [politicians]);

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

      if (refresh) {
        // Replace all politicians
        setPoliticians(result.politicians);

        // アニメーションを一定時間後に無効化（アニメーション実行後）
        setTimeout(() => {
          setAnimateItems(false);
        }, 800); // アニメーションの時間より少し長めに設定
      } else {
        // Add to existing politicians (for infinite scroll)
        setPoliticians((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newPoliticians = result.politicians.filter(
            (p) => !existingIds.has(p.id)
          );
          return [...prev, ...newPoliticians];
        });
      }

      setLastDocumentId(result.lastDocumentId);
      setHasMore(result.hasMore);
      setCurrentPage(page);

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

  // Watch for URL changes and reload data if needed
  useEffect(() => {
    const params = getUrlParams();
    console.log(
      `URL params changed: page=${params.page}, sort=${params.sort}, party=${params.party}`
    );

    if (params.sort !== currentSort || params.party !== currentParty) {
      console.log("Filter parameters changed, reloading data");
      setCurrentSort(params.sort);
      setCurrentParty(params.party);
      setPoliticians([]);
      setLastDocumentId(undefined);
      setHasMore(true);
      setCurrentPage(1);
      loadPoliticians(1, params.sort, params.party, true);
    }
  }, [location.search]);

  // Infinite scroll detection
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
      {/* <div className="flex items-center justify-between mb-2">
        <button
          onClick={handleBackToPoliticians}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>戻る</span>
        </button>
      </div> */}
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

      {/* Premium banner */}
      {/* <PremiumBanner /> */}

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
