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
import { getPartyColor } from "../../utils/dataUtils";
import { hasVoted } from "../../utils/voteStorage";

// Global app state
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

// Combined styles
const STYLES = {
  header: {
    gradient:
      "relative bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 text-white overflow-hidden",
    overlay:
      "absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400 via-transparent to-transparent opacity-20",
  },
  search: (fired: boolean) => ({
    input: `w-full pl-10 pr-10 py-2 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20 
      focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-opacity-20 text-white 
      placeholder-white placeholder-opacity-70 backdrop-blur-sm md:w-[300px] lg:w-[350px] xl:w-[400px]
      ${fired ? "search-input-flash" : ""}`,
    icon: `text-white ${fired ? "search-icon-effect" : "opacity-70"}`,
    button: fired ? "search-button-effect" : "",
  }),
  category: (
    active: boolean
  ) => `relative px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 
    ${
      active
        ? "text-white shadow-lg"
        : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
    }`,
  sort: (
    active: boolean
  ) => `w-full text-left px-4 py-2 text-sm flex items-center
    ${
      active
        ? "bg-indigo-50 text-indigo-600 font-medium"
        : "text-gray-700 hover:bg-indigo-50"
    }`,
  filter:
    "absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-10 border border-indigo-100",
  card: {
    base: "bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer",
    animation: (animate: boolean, index: number) =>
      animate
        ? {
            animation: "fadeIn 0.3s ease-out forwards",
            animationDelay: `${index * 0.05}s`,
            opacity: 0,
          }
        : {},
  },
  wave: (i: number) => ({
    animation: `waveAnimation 0.8s ease-in-out ${i * 0.08}s infinite alternate`,
    opacity: 0.7 + i * 0.05,
  }),
};

