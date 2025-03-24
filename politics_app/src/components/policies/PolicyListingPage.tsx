// src/components/policies/PolicyListingPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Building,
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
import { navigateToPolicy } from "../../utils/navigationUtils";

const PolicyListingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 状態管理
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeParty, setActiveParty] = useState("all"); // 追加: 選択中の政党
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
  const [parties, setParties] = useState<
    {
      id: string;
      name: string;
      color: string;
    }[]
  >([
    {
      id: "all",
      name: "すべての政党",
      color: "#6366F1",
    },
  ]); // 追加: 政党リスト
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [visiblePoliciesCount, setVisiblePoliciesCount] = useState(5); // 最初に表示する政策の数（5件に変更）
  const [showPartyFilter, setShowPartyFilter] = useState(false); // 追加: 政党フィルター表示状態
  const [tempSearchQuery, setTempSearchQuery] = useState(""); // 検索フィールドの一時的な値
  const [searchFired, setSearchFired] = useState(false); // 検索実行時のフィードバック用
  const [animateItems, setAnimateItems] = useState(true); // アニメーション状態の追加

  // URLパラメータからフィルタ値を取得する処理
  useEffect(() => {
    // URLパラメータから値を取得
    const params = new URLSearchParams(location.search);
    const partyParam = params.get("party");
    const categoryParam = params.get("category");
    const sortParam = params.get("sort");

    // パラメータが存在する場合は対応するステートを更新
    if (partyParam) {
      setActiveParty(partyParam);
    }

    if (categoryParam) {
      setActiveCategory(categoryParam);
    }

    if (sortParam) {
      setSortMethod(sortParam);
    }
  }, [location]);

  // ページロード時にデータを取得
  useEffect(() => {
    const loadPoliciesAndCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setAnimateItems(true); // 初回ロード時にアニメーションを有効化

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

        // 政党データを抽出・整形
        const uniqueParties = new Map<
          string,
          { name: string; color: string }
        >();

        // すべての政策から一意な政党情報を抽出
        allPolicies.forEach((policy) => {
          if (policy.proposingParty && policy.proposingParty.name) {
            uniqueParties.set(policy.proposingParty.name, {
              name: policy.proposingParty.name,
              color: policy.proposingParty.color || "#6B7280",
            });
          }
        });

        // フォーマットされた政党リストを作成
        const formattedParties = [
          {
            id: "all",
            name: "すべての政党",
            color: "#6366F1",
          },
          ...[...uniqueParties.entries()].map(([name, data]) => ({
            id: name,
            name: name,
            color: data.color,
          })),
        ];

        setParties(formattedParties);
      } catch (error) {
        console.error("データ取得エラー:", error);
        setError("政策データの取得中にエラーが発生しました。");
      } finally {
        setIsLoading(false);
      }
    };

    loadPoliciesAndCategories();
  }, []);

  // コンポーネントのマウント時に一時検索クエリを初期化
  useEffect(() => {
    setTempSearchQuery(searchQuery);
  }, []);

  // カテゴリまたは政党が変更されたときにデータをフィルタリング
  useEffect(() => {
    const filterPolicies = async () => {
      try {
        setIsLoading(true);
        setAnimateItems(true); // フィルター変更時にアニメーションを有効化

        let filtered: Policy[];

        // カテゴリでの初期フィルタリング
        if (activeCategory === "all") {
          // すべてのカテゴリの場合は全政策を対象に
          filtered = policies;
        } else {
          // 特定のカテゴリの場合
          filtered = policies.filter((policy) =>
            policy.affectedFields.includes(activeCategory)
          );
        }

        // 政党によるフィルタリング
        if (activeParty !== "all") {
          filtered = filtered.filter(
            (policy) => policy.proposingParty.name === activeParty
          );
        }

        // 検索クエリによるフィルタリング
        if (searchQuery.trim()) {
          const lowerSearchTerm = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (policy) =>
              policy.title.toLowerCase().includes(lowerSearchTerm) ||
              policy.description.toLowerCase().includes(lowerSearchTerm)
          );
        }

        // 選択されたソート方法で並べ替え
        const sorted = sortPolicies(filtered, sortMethod);
        setFilteredPolicies(sorted);

        // 表示数をリセット
        setVisiblePoliciesCount(6);
        // 現在は無限スクロールを使用するため、このステップは必要なし

        // アニメーションを一定時間後に無効化（アニメーション実行後）
        setTimeout(() => {
          setAnimateItems(false);
        }, 800); // アニメーションの時間より少し長めに設定
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
  }, [activeCategory, activeParty, policies, sortMethod, searchQuery]); // searchQueryをここに残す

  // URL更新用のヘルパー関数
  const updateUrlParams = (updates: { [key: string]: string }) => {
    // 現在のURLパラメータを取得
    const params = new URLSearchParams(location.search);

    // 更新する値をセット
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "all" && key !== "sort") {
        // "all"の場合はパラメータを削除（シンプルなURLを維持）
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // 整形されたURLパラメータ文字列を生成
    const queryString = params.toString();

    // 新しいURLへ遷移（履歴を置き換え）
    navigate(
      {
        pathname: location.pathname,
        search: queryString ? `?${queryString}` : "",
      },
      { replace: true }
    );
  };

  // 検索入力用のrefを追加
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 検索入力フィールドの変更時の処理（一時変数のみ更新）
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempSearchQuery(e.target.value);
  };

  // 検索送信時の処理
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // フォーム送信時に検索クエリを更新し、フィルタリングをトリガー
    setSearchQuery(tempSearchQuery);
    setAnimateItems(true); // 検索時にアニメーションを有効化

    // 検索エフェクトをトリガー
    setSearchFired(true);
    setTimeout(() => {
      setSearchFired(false);
    }, 600); // 0.6秒後に非表示

    // 検索欄からフォーカスを外す（テキストは保持）
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  // ソート方法変更時の処理
  const handleSortChange = (method: string) => {
    setSortMethod(method);
    setShowFilterMenu(false);
    setAnimateItems(true); // ソート変更時にアニメーションを有効化

    // URLを更新
    updateUrlParams({ sort: method });
  };

  // カテゴリ選択時の処理
  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSearchQuery(""); // 検索条件をリセット
    setTempSearchQuery(""); // 検索入力欄もクリア
    setAnimateItems(true); // カテゴリ変更時にアニメーションを有効化

    // URLを更新
    updateUrlParams({ category: categoryId });
  };

  // 政党選択時の処理
  const handlePartySelect = (partyId: string) => {
    setActiveParty(partyId);
    setSearchQuery(""); // 検索条件をリセット
    setTempSearchQuery(""); // 検索入力欄もクリア
    setShowFilterMenu(false); // 選択後にドロップダウンを閉じる
    setAnimateItems(true); // 政党変更時にアニメーションを有効化

    // URLを更新
    updateUrlParams({ party: partyId });
  };

  // メニュー外クリック時にドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFilterMenu) {
        const target = event.target as Node;
        const filterMenu = document.getElementById("filter-menu-container");
        if (filterMenu && !filterMenu.contains(target)) {
          setShowFilterMenu(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterMenu]);

  // 無限スクロール検出のためのイベントリスナー
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
          document.documentElement.offsetHeight &&
        !isLoadingMore &&
        visiblePoliciesCount < filteredPolicies.length
      ) {
        loadMorePolicies();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visiblePoliciesCount, isLoadingMore, filteredPolicies.length]);

  // 無限スクロールのための追加読み込み処理
  const loadMorePolicies = () => {
    if (!isLoadingMore && visiblePoliciesCount < filteredPolicies.length) {
      setIsLoadingMore(true);

      // 意図的に読み込みを遅延させる（UXと過剰読み込み防止のため）
      setTimeout(() => {
        setVisiblePoliciesCount((prev) => prev + 5); // 5件ずつ追加
        setIsLoadingMore(false);
      }, 800); // 0.8秒の読み込み遅延を設定
    }
  };

  // 政策カードクリック時の処理
  const handlePolicyClick = (policyId: string) => {
    navigateToPolicy(navigate, policyId);
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

  // 政党IDから政党情報を取得
  const getPartyById = (id: string) => {
    return parties.find((party) => party.id === id) || parties[0];
  };

  // 現在のアクティブカテゴリ
  const activeTab = getCategoryById(activeCategory);

  // 現在選択中の政党
  const selectedParty = getPartyById(activeParty);

  return (
    <div className="min-h-screen bg-slate-50">
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
              <Search
                size={18}
                className={`text-white ${
                  searchFired ? "search-icon-effect" : "opacity-70"
                }`}
              />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={
                activeParty === "all"
                  ? "全ての政策を検索..."
                  : `${selectedParty.name}の政策を検索...`
              }
              className={`w-full pl-10 pr-10 py-2 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20 
  focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-opacity-20 text-white 
  placeholder-white placeholder-opacity-70 backdrop-blur-sm md:w-[300px] lg:w-[350px] xl:w-[400px]
  ${searchFired ? "search-input-flash" : ""}`}
              value={tempSearchQuery}
              onChange={handleSearchChange}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white opacity-70 hover:opacity-100 transition-opacity"
              aria-label="検索"
            >
              <ChevronRight
                size={18}
                className={searchFired ? "search-button-effect" : ""}
              />
            </button>
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
                  onClick={() => handleCategorySelect(category.id)}
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
                  {activeParty === "all" ? activeTab.name : selectedParty.name}
                </span>
                <span>政策一覧</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredPolicies.length}件の政策が見つかりました
              </p>
            </div>

            <div className="relative" id="filter-menu-container">
              <button
                className="flex items-center bg-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all border border-gray-200"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <Filter size={16} className="mr-2 text-indigo-600" />
                <span>並び替え</span>
              </button>

              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-10 border border-indigo-100">
                  <div className="py-1 border-b border-gray-100">
                    <div className="px-4 py-1.5 text-xs font-semibold text-gray-500">
                      並び替え
                    </div>
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

                  <div className="py-1">
                    <div className="px-4 py-1.5 text-xs font-semibold text-gray-500">
                      政党で絞り込み
                    </div>
                    {parties.map((party) => (
                      <button
                        key={party.id}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center"
                        onClick={() => handlePartySelect(party.id)}
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: party.color }}
                        ></div>
                        <span
                          className={
                            activeParty === party.id ? "font-medium" : ""
                          }
                        >
                          {party.name}
                        </span>
                        {activeParty === party.id && (
                          <span className="ml-auto text-indigo-600">✓</span>
                        )}
                      </button>
                    ))}
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
              検索キーワードを変更するか、別のカテゴリや政党を選択してください。
            </p>
          </div>
        )}

        {/* Policy Cards - Changed to display one per row in a vertical list */}
        <div className="space-y-4">
          {filteredPolicies
            .slice(0, visiblePoliciesCount)
            .map((policy, index) => {
              const category = getCategoryById(policy.category);

              // 順番にアニメーション表示するためのスタイル
              const animationStyle = animateItems
                ? {
                    animation: "fadeIn 0.3s ease-out forwards",
                    animationDelay: `${index * 0.05}s`,
                    opacity: 0, // 初期状態は非表示
                  }
                : {};

              return (
                <div
                  key={policy.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                  style={{
                    borderLeft: `4px solid ${policy.proposingParty.color}`,
                    ...animationStyle,
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
                        <MessageSquare
                          size={12}
                          className="mr-1 flex-shrink-0"
                        />
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

          {/* 初期データ読み込み中のローディング表示 */}
          {isLoading && policies.length > 0 && !isLoadingMore && (
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
                政策データを読み込み中...
              </div>
            </div>
          )}

          {/* 無限スクロール用ローディングインジケーター */}
          {isLoadingMore && (
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

          {/* 全データ表示済みメッセージ */}
          {!isLoadingMore &&
            visiblePoliciesCount >= filteredPolicies.length &&
            filteredPolicies.length > 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                すべての政策を表示しました
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
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
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
        
        /* 検索アイコンのエフェクト - 明るく光る */
        .search-icon-effect {
          animation: searchIconGlow 0.6s ease-out;
        }
        
        @keyframes searchIconGlow {
          0% { 
            opacity: 0.7;
            transform: scale(1);
          }
          30% { 
            opacity: 1;
            transform: scale(1.3);
            filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8));
          }
          100% { 
            opacity: 0.7;
            transform: scale(1);
          }
        }
        
        /* 検索入力フィールドの背景フラッシュ効果 */
        .search-input-flash {
          animation: inputFlash 0.6s ease-out;
        }
        
        @keyframes inputFlash {
          0% { 
            background-color: rgba(255, 255, 255, 0.1);
          }
          30% { 
            background-color: rgba(255, 255, 255, 0.25);
          }
          100% { 
            background-color: rgba(255, 255, 255, 0.1);
          }
        }
        
        /* 検索ボタンの効果 - 一瞬で右に移動して戻る */
        .search-button-effect {
          animation: buttonAction 0.6s ease-out;
        }
        
        @keyframes buttonAction {
          0% { 
            transform: translateX(0);
          }
          30% { 
            transform: translateX(3px);
          }
          60% { 
            transform: translateX(0);
          }
        }
        
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
  );
};

export default PolicyListingPage;
