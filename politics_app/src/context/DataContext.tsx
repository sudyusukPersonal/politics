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
import { processPoliticiansData, processPartiesData } from "../utils/dataUtils";
import { reasonsData as initialReasonsData } from "../data/reasons";

// グローバルデータストレージ（アプリケーション全体で一度だけ初期化）
let globalPoliticiansData: Politician[] = [];
let globalPartiesData: Party[] = [];

// グローバルデータの初期化処理
const initializeGlobalData = () => {
  // すでに初期化されている場合はスキップ
  if (globalPoliticiansData.length > 0 && globalPartiesData.length > 0) {
    return { politicians: globalPoliticiansData, parties: globalPartiesData };
  }

  // データ初期化
  try {
    const politicians = processPoliticiansData();
    const parties = processPartiesData();

    // ふりがなフィールドを追加・処理
    const enhancedPoliticians = politicians.map((politician) => {
      // JSON内に既にfuriganaプロパティが存在する場合はそれを使用
      const existingFurigana = (politician as any).furigana;
      if (existingFurigana) {
        return {
          ...politician,
          furigana: existingFurigana,
        };
      }

      // ふりがなが無い場合は名前から推測
      let furigana = "";

      // 名前からカタカナ・ひらがなを抽出する処理
      if (typeof politician.name === "string") {
        // カタカナとひらがなの正規表現
        const kanaRegex = /[\u3040-\u30FF]+/g;
        const matches = politician.name.match(kanaRegex);

        if (matches) {
          furigana = matches.join("");
        }
      }

      return {
        ...politician,
        furigana: furigana || undefined,
      };
    });

    // グローバル変数に保存
    globalPoliticiansData = enhancedPoliticians;
    globalPartiesData = parties;

    return { politicians: enhancedPoliticians, parties };
  } catch (error) {
    console.error("グローバルデータの初期化に失敗しました:", error);
    return { politicians: [], parties: [] };
  }
};

// Context型定義
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
  globalPoliticians: Politician[]; // 新しく追加：グローバル政治家データへの参照

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
  searchPoliticians: (term: string) => Politician[]; // 新しく追加：検索関数
}

// Contextの作成
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider コンポーネント
export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // react-routerのナビゲーション
  const navigate = useNavigate();
  const location = useLocation();

  // グローバルデータの初期化と取得
  const { politicians: initialPoliticians, parties: initialParties } =
    initializeGlobalData();

  // JSONファイルから読み込んだデータで初期化
  const [politicians, setPoliticians] =
    useState<Politician[]>(initialPoliticians);
  const [parties, setParties] = useState<Party[]>(initialParties);
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

  // ヘルパー関数
  // 特定のIDの政治家を取得する関数
  const getPoliticianByIdHelper = (id: string) => {
    return globalPoliticiansData.find((politician) => politician.id === id);
  };

  // 特定のIDの政党を取得する関数
  const getPartyByIdHelper = (id: string) => {
    return globalPartiesData.find((party) => party.id === id);
  };

  const handlePoliticianSelect = (politician: Politician) => {
    setVoteType(null);
    setShowReasonForm(false);
    setExpandedComments({});
    setReplyingTo(null);
    setMobileMenuOpen(false);

    // 政治家詳細ページへナビゲート
    navigate(`/politicians/${politician.id}`);

    // 先頭にスクロール
    window.scrollTo(0, 0);
  };

  const handlePartySelect = (party: Party) => {
    setMobileMenuOpen(false);

    // 政党詳細ページへナビゲート
    navigate(`/parties/${party.id}`);

    // 先頭にスクロール
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
    // 投票を送信
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

    // 親コメントへの直接返信
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
    // ネストされた返信への返信
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
          // 対象の返信を見つけて新しい返信を追加
          const findAndAddReply = (replies: any[], targetId: string) => {
            for (let i = 0; i < replies.length; i++) {
              if (replies[i].id === targetId) {
                replies[i].replies.push(newReply);
                return true;
              }

              // 再帰的に深いレベルを検索
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

    // 返信したコメントスレッドを展開
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

  // すべての返信を再帰的にカウント
  const countAllReplies = (replies: any[]) => {
    let count = replies.length;
    for (const reply of replies) {
      if (reply.replies && reply.replies.length) {
        count += countAllReplies(reply.replies);
      }
    }
    return count;
  };

  // 現在の方法に基づいて政治家をソート
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

  // 政党IDによる政治家の取得
  const getPoliticiansByParty = (partyId: string) => {
    return globalPoliticiansData.filter(
      (politician) => politician.party.id === partyId
    );
  };

  // トレンドアイコンコンポーネント
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

  // ソートラベルテキスト
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

  // 新しい関数: 政治家を検索する
  const searchPoliticians = (term: string): Politician[] => {
    if (!term.trim()) {
      return [];
    }

    const searchTerm = term.toLowerCase();
    return globalPoliticiansData.filter((politician) => {
      const name = politician.name.toLowerCase();
      const furigana = politician.furigana?.toLowerCase() || "";

      return name.includes(searchTerm) || furigana.includes(searchTerm);
    });
  };

  // 現在のルートに基づいてアクティブタブを更新
  useEffect(() => {
    const path = location.pathname;
    if (path === "/" || path.includes("/politicians")) {
      setActiveTab("politicians");
    } else if (path.includes("/parties")) {
      setActiveTab("parties");
    }
  }, [location]);

  // スクロール検出のエフェクト
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

  // ビューポートメタタグとタイマーのエフェクト
  useEffect(() => {
    // モバイル向けにビューポートを最適化
    document
      .querySelector('meta[name="viewport"]')
      ?.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=5.0"
      );

    // 5秒後に固定ボトム広告を表示
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
        globalPoliticians: globalPoliticiansData, // 新しく追加されたグローバルデータ参照

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
        searchPoliticians, // 新しく追加された検索関数
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// データコンテキストを使用するためのカスタムフック
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
