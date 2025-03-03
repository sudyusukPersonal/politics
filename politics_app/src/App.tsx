import React, { useState, useEffect, useRef } from "react";
import { politicians } from "./data/politicians";
import { parties } from "./data/parties";
import { reasonsDatas } from "./data/reasons";
import { PremiumBanner } from "./components/common/PremiumBanner";
import {
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  MessageSquare,
  Users,
  Award,
  TrendingUp,
  Calendar,
  Eye,
  Activity,
  BarChart3,
  MessageCircle,
  Crown,
  ArrowLeft,
  Filter,
  SortAsc,
  SortDesc,
  Building,
  ListFilter,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  Send,
  XCircle,
  Info,
  Menu,
  X,
} from "lucide-react";

// メインのアプリコンポーネント - レスポンシブ対応
const App = () => {
  const [selectedPolitician, setSelectedPolitician] = useState<{
    id: string;
    name: string;
    position: string;
    age: number;
    party: { id: string; name: string; color: string };
    supportRate: number;
    opposeRate: number;
    totalVotes: number;
    activity: number;
    image: string;
    trending: string;
    recentActivity: string;
  } | null>(null);
  const [selectedParty, setSelectedParty] = useState<{
    id: string;
    name: string;
    color: string;
    supportRate: number;
    opposeRate: number;
    totalVotes: number;
    members: number;
    keyPolicies: string[];
    description: string;
  } | null>(null);
  const [voteType, setVoteType] = useState<"support" | "oppose" | null>(null);
  const [reason, setReason] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("politicians");
  const [showReasonForm, setShowReasonForm] = useState(false);
  const [sortMethod, setSortMethod] = useState("supportDesc"); // 支持率降順をデフォルトに
  const [showAllPoliticians, setShowAllPoliticians] = useState(false); // 全議員表示用のフラグ
  const [expandedComments, setExpandedComments] = useState<
    Record<string, boolean>
  >({});
  const [replyingTo, setReplyingTo] = useState<{
    comment?: any;
    parentComment?: any;
  } | null>(null); // 返信対象
  const [replyText, setReplyText] = useState(""); // 返信内容
  const [showFixedBottomAd, setShowFixedBottomAd] = useState(true); // 下部固定広告表示フラグ
  const [showInlineAd] = useState(true); // インラインバナー表示フラグ
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // モバイルメニュー表示フラグ（レスポンシブ対応用）
  const [reasonsData, setReasonsData] = useState(reasonsDatas); // 投票理由データの状態管理

  // スクロール検出
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

  // ビューポートメタタグ最適化のための設定 (モバイル向け)
  useEffect(() => {
    // モバイルビューポートの最適化 (実際のアプリでは必要に応じて実装)
    document
      .querySelector('meta[name="viewport"]')
      ?.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=5.0"
      );

    // 5秒後に下部固定広告を表示（ユーザーがコンテンツを閲覧し始めた後）
    const timer = setTimeout(() => {
      setShowFixedBottomAd(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handlePoliticianSelect = (politician: {
    id: string;
    name: string;
    position: string;
    age: number;
    party: { id: string; name: string; color: string };
    supportRate: number;
    opposeRate: number;
    totalVotes: number;
    activity: number;
    image: string;
    trending: string;
    recentActivity: string;
  }) => {
    setSelectedPolitician(politician);
    setSelectedParty(null);
    setVoteType(null);
    setShowReasonForm(false);
    setExpandedComments({});
    setReplyingTo(null);
    setMobileMenuOpen(false); // モバイルメニューを閉じる（レスポンシブ対応）
    // ページトップへスクロール
    window.scrollTo(0, 0);
  };

  const handlePartySelect = (party: {
    id: string;
    name: string;
    color: string;
    supportRate: number;
    opposeRate: number;
    totalVotes: number;
    members: number;
    keyPolicies: string[];
    description: string;
  }) => {
    setSelectedParty(party);
    setSelectedPolitician(null);
    setMobileMenuOpen(false); // モバイルメニューを閉じる（レスポンシブ対応）
    // ページトップへスクロール
    window.scrollTo(0, 0);
  };

  const handleBackToParties = () => {
    setSelectedParty(null);
    setActiveTab("parties");
  };

  const handleBackToPoliticians = () => {
    setShowAllPoliticians(false);
  };

  const handleVoteClick = (type: "support" | "oppose") => {
    setVoteType(type);
    setShowReasonForm(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 投票送信時のフィードバック
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
    setShowAllPoliticians(true);
  };

  // コメントの表示/非表示を切り替える
  const toggleCommentReplies = (commentId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // 返信フォームを表示する
  const handleReplyClick = (comment: any, parentComment: any = null) => {
    setReplyingTo({
      comment,
      parentComment,
    });
    setReplyText("");
  };

  // 返信を送信する
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

    // 親コメントへの直接の返信の場合
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
    // 返信への返信（ネスト）の場合
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
          // 親コメントの返信一覧から対象の返信を探す
          const findAndAddReply = (replies: any[], targetId: string) => {
            for (let i = 0; i < replies.length; i++) {
              if (replies[i].id === targetId) {
                replies[i].replies.push(newReply);
                return true;
              }

              // 再帰的に深い階層も探索
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

    // 返信を追加したコメントを展開
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

  // 返信をキャンセルする
  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
  };

  // 返信数を計算する関数（ネスト構造含む全ての返信をカウント）
  const countAllReplies = (replies: any[]) => {
    let count = replies.length;
    for (const reply of replies) {
      if (reply.replies && reply.replies.length) {
        count += countAllReplies(reply.replies);
      }
    }
    return count;
  };

  // 議員のソート処理
  const getSortedPoliticians = (politicianList: typeof politicians) => {
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

  // 政党に所属する議員を取得
  const getPoliticiansByParty = (partyId: string) => {
    return politicians.filter((politician) => politician.party.id === partyId);
  };

  // トレンド表示アイコン
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

  // ソート表示を日本語で取得
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

  // 返信コンポーネント（再帰的に表示）
  interface Reply {
    id: string;
    text: string;
    user: string;
    likes: number;
    date: string;
    replyTo?: string;
    replies?: Reply[];
  }

  const ReplyItem = ({
    reply,
    parentComment = null,
    depth = 0,
  }: {
    reply: Reply;
    parentComment?: Reply | null;
    depth?: number;
  }) => {
    const maxDepth = 2; // ネストの最大深さを2に設定
    const displayDepth = Math.min(depth, maxDepth);
    const marginLeft = displayDepth * 12; // 各階層ごとのインデント

    return (
      <div
        className="mt-2 animate-fadeIn"
        style={{ marginLeft: `${marginLeft}px` }}
      >
        <div
          className={`rounded-lg p-3 border ${
            depth % 2 === 0
              ? "bg-gray-50 border-gray-200"
              : "bg-white border-gray-100"
          }`}
        >
          {reply.replyTo && (
            <div className="flex items-center mb-2 text-xs text-gray-500">
              <CornerDownRight size={12} className="mr-1" />
              <span className="font-medium text-gray-600">
                @{reply.replyTo}
              </span>
              <span className="ml-1">への返信</span>
            </div>
          )}

          <p className="text-gray-700 text-sm">{reply.text}</p>

          <div className="flex justify-between mt-2 items-center">
            <div className="flex items-center text-xs text-gray-500">
              <span className="font-medium">{reply.user}</span>
              <span className="mx-2">•</span>
              <span>{reply.date}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-xs text-gray-600 px-2 py-1 rounded-full bg-gray-100">
                <ThumbsUp size={10} className="mr-1" />
                <span>{reply.likes}</span>
              </div>
              {depth < maxDepth && (
                <button
                  className="text-xs text-indigo-600 hover:text-indigo-800 transition"
                  onClick={() => handleReplyClick(reply, parentComment)}
                >
                  返信する
                </button>
              )}
            </div>
          </div>
        </div>

        {/* モバイル最適化: ネストされたコメントでの配置（最小限にして UX を保つ） */}
        {/* {showAdInReplies && showInlineAd && (
          <div className="my-2 flex justify-center">
            <MobileAd format="banner" showCloseButton={true} />
          </div>
        )} */}

        {/* 返信の返信を再帰的に表示 */}
        {reply.replies && reply.replies.length > 0 && depth < maxDepth && (
          <div className="ml-2 pl-2 border-l-2 border-gray-200 mt-2">
            {reply.replies.map((nestedReply) => (
              <ReplyItem
                key={nestedReply.id}
                reply={nestedReply}
                parentComment={parentComment}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };
  // コメントと返信表示コンポーネント
  interface Comment {
    id: string;
    text: string;
    user: string;
    likes: number;
    date: string;
    replies: Reply[];
  }

  const CommentItem = ({
    comment,
    type,
  }: {
    comment: Comment;
    type: "support" | "oppose";
  }) => {
    const totalReplies = countAllReplies(comment.replies);
    const isExpanded = expandedComments[comment.id];

    return (
      <div className="mb-3">
        <div
          className={`rounded-xl p-4 border hover:shadow-md transition ${
            type === "support"
              ? "bg-green-50 border-green-100"
              : "bg-red-50 border-red-100"
          }`}
        >
          <p className="text-gray-700">{comment.text}</p>

          <div className="flex justify-between mt-3 items-center">
            <div className="flex items-center text-xs text-gray-500">
              <span className="font-medium">{comment.user}</span>
              <span className="mx-2">•</span>
              <span>{comment.date}</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center text-xs text-gray-600 bg-white px-2 py-1 rounded-full shadow-sm">
                <ThumbsUp size={12} className="mr-1" />
                <span>{comment.likes}</span>
              </div>

              <button
                className="text-xs text-indigo-600 hover:text-indigo-800 transition"
                onClick={() => handleReplyClick(comment)}
              >
                返信する
              </button>
            </div>
          </div>

          {totalReplies > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-200">
              <button
                className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                onClick={() => toggleCommentReplies(comment.id)}
              >
                <MessageCircle size={14} className="mr-1" />
                <span>{totalReplies}件の返信</span>
                {isExpanded ? (
                  <ChevronUp size={14} className="ml-1" />
                ) : (
                  <ChevronDown size={14} className="ml-1" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* 返信一覧 */}
        {isExpanded && comment.replies.length > 0 && (
          <div className="mt-2 pl-2 ml-2 border-l-2 border-gray-200">
            {comment.replies.map((reply, index) => (
              <React.Fragment key={reply.id}>
                <ReplyItem reply={reply} parentComment={comment} depth={1} />
              </React.Fragment>
            ))}
          </div>
        )}

        {/* 返信入力フォーム */}
        {replyingTo &&
          replyingTo.comment.id === comment.id &&
          !replyingTo.parentComment && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 animate-slideUp">
              <form onSubmit={handleSubmitReply}>
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <CornerDownRight size={12} className="mr-1" />
                  <span className="font-medium text-gray-600">
                    @{comment.user}
                  </span>
                  <span className="ml-1">への返信</span>
                </div>

                <div className="flex items-center">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="返信を入力..."
                    className="flex-1 border border-gray-300 rounded-l-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-r-lg text-sm transition"
                  >
                    <Send size={16} />
                  </button>
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleCancelReply}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          )}
      </div>
    );
  };

  // 政治家カードコンポーネント（再利用のため分離）
  interface Politician {
    id: string;
    name: string;
    position: string;
    age: number;
    party: { id: string; name: string; color: string };
    supportRate: number;
    opposeRate: number;
    totalVotes: number;
    activity: number;
    image: string;
    trending: string;
    recentActivity: string;
  }

  const PoliticianCard = ({
    politician,
    index,
  }: {
    politician: Politician;
    index: number;
  }) => (
    <div
      key={politician.id}
      className={`border-b border-gray-100 last:border-0 hover:bg-indigo-50/30 transition-colors ${
        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
      }`}
      onClick={() => handlePoliticianSelect(politician)}
    >
      <div className="p-4 flex items-center">
        <div className="relative flex-shrink-0">
          <img
            src={politician.image}
            alt={politician.name}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 transform transition hover:scale-105"
            style={{ borderColor: politician.party.color }}
          />
          <div
            className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-lg"
            style={{ backgroundColor: politician.party.color }}
          >
            {politician.party.name.charAt(0)}
          </div>
        </div>

        <div className="ml-3 sm:ml-4 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base truncate">
              {politician.name}
            </h3>
            {getTrendIcon(politician.trending)}
          </div>

          <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
            <span className="truncate">{politician.position}</span>
            <span className="mx-2 flex-shrink-0">•</span>
            <span className="flex-shrink-0">{politician.age}歳</span>
          </div>

          <div className="mt-2">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center">
                  <ThumbsUp
                    size={14}
                    className="text-green-500 mr-1 flex-shrink-0"
                  />
                  <span className="font-medium text-green-700">
                    {politician.supportRate}%
                  </span>
                </div>
                <div className="flex items-center">
                  <ThumbsDown
                    size={14}
                    className="text-red-500 mr-1 flex-shrink-0"
                  />
                  <span className="font-medium text-red-700">
                    {politician.opposeRate}%
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {politician.totalVotes.toLocaleString()}票
              </span>
            </div>

            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden flex">
              <div
                className="h-full rounded-l-full"
                style={{
                  width: `${politician.supportRate}%`,
                  backgroundColor: "#10B981",
                }}
              ></div>
              <div
                className="h-full rounded-r-full"
                style={{
                  width: `${politician.opposeRate}%`,
                  backgroundColor: "#EF4444",
                }}
              ></div>
            </div>

            <div className="flex items-center mt-2 text-xs text-gray-500 truncate">
              <Calendar size={12} className="mr-1 flex-shrink-0" />
              <span className="truncate">
                最近の活動: {politician.recentActivity}
              </span>
            </div>
          </div>
        </div>

        <ChevronRight size={18} className="text-gray-400 ml-2 flex-shrink-0" />
      </div>
    </div>
  );

  // 全議員一覧表示コンポーネント
  const AllPoliticiansList = () => {
    const sortedPoliticians = getSortedPoliticians(politicians);

    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handleBackToPoliticians}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition"
          >
            <ArrowLeft size={16} className="mr-1" />
            <span>戻る</span>
          </button>

          <div className="relative">
            <button
              className="flex items-center bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
              onClick={() => {
                const sortDropdown = document.getElementById("sort-dropdown");
                if (sortDropdown) {
                  sortDropdown.classList.toggle("hidden");
                }
              }}
            >
              <ListFilter size={14} className="mr-1.5 text-indigo-600" />
              <span>{getSortLabel(sortMethod)}</span>
            </button>

            <div
              id="sort-dropdown"
              className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-10 hidden"
            >
              <div className="w-48 text-sm">
                <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b border-gray-100">
                  ソート基準
                </div>
                <button
                  onClick={() => {
                    handleSortChange("supportDesc");
                    const dropdown = document.getElementById("sort-dropdown");
                    if (dropdown) {
                      dropdown.classList.add("hidden");
                    }
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
                    sortMethod === "supportDesc"
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <SortDesc size={12} className="inline mr-1" />{" "}
                  支持率（高い順）
                </button>
                <button
                  onClick={() => {
                    handleSortChange("supportAsc");
                    const dropdown = document.getElementById("sort-dropdown");
                    if (dropdown) {
                      dropdown.classList.add("hidden");
                    }
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
                    sortMethod === "supportAsc"
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <SortAsc size={12} className="inline mr-1" /> 支持率（低い順）
                </button>
                <button
                  onClick={() => {
                    handleSortChange("opposeDesc");
                    const dropdown = document.getElementById("sort-dropdown");
                    if (dropdown) {
                      dropdown.classList.add("hidden");
                    }
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
                    sortMethod === "opposeDesc"
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <SortDesc size={12} className="inline mr-1" />{" "}
                  不支持率（高い順）
                </button>
                <button
                  onClick={() => {
                    handleSortChange("opposeAsc");
                    const dropdown = document.getElementById("sort-dropdown");
                    if (dropdown) {
                      dropdown.classList.add("hidden");
                    }
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
                    sortMethod === "opposeAsc"
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <SortAsc size={12} className="inline mr-1" />{" "}
                  不支持率（低い順）
                </button>
                <button
                  onClick={() => {
                    handleSortChange("activityDesc");
                    const dropdown = document.getElementById("sort-dropdown");
                    if (dropdown) {
                      dropdown.classList.add("hidden");
                    }
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
                    sortMethod === "activityDesc"
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <SortDesc size={12} className="inline mr-1" />{" "}
                  活動指数（高い順）
                </button>
                <button
                  onClick={() => {
                    handleSortChange("activityAsc");
                    const dropdown = document.getElementById("sort-dropdown");
                    if (dropdown) {
                      dropdown.classList.add("hidden");
                    }
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
                    sortMethod === "activityAsc"
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <SortAsc size={12} className="inline mr-1" />{" "}
                  活動指数（低い順）
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* プレミアム会員バナー */}
        <PremiumBanner />

        {/* タイトル直下の大型モバイルバナー (320×100) */}
        {/* <div className="flex justify-center">
          <MobileAd format="large-banner" showCloseButton={true} />
        </div> */}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <Users size={18} className="mr-2 text-indigo-600" />
              全政治家一覧
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              評価順に並べ替えてランキング表示
            </p>
          </div>

          <div>
            {sortedPoliticians.map((politician, index) => (
              <React.Fragment key={politician.id}>
                <PoliticianCard politician={politician} index={index} />

                {/* 3番目の政治家の後に広告を挿入（第3段落後） */}
                {/* {index === 2 && showInlineAd && (
                  <div className="flex justify-center py-3 border-b border-gray-100">
                    <MobileAd format="rectangle" showCloseButton={true} />
                  </div>
                )} */}

                {/* 5番目の後にネイティブ広告（コンテンツの流れに自然に組み込む） */}
                {/* {index === 4 && (
                  <NativeAdCard index={index} showCloseButton={true} />
                )} */}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // 政党詳細ページコンポーネント
  const PartyDetail = () => {
    if (!selectedParty) return null;
    const partyPoliticians = getPoliticiansByParty(selectedParty.id);
    const sortedPartyPoliticians = getSortedPoliticians(partyPoliticians);

    return (
      <section className="space-y-4">
        <div className="flex items-center mb-2">
          <button
            onClick={handleBackToParties}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition"
          >
            <ArrowLeft size={16} className="mr-1" />
            <span>政党一覧に戻る</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div
            className="p-5 border-b border-gray-100"
            style={{ backgroundColor: `${selectedParty.color}10` }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 sm:mb-0"
                style={{ backgroundColor: selectedParty.color }}
              >
                {selectedParty.name.charAt(0)}
              </div>
              <div className="sm:ml-4">
                <h2
                  className="text-xl font-bold"
                  style={{ color: selectedParty.color }}
                >
                  {selectedParty.name}
                </h2>
                <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1">
                  <span>所属議員: {partyPoliticians.length}名</span>
                  <span className="mx-2 hidden sm:inline">•</span>
                  <span>
                    総投票数: {selectedParty.totalVotes.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                <div className="flex items-center">
                  <ThumbsUp size={14} className="text-green-500 mr-1" />
                  <span className="text-sm font-medium">支持率: </span>
                  <span className="font-bold ml-1 text-green-600">
                    {selectedParty.supportRate}%
                  </span>
                </div>
                <div className="flex items-center">
                  <ThumbsDown size={14} className="text-red-500 mr-1" />
                  <span className="text-sm font-medium">不支持率: </span>
                  <span className="font-bold ml-1 text-red-600">
                    {selectedParty.opposeRate}%
                  </span>
                </div>
              </div>

              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
                <div
                  className="h-full rounded-l-full"
                  style={{
                    width: `${selectedParty.supportRate}%`,
                    backgroundColor: "#10B981",
                  }}
                ></div>
                <div
                  className="h-full rounded-r-full"
                  style={{
                    width: `${selectedParty.opposeRate}%`,
                    backgroundColor: "#EF4444",
                  }}
                ></div>
              </div>
            </div>

            {/* 政党概要の直後に大型バナー広告 (320×100) - 研究に基づくアバブ・ザ・フォールド位置 */}
            {/* {showInlineAd && (
              <div className="mt-3 flex justify-center">
                <MobileAd format="large-banner" showCloseButton={true} />
              </div>
            )} */}

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700">政党概要</h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedParty.description}
              </p>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                主要政策
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedParty.keyPolicies.map((policy, i) => (
                  <span
                    key={i}
                    className="text-xs py-1 px-3 rounded-full border"
                    style={{
                      backgroundColor: `${selectedParty.color}15`,
                      borderColor: `${selectedParty.color}30`,
                      color: selectedParty.color,
                    }}
                  >
                    {policy}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800 flex items-center">
              <Users size={18} className="mr-2 text-indigo-600" />
              所属議員
            </h2>

            <div className="relative">
              <button
                className="flex items-center bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                onClick={() => {
                  const element = document.getElementById(
                    "party-sort-dropdown"
                  );
                  if (element) {
                    element.classList.toggle("hidden");
                  }
                }}
              >
                <Filter size={14} className="mr-1.5" />
                <span>{getSortLabel(sortMethod)}</span>
              </button>

              <div
                id="party-sort-dropdown"
                className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-10 hidden"
              >
                <div className="w-48 text-sm">
                  <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b border-gray-100">
                    ソート基準
                  </div>
                  <button
                    onClick={() => {
                      handleSortChange("supportDesc");
                      const element = document.getElementById(
                        "party-sort-dropdown"
                      );
                      if (element) {
                        element.classList.toggle("hidden");
                      }
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
                      sortMethod === "supportDesc"
                        ? "bg-indigo-50 text-indigo-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <SortDesc size={12} className="inline mr-1" />{" "}
                    支持率（高い順）
                  </button>
                  <button
                    onClick={() => {
                      handleSortChange("supportAsc");
                      const element = document.getElementById(
                        "party-sort-dropdown"
                      );
                      if (element) {
                        element.classList.toggle("hidden");
                      }
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
                      sortMethod === "supportAsc"
                        ? "bg-indigo-50 text-indigo-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <SortAsc size={12} className="inline mr-1" />{" "}
                    支持率（低い順）
                  </button>
                  <button
                    onClick={() => {
                      handleSortChange("activityDesc");
                      const dropdown = document.getElementById(
                        "party-sort-dropdown"
                      );
                      dropdown?.classList.add("hidden");
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
                      sortMethod === "activityDesc"
                        ? "bg-indigo-50 text-indigo-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <SortDesc size={12} className="inline mr-1" />{" "}
                    活動指数（高い順）
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            {sortedPartyPoliticians.map((politician, index) => (
              <React.Fragment key={politician.id}>
                <PoliticianCard politician={politician} index={index} />

                {/* 3番目の政治家の後に300×250広告を配置（研究に基づく第3段落後） */}
                {/* {index === 2 &&
                  sortedPartyPoliticians.length > 3 &&
                  showInlineAd && (
                    <div className="py-3 flex justify-center border-b border-gray-100">
                      <MobileAd format="rectangle" showCloseButton={true} />
                    </div>
                  )} */}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // モバイルメニュー（レスポンシブ対応用）
  const MobileMenu = () => {
    if (!mobileMenuOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
        <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-lg">メニュー</h3>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="p-4">
            <ul className="space-y-4">
              <li>
                <button
                  onClick={() => {
                    setActiveTab("politicians");
                    setSelectedPolitician(null);
                    setSelectedParty(null);
                    setShowAllPoliticians(false);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center text-gray-700 font-medium"
                >
                  <Users size={18} className="mr-2 text-indigo-600" />
                  政治家一覧
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("parties");
                    setSelectedPolitician(null);
                    setSelectedParty(null);
                    setShowAllPoliticians(false);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center text-gray-700 font-medium"
                >
                  <Building size={18} className="mr-2 text-indigo-600" />
                  政党一覧
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setShowAllPoliticians(true);
                    setSelectedPolitician(null);
                    setSelectedParty(null);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center text-gray-700 font-medium"
                >
                  <BarChart3 size={18} className="mr-2 text-indigo-600" />
                  ランキング
                </button>
              </li>
              <li className="border-t border-gray-200 pt-4">
                <button className="flex items-center text-gray-700 font-medium">
                  <Crown size={18} className="mr-2 text-yellow-500" />
                  プレミアム会員登録
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen font-sans bg-amber-50">
      {/* モバイルメニュー（レスポンシブ対応） */}
      <MobileMenu />

      {/* ヘッダー - スクロールで変化するエフェクト */}
      <header
      // className={`sticky top-0 z-20 transition-all duration-300 ${
      //   isScrolled
      //     ? "bg-white shadow-md py-2"
      //     : "bg-gradient-to-r from-indigo-600 to-purple-600 py-3 sm:py-4"
      // }`}
      >
        <div className="container px-4 mx-auto flex items-center justify-between">
          {/* メニューボタン - 大画面では非表示 */}
          <button
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full transition"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu
              size={20}
              className={isScrolled ? "text-gray-700" : "text-white"}
            />
          </button>

          {/* プレミアムボタン */}
          <div className="relative group hidden sm:block">
            <button className="flex items-center justify-center w-7 h-7 rounded-full transition">
              <Crown
                size={16}
                className={isScrolled ? "text-yellow-500" : "text-white"}
              />
            </button>
            <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-white rounded-lg shadow-lg p-2 w-48 border border-gray-200 z-10">
              <p className="text-xs text-gray-700 mb-2">
                広告なしでご利用いただけるプレミアムプランをお試しください。
              </p>
              <button className="w-full bg-indigo-600 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-indigo-700 transition">
                プレミアムに登録する
              </button>
            </div>
          </div>

          <h1
            className={`font-bold transition-all duration-300 flex items-center ${
              isScrolled
                ? "text-gray-800 text-base sm:text-lg"
                : "text-white text-lg sm:text-xl"
            }`}
          >
            <Award size={isScrolled ? 20 : 24} className="mr-2" />
            政治家評価ポータル
          </h1>

          {selectedPolitician ? (
            <button
              onClick={() => {
                setSelectedPolitician(null);
                // 政党の詳細から来た場合は政党詳細に戻る
                if (selectedParty) {
                  handlePartySelect(selectedParty);
                }
              }}
              className={`flex items-center rounded-full px-3 py-1 text-sm transition-all ${
                isScrolled
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-white/20 text-white backdrop-blur-sm"
              }`}
            >
              <span>一覧に戻る</span>
            </button>
          ) : !selectedParty && !showAllPoliticians ? (
            <div
              className={`hidden md:flex space-x-1 rounded-full backdrop-blur-sm p-1 ${
                isScrolled ? "bg-gray-100" : "bg-white/20"
              }`}
            >
              <button
                onClick={() => setActiveTab("politicians")}
                className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                  activeTab === "politicians"
                    ? isScrolled
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "bg-white/90 text-indigo-600"
                    : isScrolled
                    ? "text-gray-600"
                    : "text-white"
                }`}
              >
                政治家
              </button>
              <button
                onClick={() => setActiveTab("parties")}
                className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                  activeTab === "parties"
                    ? isScrolled
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "bg-white/90 text-indigo-600"
                    : isScrolled
                    ? "text-gray-600"
                    : "text-white"
                }`}
              >
                政党
              </button>
            </div>
          ) : (
            <div className="w-8 md:w-16"></div> // スペース確保用
          )}
        </div>
      </header>

      {/* メインコンテンツ - レスポンシブコンテナ */}
      <main className="flex-1 p-4 pb-16 container mx-auto max-w-7xl">
        {" "}
        {/* コンテナを最大幅7xlに設定、自動マージンで中央揃え */}
        <div className="mx-auto max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
          {" "}
          {/* 各デバイス幅に応じたコンテンツ幅 */}
          {/* タイトル直下の320×100大型モバイルバナー - モバイル向け最適化広告 */}
          {/* <div className="flex justify-center mb-4">
            <MobileAd format="large-banner" showCloseButton={true} />
          </div> */}
          {selectedPolitician ? (
            // 政治家詳細ページ
            <section className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <div className="relative mx-auto sm:mx-0 mb-4 sm:mb-0">
                      <div
                        className="absolute inset-0 rounded-full blur-sm opacity-30"
                        style={{
                          backgroundColor: selectedPolitician.party.color,
                        }}
                      ></div>
                      <img
                        src={selectedPolitician.image}
                        alt={selectedPolitician.name}
                        className="w-20 h-20 relative rounded-full object-cover border-2 z-10"
                        style={{ borderColor: selectedPolitician.party.color }}
                      />
                    </div>
                    <div className="sm:ml-6 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <h2 className="text-xl font-bold">
                          {selectedPolitician.name}
                        </h2>
                        <div className="mt-1 sm:mt-0 sm:ml-3">
                          {getTrendIcon(selectedPolitician.trending)}
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-center sm:justify-start items-center text-sm text-gray-500 mt-1">
                        <span>{selectedPolitician.position}</span>
                        <span className="mx-2">•</span>
                        <span>{selectedPolitician.age}歳</span>
                      </div>
                      <div
                        className="mt-2 px-3 py-1 rounded-full text-white text-xs inline-flex items-center cursor-pointer"
                        style={{
                          backgroundColor: selectedPolitician.party.color,
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // イベントの伝播を停止
                          const party = parties.find(
                            (p) => p.id === selectedPolitician.party.id
                          );
                          if (party) {
                            handlePartySelect(party);
                          }
                        }}
                      >
                        <Building size={12} className="mr-1" />
                        {selectedPolitician.party.name}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                      <h3 className="font-bold text-gray-700 mb-1 sm:mb-0">
                        市民評価
                      </h3>
                      <span className="text-sm text-gray-500">
                        総投票数:{" "}
                        {selectedPolitician.totalVotes.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-green-100">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <ThumbsUp
                              size={16}
                              className="text-green-500 mr-2"
                            />
                            <span className="text-sm font-medium">支持</span>
                          </div>
                          <span className="text-xl font-bold text-green-600">
                            {selectedPolitician.supportRate}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{
                              width: `${selectedPolitician.supportRate}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-3 shadow-sm border border-red-100">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <ThumbsDown
                              size={16}
                              className="text-red-500 mr-2"
                            />
                            <span className="text-sm font-medium">不支持</span>
                          </div>
                          <span className="text-xl font-bold text-red-600">
                            {selectedPolitician.opposeRate}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                          <div
                            className="h-full rounded-full bg-red-500"
                            style={{
                              width: `${selectedPolitician.opposeRate}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex my-3">
                      <div
                        className="h-full rounded-l-full transition-all duration-700 ease-in-out"
                        style={{
                          width: `${selectedPolitician.supportRate}%`,
                          backgroundColor: "#10B981",
                        }}
                      ></div>
                      <div
                        className="h-full rounded-r-full transition-all duration-700 ease-in-out"
                        style={{
                          width: `${selectedPolitician.opposeRate}%`,
                          backgroundColor: "#EF4444",
                        }}
                      ></div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500">
                      <span className="flex items-center mb-1 sm:mb-0">
                        <Eye size={12} className="mr-1" />
                        最近の活動: {selectedPolitician.recentActivity}
                      </span>
                      <span className="flex items-center">
                        <Activity size={12} className="mr-1" />
                        活動指数: {selectedPolitician.activity}
                      </span>
                    </div>
                  </div>

                  {/* 投票ボタン */}
                  {!showReasonForm && (
                    <div className="mt-6">
                      <h3 className="text-center text-sm font-medium text-gray-500 mb-3">
                        この政治家を評価する
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          onClick={() => handleVoteClick("support")}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl flex items-center justify-center font-medium transition transform hover:translate-y-0.5 active:scale-95 shadow-md"
                        >
                          <ThumbsUp size={18} className="mr-2" />
                          支持する
                        </button>
                        <button
                          onClick={() => handleVoteClick("oppose")}
                          className="bg-gradient-to-r from-red-500 to-rose-600 text-white py-3 rounded-xl flex items-center justify-center font-medium transition transform hover:translate-y-0.5 active:scale-95 shadow-md"
                        >
                          <ThumbsDown size={18} className="mr-2" />
                          支持しない
                        </button>
                      </div>
                      <p className="text-center text-xs text-gray-500 mt-2">
                        ※評価には理由の入力が必要です
                      </p>
                    </div>
                  )}

                  {/* 投票フォーム */}
                  {showReasonForm && (
                    <div className="mt-6 animate-fadeIn">
                      <div
                        className={`rounded-xl p-4 mb-3 ${
                          voteType === "support"
                            ? "bg-green-50 border border-green-200"
                            : "bg-red-50 border border-red-200"
                        }`}
                      >
                        <h3 className="font-medium mb-1 flex items-center">
                          {voteType === "support" ? (
                            <>
                              <ThumbsUp
                                size={16}
                                className="text-green-500 mr-2"
                              />
                              <span className="text-green-700">
                                支持する理由
                              </span>
                            </>
                          ) : (
                            <>
                              <ThumbsDown
                                size={16}
                                className="text-red-500 mr-2"
                              />
                              <span className="text-red-700">
                                支持しない理由
                              </span>
                            </>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          具体的な理由を記入してください（必須）
                        </p>

                        <form onSubmit={handleSubmit}>
                          <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:outline-none transition-shadow"
                            style={{}}
                            rows={4}
                            placeholder="あなたの意見を書いてください..."
                            required
                          ></textarea>

                          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-3">
                            <button
                              type="submit"
                              className={`py-2.5 rounded-lg text-white font-medium transition transform active:scale-95 ${
                                voteType === "support"
                                  ? "bg-green-500 hover:bg-green-600"
                                  : "bg-red-500 hover:bg-red-600"
                              }`}
                            >
                              評価を送信
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowReasonForm(false)}
                              className="py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                            >
                              キャンセル
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* プレミアム会員バナー */}
              <PremiumBanner />

              {/* 投票理由リスト */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-4 flex items-center">
                    <MessageSquare size={18} className="mr-2 text-indigo-600" />
                    評価理由
                  </h3>

                  {/* 修正：スティッキー広告を通常のインラインバナーに変更 */}
                  {/* <InlineAdBanner format="rectangle" showCloseButton={true} /> */}

                  {/* 支持理由 */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-green-600 flex items-center">
                        <ThumbsUp size={16} className="mr-1" />
                        支持する理由
                      </h4>
                      <span className="text-xs py-1 px-2 bg-green-100 text-green-700 rounded-full">
                        {reasonsData.support.length}件
                      </span>
                    </div>

                    <div className="space-y-3">
                      {reasonsData.support.map((comment, index) => (
                        <React.Fragment key={comment.id}>
                          <CommentItem comment={comment} type="support" />

                          {/* 3番目のコメント後に中型長方形広告を配置 */}
                          {/* {index === 2 &&
                            reasonsData.support.length > 3 &&
                            showInlineAd && (
                              <div className="my-4 flex justify-center">
                                <MobileAd
                                  format="rectangle"
                                  showCloseButton={true}
                                />
                              </div>
                            )} */}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* 不支持理由 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-red-600 flex items-center">
                        <ThumbsDown size={16} className="mr-1" />
                        支持しない理由
                      </h4>
                      <span className="text-xs py-1 px-2 bg-red-100 text-red-700 rounded-full">
                        {reasonsData.oppose.length}件
                      </span>
                    </div>

                    <div className="space-y-3">
                      {reasonsData.oppose.map((comment) => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          type="oppose"
                        />
                      ))}
                    </div>
                  </div>

                  {/* 返信入力フォーム (ネストされた返信の場合) */}
                  {replyingTo && replyingTo.parentComment && (
                    <div className="fixed bottom-16 left-0 right-0 p-3 bg-white border-t border-gray-200 animate-slideUp shadow-lg max-w-md mx-auto z-20">
                      <form onSubmit={handleSubmitReply}>
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <CornerDownRight size={12} className="mr-1" />
                          <span className="font-medium text-gray-600">
                            @{replyingTo.comment.user}
                          </span>
                          <span className="ml-1">への返信</span>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="返信を入力..."
                            className="flex-1 border border-gray-300 rounded-l-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                            autoFocus
                          />

                          <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-r-lg text-sm transition"
                          >
                            <Send size={16} />
                          </button>
                        </div>

                        <div className="flex justify-end mt-2">
                          <button
                            type="button"
                            onClick={handleCancelReply}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            キャンセル
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </section>
          ) : selectedParty ? (
            // 政党詳細ページ
            <PartyDetail />
          ) : showAllPoliticians ? (
            // 全議員一覧ページ
            <AllPoliticiansList />
          ) : (
            // 通常のホーム画面
            <>
              {/* モバイル用のタブ切り替えボタン - 大画面では非表示 */}
              <div className="md:hidden flex mb-4 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("politicians")}
                  className={`flex-1 py-3 text-center font-medium text-sm border-b-2 transition ${
                    activeTab === "politicians"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  政治家
                </button>
                <button
                  onClick={() => setActiveTab("parties")}
                  className={`flex-1 py-3 text-center font-medium text-sm border-b-2 transition ${
                    activeTab === "parties"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  政党
                </button>
              </div>

              {activeTab === "politicians" ? (
                // 政治家タブ
                <section className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center">
                          <Users size={18} className="mr-2 text-indigo-600" />
                          注目の政治家
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          市民による評価が高い政治家
                        </p>
                      </div>

                      <button
                        onClick={showAllPoliticiansList}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                      >
                        全議員を見る
                        <ChevronRight size={16} className="ml-1" />
                      </button>
                    </div>

                    <div>
                      {/* 支持率上位3人を表示 */}
                      {getSortedPoliticians(politicians)
                        .slice(0, 3)
                        .map((politician, index) => (
                          <PoliticianCard
                            key={politician.id}
                            politician={politician}
                            index={index}
                          />
                        ))}
                    </div>

                    {/* 3件目の後に300×250長方形広告（研究に基づく第3段落後配置） */}
                    {/* {showInlineAd && (
                      <div className="flex justify-center p-4 border-t border-gray-100">
                        <MobileAd format="rectangle" showCloseButton={true} />
                      </div>
                    )} */}
                  </div>

                  {/* プレミアム会員バナー */}
                  <PremiumBanner />

                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 p-4">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center mb-4">
                      <BarChart3 size={18} className="mr-2 text-indigo-600" />
                      活動指数ランキング
                    </h2>
                    <div className="space-y-4">
                      {politicians
                        .sort((a, b) => b.activity - a.activity)
                        .slice(0, 3)
                        .map((politician, index) => (
                          <div
                            key={politician.id}
                            className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                            onClick={() => handlePoliticianSelect(politician)}
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-bold text-gray-700 mr-3 flex-shrink-0">
                              {index + 1}
                            </div>
                            <img
                              src={politician.image}
                              alt={politician.name}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200 mr-3 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <h3 className="font-medium text-sm truncate">
                                  {politician.name}
                                </h3>
                                <span className="font-bold text-indigo-600 flex-shrink-0">
                                  {politician.activity}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div
                                  className="rounded-full h-full transition-all duration-500"
                                  style={{
                                    width: `${politician.activity}%`,
                                    backgroundColor: politician.party.color,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* スポンサー付きの4位エントリ風広告（ネイティブ） */}
                      <div className="flex items-center p-2 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-500 mr-3 flex-shrink-0">
                          <span className="text-xs">PR</span>
                        </div>
                        <img
                          src="/api/placeholder/40/40"
                          alt="広告"
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 mr-3 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h3 className="font-medium text-sm truncate">
                              選挙・政治情報アプリ
                            </h3>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 truncate">
                            政治に関する詳しい情報はこちらから
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              ) : (
                // 政党タブ
                <section className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="p-4 border-b border-gray-100">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <TrendingUp
                          size={18}
                          className="mr-2 text-indigo-600"
                        />
                        政党支持率
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        市民による評価に基づく政党支持率
                      </p>
                    </div>

                    <div className="p-4 space-y-6">
                      {parties.map((party, index) => (
                        <React.Fragment key={party.id}>
                          <div
                            className="relative hover:bg-gray-50 p-2 rounded-lg transition cursor-pointer"
                            onClick={() => handlePartySelect(party)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <span
                                  className="w-4 h-4 rounded-full mr-2 flex-shrink-0"
                                  style={{ backgroundColor: party.color }}
                                ></span>
                                <span className="font-bold truncate">
                                  {party.name}
                                </span>
                              </div>
                              <ChevronRight
                                size={16}
                                className="text-gray-400 flex-shrink-0"
                              />
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="flex items-center">
                                  <ThumbsUp
                                    size={14}
                                    className="text-green-500 mr-1 flex-shrink-0"
                                  />
                                  <span className="font-medium text-green-700">
                                    {party.supportRate}%
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <ThumbsDown
                                    size={14}
                                    className="text-red-500 mr-1 flex-shrink-0"
                                  />
                                  <span className="font-medium text-red-700">
                                    {party.opposeRate}%
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {party.totalVotes.toLocaleString()}票
                              </span>
                            </div>

                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex mb-2">
                              <div
                                className="h-full rounded-l-full"
                                style={{
                                  width: `${party.supportRate}%`,
                                  backgroundColor: "#10B981",
                                }}
                              ></div>
                              <div
                                className="h-full rounded-r-full"
                                style={{
                                  width: `${party.opposeRate}%`,
                                  backgroundColor: "#EF4444",
                                }}
                              ></div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3 mt-2">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 mb-2">
                                <div className="flex items-center mb-1 sm:mb-0">
                                  <Users
                                    size={12}
                                    className="mr-1 flex-shrink-0"
                                  />
                                  <span>
                                    所属議員:{" "}
                                    {getPoliticiansByParty(party.id).length}名
                                  </span>
                                </div>
                                <span className="flex items-center">
                                  <Activity
                                    size={12}
                                    className="mr-1 flex-shrink-0"
                                  />
                                  <span>
                                    政策数: {party.keyPolicies.length}
                                  </span>
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-1">
                                {party.keyPolicies.map((policy, i) => (
                                  <span
                                    key={i}
                                    className="text-xs py-1 px-2 rounded-full bg-white border border-gray-200"
                                    style={{ color: party.color }}
                                  >
                                    {policy}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* 第1党の後に広告（第3段落後） */}
                          {/* {index === 0 && showInlineAd && (
                            <div className="flex justify-center py-2">
                              <MobileAd
                                format="rectangle"
                                showCloseButton={true}
                              />
                            </div>
                          )} */}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      {/* 下部固定広告（320×50）- レスポンシブ対応 */}
      {/* {showFixedBottomAd && (
        <MobileAd format="fixed-bottom" showCloseButton={true} />
      )} */}

      {/* スタイル定義 */}
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
  @keyframes premiumReveal {
    0% { 
      opacity: 0; 
      transform: translateY(20px);
    }
    100% { 
      opacity: 1; 
      transform: translateY(0);
    }
  }

  .premium-reveal-animation {
    animation: premiumReveal 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
    animation-iteration-count: 1;
  }
  
@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
.animate-slideUp {
  animation: slideUp 0.3s ease-out forwards;
}
`}</style>
    </div>
  );
};

export default App;
