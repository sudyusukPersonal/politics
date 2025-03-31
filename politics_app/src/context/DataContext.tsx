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
import { processPoliticiansData } from "../utils/dataUtils";
import { fetchPoliticianById } from "../services/politicianService";
import {
  navigateToPolitician,
  navigateToParty,
  navigateToParties,
  navigateToPoliticians,
  navigateToPolicyList,
} from "../utils/navigationUtils";

// Base interface for all cached data collections to reduce duplication
interface CachedItems {
  lastDocumentId?: string;
  hasMore: boolean;
  currentPage: number;
}

// Cached politicians data extends the base interface
interface CachedPoliticiansData extends CachedItems {
  politicians: Politician[];
}

// Cached party politicians data extends the base interface with party ID
interface CachedPartyPoliticiansData extends CachedItems {
  partyId: string;
  politicians: Politician[];
}

// Sort methods map to simplify the sorting logic
const SORT_METHODS = {
  supportDesc: (a: Politician, b: Politician) => b.supportRate - a.supportRate,
  supportAsc: (a: Politician, b: Politician) => a.supportRate - b.supportRate,
  opposeDesc: (a: Politician, b: Politician) => b.opposeRate - a.opposeRate,
  opposeAsc: (a: Politician, b: Politician) => a.opposeRate - b.opposeRate,
  activityDesc: (a: Politician, b: Politician) => b.activity - a.activity,
  activityAsc: (a: Politician, b: Politician) => a.activity - b.activity,
};

// Sort labels map to get labels by sort method
const SORT_LABELS = {
  supportDesc: "支持率（高い順）",
  supportAsc: "支持率（低い順）",
  opposeDesc: "不支持率（高い順）",
  opposeAsc: "不支持率（低い順）",
  activityDesc: "活動指数（高い順）",
  activityAsc: "活動指数（低い順）",
};

// Move trend icon function outside component to avoid recreation on each rende

// Context type definition
interface DataContextType {
  // State
  politicians: Politician[];
  selectedPolitician: Politician | null;
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
  globalPoliticians: Politician[];
  dataInitialized: boolean;
  isLoadingPolitician: boolean;
  currentPage: number;
  cachedPoliticians: CachedPoliticiansData | null;
  cachedPartyPoliticians: Record<string, CachedPartyPoliticiansData> | null;

  // State setters
  setPoliticians: React.Dispatch<React.SetStateAction<Politician[]>>;
  setSelectedPolitician: React.Dispatch<
    React.SetStateAction<Politician | null>
  >;
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
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setCachedPoliticians: React.Dispatch<
    React.SetStateAction<CachedPoliticiansData | null>
  >;
  setCachedPartyPoliticians: React.Dispatch<
    React.SetStateAction<Record<string, CachedPartyPoliticiansData> | null>
  >;
  setVoteType: React.Dispatch<
    React.SetStateAction<"support" | "oppose" | null>
  >;
  setReason: React.Dispatch<React.SetStateAction<string>>;
  setShowReasonForm: React.Dispatch<React.SetStateAction<boolean>>;

  // Helper functions
  resetVoteData: () => void;
  getPoliticianById: (id: string) => Politician | undefined;
  handlePoliticianSelect: (politician: Politician) => void;
  handleBackToParties: () => void;
  handleBackToPoliticians: () => void;
  handleVoteClick: (type: "support" | "oppose") => void;
  handleSortChange: (method: string) => void;
  showAllPoliticiansList: (page?: number) => void;
  toggleCommentReplies: (commentId: string) => void;
  handleReplyClick: (comment: any, parentComment?: any) => void;
  handleCancelReply: () => void;
  countAllReplies: (replies: any[]) => number;
  getSortedPoliticians: (politicianList: Politician[]) => Politician[];
  getPoliticiansByParty: (partyId: string) => Politician[];
  getSortLabel: (method: string) => string;
  searchPoliticians: (term: string) => Politician[];
  clearPoliticiansCache: () => void;
  clearPartyPoliticiansCache: (partyId?: string) => void;

  // Firebase-specific functions
  fetchPoliticianFromFirebase: (id: string) => Promise<Politician | null>;
  refreshSelectedPolitician: (id: string) => Promise<void>;
  navigateToPolicyList: (params?: {
    party?: string;
    category?: string;
    sort?: string;
  }) => void;
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

  // Global data states
  const [globalPoliticians, setGlobalPoliticians] = useState<Politician[]>([]);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [isLoadingPolitician, setIsLoadingPolitician] = useState(false);

  // Cache states
  const [cachedPoliticians, setCachedPoliticians] =
    useState<CachedPoliticiansData | null>(null);
  const [cachedPartyPoliticians, setCachedPartyPoliticians] = useState<Record<
    string,
    CachedPartyPoliticiansData
  > | null>(null);

  // Application state
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [selectedPolitician, setSelectedPolitician] =
    useState<Politician | null>(null);
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
  const [currentPage, setCurrentPage] = useState(1);

  // Unified cache clearing function
  const clearCache = useCallback(
    (type?: "politicians" | "party", partyId?: string) => {
      if (!type || type === "politicians") {
        setCachedPoliticians(null);
      }

      if (!type || type === "party") {
        if (partyId) {
          // Clear specific party cache
          setCachedPartyPoliticians((prev) => {
            if (!prev) return null;
            const updated = { ...prev };
            delete updated[partyId];
            return Object.keys(updated).length > 0 ? updated : null;
          });
        } else {
          // Clear all party caches
          setCachedPartyPoliticians(null);
        }
      }
    },
    []
  );

