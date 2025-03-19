// src/context/DataContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  JSX,
  useMemo,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Politician, Party } from "../types";
import { TrendingUp, Activity } from "lucide-react";
import { processPoliticiansData, processPartiesData } from "../utils/dataUtils";
import { fetchPoliticianById } from "../services/politicianService";

// キャッシュされた政治家リストのインターフェース
interface CachedPoliticiansData {
  politicians: Politician[];
  lastDocumentId?: string;
  hasMore: boolean;
  currentPage: number;
}

// キャッシュされた政党ごとの政治家リストのインターフェース
interface CachedPartyPoliticiansData {
  partyId: string; // どの政党のデータか識別するためのID
  politicians: Politician[];
  lastDocumentId?: string;
  hasMore: boolean;
  currentPage: number;
}

// Context type definition
interface DataContextType {
  // State
  politicians: Politician[];
  parties: Party[];
  selectedPolitician: Politician | null;
  selectedParty: Party | null;
  voteType: "support" | "oppose" | null;
  activeTab: string;
  showReasonForm: boolean;
  expandedComments: Record<string, boolean>;
  replyingTo: { comment?: any; parentComment?: any } | null;
  replyText: string;
  reason: string;
  sortMethod: string;
  showPremiumBanner: boolean;
  isScrolled: boolean;
  showFixedBottomAd: boolean;
  showInlineAd: boolean;
  mobileMenuOpen: boolean;
  showAllPoliticians: boolean;
  globalPoliticians: Politician[]; // Global politicians data
  globalParties: Party[]; // Global parties data
  dataInitialized: boolean; // Flag to track if data is initialized
  isLoadingPolitician: boolean; // New flag for politician loading state
  currentPage: number; // New state for current page number
  // 新しく追加：キャッシュされた政治家データ
  cachedPoliticians: CachedPoliticiansData | null;
  // 新しく追加：キャッシュされた政党ごとの政治家リスト
  cachedPartyPoliticians: Record<string, CachedPartyPoliticiansData> | null;

  // State setters
  setPoliticians: React.Dispatch<React.SetStateAction<Politician[]>>;
  setParties: React.Dispatch<React.SetStateAction<Party[]>>;
  setSelectedPolitician: React.Dispatch<
    React.SetStateAction<Politician | null>
  >;
  setSelectedParty: React.Dispatch<React.SetStateAction<Party | null>>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  setExpandedComments: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  setReplyingTo: React.Dispatch<
    React.SetStateAction<{ comment?: any; parentComment?: any } | null>
  >;
  setReplyText: React.Dispatch<React.SetStateAction<string>>;
  setSortMethod: React.Dispatch<React.SetStateAction<string>>;
  setShowPremiumBanner: React.Dispatch<React.SetStateAction<boolean>>;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>; // New setter for current page
  // 新しく追加：キャッシュされた政治家データのセッター
  setCachedPoliticians: React.Dispatch<
    React.SetStateAction<CachedPoliticiansData | null>
  >;
  // 新しく追加：キャッシュされた政党ごとの政治家リストのセッター
  setCachedPartyPoliticians: React.Dispatch<
    React.SetStateAction<Record<string, CachedPartyPoliticiansData> | null>
  >;

  // Helper functions
  getPoliticianById: (id: string) => Politician | undefined;
  getPartyById: (id: string) => Party | undefined;
  handlePoliticianSelect: (politician: Politician) => void;
  handlePartySelect: (party: Party) => void;
  handleBackToParties: () => void;
  handleBackToPoliticians: () => void;
  handleVoteClick: (type: "support" | "oppose") => void;
  handleSortChange: (method: string) => void;
  showAllPoliticiansList: (page?: number) => void; // Modified to accept page parameter
  toggleCommentReplies: (commentId: string) => void;
  handleReplyClick: (comment: any, parentComment?: any) => void;
  handleCancelReply: () => void;
  countAllReplies: (replies: any[]) => number;
  getSortedPoliticians: (politicianList: Politician[]) => Politician[];
  getPoliticiansByParty: (partyId: string) => Politician[];
  getTrendIcon: (trend: string) => JSX.Element;
  getSortLabel: (method: string) => string;
  searchPoliticians: (term: string) => Politician[]; // Search function
  setVoteType: React.Dispatch<
    React.SetStateAction<"support" | "oppose" | null>
  >;
  setReason: React.Dispatch<React.SetStateAction<string>>;
  setShowReasonForm: React.Dispatch<React.SetStateAction<boolean>>;
  resetVoteData: () => void;

