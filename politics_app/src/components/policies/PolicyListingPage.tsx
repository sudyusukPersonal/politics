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
import { fetchAllCategories, Policy } from "../../services/policyService";
import { fetchPoliciesWithFilterAndSort } from "../../services/policyService";
import LoadingAnimation from "../common/LoadingAnimation";
import { navigateToPolicy } from "../../utils/navigationUtils";

const PolicyListingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ---- URL パラメータ管理 ----
  // URLからパラメータを取得する関数
  const getUrlParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      category: searchParams.get("category") || "all",
      party: searchParams.get("party") || "all",
      sort: searchParams.get("sort") || "supportDesc",
    };
  };

  // URL更新関数
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

  // ---- 状態管理 ----
  // フィルタリング状態
  const [activeCategory, setActiveCategory] = useState(getUrlParams().category);
  const [activeParty, setActiveParty] = useState(getUrlParams().party);
  const [sortMethod, setSortMethod] = useState(getUrlParams().sort);

  // 検索関連
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFired, setSearchFired] = useState(false);

  // UI状態
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showPartyFilter, setShowPartyFilter] = useState(false);
  const [animateItems, setAnimateItems] = useState(true);

  // データ状態
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [lastDocumentId, setLastDocumentId] = useState<string | undefined>(
    undefined
  );
  const [hasMore, setHasMore] = useState(true);
  const [visiblePoliciesCount, setVisiblePoliciesCount] = useState(6);

  // ローディング状態
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // マスターデータ
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
  ]);

  // 検索入力用のrefを追加
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ---- データ読み込み関数 ----
  // 政策データ読み込み関数
  const loadPolicies = async (
    category: string,
    party: string,
    sort: string,
    searchTerm: string = "",
    refresh: boolean = false
  ) => {
    try {
      // ローディング状態の管理
      if (refresh) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      setError(null);
      setAnimateItems(refresh); // フィルター変更時のみアニメーション有効化

      // refreshがtrueの場合は初期状態にリセット
      const docId = refresh ? undefined : lastDocumentId;

      console.log(
        `政策データ読み込み - カテゴリ: ${category}, 政党: ${party}, ソート: ${sort}, 検索語: ${searchTerm}, 最終ID: ${
          docId || "なし"
        }`
      );

      // サーバーサイドでフィルターとソートを適用して取得
      const result = await fetchPoliciesWithFilterAndSort(
        category,
        party,
        sort,
        searchTerm,
        docId,
        5 // ページあたりの表示件数
      );

      // データの追加または置き換え
      if (refresh) {
        // 全データ置き換え
        setPolicies(result.policies);

        // アニメーション終了後に状態をリセット
        setTimeout(() => {
          setAnimateItems(false);
        }, 800);
      } else {
        // 既存データに追加（重複を防ぐ）
        setPolicies((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newPolicies = result.policies.filter(
            (p) => !existingIds.has(p.id)
          );
          return [...prev, ...newPolicies];
        });
      }

      // 状態の更新
      setLastDocumentId(result.lastDocumentId);
      setHasMore(result.hasMore);

      console.log(
        `${result.policies.length}件の政策を読み込みました。次のページ: ${
          result.hasMore ? "あり" : "なし"
        }`
      );
    } catch (error) {
      console.error("政策データ読み込みエラー:", error);
      setError("政策データの読み込みに失敗しました。もう一度お試しください。");

      if (refresh) {
        setPolicies([]); // エラー時はデータをクリア
      }
    } finally {
      // ローディング状態の解除
      if (refresh) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };
  // カテゴリとパーティのマスターデータを読み込む
  const loadCategoriesAndParties = async () => {
    try {
      setIsLoading(true);

      // カテゴリデータを取得
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
        科学技術: <Activity size={14} />,
        地方創生: <Building size={14} />,
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
        科学技術: "#3B82F6",
        地方創生: "#10B981",
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

      // 政党データを設定（今回はサンプルとして固定リスト）
      const partyData = [
        { id: "all", name: "すべての政党", color: "#6366F1" },
        { id: "自由民主党", name: "自由民主党", color: "#555555" },
        { id: "立憲民主党", name: "立憲民主党", color: "#4361EE" },
        { id: "公明党", name: "公明党", color: "#7209B7" },
        { id: "日本維新の会", name: "日本維新の会", color: "#228B22" },
        { id: "国民民主党", name: "国民民主党", color: "#000080" },
        { id: "日本共産党", name: "日本共産党", color: "#E63946" },
        { id: "れいわ新選組", name: "れいわ新選組", color: "#F72585" },
        { id: "社民党", name: "社民党", color: "#118AB2" },
        { id: "参政党", name: "参政党", color: "#FF4500" },
      ];

      setParties(partyData);
    } catch (error) {
      console.error("カテゴリ・政党データ取得エラー:", error);
      setError("カテゴリデータの取得中にエラーが発生しました。");
    }
  };

  // ---- イベントハンドラ ----
  // 検索入力フィールドの変更時の処理（一時変数のみ更新）
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempSearchQuery(e.target.value);
  };

  // 検索送信時の処理
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // フォーム送信時に検索クエリを更新し、フィルタリングをトリガー
    setSearchQuery(tempSearchQuery);

    // データをリセットして新たに検索
    setPolicies([]);
    setLastDocumentId(undefined);
    setHasMore(true);
    loadPolicies(
      activeCategory,
      activeParty,
      sortMethod,
      tempSearchQuery,
      true
    );

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

    // URLを更新
    updateUrlParams({ sort: method });

    // データをリセットして再取得
    setPolicies([]);
    setLastDocumentId(undefined);
    setHasMore(true);
    loadPolicies(activeCategory, activeParty, method, searchQuery, true);
  };

  // カテゴリ選択時の処理
  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);

    // 検索条件はリセットしない（検索+カテゴリで絞り込み可能）
    // URLを更新
    updateUrlParams({ category: categoryId });

    // データをリセットして再取得
    setPolicies([]);
    setLastDocumentId(undefined);
    setHasMore(true);
    loadPolicies(categoryId, activeParty, sortMethod, searchQuery, true);
  };

  // 政党選択時の処理
  const handlePartySelect = (partyId: string) => {
    setActiveParty(partyId);
    setShowFilterMenu(false); // 選択後にドロップダウンを閉じる

    // URL更新
    updateUrlParams({ party: partyId });

    // データをリセットして再取得
    setPolicies([]);
    setLastDocumentId(undefined);
    setHasMore(true);
    loadPolicies(activeCategory, partyId, sortMethod, searchQuery, true);
  };

  // 政策カードクリック時の処理
  const handlePolicyClick = (policyId: string) => {
    navigateToPolicy(navigate, policyId);
  };

  // ---- 無限スクロール ----
  // 無限スクロールのための追加読み込み処理
  const loadMorePolicies = () => {
    if (!isLoading && !isLoadingMore && hasMore && lastDocumentId) {
      setIsLoadingMore(true);
      setTimeout(() => {
        loadPolicies(
          activeCategory,
          activeParty,
          sortMethod,
          searchQuery,
          false
        );
      }, 800); // 0.8秒の遅延を追加
    }
  };

  // ---- Effect Hooks ----
  // 初期ロード
  useEffect(() => {
    // マスターデータを読み込む
    loadCategoriesAndParties();

    // URLパラメータから初期状態を設定
    const params = getUrlParams();
    setActiveCategory(params.category);
    setActiveParty(params.party);
    setSortMethod(params.sort);

    // 政策データを初回読み込み
    loadPolicies(params.category, params.party, params.sort, "", true);
  }, []);

  // URL変更時の処理
  useEffect(() => {
    const params = getUrlParams();

    if (
      params.category !== activeCategory ||
      params.party !== activeParty ||
      params.sort !== sortMethod
    ) {
      console.log("URLパラメータが変更されました:", params);

      // パラメータが変更された場合、状態を更新して再読み込み
      setActiveCategory(params.category);
      setActiveParty(params.party);
      setSortMethod(params.sort);

      // データをリセットして再取得
      setPolicies([]);
      setLastDocumentId(undefined);
      setHasMore(true);
      loadPolicies(
        params.category,
        params.party,
        params.sort,
        searchQuery,
        true
      );
    }
  }, [location.search]);

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
      // スクロール位置が画面下部に近づいたかを判定
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
          document.documentElement.offsetHeight &&
        !isLoading &&
        !isLoadingMore &&
        hasMore &&
        lastDocumentId
      ) {
        loadMorePolicies();
      }
    };

    // スクロールイベントリスナーの追加と削除
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [
    isLoading,
    isLoadingMore,
    hasMore,
    lastDocumentId,
    activeCategory,
    activeParty,
    sortMethod,
    searchQuery,
  ]);

  // ---- ヘルパー関数 ----
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
      {/* Header with gradient background */}
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
        {/* Category tabs - horizontal scrollable */}
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
                {policies.length}件の政策が見つかりました
                {!hasMore && policies.length > 0 && " (全件表示中)"}
                {isLoading && " (読み込み中...)"}
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
                      className={`w-full text-left px-4 py-2 text-sm ${
                        sortMethod === "supportDesc"
                          ? "bg-indigo-50 text-indigo-600 font-medium"
                          : "text-gray-700 hover:bg-indigo-50"
                      } flex items-center`}
                      onClick={() => handleSortChange("supportDesc")}
                    >
                      <ArrowUp size={16} className="mr-2 text-indigo-600" />
                      <span>支持率（高い順）</span>
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm ${
                        sortMethod === "supportAsc"
                          ? "bg-indigo-50 text-indigo-600 font-medium"
                          : "text-gray-700 hover:bg-indigo-50"
                      } flex items-center`}
                      onClick={() => handleSortChange("supportAsc")}
                    >
                      <ArrowDown size={16} className="mr-2 text-indigo-600" />
                      <span>支持率（低い順）</span>
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm ${
                        sortMethod === "newest"
                          ? "bg-indigo-50 text-indigo-600 font-medium"
                          : "text-gray-700 hover:bg-indigo-50"
                      } flex items-center`}
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
        {!isLoading && policies.length === 0 && !error && (
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

        {/* Policy Cards - vertical list */}
        <div className="space-y-4">
          {policies.map((policy, index) => {
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
          {!isLoadingMore && !hasMore && policies.length > 0 && (
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
