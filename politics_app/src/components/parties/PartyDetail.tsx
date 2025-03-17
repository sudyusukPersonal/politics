// src/components/parties/PartyDetail.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Activity,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import PoliticianCard from "../politicians/PoliticianCard";
import InlineAdBanner from "../ads/InlineAdBanner";
import LoadingAnimation from "../common/LoadingAnimation";
import { fetchPoliticiansByPartyWithPagination } from "../../services/politicianService";
import { Party, Politician } from "../../types";

const PartyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    handleBackToParties,
    sortMethod,
    handleSortChange,
    getSortedPoliticians,
    setSelectedParty,
    getPartyById,
    getPoliticiansByParty,
    dataInitialized,
  } = useData();

  const [party, setParty] = useState<Party | null>(null);
  const [partyMembers, setPartyMembers] = useState<Politician[]>([]);
  const [lastDocumentId, setLastDocumentId] = useState<string | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // URLからページ番号を取得する関数
  const getPageFromUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    const page = searchParams.get("page");
    return page ? parseInt(page, 10) : 1;
  };

  // グローバルデータから政党データを取得（メモ化）
  const selectedParty = useMemo(() => {
    if (!id || !dataInitialized) return null;
    return getPartyById(id);
  }, [id, dataInitialized, getPartyById]);

  // 政党に所属する政治家を取得（メモ化）
  const members = useMemo(() => {
    if (!id || !dataInitialized) return [];
    return getPoliticiansByParty(id);
  }, [id, dataInitialized, getPoliticiansByParty]);

  // ソート済みの党員リスト（メモ化）
  const sortedPartyPoliticians = useMemo(() => {
    return getSortedPoliticians(partyMembers);
  }, [partyMembers, getSortedPoliticians, sortMethod]);

  // URLからページ番号を設定
  useEffect(() => {
    const page = getPageFromUrl();
    setCurrentPage(page);
  }, [location.search]);

  // スクロール検出のuseEffect
  useEffect(() => {
    const handleScroll = () => {
      // スクロール位置を検出し、追加読み込みのロジックを実装
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

  // 政治家読み込み関数
  const loadMorePoliticians = async () => {
    if (party && !isLoading && hasMore) {
      try {
        setIsLoading(true);

        // 次のページ番号を計算
        const nextPage = currentPage + 1;

        const result = await fetchPoliticiansByPartyWithPagination(
          party.name,
          lastDocumentId
        );

        if (result.politicians.length < 15 || !result.hasMore) {
          setHasMore(false);
        }

        setPartyMembers((prev) => [...prev, ...result.politicians]);
        setLastDocumentId(result.lastDocumentId);

        // URLを更新（ページをリロードせずに）
        navigate(`/parties/${id}?page=${nextPage}`, { replace: true });
        setCurrentPage(nextPage);
      } catch (error) {
        console.error("政治家の読み込みに失敗しました:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // データ読み込み状態の管理
  useEffect(() => {
    if (dataInitialized) {
      if (selectedParty) {
        setParty(selectedParty);
      }
    }
  }, [dataInitialized, selectedParty]);

  // 初回読み込み時の処理
  useEffect(() => {
    if (party) {
      // すでにURLにページ情報がある場合は、そのページまでデータを読み込む
      const initialPage = getPageFromUrl();

      const initialLoad = async () => {
        let tempLastDocId: string | undefined = undefined;
        let allPoliticians: Politician[] = [];

        // 現在のページまでのデータをすべて取得
        for (let i = 1; i <= initialPage; i++) {
          setIsLoading(true);
          try {
            const result = await fetchPoliticiansByPartyWithPagination(
              party.name,
              tempLastDocId
            );

            allPoliticians = [...allPoliticians, ...result.politicians];

            // 最後のページの情報を設定
            if (i === initialPage) {
              setPartyMembers(allPoliticians);
              setLastDocumentId(result.lastDocumentId);
              setHasMore(result.hasMore);
            }

            tempLastDocId = result.lastDocumentId;

            // 全てのデータを取得した場合
            if (result.politicians.length < 15 || !result.hasMore) {
              setHasMore(false);
              break;
            }
          } catch (error) {
            console.error("初期データ読み込みに失敗しました:", error);
            break;
          } finally {
            setIsLoading(false);
          }
        }
      };

      initialLoad();
    }
  }, [party]);

  // 選択された政党をコンテキストに設定
  useEffect(() => {
    if (party) {
      setSelectedParty(party);
      window.scrollTo(0, 0);
    }
  }, [party, setSelectedParty]);

  // リダイレクト処理（データロード後に政党が見つからない場合）
  useEffect(() => {
    if (!isLoading && !party && dataInitialized) {
      navigate("/parties");
    }
  }, [party, isLoading, navigate, dataInitialized]);

  // モダンなローディング表示
  if (isLoading && partyMembers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 min-h-[400px] flex items-center justify-center">
        <LoadingAnimation type="pulse" message="政党情報を読み込んでいます" />
      </div>
    );
  }

  if (!party) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <div className="text-red-500 mb-2">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          政党が見つかりません
        </h3>
        <p className="mt-2 text-gray-600">
          指定されたIDの政党情報を取得できませんでした。
        </p>
        <button
          onClick={() => navigate("/parties")}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          政党一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={handleBackToParties}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>政党一覧に戻る</span>
        </button>

        {/* 現在のページ表示 */}
        <div className="text-sm text-gray-500">ページ: {currentPage}</div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-fadeIn">
        {/* Party header */}
        <div
          className="p-5 border-b border-gray-100"
          style={{ backgroundColor: `${party.color}10` }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 sm:mb-0"
              style={{ backgroundColor: party.color }}
            >
              {party.name.charAt(0)}
            </div>
            <div className="sm:ml-4">
              <h2 className="text-xl font-bold" style={{ color: party.color }}>
                {party.name}
              </h2>
              <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1">
                <span>所属議員: {party.members}名</span>
                <span className="mx-2 hidden sm:inline">•</span>
                <span>総投票数: {party.totalVotes.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            {/* Support/oppose stats */}
            <div className="mb-2 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <div className="flex items-center">
                <ThumbsUp size={14} className="text-green-500 mr-1" />
                <span className="text-sm font-medium">支持率: </span>
                <span className="font-bold ml-1 text-green-600">
                  {party.supportRate}%
                </span>
              </div>
              <div className="flex items-center">
                <ThumbsDown size={14} className="text-red-500 mr-1" />
                <span className="text-sm font-medium">不支持率: </span>
                <span className="font-bold ml-1 text-red-600">
                  {party.opposeRate}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
              <div
                className="h-full rounded-l-full"
                style={{
                  width: `${party.supportRate}%`,
                  backgroundColor: "#10B981",
                }}
              ></div>
              <div
                className="h-full rounded-r-full"
                style={{
                  width: `${party.opposeRate}%`,
                  backgroundColor: "#EF4444",
                }}
              ></div>
            </div>
          </div>

          {/* Ad banner */}
          <InlineAdBanner format="large-banner" showCloseButton={true} />

          {/* Party description */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">政党概要</h3>
            <p className="text-sm text-gray-600 mt-1">{party.description}</p>
          </div>

          {/* Key policies */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">主要政策</h3>
            <div className="flex flex-wrap gap-2">
              {party.keyPolicies.map((policy, i) => (
                <span
                  key={i}
                  className="text-xs py-1 px-3 rounded-full border"
                  style={{
                    backgroundColor: `${party.color}15`,
                    borderColor: `${party.color}30`,
                    color: party.color,
                  }}
                >
                  {policy}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Party members */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 flex items-center">
            <Users size={18} className="mr-2 text-indigo-600" />
            所属議員
          </h2>

          {/* Sorting dropdown */}
          <div className="relative">
            <button
              className="flex items-center bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
              onClick={() => {
                const element = document.getElementById("party-sort-dropdown");
                if (element) {
                  element.classList.toggle("hidden");
                }
              }}
            >
              <Filter size={14} className="mr-1.5" />
              <span>
                {sortMethod === "supportDesc"
                  ? "支持率（高い順）"
                  : sortMethod === "supportAsc"
                  ? "支持率（低い順）"
                  : sortMethod === "activityDesc"
                  ? "活動指数（高い順）"
                  : "ソート基準"}
              </span>
            </button>

            {/* Sort dropdown options */}
            <div
              id="party-sort-dropdown"
              className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-10 hidden animate-fadeIn"
            >
              <div className="w-48 text-sm">
                <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b border-gray-100">
                  ソート基準
                </div>
                <button
                  onClick={() => {
                    handleSortChange("supportDesc");
                    const element = document.getElementById(
                      "party-sort-dropdown"
                    );
                    if (element) {
                      element.classList.toggle("hidden");
                    }
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
                    sortMethod === "supportDesc"
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  支持率（高い順）
                </button>
                <button
                  onClick={() => {
                    handleSortChange("supportAsc");
                    const element = document.getElementById(
                      "party-sort-dropdown"
                    );
                    if (element) {
                      element.classList.toggle("hidden");
                    }
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
                    sortMethod === "supportAsc"
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  支持率（低い順）
                </button>
                <button
                  onClick={() => {
                    handleSortChange("activityDesc");
                    const dropdown = document.getElementById(
                      "party-sort-dropdown"
                    );
                    if (dropdown) {
                      dropdown.classList.add("hidden");
                    }
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
                    sortMethod === "activityDesc"
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  活動指数（高い順）
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Party members list */}
        <div>
          {sortedPartyPoliticians.length > 0 ? (
            <>
              {sortedPartyPoliticians.map((politician, index) => (
                <React.Fragment key={politician.id}>
                  <PoliticianCard politician={politician} index={index} />

                  {/* Ad after 3rd politician */}
                  {index === 2 && sortedPartyPoliticians.length > 3 && (
                    <div className="py-3 flex justify-center border-b border-gray-100">
                      <InlineAdBanner
                        format="rectangle"
                        showCloseButton={true}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}

              {/* ページネーションコントロール */}
              <div className="flex justify-between items-center p-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  表示中: {sortedPartyPoliticians.length}名 / ページ
                  {currentPage}
                </div>
                {hasMore && (
                  <button
                    onClick={loadMorePoliticians}
                    disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {isLoading ? "読み込み中..." : "もっと見る"}
                  </button>
                )}
              </div>

              {/* ローディング中インジケーター */}
              {isLoading && (
                <div className="text-center py-4">
                  <LoadingAnimation
                    type="dots"
                    message="議員を読み込んでいます"
                  />
                </div>
              )}

              {/* すべての議員を読み込んだ後のメッセージ */}
              {!hasMore && partyMembers.length > 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  すべての議員を読み込みました
                </div>
              )}
            </>
          ) : (
            <div className="p-4 text-center text-gray-500">
              この政党に所属する議員は見つかりませんでした
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PartyDetail;
