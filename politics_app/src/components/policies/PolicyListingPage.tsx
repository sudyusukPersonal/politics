// src/components/policies/PolicyListingPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  TrendingUp,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Clock,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Activity,
  Users,
  MessageSquare,
} from "lucide-react";
import {
  fetchAllPolicies,
  fetchPoliciesByCategory,
  searchPolicies,
  sortPolicies,
  fetchAllCategories,
  Policy,
} from "../../services/policyService";
import LoadingAnimation from "../common/LoadingAnimation";

const PolicyListingPage: React.FC = () => {
  const navigate = useNavigate();

  // 状態管理
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortMethod, setSortMethod] = useState("supportDesc"); // デフォルトのソート方法
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [categories, setCategories] = useState<
    {
      id: string;
      name: string;
      color: string;
      icon: JSX.Element;
    }[]
  >([
    {
      id: "all",
      name: "すべて",
      color: "#6366F1",
      icon: <Activity size={14} />,
    },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreVisible, setLoadMoreVisible] = useState(true);
  const [visiblePoliciesCount, setVisiblePoliciesCount] = useState(6); // 最初に表示する政策の数

  // ページロード時にデータを取得
  useEffect(() => {
    const loadPoliciesAndCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 全ての政策を取得
        const allPolicies = await fetchAllPolicies();
        setPolicies(allPolicies);

        // 利用可能なカテゴリを取得
        const allCategories = await fetchAllCategories();

        // カテゴリデータを整形
        const categoryIcons: Record<string, JSX.Element> = {
          経済: <TrendingUp size={14} />,
          環境: <AlertCircle size={14} />,
          教育: <Users size={14} />,
          社会保障: <Users size={14} />,
          安全保障: <AlertCircle size={14} />,
          外交: <Users size={14} />,
          労働: <Activity size={14} />,
          健康: <Users size={14} />,
        };

        const categoryColors: Record<string, string> = {
          経済: "#06B6D4",
          環境: "#10B981",
          教育: "#F59E0B",
          社会保障: "#8B5CF6",
          安全保障: "#EF4444",
          外交: "#3B82F6",
          労働: "#EC4899",
          健康: "#14B8A6",
        };

        const formattedCategories = [
          {
            id: "all",
            name: "すべて",
            color: "#6366F1",
            icon: <Activity size={14} />,
          },
          ...allCategories.map((category) => ({
            id: category,
            name: category,
            color: categoryColors[category] || "#6B7280", // デフォルトの色
            icon: categoryIcons[category] || <Activity size={14} />, // デフォルトのアイコン
          })),
        ];

        setCategories(formattedCategories);
      } catch (error) {
        console.error("データ取得エラー:", error);
        setError("政策データの取得中にエラーが発生しました。");
      } finally {
        setIsLoading(false);
      }
    };

    loadPoliciesAndCategories();
  }, []);

  // カテゴリが変更されたときにデータをフィルタリング
  useEffect(() => {
    const filterPolicies = async () => {
      try {
        setIsLoading(true);

        let filtered: Policy[];

        if (activeCategory === "all") {
          // すべてのカテゴリの場合は全政策を対象に検索
          if (searchQuery.trim()) {
            filtered = await searchPolicies(searchQuery);
          } else {
            filtered = policies;
          }
        } else {
          // 特定のカテゴリの場合
          if (searchQuery.trim()) {
            // 検索クエリがある場合、全政策から検索してからカテゴリでフィルタリング
            const searchResults = await searchPolicies(searchQuery);
            filtered = searchResults.filter((policy) =>
              policy.affectedFields.includes(activeCategory)
            );
          } else {
            // 検索クエリがない場合、カテゴリでフィルタリングした政策を取得
            filtered = policies.filter((policy) =>
              policy.affectedFields.includes(activeCategory)
            );
          }
        }

        // 選択されたソート方法で並べ替え
        const sorted = sortPolicies(filtered, sortMethod);
        setFilteredPolicies(sorted);

        // 表示数をリセット
        setVisiblePoliciesCount(6);
        // 表示するアイテムが6以下ならもっと表示ボタンを非表示
        setLoadMoreVisible(sorted.length > 6);
      } catch (error) {
        console.error("政策フィルタリングエラー:", error);
        setError("政策のフィルタリング中にエラーが発生しました。");
      } finally {
        setIsLoading(false);
      }
    };

    if (policies.length > 0) {
      filterPolicies();
    }
  }, [activeCategory, policies, searchQuery, sortMethod]);

  // 検索クエリが変更されたときの処理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 検索送信時の処理
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 検索クエリの変更は useEffect でフィルタリングをトリガーする
  };

  // ソート方法変更時の処理
  const handleSortChange = (method: string) => {
    setSortMethod(method);
    setShowFilterMenu(false);
  };

  // もっと表示ボタンの処理
  const handleLoadMore = () => {
    setVisiblePoliciesCount((prev) => prev + 6);
    if (visiblePoliciesCount + 6 >= filteredPolicies.length) {
      setLoadMoreVisible(false);
    }
  };

  // 政策カードクリック時の処理
  const handlePolicyClick = (policyId: string) => {
    navigate(`/policy/${policyId}`);
  };

  // トレンドアイコンの取得
  const getTrendingIcon = (trend: string) => {
    if (trend === "up") {
      return <TrendingUp size={16} className="text-green-500" />;
    } else if (trend === "down") {
      return (
        <TrendingUp size={16} className="text-red-500 transform rotate-180" />
      );
    }
    return null;
  };

  // ステータス表示用のカラー設定
  const getStatusColor = (status: string) => {
    switch (status) {
      case "可決":
        return "bg-green-100 text-green-800 border-green-200";
      case "審議中":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "委員会審議":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "否決":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // カテゴリーIDからカテゴリ情報を取得
  const getCategoryById = (id: string) => {
    return categories.find((cat) => cat.id === id) || categories[0];
  };

  // 現在のアクティブカテゴリ
  const activeTab = getCategoryById(activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-bl from-gray-50 via-amber-50 to-gray-50">
      {/* Compact header with modern design */}
      <div className="relative bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400 via-transparent to-transparent opacity-20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-400 via-transparent to-transparent opacity-20"></div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h1 className="text-2xl font-bold mb-1 inline-flex items-center">
              <div className="mr-2 p-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded">
                <AlertCircle size={18} className="text-white" />
              </div>
              政策提案データベース
            </h1>
            <p className="text-sm md:text-base opacity-80">
              最新政策の動向把握と意見表明プラットフォーム
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full md:w-auto md:max-w-md"
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-white opacity-70" />
            </div>
            <input
              type="text"
              placeholder="政策を検索..."
              className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-opacity-20 text-white placeholder-white placeholder-opacity-70 backdrop-blur-sm"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </form>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {/* Category tabs - Original horizontal layout */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-3 pb-2">
            {categories.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  className={`relative px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
                  }`}
                  style={{
                    backgroundColor: isActive ? category.color : "",
                  }}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{category.icon}</span>
                    <span className={`${isActive ? "font-bold" : ""}`}>
                      {category.name}
                    </span>
                    {isActive && (
                      <span className="relative ml-1.5 flex h-2 w-2">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content title */}
        <div className="relative mb-8">
          <div
            className="absolute left-0 top-0 h-full w-2 rounded-full"
            style={{ backgroundColor: activeTab.color }}
          ></div>

          <div className="flex justify-between items-center pl-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <span
                  className="mr-2 text-transparent bg-clip-text bg-gradient-to-r"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${activeTab.color}, ${activeTab.color}99)`,
                  }}
                >
                  {activeTab.name}
                </span>
                <span>政策一覧</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredPolicies.length}件の政策が見つかりました
              </p>
            </div>

            <div className="relative">
              <button
                className="flex items-center bg-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all border border-gray-200"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <Filter size={16} className="mr-2 text-indigo-600" />
                <span>並び替え</span>
              </button>

              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-indigo-100">
                  <div className="py-1">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center"
                      onClick={() => handleSortChange("supportDesc")}
                    >
                      <ArrowUp size={16} className="mr-2 text-indigo-600" />
                      <span>支持率（高い順）</span>
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center"
                      onClick={() => handleSortChange("supportAsc")}
                    >
                      <ArrowDown size={16} className="mr-2 text-indigo-600" />
                      <span>支持率（低い順）</span>
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center"
                      onClick={() => handleSortChange("newest")}
                    >
                      <Clock size={16} className="mr-2 text-indigo-600" />
                      <span>新しい順</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ローディング表示 */}
        {isLoading && policies.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <LoadingAnimation type="dots" message="政策データを読み込み中..." />
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle size={20} className="text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* データが見つからない場合 */}
        {!isLoading && filteredPolicies.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertCircle size={40} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              政策が見つかりません
            </h3>
            <p className="text-gray-500">
              検索条件に一致する政策データが見つかりませんでした。
              <br />
              検索キーワードを変更するか、別のカテゴリを選択してください。
            </p>
          </div>
        )}

        {/* Policy Cards - Changed to display one per row in a vertical list */}
        <div className="space-y-4">
          {filteredPolicies.slice(0, visiblePoliciesCount).map((policy) => {
            const category = getCategoryById(policy.category);

            return (
              <div
                key={policy.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                style={{
                  borderLeft: `4px solid ${policy.proposingParty.color}`,
                }}
                onClick={() => handlePolicyClick(policy.id)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div
                      className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: `${policy.proposingParty.color}15`,
                        color: policy.proposingParty.color,
                      }}
                    >
                      {policy.proposingParty.name}
                    </div>
                    {getTrendingIcon(policy.trending)}
                  </div>

                  <h3 className="font-bold text-lg mb-2 text-gray-800">
                    {policy.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4">
                    {policy.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {policy.affectedFields.map((field, index) => {
                      const fieldCategory = getCategoryById(field);
                      return (
                        <span
                          key={index}
                          className="text-xs px-2.5 py-1 rounded-full text-white"
                          style={{
                            backgroundColor: fieldCategory.color,
                          }}
                        >
                          {field}
                        </span>
                      );
                    })}
                    <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 flex items-center">
                      <MessageSquare size={12} className="mr-1 flex-shrink-0" />
                      {policy.commentsCount}件のコメント
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <div className="flex items-center">
                        <ThumbsUp
                          size={14}
                          className="text-green-500 mr-1.5 animate-bounce-slow"
                        />
                        <span className="font-medium text-green-600">
                          {policy.supportRate}%
                        </span>
                      </div>
                      <div className="flex items-center">
                        <ThumbsDown
                          size={14}
                          className="text-red-500 mr-1.5 animate-bounce-slow"
                        />
                        <span className="font-medium text-red-600">
                          {policy.opposeRate}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden flex">
                      <div
                        className="h-full rounded-l-full"
                        style={{
                          width: `${policy.supportRate}%`,
                          backgroundColor: "#10B981", // Green
                        }}
                      ></div>
                      <div
                        className="h-full rounded-r-full"
                        style={{
                          width: `${policy.opposeRate}%`,
                          backgroundColor: "#EF4444", // Red
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ローディング表示 - 既存データの追加読み込み中 */}
          {isLoading && policies.length > 0 && (
            <div className="flex justify-center py-6">
              <LoadingAnimation type="dots" message="政策を読み込み中..." />
            </div>
          )}

          {/* もっと表示ボタン */}
          {loadMoreVisible &&
            filteredPolicies.length > visiblePoliciesCount && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                >
                  <span className="flex items-center">
                    さらに表示する
                    <ChevronRight size={16} className="ml-1" />
                  </span>
                </button>
              </div>
            )}
        </div>
      </div>

      {/* Floating action button */}
      <div className="fixed bottom-6 right-6">
        <button
          className="w-12 h-12 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-indigo-700 transition-colors"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="ページトップへ戻る"
        >
          <TrendingUp size={20} />
        </button>
      </div>

      {/* Add animation styles */}
      <style>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PolicyListingPage;