// Animation keyframes
const ANIMATIONS = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
  .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
  .search-icon-effect { animation: searchIconGlow 0.6s ease-out; }
  @keyframes searchIconGlow { 
    0% { opacity: 0.7; transform: scale(1); }
    30% { opacity: 1; transform: scale(1.3); filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8)); }
    100% { opacity: 0.7; transform: scale(1); }
  }
  .search-input-flash { animation: inputFlash 0.6s ease-out; }
  @keyframes inputFlash {
    0% { background-color: rgba(255, 255, 255, 0.1); }
    30% { background-color: rgba(255, 255, 255, 0.25); }
    100% { background-color: rgba(255, 255, 255, 0.1); }
  }
  .search-button-effect { animation: buttonAction 0.6s ease-out; }
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

  // URL parameter management
  const getUrlParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      category: searchParams.get("category") || "all",
      party: searchParams.get("party") || "all",
      sort: searchParams.get("sort") || "supportDesc",
    };
  };

  const updateUrlParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(location.search);
    Object.entries(updates).forEach(([key, value]) => {
      value === "all" && key !== "sort"
        ? params.delete(key)
        : params.set(key, value);
    });

    navigate(
      {
        pathname: location.pathname,
        search: params.toString() ? `?${params.toString()}` : "",
      },
      { replace: true }
    );
  };

  // Combined state
  const [state, setState] = useState({
    // Filter state
    filters: {
      category: getUrlParams().category,
      party: getUrlParams().party,
      sort: getUrlParams().sort,
    },
    // Search state
    search: {
      query: "",
      tempQuery: "",
      fired: false,
    },
    // UI state
    ui: {
      showFilterMenu: false,
      animateItems: true,
    },
    // Data state
    data: {
      policies: [] as Policy[],
      lastDocId: undefined as string | undefined,
      hasMore: true,
    },
    // Loading state
    loading: {
      isLoading: true,
      isLoadingMore: false,
      error: null as string | null,
    },
    // Master data
    master: {
      categories: [
        {
          id: "all",
          name: "すべて",
          color: "#6366F1",
          icon: <Activity size={14} />,
        },
      ],
      parties: [{ id: "all", name: "すべての政党", color: "#6366F1" }],
    },
  });

  // Destructure state for convenience
  const { filters, search, ui, data, loading, master } = state;

  // App state management
  const saveToAppState = (
    policies: Policy[],
    lastDocId: string | undefined,
    hasMoreData: boolean,
    category: string,
    party: string,
    sort: string,
    query: string
  ) => {
    Object.assign(APP_STATE, {
      policies,
      lastDocumentId: lastDocId,
      hasMore: hasMoreData,
      scrollPosition: window.scrollY,
      category,
      party,
      sort,
      searchQuery: query,
    });
  };

  const resetAppState = () => {
    Object.assign(APP_STATE, {
      policies: [],
      lastDocumentId: undefined,
      hasMore: true,
      scrollPosition: 0,
      category: "",
      party: "",
      sort: "",
      searchQuery: "",
    });
  };

  // Data loading function
  const loadPolicies = async (
    category: string,
    party: string,
    sort: string,
    searchTerm: string = "",
    refresh: boolean = false
  ) => {
    try {
      setState((prev) => ({
        ...prev,
        loading: {
          ...prev.loading,
          isLoading: refresh ? true : prev.loading.isLoading,
          isLoadingMore: !refresh ? true : prev.loading.isLoadingMore,
          error: null,
        },
        ui: { ...prev.ui, animateItems: refresh },
      }));

      const docId = refresh ? undefined : data.lastDocId;
      const result = await fetchPoliciesWithFilterAndSort(
        category,
        party,
        sort,
        searchTerm,
        docId,
        10
      );
      console.log("Policies loaded:", result.policies);
      const updatedPolicies = refresh
        ? result.policies
        : [
            ...data.policies,
            ...result.policies.filter(
              (p) => !data.policies.some((existing) => existing.id === p.id)
            ),
          ];

      setState((prev) => ({
        ...prev,
        data: {
          policies: updatedPolicies,
          lastDocId: result.lastDocumentId,
          hasMore: result.hasMore,
        },
        loading: {
          ...prev.loading,
          isLoading: refresh ? false : prev.loading.isLoading,
          isLoadingMore: !refresh ? false : prev.loading.isLoadingMore,
        },
        ui: {
          ...prev.ui,
          animateItems: refresh ? prev.ui.animateItems : false,
        },
      }));

      if (refresh) {
        setTimeout(
          () =>
            setState((prev) => ({
              ...prev,
              ui: { ...prev.ui, animateItems: false },
            })),
          800
        );
      }

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
      setState((prev) => ({
        ...prev,
        loading: {
          ...prev.loading,
          isLoading: refresh ? false : prev.loading.isLoading,
          isLoadingMore: !refresh ? false : prev.loading.isLoadingMore,
          error: "政策データの読み込みに失敗しました。もう一度お試しください。",
        },
        data: {
          ...prev.data,
          policies: refresh ? [] : prev.data.policies,
        },
      }));
    }
  };

  // Load categories and parties
  const loadCategoriesAndParties = async () => {
    try {
      const allCategories = await fetchAllCategories();

      // Category icon and color mappings
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
        人権: { icon: <Activity size={14} />, color: "#EC4899" },
        医療: { icon: <Users size={14} />, color: "#14B8A6" },
        科学技術: { icon: <Activity size={14} />, color: "#3B82F6" },
        地方創生: { icon: <Building size={14} />, color: "#10B981" },
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
          color: categoryIconsAndColors[category]?.color || "#6B7280",
          icon: categoryIconsAndColors[category]?.icon || (
            <Activity size={14} />
          ),
        })),
      ];

      // Party data
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

      setState((prev) => ({
        ...prev,
        master: { categories: formattedCategories, parties: partyData },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: {
          ...prev.loading,
          error: "カテゴリデータの取得中にエラーが発生しました。",
        },
      }));
    }
  };

  // Event handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({
      ...prev,
      search: { ...prev.search, tempQuery: e.target.value },
    }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (search.tempQuery !== search.query) resetAppState();

    setState((prev) => ({
      ...prev,
      search: { ...prev.search, query: prev.search.tempQuery, fired: true },
      data: { policies: [], lastDocId: undefined, hasMore: true },
    }));

    loadPolicies(
      filters.category,
      filters.party,
      filters.sort,
      search.tempQuery,
      true
    );

    setTimeout(
      () =>
        setState((prev) => ({
          ...prev,
          search: { ...prev.search, fired: false },
        })),
      600
    );

    searchInputRef.current?.blur();
  };

  // Filter change handler
  const handleFilterChange = (
    type: "sort" | "category" | "party",
    value: string
  ) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, [type]: value },
      ui: {
        ...prev.ui,
        showFilterMenu: type === "category" ? prev.ui.showFilterMenu : false,
      },
      data: { policies: [], lastDocId: undefined, hasMore: true },
    }));

    updateUrlParams({ [type]: value });
    resetAppState();

    loadPolicies(
      type === "category" ? value : filters.category,
      type === "party" ? value : filters.party,
      type === "sort" ? value : filters.sort,
      search.query,
      true
    );
  };

  // Load more policies
  const loadMorePolicies = () => {
    if (
      !loading.isLoading &&
      !loading.isLoadingMore &&
      data.hasMore &&
      data.lastDocId
    ) {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, isLoadingMore: true },
      }));
      setTimeout(
        () =>
          loadPolicies(
            filters.category,
            filters.party,
            filters.sort,
            search.query,
            false
          ),
        800
      );
    }
  };

  const getCategoryById = (id: string) =>
    master.categories.find((cat) => cat.id === id) || master.categories[0];

  const getPartyById = (id: string) =>
    master.parties.find((party) => party.id === id) || master.parties[0];

  // Active entities
  const activeTab = getCategoryById(filters.category);
  const selectedParty = getPartyById(filters.party);

  // Initial load
  useEffect(() => {
    loadCategoriesAndParties();
    const params = getUrlParams();

    // Restore from app state if possible
    if (
      APP_STATE.policies.length > 0 &&
      APP_STATE.category === params.category &&
      APP_STATE.party === params.party &&
      APP_STATE.sort === params.sort
    ) {
      setState((prev) => ({
        ...prev,
        filters: {
          category: params.category,
          party: params.party,
          sort: params.sort,
        },
        data: {
          policies: APP_STATE.policies,
          lastDocId: APP_STATE.lastDocumentId,
          hasMore: APP_STATE.hasMore,
        },
        search: {
          query: APP_STATE.searchQuery,
          tempQuery: APP_STATE.searchQuery,
          fired: false,
        },
        ui: { ...prev.ui, animateItems: false },
        loading: { ...prev.loading, isLoading: false },
      }));

      setTimeout(() => window.scrollTo(0, APP_STATE.scrollPosition), 100);
    } else {
      setState((prev) => ({
        ...prev,
        filters: {
          category: params.category,
          party: params.party,
          sort: params.sort,
        },
      }));

      loadPolicies(params.category, params.party, params.sort, "", true);
    }
  }, []);

  // URL change handler
  useEffect(() => {
    const params = getUrlParams();

    if (
      params.category !== filters.category ||
      params.party !== filters.party ||
      params.sort !== filters.sort
    ) {
      setState((prev) => ({
        ...prev,
        filters: {
          category: params.category,
          party: params.party,
          sort: params.sort,
        },
        data: { policies: [], lastDocId: undefined, hasMore: true },
      }));

      resetAppState();
      loadPolicies(
        params.category,
        params.party,
        params.sort,
        search.query,
        true
      );
    }
  }, [location.search]);

  // Scroll and infinite loading handler
  useEffect(() => {
    const handleScroll = () => {
      if (data.policies.length > 0) APP_STATE.scrollPosition = window.scrollY;

      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
          document.documentElement.offsetHeight &&
        !loading.isLoading &&
        !loading.isLoadingMore &&
        data.hasMore &&
        data.lastDocId
      ) {
        loadMorePolicies();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [
    data.policies,
    loading.isLoading,
    loading.isLoadingMore,
    data.hasMore,
    data.lastDocId,
  ]);

  // Handle outside click for filter menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ui.showFilterMenu) {
        const target = event.target as Node;
        const filterMenu = document.getElementById("filter-menu-container");
        if (filterMenu && !filterMenu.contains(target)) {
          setState((prev) => ({
            ...prev,
            ui: { ...prev.ui, showFilterMenu: false },
          }));
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ui.showFilterMenu]);

  // Component rendering
  const renderCategoryTabs = () => (
    <div className="mb-8 overflow-x-auto">
      <div className="flex space-x-3 pb-2">
        {master.categories.map((category) => {
          const isActive = filters.category === category.id;
          return (
            <button
              key={category.id}
              className={STYLES.category(isActive)}
              style={{ backgroundColor: isActive ? category.color : "" }}
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
          setState((prev) => ({
            ...prev,
            ui: { ...prev.ui, showFilterMenu: !prev.ui.showFilterMenu },
          }))
        }
      >
        <Filter size={16} className="mr-2 text-indigo-600" />
        <span>並び替え</span>
      </button>

      {ui.showFilterMenu && (
        <div className={STYLES.filter}>
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
              {
                id: "commentsDesc",
                label: "コメント数（多い順）",
                icon: (
                  <MessageSquare size={16} className="mr-2 text-indigo-600" />
                ),
              },
            ].map((option) => (
              <button
                key={option.id}
                className={STYLES.sort(filters.sort === option.id)}
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
            {master.parties.map((party) => (
              <button
                key={party.id}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center"
                onClick={() => handleFilterChange("party", party.id)}
              >
                <div
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: party.color }}
                ></div>
                <span
                  className={filters.party === party.id ? "font-medium" : ""}
                >
                  {party.name}
                </span>
                {filters.party === party.id && (
                  <span className="ml-auto text-indigo-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  //proposingParty
  const renderPolicyCard = (policy: Policy, index: number) => (
    <div
      key={policy.id}
      className={STYLES.card.base}
      style={{
        borderLeft: `4px solid ${getPartyColor(policy.name)}`,
        ...STYLES.card.animation(ui.animateItems, index),
      }}
      onClick={() => navigateToPolicy(navigate, policy.id)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <div
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: `${getPartyColor(policy.name)}15`,
                color: getPartyColor(policy.name),
              }}
            >
              {policy.name}
            </div>
            {!hasVoted(policy.id) && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium animate-pulse flex items-center">
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

          {/* {getTrendingIcon(policy.trending)} ここにトレンドアイコンを入れるiconを入れる予定*/}
        </div>
        {/* Title and description */}
        <div className="flex items-start mb-2">
          <img
            src={`cm_parly_images/${policy.name}.jpg`}
            alt={`${policy.name} icon`}
            className="w-6 h-6 mr-2 mt-1 rounded-full object-cover flex-shrink-0"
          />
          <h3 className="font-bold text-lg text-gray-800">{policy.title}</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">{policy.description}</p>

        {/* Tags */}
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

        {/* Support rate bar */}
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

  // UI states
  const renderLoadingState = () => (
    <div className="flex justify-center items-center py-12">
      <LoadingAnimation type="dots" message="政策データを読み込み中..." />
    </div>
  );

  const renderErrorState = () => (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle size={20} className="text-red-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm">{loading.error}</p>
        </div>
      </div>
    </div>
  );

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

  const renderLoadingMore = () => (
    <div className="flex flex-col items-center justify-center py-6 overflow-hidden">
      <div className="relative flex">
        <div className="flex space-x-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-6 rounded-full bg-indigo-500"
              style={STYLES.wave(i)}
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
      {/* Header */}
      <div className={STYLES.header.gradient}>
        <div className="absolute inset-0">
          <div className={STYLES.header.overlay}></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-400 via-transparent to-transparent opacity-20"></div>
        </div>

        <div className="container mx-auto px-4 py-3 relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h3 className="text-base font-bold mb-1 inline-flex items-center">
              <div className="mr-2 p-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded">
                <AlertCircle size={14} className="text-white" />
              </div>
              政策について
            </h3>
            <p className="text-sm md:text-base opacity-80 mb-3">
              政策は中立の立場を保ち、公平な紹介を心掛けています
            </p>

            <div className="flex flex-row justify-around space-x-3 mt-2 w-full sm:w-auto">
              <button
                className="inline-flex items-center px-2 py-2 rounded-full text-white text-sm font-medium transition-all duration-200 bg-gradient-to-r from-indigo-600/30 to-indigo-500/90 hover:from-indigo-500 hover:to-indigo-400 shadow-md hover:shadow-lg border border-indigo-300/30"
                onClick={() => navigate("/policyinfo")}
              >
                <Activity size={16} className="mr-2" />
                詳しくはこちら
                <ChevronRight size={16} className="ml-1" />
              </button>

              <button
                className="inline-flex items-center px-2 py-2 rounded-full text-white text-sm font-medium transition-all duration-200 bg-gradient-to-r from-purple-600/30 to-purple-500/90 hover:from-purple-500 hover:to-purple-400 shadow-md hover:shadow-lg border border-purple-300/30"
                onClick={() => navigate("/partyinfo")}
              >
                <Building size={16} className="mr-2" />
                政党の皆様へ
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {/* Category tabs */}
        {renderCategoryTabs()}

        {/* Header */}
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
                  {filters.party === "all"
                    ? activeTab.name
                    : selectedParty.name}
                </span>
                <span>政策一覧</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {activeTab.name !== "すべて" ? `${activeTab.name}` : "全ての"}
                政策
                {loading.isLoading && " (読み込み中...)"}
              </p>
            </div>

            {/* Filter menu */}
            {renderFilterMenu()}
          </div>
        </div>

        {/* Content states */}
        {loading.isLoading &&
          data.policies.length === 0 &&
          renderLoadingState()}
        {loading.error && renderErrorState()}
        {!loading.isLoading &&
          data.policies.length === 0 &&
          !loading.error &&
          renderEmptyState()}

        {/* Policy cards */}
        <div className="space-y-4">
          {data.policies.map((policy, index) =>
            renderPolicyCard(policy, index)
          )}
          {loading.isLoadingMore && renderLoadingMore()}
          {!loading.isLoadingMore &&
            !data.hasMore &&
            data.policies.length > 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                すべての政策を表示しました
              </div>
            )}
        </div>
      </div>

      {/* Back to top button */}
      <div className="fixed bottom-6 right-6">
        <button
          className="w-12 h-12 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-indigo-700 transition-colors"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="ページトップへ戻る"
        >
          <TrendingUp size={20} />
        </button>
      </div>

      {/* Animations */}
      <style>{ANIMATIONS}</style>
    </div>
  );
};

export default PolicyListingPage;