  // New Firebase-specific functions
  fetchPoliticianFromFirebase: (id: string) => Promise<Politician | null>;
  refreshSelectedPolitician: (id: string) => Promise<void>;
  // 新しく追加：キャッシュクリア関数
  clearPoliticiansCache: () => void;
  clearPartyPoliticiansCache: (partyId?: string) => void;
}

// Context creation
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // React Router hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Reset vote data handler
  const resetVoteData = useCallback(() => {
    setReason("");
    setVoteType(null);
    setShowReasonForm(false);
  }, []);

  // Global data states
  const [globalPoliticians, setGlobalPoliticians] = useState<Politician[]>([]);
  const [globalParties, setGlobalParties] = useState<Party[]>([]);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [isLoadingPolitician, setIsLoadingPolitician] = useState(false);
  // 新しく追加：キャッシュされた政治家データ
  const [cachedPoliticians, setCachedPoliticians] =
    useState<CachedPoliticiansData | null>(null);
  // 新しく追加：キャッシュされた政党ごとの政治家リスト
  const [cachedPartyPoliticians, setCachedPartyPoliticians] = useState<Record<
    string,
    CachedPartyPoliticiansData
  > | null>(null);

  // Initialize global data on first load
  useEffect(() => {
    const initializeData = async () => {
      try {
        setDataLoading(true);

        // Process data only if not already loaded
        if (globalPoliticians.length === 0 || globalParties.length === 0) {
          // Process data in parallel if possible
          const politicians = processPoliticiansData();
          const parties = processPartiesData();

          setGlobalPoliticians(politicians);
          setGlobalParties(await parties);
        }

        setDataInitialized(true);
      } catch (error) {
        console.error("Failed to initialize global data:", error);
      } finally {
        setDataLoading(false);
      }
    };

    initializeData();
  }, []);

  // Application state
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedPolitician, setSelectedPolitician] =
    useState<Politician | null>(null);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [voteType, setVoteType] = useState<"support" | "oppose" | null>(null);
  const [reason, setReason] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("politicians");
  const [showReasonForm, setShowReasonForm] = useState(false);
  const [sortMethod, setSortMethod] = useState("supportDesc");
  const [expandedComments, setExpandedComments] = useState<
    Record<string, boolean>
  >({});
  const [replyingTo, setReplyingTo] = useState<{
    comment?: any;
    parentComment?: any;
  } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showPremiumBanner, setShowPremiumBanner] = useState(true);
  const [showFixedBottomAd, setShowFixedBottomAd] = useState(true);
  const [showInlineAd] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAllPoliticians, setShowAllPoliticians] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // New state for current page

  // キャッシュクリア関数
  const clearPoliticiansCache = useCallback(() => {
    setCachedPoliticians(null);
  }, []);

  // 政党別の政治家キャッシュをクリアする関数
  const clearPartyPoliticiansCache = useCallback((partyId?: string) => {
    if (partyId) {
      // 特定の政党のキャッシュのみをクリア
      setCachedPartyPoliticians((prev) => {
        if (!prev) return null;
        const updated = { ...prev };
        delete updated[partyId];
        return Object.keys(updated).length > 0 ? updated : null;
      });
    } else {
      // すべての政党の政治家キャッシュをクリア
      setCachedPartyPoliticians(null);
    }
  }, []);

  // Update local state from global data once it's initialized
  useEffect(() => {
    if (dataInitialized && !dataLoading) {
      setPoliticians(globalPoliticians);
      setParties(globalParties);
    }
  }, [dataInitialized, dataLoading, globalPoliticians, globalParties]);

  // Firebase-specific function to fetch a politician by ID directly from Firestore
  const fetchPoliticianFromFirebase = useCallback(
    async (id: string): Promise<Politician | null> => {
      try {
        setIsLoadingPolitician(true);
        const politicianData = await fetchPoliticianById(id);
        return politicianData;
      } catch (error) {
        console.error("Error fetching politician from Firebase:", error);
        return null;
      } finally {
        setIsLoadingPolitician(false);
      }
    },
    []
  );

  // Function to refresh the selected politician data from Firebase
  const refreshSelectedPolitician = useCallback(
    async (id: string): Promise<void> => {
      try {
        setIsLoadingPolitician(true);
        const politicianData = await fetchPoliticianById(id);
        if (politicianData) {
          setSelectedPolitician(politicianData);

          // Also update in the global politicians array if it exists there
          setGlobalPoliticians((prev) => {
            const index = prev.findIndex((p) => p.id === id);
            if (index !== -1) {
              const updatedPoliticians = [...prev];
              updatedPoliticians[index] = politicianData;
              return updatedPoliticians;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Error refreshing politician data:", error);
      } finally {
        setIsLoadingPolitician(false);
      }
    },
    []
  );

  // Helper functions using memoization for efficiency
  // Get politician by ID using the global data
  const getPoliticianById = useMemo(() => {
    return (id: string) => {
      return globalPoliticians.find((politician) => politician.id === id);
    };
  }, [globalPoliticians]);

  // Get party by ID using the global data
  const getPartyById = useMemo(() => {
    return (id: string) => {
      return globalParties.find((party) => party.id === id);
    };
  }, [globalParties]);

  // Modified to support Firebase integration
  const handlePoliticianSelect = useCallback(
    (politician: Politician) => {
      // Reset UI states
      setVoteType(null);
      setShowReasonForm(false);
      setExpandedComments({});
      setReplyingTo(null);
      setMobileMenuOpen(false);

      // Set the selected politician directly (the detail page will fetch fresh data)
      setSelectedPolitician(politician);

      // Navigate to politician detail page
      navigate(`/politicians/${politician.id}`);

      // Scroll to top
      window.scrollTo(0, 0);
    },
    [
      navigate,
      setVoteType,
      setShowReasonForm,
      setExpandedComments,
      setReplyingTo,
      setMobileMenuOpen,
    ]
  );

  const handlePartySelect = useCallback(
    (party: Party) => {
      setMobileMenuOpen(false);
      setSelectedParty(party);

      // Navigate to party detail page
      navigate(`/parties/${party.id}`);

      // Scroll to top
      window.scrollTo(0, 0);
    },
    [navigate, setMobileMenuOpen]
  );

  const handleBackToParties = useCallback(() => {
    navigate("/parties");
  }, [navigate]);

  const handleBackToPoliticians = useCallback(() => {
    navigate("/politicians");
  }, [navigate]);

  const handleVoteClick = useCallback((type: "support" | "oppose") => {
    setVoteType(type);
    setShowReasonForm(true);
  }, []);

  const handleSortChange = useCallback((method: string) => {
    setSortMethod(method);
  }, []);

  // Modified to accept a page parameter and include it in the URL
  const showAllPoliticiansList = useCallback(
    (page: number = 1) => {
      setShowAllPoliticians(true);
      setCurrentPage(page);
      navigate(`/politicians?page=${page}`);
    },
    [navigate]
  );

  const toggleCommentReplies = useCallback((commentId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  }, []);

  const handleReplyClick = useCallback(
    (comment: any, parentComment: any = null) => {
      setReplyingTo({
        comment,
        parentComment,
      });
      setReplyText("");
    },
    []
  );

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
    setReplyText("");
  }, []);

  // Recursively count all replies
  const countAllReplies = useCallback((replies: any[]) => {
    let count = replies.length;
    for (const reply of replies) {
      if (reply.replies && reply.replies.length) {
        count += countAllReplies(reply.replies);
      }
    }
    return count;
  }, []);

  // Sort politicians based on current method
  const getSortedPoliticians = useMemo(() => {
    return (politicianList: Politician[]) => {
      const list = [...politicianList];

      switch (sortMethod) {
        case "supportDesc":
          return list.sort((a, b) => b.supportRate - a.supportRate);
        case "supportAsc":
          return list.sort((a, b) => a.supportRate - b.supportRate);
        case "opposeDesc":
          return list.sort((a, b) => b.opposeRate - a.opposeRate);
        case "opposeAsc":
          return list.sort((a, b) => a.opposeRate - b.opposeRate);
        case "activityDesc":
          return list.sort((a, b) => b.activity - a.activity);
        case "activityAsc":
          return list.sort((a, b) => a.activity - b.activity);
        default:
          return list;
      }
    };
  }, [sortMethod]);

  // Get politicians by party ID
  const getPoliticiansByParty = useMemo(() => {
    return (partyId: string) => {
      return globalPoliticians.filter(
        (politician) => politician.party.id === partyId
      );
    };
  }, [globalPoliticians]);

  // Trend icon component
  const getTrendIcon = useCallback((trend: string) => {
    if (trend === "up") {
      return (
        <div className="inline-flex items-center text-green-500">
          <TrendingUp size={14} className="flex-shrink-0" />
          <span className="ml-1 text-xs whitespace-nowrap">上昇中</span>
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center text-red-500">
          <Activity size={14} className="flex-shrink-0" />
          <span className="ml-1 text-xs whitespace-nowrap">下降中</span>
        </div>
      );
    }
  }, []);

  // Sort label text
  const getSortLabel = useCallback((method: string) => {
    switch (method) {
      case "supportDesc":
        return "支持率（高い順）";
      case "supportAsc":
        return "支持率（低い順）";
      case "opposeDesc":
        return "不支持率（高い順）";
      case "opposeAsc":
        return "不支持率（低い順）";
      case "activityDesc":
        return "活動指数（高い順）";
      case "activityAsc":
        return "活動指数（低い順）";
      default:
        return "ソート基準";
    }
  }, []);

  // Search politicians by name or furigana
  const searchPoliticians = useMemo(() => {
    return (term: string): Politician[] => {
      if (!term.trim()) {
        return [];
      }

      const searchTerm = term.toLowerCase();
      return globalPoliticians.filter((politician) => {
        const name = politician.name.toLowerCase();
        const furigana = politician.furigana?.toLowerCase() || "";

        return name.includes(searchTerm) || furigana.includes(searchTerm);
      });
    };
  }, [globalPoliticians]);

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/" || path.includes("/politicians")) {
      setActiveTab("politicians");
    } else if (path.includes("/parties")) {
      setActiveTab("parties");
    }
  }, [location]);

  // Parse URL parameters on location change
  useEffect(() => {
    // Extract page number from URL if present
    const params = new URLSearchParams(location.search);
    const pageParam = params.get("page");

    if (pageParam) {
      const pageNumber = parseInt(pageParam, 10);
      if (!isNaN(pageNumber) && pageNumber > 0) {
        setCurrentPage(pageNumber);
      }
    }
  }, [location]);

  // Scroll detection effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

  // Viewport meta tag and timer effect
  useEffect(() => {
    // Optimize viewport for mobile
    document
      .querySelector('meta[name="viewport"]')
      ?.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=5.0"
      );

    // Show fixed bottom ad after 5 seconds
    const timer = setTimeout(() => {
      setShowFixedBottomAd(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <DataContext.Provider
      value={{
        // State
        politicians,
        parties,
        selectedPolitician,
        selectedParty,
        voteType,
        reason,
        activeTab,
        showReasonForm,
        expandedComments,
        replyingTo,
        replyText,
        sortMethod,
        showPremiumBanner,
        isScrolled,
        showFixedBottomAd,
        showInlineAd,
        mobileMenuOpen,
        showAllPoliticians,
        globalPoliticians,
        globalParties,
        dataInitialized,
        isLoadingPolitician,
        currentPage,
        cachedPoliticians, // 新しく追加
        cachedPartyPoliticians, // 新しく追加

        // State setters
        setPoliticians,
        setParties,
        setSelectedPolitician,
        setSelectedParty,
        setActiveTab,
        setExpandedComments,
        setReplyingTo,
        setReplyText,
        setSortMethod,
        setShowPremiumBanner,
        setMobileMenuOpen,
        setVoteType,
        setReason,
        setShowReasonForm,
        setCurrentPage,
        setCachedPoliticians, // 新しく追加
        setCachedPartyPoliticians, // 新しく追加

        // Helper functions
        resetVoteData,
        getPoliticianById,
        getPartyById,
        handlePoliticianSelect,
        handlePartySelect,
        handleBackToParties,
        handleBackToPoliticians,
        handleVoteClick,
        handleSortChange,
        showAllPoliticiansList,
        toggleCommentReplies,
        handleReplyClick,
        handleCancelReply,
        countAllReplies,
        getSortedPoliticians,
        getPoliticiansByParty,
        getTrendIcon,
        getSortLabel,
        searchPoliticians,
        clearPoliticiansCache, // 新しく追加
        clearPartyPoliticiansCache, // 新しく追加

        // Firebase-specific functions
        fetchPoliticianFromFirebase,
        refreshSelectedPolitician,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
