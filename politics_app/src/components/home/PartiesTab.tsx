// src/components/home/PartiesTab.tsx
import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Users,
  Activity,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  Filter,
  MessageSquare,
} from "lucide-react";
import InlineAdBanner from "../ads/InlineAdBanner";
import PremiumBanner from "../common/PremiumBanner";
import LoadingAnimation from "../common/LoadingAnimation";
import { Party } from "../../types";
import { fetchAllParties } from "../../services/partyService";
import { useNavigate } from "react-router-dom";
import { hasVoted } from "../../utils/voteStorage";

// ソートオプションの型定義
type SortOption = "supportDesc" | "supportAsc" | "commentsDesc";

const PartiesTab: React.FC = () => {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("supportDesc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const navigate = useNavigate();

  // アニメーション用のスタイル
  const ANIMATIONS = `
    @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
    .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
  `;

  // 政党データを取得する
  useEffect(() => {
    const loadParties = async () => {
      try {
        setLoading(true);
        setError(null);

        // Firestoreから政党データを取得
        const partiesData = await fetchAllParties();

        // デフォルトのソート（支持率高い順）
        const sortedParties = sortParties(partiesData, sortBy);
        setParties(sortedParties);

        console.log(`${partiesData.length}件の政党データを読み込みました`);
      } catch (err) {
        console.error("政党データの読み込みに失敗しました:", err);
        setError("政党データの取得に失敗しました。もう一度お試しください。");
      } finally {
        setLoading(false);
      }
    };

    loadParties();
  }, []);

  // ソート変更時の処理
  useEffect(() => {
    if (parties.length > 0) {
      const sortedParties = sortParties([...parties], sortBy);
      setParties(sortedParties);
    }
  }, [sortBy]);

  // 政党データをソートする関数
  const sortParties = (
    partiesToSort: Party[],
    sortOption: SortOption
  ): Party[] => {
    switch (sortOption) {
      case "supportDesc":
        return partiesToSort.sort((a, b) => b.supportRate - a.supportRate);
      case "supportAsc":
        return partiesToSort.sort((a, b) => a.supportRate - b.supportRate);
      case "commentsDesc":
        return partiesToSort.sort(
          (a, b) => (b.totalCommentCount || 0) - (a.totalCommentCount || 0)
        );
      default:
        return partiesToSort;
    }
  };

  // ソート変更ハンドラー
  const handleSortChange = (newSortOption: SortOption) => {
    setSortBy(newSortOption);
    setShowSortMenu(false);
  };

  // 政党クリック時のハンドラー
  const handlePartySelect = (party: Party) => {
    navigate(`/parties/${party.id}`);
  };

  // ソートメニューのクリックイベントを親要素に伝播させない
  const handleSortMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // ソートメニューの外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSortMenu) {
        const target = event.target as Node;
        const menuEl = document.getElementById("sort-menu-container");
        if (menuEl && !menuEl.contains(target)) {
          setShowSortMenu(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSortMenu]);

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

  // エラー表示
  if (error) {
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          政党データの取得に失敗
        </h3>
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          再読み込み
        </button>
      </div>
    );
  }

  // 政党データが空の場合
  if (!parties.length) {
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

  // ソートのラベルを取得する関数
  const getSortLabel = (option: SortOption): string => {
    switch (option) {
      case "supportDesc":
        return "支持率高い順";
      case "supportAsc":
        return "支持率低い順";
      case "commentsDesc":
        return "コメント数順";
      default:
        return "支持率高い順";
    }
  };

  return (
    <section className="space-y-6">
      {/* Premium banner */}
      <PremiumBanner />

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-fadeIn">
        <style>{ANIMATIONS}</style>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <TrendingUp size={18} className="mr-2 text-indigo-600" />
              政党支持率
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              政党を評価してコメントを投稿しよう
            </p>
          </div>

          {/* ソートメニュー */}
          <div
            className="relative"
            id="sort-menu-container"
            onClick={handleSortMenuClick}
          >
            <button
              className="flex items-center bg-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 border border-gray-200 transition"
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              <Filter size={14} className="mr-1.5 text-indigo-600" />
              <span className="text-gray-700">{getSortLabel(sortBy)}</span>
            </button>

            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 py-1 border border-gray-100">
                <button
                  className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                    sortBy === "supportDesc"
                      ? "bg-indigo-50 text-indigo-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handleSortChange("supportDesc")}
                >
                  <ArrowUp size={14} className="mr-2 text-indigo-600" />
                  支持率（高い順）
                </button>
                <button
                  className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                    sortBy === "supportAsc"
                      ? "bg-indigo-50 text-indigo-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handleSortChange("supportAsc")}
                >
                  <ArrowDown size={14} className="mr-2 text-indigo-600" />
                  支持率（低い順）
                </button>
                <button
                  className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                    sortBy === "commentsDesc"
                      ? "bg-indigo-50 text-indigo-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handleSortChange("commentsDesc")}
                >
                  <MessageSquare size={14} className="mr-2 text-indigo-600" />
                  コメント数（多い順）
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 space-y-6">
          {parties.map((party, index) => (
            <React.Fragment key={party.id}>
              <div
                className="relative hover:bg-gray-50 p-4 rounded-xl transition cursor-pointer overflow-hidden group"
                onClick={() => handlePartySelect(party)}
                style={{
                  borderLeft: `4px solid ${party.color}`,
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
                }}
              >
                {/* アクセントカラーの背景要素 */}
                <div
                  className="absolute top-0 left-0 w-2 h-full opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{ backgroundColor: party.color }}
                ></div>

                {/* 新しいレイアウト：画像と情報を横に配置 */}
                <div className="flex">
                  {/* 左側：大きな政党画像 */}
                  <div className="flex-shrink-0 mr-4 flex items-center">
                    <div
                      className="w-16 h-16 rounded-full overflow-hidden border-2 flex items-center justify-center relative"
                      style={{ borderColor: party.color }}
                    >
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{ backgroundColor: party.color }}
                      ></div>
                      <img
                        src={party.image}
                        alt={party.name}
                        className="w-full h-full object-cover relative z-10"
                        onError={(e) => {
                          // エラー時にフォールバック表示
                          const target = e.currentTarget;
                          target.onerror = null; // 無限ループ防止
                          target.style.display = "none";
                          target.parentElement!.style.backgroundColor =
                            party.color;
                          target.parentElement!.innerHTML = `<span class="text-white text-2xl font-bold">${party.name.charAt(
                            0
                          )}</span>`;
                        }}
                      />
                    </div>
                  </div>

                  {/* 右側：政党情報 */}
                  <div className="flex-grow">
                    {/* 政党名と投票ボタンを配置。投票ボタンをセンターラインに合わせる */}
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <h3 className="font-bold text-base text-gray-800 truncate">
                          {party.name}
                        </h3>
                        {!hasVoted(party.id) && (
                          <span className="mt-1 sm:mt-0 sm:ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium animate-pulse flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mr-1"
                            >
                              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"></path>
                            </svg>
                            投票する
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <div
                          className="px-2 py-0.5 rounded-full text-xs flex items-center"
                          style={{
                            backgroundColor: `${party.color}15`,
                            color: party.color,
                            border: `1px solid ${party.color}30`,
                          }}
                        >
                          <MessageSquare
                            size={12}
                            className="mr-1 flex-shrink-0"
                          />
                          <span className="font-medium">
                            {party.totalCommentCount || 0} コメント
                          </span>
                        </div>
                        <div
                          className="rounded-full p-1.5 transition-colors group-hover:bg-gray-100"
                          style={{ color: party.color }}
                        >
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>

                    {/* Support/Oppose stats */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <ThumbsUp
                          size={14}
                          className="text-green-500 mr-1 animate-bounce-slow"
                        />
                        <span className="font-medium text-green-700">
                          {party.supportRate}%
                        </span>
                      </div>
                      <div className="flex items-center">
                        <ThumbsDown
                          size={14}
                          className="text-red-500 mr-1 animate-bounce-slow"
                        />
                        <span className="font-medium text-red-700">
                          {party.opposeRate}%
                        </span>
                      </div>
                    </div>

                    {/* Progress bar with animation - 修正版 */}
                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex p-0.5">
                      <div
                        className="h-full rounded-l-full transition-all duration-700 ease-in-out"
                        style={{
                          width: `${party.supportRate}%`,
                          backgroundColor: "#10B981",
                          filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))",
                        }}
                      ></div>
                      <div
                        className="h-full rounded-r-full transition-all duration-700 ease-in-out"
                        style={{
                          width: `${party.opposeRate}%`,
                          backgroundColor: "#EF4444",
                          filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Party details */}
                <div className="bg-gray-50 rounded-lg p-3 mt-2">
                  <div className="flex flex-row items-center space-x-4 text-xs text-gray-500 mb-2">
                    <div className="flex items-center">
                      <Users size={12} className="mr-1 flex-shrink-0" />
                      <span>所属議員: {party.members}名</span>
                    </div>
                    <div className="flex items-center">
                      <Activity size={12} className="mr-1 flex-shrink-0" />
                      <span>
                        総得票数: {party.totalVotes.toLocaleString()}票
                      </span>
                    </div>
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
              {/* {index === 0 && (
                <div className="flex justify-center py-2">
                  <InlineAdBanner format="rectangle" showCloseButton={true} />
                </div>
              )} */}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartiesTab;
