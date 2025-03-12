// src/context/DataContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  JSX,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Politician, Party, ReasonsData } from "../types";
import { TrendingUp, Activity } from "lucide-react";
import { processPoliticiansData, processPartiesData } from "../utils/dataUtils"; // 新しいユーティリティをインポート
import { reasonsData as initialReasonsData } from "../data/reasons"; // この部分はそのまま

// Create context type
interface DataContextType {
  // State
  politicians: Politician[];
  parties: Party[];
  reasonsData: ReasonsData;
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

  // State setters
  setPoliticians: React.Dispatch<React.SetStateAction<Politician[]>>;
  setParties: React.Dispatch<React.SetStateAction<Party[]>>;
  setReasonsData: React.Dispatch<React.SetStateAction<ReasonsData>>;
  setSelectedPolitician: React.Dispatch<
    React.SetStateAction<Politician | null>
  >;
  setSelectedParty: React.Dispatch<React.SetStateAction<Party | null>>;
  setVoteType: React.Dispatch<
    React.SetStateAction<"support" | "oppose" | null>
  >;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  setShowReasonForm: React.Dispatch<React.SetStateAction<boolean>>;
  setExpandedComments: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  setReplyingTo: React.Dispatch<
    React.SetStateAction<{ comment?: any; parentComment?: any } | null>
  >;
  setReplyText: React.Dispatch<React.SetStateAction<string>>;
  setReason: React.Dispatch<React.SetStateAction<string>>;
  setSortMethod: React.Dispatch<React.SetStateAction<string>>;
  setShowPremiumBanner: React.Dispatch<React.SetStateAction<boolean>>;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Helper functions
  getPoliticianById: (id: string) => Politician | undefined;
  getPartyById: (id: string) => Party | undefined;
  handlePoliticianSelect: (politician: Politician) => void;
  handlePartySelect: (party: Party) => void;
  handleBackToParties: () => void;
  handleBackToPoliticians: () => void;
  handleVoteClick: (type: "support" | "oppose") => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleSortChange: (method: string) => void;
  showAllPoliticiansList: () => void;
  toggleCommentReplies: (commentId: string) => void;
  handleReplyClick: (comment: any, parentComment?: any) => void;
  handleSubmitReply: (e: React.FormEvent<HTMLFormElement>) => void;
  handleCancelReply: () => void;
  countAllReplies: (replies: any[]) => number;
  getSortedPoliticians: (politicianList: Politician[]) => Politician[];
  getPoliticiansByParty: (partyId: string) => Politician[];
  getTrendIcon: (trend: string) => JSX.Element;
  getSortLabel: (method: string) => string;
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Navigation using react-router
  const navigate = useNavigate();
  const location = useLocation();

  // JSONファイルから読み込んだデータで初期化
  const [politicians, setPoliticians] = useState<Politician[]>(
    processPoliticiansData()
  );
  const [parties, setParties] = useState<Party[]>(processPartiesData());
  const [reasonsData, setReasonsData] =
    useState<ReasonsData>(initialReasonsData);

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

  // Helper functions
  // 特定のIDの政治家を取得する関数
  const getPoliticianByIdHelper = (id: string) => {
    return politicians.find((politician) => politician.id === id);
  };

  // 特定のIDの政党を取得する関数
  const getPartyByIdHelper = (id: string) => {
    return parties.find((party) => party.id === id);
  };

  const handlePoliticianSelect = (politician: Politician) => {
    setVoteType(null);
    setShowReasonForm(false);
    setExpandedComments({});
    setReplyingTo(null);
    setMobileMenuOpen(false);

    // Navigate to politician detail page
    navigate(`/politicians/${politician.id}`);

    // Scroll to top
    window.scrollTo(0, 0);
  };

  const handlePartySelect = (party: Party) => {
    setMobileMenuOpen(false);

    // Navigate to party detail page
    navigate(`/parties/${party.id}`);

    // Scroll to top
    window.scrollTo(0, 0);
  };

  const handleBackToParties = () => {
    navigate("/parties");
  };

  const handleBackToPoliticians = () => {
    navigate("/politicians");
  };

