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

// アプリケーション側でデータを保持するための単一のグローバル変数
// Reactのレンダリングサイクルの外に保持するため、リロードされるまで維持される
const APP_STATE = {
  policies: [] as Policy[],
  scrollPosition: 0,
  lastDocumentId: undefined as string | undefined,
  hasMore: true,
  category: "",
  party: "",
  sort: "",
  searchQuery: "",
};

// Style constants
const STYLES = {
  headerGradient:
    "relative bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 text-white overflow-hidden",
  headerOverlay:
    "absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400 via-transparent to-transparent opacity-20",
  searchInput: (
    searchFired: any
  ) => `w-full pl-10 pr-10 py-2 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20 
    focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-opacity-20 text-white 
    placeholder-white placeholder-opacity-70 backdrop-blur-sm md:w-[300px] lg:w-[350px] xl:w-[400px]
    ${searchFired ? "search-input-flash" : ""}`,
  searchIcon: (searchFired: any) =>
    `text-white ${searchFired ? "search-icon-effect" : "opacity-70"}`,
  searchButton: (searchFired: any) =>
    searchFired ? "search-button-effect" : "",
  categoryButton: (
    isActive: any
  ) => `relative px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 
    ${
      isActive
        ? "text-white shadow-lg"
        : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
    }`,
  sortButton: (
    isActive: any
  ) => `w-full text-left px-4 py-2 text-sm flex items-center
    ${
      isActive
        ? "bg-indigo-50 text-indigo-600 font-medium"
        : "text-gray-700 hover:bg-indigo-50"
    }`,
  filterMenu:
    "absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-10 border border-indigo-100",
  policyCard: (animateItems: any, index: number) =>
    animateItems
      ? {
          animation: "fadeIn 0.3s ease-out forwards",
          animationDelay: `${index * 0.05}s`,
          opacity: 0,
        }
      : {},
  policyCardBase:
    "bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer",
  loadingWave: (i: number) => ({
    animation: `waveAnimation 0.8s ease-in-out ${i * 0.08}s infinite alternate`,
    opacity: 0.7 + i * 0.05,
  }),
};

// Animation styles
const ANIMATIONS = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
  }

  .animate-bounce-slow {
    animation: bounce-slow 2s ease-in-out infinite;
  }
  
  .search-icon-effect {
    animation: searchIconGlow 0.6s ease-out;
  }
  
  @keyframes searchIconGlow {
    0% { opacity: 0.7; transform: scale(1); }
    30% { opacity: 1; transform: scale(1.3); filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8)); }
    100% { opacity: 0.7; transform: scale(1); }
  }
  
  .search-input-flash {
    animation: inputFlash 0.6s ease-out;
  }
  
  @keyframes inputFlash {
    0% { background-color: rgba(255, 255, 255, 0.1); }
    30% { background-color: rgba(255, 255, 255, 0.25); }
    100% { background-color: rgba(255, 255, 255, 0.1); }
  }
  
  .search-button-effect {
    animation: buttonAction 0.6s ease-out;
  }
  
  @keyframes buttonAction {
    0% { transform: translateX(0); }
    30% { transform: translateX(3px); }
    60% { transform: translateX(0); }
  }
  
  @keyframes waveAnimation {
    0% { height: 6px; transform: translateY(10px); }
    50% { height: 24px; transform: translateY(0); }
    100% { height: 6px; transform: translateY(10px); }
  }
