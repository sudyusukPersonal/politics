// src/context/DataContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Politician, Party } from "../types";
import { processPoliticiansData } from "../utils/dataUtils";
import {
  navigateToPolitician,
  navigateToParty,
  navigateToParties,
  navigateToPoliticians,
  navigateToPolicyList,
} from "../utils/navigationUtils";

// Sort methods map to simplify the sorting logic
const SORT_METHODS = {
  supportDesc: (a: Politician, b: Politician) => b.supportRate - a.supportRate,
  supportAsc: (a: Politician, b: Politician) => a.supportRate - b.supportRate,
};

// Context type definition
interface DataContextType {
  // State
  politicians: Politician[];
  selectedPolitician: Politician | null;
  activeTab: string;
  isScrolled: boolean;
  mobileMenuOpen: boolean;
  globalPoliticians: Politician[];
  dataInitialized: boolean;
  isLoadingPolitician: boolean;
  currentPage: number;

  // State setters
  setPoliticians: React.Dispatch<React.SetStateAction<Politician[]>>;
  setSelectedPolitician: React.Dispatch<
    React.SetStateAction<Politician | null>
  >;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;

  // Helper functions
  getPoliticianById: (id: string) => Politician | undefined;
  handlePoliticianSelect: (politician: Politician) => void;
  handleBackToParties: () => void;
  handleBackToPoliticians: () => void;
  showAllPoliticiansList: (page?: number) => void;
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

  // Application state
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [selectedPolitician, setSelectedPolitician] =
    useState<Politician | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("politicians");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize global data on first load
  useEffect(() => {
    const initializeData = async () => {
      try {
        setDataLoading(true);

        // Process data only if not already loaded
        if (globalPoliticians.length === 0) {
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

  // Helper functions using memoization for efficiency
  const getPoliticianById = useMemo(
    () => (id: string) =>
      globalPoliticians.find((politician) => politician.id === id),
    [globalPoliticians]
  );

  // Specific handler functions
  const handlePoliticianSelect = useCallback(
    (politician: Politician) => {
      // Reset UI states
      setMobileMenuOpen(false);
      setSelectedPolitician(politician);
      navigateToPolitician(navigate, politician.id);

      // Scroll to top
      window.scrollTo(0, 0);
    },
    [navigate]
  );

  // Unified back navigation
  const handleBackToParties = useCallback(() => {
    navigateToParties(navigate);
  }, [navigate]);

  const handleBackToPoliticians = useCallback(() => {
    navigateToPoliticians(navigate);
  }, [navigate]);

  const showAllPoliticiansList = useCallback(
    (page: number = 1) => {
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

  return (
    <DataContext.Provider
      value={{
        // State
        politicians,
        selectedPolitician,
        activeTab,
        isScrolled,
        mobileMenuOpen,
        globalPoliticians,
        dataInitialized,
        isLoadingPolitician,
        currentPage,

        // State setters
        setPoliticians,
        setSelectedPolitician,
        setActiveTab,
        setMobileMenuOpen,
        setCurrentPage,

        // Helper functions
        getPoliticianById,
        handlePoliticianSelect,
        handleBackToParties,
        handleBackToPoliticians,
        showAllPoliticiansList,
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