  const handleVoteClick = (type: "support" | "oppose") => {
    setVoteType(type);
    setShowReasonForm(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Submit vote
    alert(
      `${
        voteType === "support" ? "支持" : "不支持"
      }の理由を送信しました: ${reason}`
    );
    setReason("");
    setVoteType(null);
    setShowReasonForm(false);
  };

  const handleSortChange = (method: string) => {
    setSortMethod(method);
  };

  const showAllPoliticiansList = () => {
    navigate("/politicians");
  };

  const toggleCommentReplies = (commentId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleReplyClick = (comment: any, parentComment: any = null) => {
    setReplyingTo({
      comment,
      parentComment,
    });
    setReplyText("");
  };

  const handleSubmitReply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!replyText.trim() || !replyingTo) return;

    const newReply = {
      id: `reply-${Date.now()}`,
      text: replyText,
      user: "あなた",
      likes: 0,
      date: "たった今",
      replyTo: replyingTo.comment.user,
      replies: [],
    };

    const updatedReasonsData = { ...reasonsData };

    // Direct reply to a parent comment
    if (!replyingTo.parentComment) {
      const type = replyingTo.comment.id.startsWith("r")
        ? reasonsData.support.some((r) => r.id === replyingTo.comment.id)
          ? "support"
          : "oppose"
        : null;

      if (type) {
        const commentIndex = updatedReasonsData[type].findIndex(
          (c) => c.id === replyingTo.comment.id
        );
        if (commentIndex !== -1) {
          updatedReasonsData[type][commentIndex].replies.push(newReply);
        }
      }
    }
    // Reply to a nested reply
    else {
      const type = replyingTo.parentComment.id.startsWith("r")
        ? reasonsData.support.some((r) => r.id === replyingTo.parentComment.id)
          ? "support"
          : "oppose"
        : null;

      if (type) {
        const commentIndex = updatedReasonsData[type].findIndex(
          (c) => c.id === replyingTo.parentComment.id
        );
        if (commentIndex !== -1) {
          // Find the target reply and add our new reply
          const findAndAddReply = (replies: any[], targetId: string) => {
            for (let i = 0; i < replies.length; i++) {
              if (replies[i].id === targetId) {
                replies[i].replies.push(newReply);
                return true;
              }

              // Recursively search deeper levels
              if (replies[i].replies && replies[i].replies.length) {
                if (findAndAddReply(replies[i].replies, targetId)) {
                  return true;
                }
              }
            }
            return false;
          };

          findAndAddReply(
            updatedReasonsData[type][commentIndex].replies,
            replyingTo.comment.id
          );
        }
      }
    }

    setReasonsData(updatedReasonsData);
    setReplyingTo(null);
    setReplyText("");

    // Expand the comment thread we just replied to
    if (replyingTo.parentComment) {
      setExpandedComments((prev) => ({
        ...prev,
        [replyingTo.parentComment.id]: true,
      }));
    } else {
      setExpandedComments((prev) => ({
        ...prev,
        [replyingTo.comment.id]: true,
      }));
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
  };

  // Count all replies recursively
  const countAllReplies = (replies: any[]) => {
    let count = replies.length;
    for (const reply of replies) {
      if (reply.replies && reply.replies.length) {
        count += countAllReplies(reply.replies);
      }
    }
    return count;
  };

  // Sort politicians based on current method
  const getSortedPoliticians = (politicianList: Politician[]) => {
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

  // Get politicians by party ID
  const getPoliticiansByParty = (partyId: string) => {
    return politicians.filter((politician) => politician.party.id === partyId);
  };

  // Trend icon component
  const getTrendIcon = (trend: string) => {
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
  };

  // Sort label text
  const getSortLabel = (method: string) => {
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
  };

  // Update active tab based on the current route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/" || path.includes("/politicians")) {
      setActiveTab("politicians");
    } else if (path.includes("/parties")) {
      setActiveTab("parties");
    }
  }, [location]);

  // Effect for scroll detection
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

  // Effect for viewport meta tag & timer
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
        reasonsData,
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
        showAllPoliticians: false,

        // State setters
        setPoliticians,
        setParties,
        setReasonsData,
        setSelectedPolitician,
        setSelectedParty,
        setVoteType,
        setReason,
        setActiveTab,
        setShowReasonForm,
        setExpandedComments,
        setReplyingTo,
        setReplyText,
        setSortMethod,
        setShowPremiumBanner,
        setMobileMenuOpen,

        // Helper functions
        getPoliticianById: getPoliticianByIdHelper,
        getPartyById: getPartyByIdHelper,
        handlePoliticianSelect,
        handlePartySelect,
        handleBackToParties,
        handleBackToPoliticians,
        handleVoteClick,
        handleSubmit,
        handleSortChange,
        showAllPoliticiansList,
        toggleCommentReplies,
        handleReplyClick,
        handleSubmitReply,
        handleCancelReply,
        countAllReplies,
        getSortedPoliticians,
        getPoliticiansByParty,
        getTrendIcon,
        getSortLabel,
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