`;

const PolicyListingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // URL パラメータ管理
  const getUrlParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      category: searchParams.get("category") || "all",
      party: searchParams.get("party") || "all",
      sort: searchParams.get("sort") || "supportDesc",
    };
  };

  const updateUrlParams = (
    updates: { [s: string]: unknown } | ArrayLike<unknown>
  ) => {
    const params = new URLSearchParams(location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "all" && key !== "sort") {
        params.delete(key);
      } else {
        params.set(key, value as string);
      }
    });
    navigate(
      {
        pathname: location.pathname,
        search: params.toString() ? `?${params.toString()}` : "",
      },
      { replace: true }
    );
  };

  // 状態管理（グループ化して状態変数の数を削減）
  const [filterState, setFilterState] = useState({
    activeCategory: getUrlParams().category,
    activeParty: getUrlParams().party,
    sortMethod: getUrlParams().sort,
  });

  const [searchState, setSearchState] = useState({
    tempSearchQuery: "",
    searchQuery: "",
    searchFired: false,
  });

  const [uiState, setUiState] = useState({
    showFilterMenu: false,
    showPartyFilter: false,
    animateItems: true,
  });

  const [policyData, setPolicyData] = useState({
    policies: [] as Policy[],
    lastDocumentId: undefined as string | undefined,
    hasMore: true,
  });

  const [loadingState, setLoadingState] = useState({
    isLoading: true,
    isLoadingMore: false,
    error: null as string | null,
  });

  // マスターデータ
  const [masterData, setMasterData] = useState({
    categories: [
      {
        id: "all",
        name: "すべて",
        color: "#6366F1",
        icon: <Activity size={14} />,
      },
    ],
    parties: [
      {
        id: "all",
        name: "すべての政党",
        color: "#6366F1",
      },
    ],
  });

  // 状態の分割代入
  const { activeCategory, activeParty, sortMethod } = filterState;
  const { tempSearchQuery, searchQuery, searchFired } = searchState;
  const { showFilterMenu, animateItems } = uiState;
  const { policies, lastDocumentId, hasMore } = policyData;
  const { isLoading, isLoadingMore, error } = loadingState;
  const { categories, parties } = masterData;

  // アプリケーション状態にデータを保存
  const saveToAppState = (
    policies: Policy[],
    lastDocId: string | undefined,
    hasMoreData: boolean,
    category: string,
    party: string,
    sort: string,
    search: string
  ) => {
    APP_STATE.policies = policies;
    APP_STATE.lastDocumentId = lastDocId;
    APP_STATE.hasMore = hasMoreData;
    APP_STATE.scrollPosition = window.scrollY;
    APP_STATE.category = category;
    APP_STATE.party = party;
    APP_STATE.sort = sort;
    APP_STATE.searchQuery = search;

    // APP_STATEの状態をログ出力
    console.table({
      データ件数: APP_STATE.policies.length,
      スクロール位置: APP_STATE.scrollPosition,
      ドキュメントID: APP_STATE.lastDocumentId,
      続きあり: APP_STATE.hasMore,
      カテゴリー: APP_STATE.category,
      政党フィルター: APP_STATE.party,
      ソート条件: APP_STATE.sort,
      検索クエリ: APP_STATE.searchQuery,
    });

    // 政策データのサンプルをログ出力
    if (APP_STATE.policies.length > 0) {
      console.log("政策データサンプル:");
      console.table(
        APP_STATE.policies.slice(0, 3).map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          supportRate: p.supportRate,
        }))
      );
    }
  };

  // アプリケーション状態のリセット
  const resetAppState = () => {
    console.log("APP_STATEをリセットします");

    APP_STATE.policies = [];
    APP_STATE.lastDocumentId = undefined;
    APP_STATE.hasMore = true;
    APP_STATE.scrollPosition = 0;
    APP_STATE.category = "";
    APP_STATE.party = "";
    APP_STATE.sort = "";
    APP_STATE.searchQuery = "";

    // リセット後の状態をログ出力
    console.table({
      データ件数: APP_STATE.policies.length,
      スクロール位置: APP_STATE.scrollPosition,
      ドキュメントID: APP_STATE.lastDocumentId,
      続きあり: APP_STATE.hasMore,
      カテゴリー: APP_STATE.category,
      政党フィルター: APP_STATE.party,
      ソート条件: APP_STATE.sort,
      検索クエリ: APP_STATE.searchQuery,
    });
  };

  // 政策データ読み込み関数（統合）
  const loadPolicies = async (
    category: string,
    party: string,
    sort: string,
    searchTerm: string = "",
    refresh: boolean = false
  ) => {
    try {
      // ローディング状態の管理（簡略化）
      setLoadingState((prev) => ({
        ...prev,
        isLoading: refresh ? true : prev.isLoading,
        isLoadingMore: !refresh ? true : prev.isLoadingMore,
        error: null,
      }));

      setUiState((prev) => ({ ...prev, animateItems: refresh }));

      // 最後のドキュメントID設定
      const docId = refresh ? undefined : lastDocumentId;

      console.log(
        `政策データ読み込み - カテゴリ:${category}, 政党:${party}, ソート:${sort}, 検索:${
          searchTerm || "なし"
        }, 続きから:${docId ? "あり" : "なし"}`
      );

      // サーバーサイドでフィルターとソートを適用して取得
      const result = await fetchPoliciesWithFilterAndSort(
        category,
        party,
        sort,
        searchTerm,
        docId,
        10
      );

      console.log(
        `Firestore取得: ${
          result.policies.length
        }件の政策ドキュメント取得 (カテゴリ:${category}, 政党:${party}, ソート:${sort}, 検索:${
          searchTerm || "なし"
        }, 続きから:${docId ? "あり" : "なし"})`
      );

      // データの更新
      let updatedPolicies: Policy[];

      if (refresh) {
        updatedPolicies = result.policies;
        setPolicyData((prev) => ({
          ...prev,
          policies: result.policies,
          lastDocumentId: result.lastDocumentId,
          hasMore: result.hasMore,
        }));

        // アニメーション状態をリセット
        setTimeout(() => {
          setUiState((prev) => ({ ...prev, animateItems: false }));
        }, 800);
      } else {
        const existingIds = new Set(policies.map((p) => p.id));
        const newPolicies = result.policies.filter(
          (p) => !existingIds.has(p.id)
        );
        updatedPolicies = [...policies, ...newPolicies];

        setPolicyData((prev) => ({
          ...prev,
          policies: updatedPolicies,
          lastDocumentId: result.lastDocumentId,
          hasMore: result.hasMore,
        }));
      }

      // アプリケーション状態を更新
      saveToAppState(
        updatedPolicies,
        result.lastDocumentId,
        result.hasMore,
        category,
        party,
        sort,
        searchTerm
      );
    } catch (error) {
      console.error("政策データ読み込みエラー:", error);
      setLoadingState((prev) => ({
        ...prev,
        error: "政策データの読み込みに失敗しました。もう一度お試しください。",
      }));

      if (refresh) {
        setPolicyData((prev) => ({ ...prev, policies: [] }));
      }
    } finally {
      // ローディング状態の解除
      setLoadingState((prev) => ({
        ...prev,
        isLoading: refresh ? false : prev.isLoading,
        isLoadingMore: !refresh ? false : prev.isLoadingMore,
      }));
    }
  };

  // カテゴリとパーティのマスターデータを読み込む（簡略化）
  const loadCategoriesAndParties = async () => {
    try {
      setLoadingState((prev) => ({ ...prev, isLoading: true }));

      // カテゴリデータを取得
      const allCategories = await fetchAllCategories();
      console.log(
        `Firestore取得: ${allCategories.length}件のカテゴリドキュメント取得`
      );

      // カテゴリアイコンと色のマッピング
      const categoryIconsAndColors: Record<
        string,
        { icon: JSX.Element; color: string }
      > = {
        経済: { icon: <TrendingUp size={14} />, color: "#06B6D4" },
        環境: { icon: <AlertCircle size={14} />, color: "#10B981" },
        教育: { icon: <Users size={14} />, color: "#F59E0B" },
        社会保障: { icon: <Users size={14} />, color: "#8B5CF6" },
        安全保障: { icon: <AlertCircle size={14} />, color: "#EF4444" },
        外交: { icon: <Users size={14} />, color: "#3B82F6" },
        労働: { icon: <Activity size={14} />, color: "#EC4899" },
        健康: { icon: <Users size={14} />, color: "#14B8A6" },
        科学技術: { icon: <Activity size={14} />, color: "#3B82F6" },
        地方創生: { icon: <Building size={14} />, color: "#10B981" },
      };

      // カテゴリデータを整形
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
          color: categoryIconsAndColors[category]?.color || "#6B7280",
          icon: categoryIconsAndColors[category]?.icon || (
            <Activity size={14} />
          ),
        })),
      ];

      // 政党データ（サンプル）
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

      setMasterData({
        categories: formattedCategories,
        parties: partyData,
      });
    } catch (error) {
      console.error("カテゴリ・政党データ取得エラー:", error);
      setLoadingState((prev) => ({
        ...prev,
        error: "カテゴリデータの取得中にエラーが発生しました。",
      }));
    }
  };

  // イベントハンドラ（汎用化）
  const handleSearchChange = (e: { target: { value: any } }) => {
    setSearchState((prev) => ({ ...prev, tempSearchQuery: e.target.value }));
  };

  const handleSearchSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    // 検索クエリが変更された場合はアプリケーション状態をリセット
    if (tempSearchQuery !== searchQuery) {
      resetAppState();
    }

    setSearchState((prev) => ({
      ...prev,
      searchQuery: prev.tempSearchQuery,
      searchFired: true,
    }));

    setPolicyData((prev) => ({
      ...prev,
      policies: [],
      lastDocumentId: undefined,
      hasMore: true,
    }));

    loadPolicies(
      activeCategory,
      activeParty,
      sortMethod,
      tempSearchQuery,
      true
    );

    setTimeout(() => {
      setSearchState((prev) => ({ ...prev, searchFired: false }));
    }, 600);

    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  // フィルター変更ハンドラを統合
  const handleFilterChange = (
    type: "sort" | "category" | "party",
    value: string
  ) => {
    // フィルター状態更新マッピング
    const stateUpdates = {
      sort: { sortMethod: value },
      category: { activeCategory: value },
      party: { activeParty: value },
    };

    // フィルター状態を更新
    setFilterState((prev) => ({ ...prev, ...stateUpdates[type] }));

    // ドロップダウンを閉じる（ソートと政党変更時）
    if (type !== "category") {
      setUiState((prev) => ({ ...prev, showFilterMenu: false }));
    }

    // URL更新
    updateUrlParams({ [type]: value });

    // データをリセットして再取得
    setPolicyData({
      policies: [],
      lastDocumentId: undefined,
      hasMore: true,
    });

    // アプリケーション状態をリセット
    resetAppState();

    // フィルター条件で新しいデータを読み込み
    loadPolicies(
      type === "category" ? value : activeCategory,
      type === "party" ? value : activeParty,
      type === "sort" ? value : sortMethod,
      searchQuery,
      true
    );
  };

  // 政策カードクリック時の処理
  const handlePolicyClick = (policyId: string) => {
    navigateToPolicy(navigate, policyId);
  };

  // 無限スクロールのための追加読み込み
  const loadMorePolicies = () => {
    if (!isLoading && !isLoadingMore && hasMore && lastDocumentId) {
      setLoadingState((prev) => ({ ...prev, isLoadingMore: true }));
      setTimeout(() => {
        loadPolicies(
          activeCategory,
          activeParty,
          sortMethod,
          searchQuery,
          false
        );
      }, 800);
    }
  };

  // ヘルパー関数
  const getTrendingIcon = (trend: string) => {
    if (trend === "up") {
      return <TrendingUp size={16} className="text-green-500" />;
    }
    return (
      <TrendingUp size={16} className="text-red-500 transform rotate-180" />
    );
  };

  const getCategoryById = (id: string) => {
    return categories.find((cat) => cat.id === id) || categories[0];
  };

  const getPartyById = (id: string) => {
    return parties.find((party) => party.id === id) || parties[0];
  };

  // 現在のアクティブデータ
  const activeTab = getCategoryById(activeCategory);
  const selectedParty = getPartyById(activeParty);

  // 初期ロード
  useEffect(() => {
    // マスターデータとポリシーデータを並行ロード
    loadCategoriesAndParties();

    const params = getUrlParams();

    // URL条件をログ出力
    console.log("URLパラメータ:", params);

    // アプリケーション状態をログ出力
    console.table({
      データ件数: APP_STATE.policies.length,
      スクロール位置: APP_STATE.scrollPosition,
      ドキュメントID: APP_STATE.lastDocumentId,
      続きあり: APP_STATE.hasMore,
      カテゴリー: APP_STATE.category,
      政党フィルター: APP_STATE.party,
      ソート条件: APP_STATE.sort,
      検索クエリ: APP_STATE.searchQuery,
      URL一致:
        APP_STATE.category === params.category &&
        APP_STATE.party === params.party &&
        APP_STATE.sort === params.sort,
    });

    // アプリケーション状態とURLパラメータが一致する場合のみ復元
    if (
      APP_STATE.policies.length > 0 &&
      APP_STATE.category === params.category &&
      APP_STATE.party === params.party &&
      APP_STATE.sort === params.sort
    ) {
      console.log("アプリケーション状態から復元します");

      setFilterState({
        activeCategory: params.category,
        activeParty: params.party,
        sortMethod: params.sort,
      });

      setPolicyData({
        policies: APP_STATE.policies,
        lastDocumentId: APP_STATE.lastDocumentId,
        hasMore: APP_STATE.hasMore,
      });

      setSearchState((prev) => ({
        ...prev,
        searchQuery: APP_STATE.searchQuery,
        tempSearchQuery: APP_STATE.searchQuery,
      }));

      setUiState((prev) => ({ ...prev, animateItems: false }));
      setLoadingState((prev) => ({ ...prev, isLoading: false }));

      // 少し遅延させてからスクロール位置を復元
      setTimeout(() => {
        window.scrollTo(0, APP_STATE.scrollPosition);
        console.log(`スクロール位置を復元: ${APP_STATE.scrollPosition}px`);
      }, 100);
    } else {
      console.log("通常のデータロードを実行します");
      setFilterState({
        activeCategory: params.category,
        activeParty: params.party,
        sortMethod: params.sort,
      });

      loadPolicies(params.category, params.party, params.sort, "", true);
    }
  }, []);

  // URL変更時の処理
  useEffect(() => {
    const params = getUrlParams();

    if (
      params.category !== activeCategory ||
      params.party !== activeParty ||
      params.sort !== sortMethod
    ) {
      console.log("URL パラメータ変更を検出しました");
      console.table({
        変更前: {
          category: activeCategory,
          party: activeParty,
          sort: sortMethod,
        },
        変更後: {
          category: params.category,
          party: params.party,
          sort: params.sort,
        },
      });

      setFilterState({
        activeCategory: params.category,
        activeParty: params.party,
        sortMethod: params.sort,
      });

      setPolicyData({
        policies: [],
        lastDocumentId: undefined,
        hasMore: true,
      });

      // アプリケーション状態をリセット
      resetAppState();

      loadPolicies(
        params.category,
        params.party,
        params.sort,
        searchQuery,
        true
      );
    }
  }, [location.search]);

  // スクロール位置の保存と無限スクロール検知
  useEffect(() => {
    const handleScroll = () => {
      // スクロール位置の保存
      if (policies.length > 0) {
        APP_STATE.scrollPosition = window.scrollY;

        // 100px毎にログ出力（頻繁すぎるログを避けるため）
        if (
          Math.floor(window.scrollY / 100) !==
          Math.floor(APP_STATE.scrollPosition / 100)
        ) {
          console.log(`スクロール位置: ${window.scrollY}px`);
        }
      }

      // 無限スクロール検出
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
          document.documentElement.offsetHeight &&
        !isLoading &&
        !isLoadingMore &&
        hasMore &&
        lastDocumentId
      ) {
        console.log("画面下部に到達: 追加データをロードします");
        loadMorePolicies();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [policies, isLoading, isLoadingMore, hasMore, lastDocumentId]);

  // メニュー外クリック検知
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFilterMenu) {
        const target = event.target as Node;
        const filterMenu = document.getElementById("filter-menu-container");
        if (filterMenu && !filterMenu.contains(target)) {
          setUiState((prev) => ({ ...prev, showFilterMenu: false }));
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilterMenu]);

  // レンダリングヘルパー関数
  const renderCategoryTabs = () => (
    <div className="mb-8 overflow-x-auto">
      <div className="flex space-x-3 pb-2">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              className={STYLES.categoryButton(isActive)}
              style={{
                backgroundColor: isActive ? category.color : "",
              }}
              onClick={() => handleFilterChange("category", category.id)}
            >
              <div className="flex items-center">
                <span className="mr-2">{category.icon}</span>
                <span className={isActive ? "font-bold" : ""}>
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
  );

  const renderFilterMenu = () => (
    <div className="relative" id="filter-menu-container">
      <button
        className="flex items-center bg-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all border border-gray-200"
        onClick={() =>
          setUiState((prev) => ({
            ...prev,
            showFilterMenu: !prev.showFilterMenu,
          }))
        }
      >
        <Filter size={16} className="mr-2 text-indigo-600" />
        <span>並び替え</span>
      </button>

      {showFilterMenu && (
        <div className={STYLES.filterMenu}>
          <div className="py-1 border-b border-gray-100">
            <div className="px-4 py-1.5 text-xs font-semibold text-gray-500">
              並び替え
            </div>

            {[
              {
                id: "supportDesc",
                label: "支持率（高い順）",
                icon: <ArrowUp size={16} className="mr-2 text-indigo-600" />,
              },
              {
                id: "supportAsc",
                label: "支持率（低い順）",
                icon: <ArrowDown size={16} className="mr-2 text-indigo-600" />,
              },
            ].map((option) => (
              <button
                key={option.id}
                className={STYLES.sortButton(sortMethod === option.id)}
                onClick={() => handleFilterChange("sort", option.id)}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          <div className="py-1">
            <div className="px-4 py-1.5 text-xs font-semibold text-gray-500">
              政党で絞り込み
            </div>
            {parties.map((party) => (
              <button
                key={party.id}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center"
                onClick={() => handleFilterChange("party", party.id)}
              >
                <div
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: party.color }}
                ></div>
                <span className={activeParty === party.id ? "font-medium" : ""}>
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
  );

  const renderPolicyCard = (policy: Policy, index: number) => {
    const cardStyle = {
      borderLeft: `4px solid ${policy.proposingParty.color}`,
      ...STYLES.policyCard(animateItems, index),
    };

    return (
      <div
        key={policy.id}
        className={STYLES.policyCardBase}
        style={cardStyle}
        onClick={() => handlePolicyClick(policy.id)}
      >
        <div className="p-4">
          {/* ヘッダー部分 */}
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

          {/* タイトルと説明 */}
          <h3 className="font-bold text-lg mb-2 text-gray-800">
            {policy.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4">{policy.description}</p>

          {/* タグセクション */}
          <div className="flex flex-wrap gap-2 mb-3">
            {policy.affectedFields.map((field, i) => {
              const fieldCategory = getCategoryById(field);
              return (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-full text-white"
                  style={{ backgroundColor: fieldCategory.color }}
                >
                  {field}
                </span>
              );
            })}
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 flex items-center">
              <MessageSquare size={12} className="mr-1 flex-shrink-0" />
              {policy.totalCommentCount}件のコメント
            </span>
          </div>

          {/* 支持率バー */}
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
                  backgroundColor: "#10B981",
                }}
              ></div>
              <div
                className="h-full rounded-r-full"
                style={{
                  width: `${policy.opposeRate}%`,
                  backgroundColor: "#EF4444",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 読み込み中の表示
  const renderLoadingState = () => (
    <div className="flex justify-center items-center py-12">
      <LoadingAnimation type="dots" message="政策データを読み込み中..." />
    </div>
  );

  // エラー表示
  const renderErrorState = () => (
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
  );

  // データ空表示
  const renderEmptyState = () => (
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
  );

  // 追加読み込み表示
  const renderLoadingMore = () => (
    <div className="flex flex-col items-center justify-center py-6 overflow-hidden">
      <div className="relative flex">
        <div className="flex space-x-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-6 rounded-full bg-indigo-500"
              style={STYLES.loadingWave(i)}
            ></div>
          ))}
        </div>
      </div>
      <div className="mt-4 text-indigo-600 font-medium text-sm tracking-wider animate-pulse">
        次のデータを読み込み中...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー部分 */}
      <div className={STYLES.headerGradient}>
        <div className="absolute inset-0">
          <div className={STYLES.headerOverlay}></div>
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
              <Search size={18} className={STYLES.searchIcon(searchFired)} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={
                activeParty === "all"
                  ? "全ての政策を検索..."
                  : `${selectedParty.name}の政策を検索...`
              }
              className={STYLES.searchInput(searchFired)}
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
                className={STYLES.searchButton(searchFired)}
              />
            </button>
          </form>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8">
        {/* カテゴリタブ */}
        {renderCategoryTabs()}

        {/* ヘッダー部分 */}
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
                {policies.length}件の
                {activeTab.name !== "すべて" ? `${activeTab.name}` : ""}政策
                {isLoading && " (読み込み中...)"}
              </p>
            </div>

            {/* フィルターメニュー */}
            {renderFilterMenu()}
          </div>
        </div>

        {/* ローディング状態 */}
        {isLoading && policies.length === 0 && renderLoadingState()}

        {/* エラー状態 */}
        {error && renderErrorState()}

        {/* データなし状態 */}
        {!isLoading && policies.length === 0 && !error && renderEmptyState()}

        {/* 政策カードリスト */}
        <div className="space-y-4">
          {policies.map((policy, index) => renderPolicyCard(policy, index))}

          {/* 追加ローディング */}
          {isLoadingMore && renderLoadingMore()}

          {/* 全データ表示完了メッセージ */}
          {!isLoadingMore && !hasMore && policies.length > 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              すべての政策を表示しました
            </div>
          )}
        </div>
      </div>

      {/* トップへ戻るボタン */}
      <div className="fixed bottom-6 right-6">
        <button
          className="w-12 h-12 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-indigo-700 transition-colors"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="ページトップへ戻る"
        >
          <TrendingUp size={20} />
        </button>
      </div>

      {/* アニメーションスタイル */}
      <style>{ANIMATIONS}</style>
    </div>
  );
};

export default PolicyListingPage;