  // Initialize global data on first load
  useEffect(() => {
    const initializeData = async () => {
      try {
        setDataLoading(true);

        // Process data only if not already loaded
        if (globalPoliticians.length === 0) {
          // Process data in parallel
          const politicians = processPoliticiansData();

          setGlobalPoliticians(politicians);
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

  // Update local state from global data once it's initialized
  useEffect(() => {
    if (dataInitialized && !dataLoading) {
      setPoliticians(globalPoliticians);
    }
  }, [dataInitialized, dataLoading, globalPoliticians]);

  // Reset vote data handler
  const resetVoteData = useCallback(() => {
    setReason("");
    setVoteType(null);
    setShowReasonForm(false);
  }, []);

  // Firebase-specific function to fetch a politician by ID
  const fetchPoliticianFromFirebase = useCallback(
    async (id: string): Promise<Politician | null> => {
      try {
        setIsLoadingPolitician(true);
        return await fetchPoliticianById(id);
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
  const getPoliticianById = useMemo(
    () => (id: string) =>
      globalPoliticians.find((politician) => politician.id === id),
    [globalPoliticians]
  );

  // Unified entity selection function
  const selectEntity = useCallback(
    (entityType: "politician" | "party", entity: Politician | Party) => {
      // Reset UI states
      setVoteType(null);
      setShowReasonForm(false);
      setExpandedComments({});
      setReplyingTo(null);
      setMobileMenuOpen(false);

      if (entityType === "politician") {
        setSelectedPolitician(entity as Politician);
        navigateToPolitician(navigate, (entity as Politician).id);
      } else {
        navigateToParty(navigate, (entity as Party).id);
      }

      // Scroll to top
      window.scrollTo(0, 0);
    },
    [navigate]
  );

  // Specific handler functions that use the unified function
  const handlePoliticianSelect = useCallback(
    (politician: Politician) => {
      selectEntity("politician", politician);
    },
    [selectEntity]
  );

  // Unified back navigation
  const navigateBack = useCallback(
    (destination: "parties" | "politicians") => {
      destination === "parties"
        ? navigateToParties(navigate)
        : navigateToPoliticians(navigate);
    },
    [navigate]
  );

  const handleBackToParties = useCallback(() => {
    navigateBack("parties");
  }, [navigateBack]);

  const handleBackToPoliticians = useCallback(() => {
    navigateBack("politicians");
  }, [navigateBack]);

  // Vote and UI handlers
  const handleVoteClick = useCallback((type: "support" | "oppose") => {
    setVoteType(type);
    setShowReasonForm(true);
  }, []);

  const handleSortChange = useCallback((method: string) => {
    setSortMethod(method);
  }, []);

  const showAllPoliticiansList = useCallback(
    (page: number = 1) => {
      setShowAllPoliticians(true);
      setCurrentPage(page);
      navigateToPoliticians(navigate, page);
    },
    [navigate]
  );

  const handleNavigateToPolicyList = useCallback(
    (params?: { party?: string; category?: string; sort?: string }) => {
      navigateToPolicyList(navigate, params);
    },
    [navigate]
  );

  // Comment interaction functions
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

  // Get sorted politicians using the sort methods map
  const getSortedPoliticians = useMemo(
    () => (politicianList: Politician[]) => {
      const sortFn =
        SORT_METHODS[sortMethod as keyof typeof SORT_METHODS] ||
        SORT_METHODS.supportDesc;
      return [...politicianList].sort(sortFn);
    },
    [sortMethod]
  );

  // Get politicians by party ID
  const getPoliticiansByParty = useMemo(
    () => (partyId: string) =>
      globalPoliticians.filter((politician) => politician.party.id === partyId),
    [globalPoliticians]
  );

  // Get sort label
  const getSortLabel = useCallback(
    (method: string) =>
      SORT_LABELS[method as keyof typeof SORT_LABELS] || "ソート基準",
    []
  );

  // Search politicians by name or furigana
  const searchPoliticians = useMemo(
    () =>
      (term: string): Politician[] => {
        if (!term.trim()) return [];

        const searchTerm = term.toLowerCase();
        return globalPoliticians.filter((politician) => {
          const name = politician.name.toLowerCase();
          const furigana = politician.furigana?.toLowerCase() || "";
          return name.includes(searchTerm) || furigana.includes(searchTerm);
        });
      },
    [globalPoliticians]
  );

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
        selectedPolitician,
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
        dataInitialized,
        isLoadingPolitician,
        currentPage,
        cachedPoliticians,
        cachedPartyPoliticians,

        // State setters
        setPoliticians,
        setSelectedPolitician,
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
        setCachedPoliticians,
        setCachedPartyPoliticians,

        // Helper functions
        resetVoteData,
        getPoliticianById,
        handlePoliticianSelect,
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
        getSortLabel,
        searchPoliticians,

        // Cache functions with unified API
        clearPoliticiansCache: () => clearCache("politicians"),
        clearPartyPoliticiansCache: (partyId?: string) =>
          clearCache("party", partyId),

        // Firebase-specific functions
        fetchPoliticianFromFirebase,
        refreshSelectedPolitician,

        // Navigation function
        navigateToPolicyList: handleNavigateToPolicyList,
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
