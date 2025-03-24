// src/components/comments/OptimizedCommentSystem.tsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  CornerDownRight,
  Send,
  ChevronUp,
  ChevronDown,
  Filter,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { Comment, Reply } from "../../types";
import { useReplyData } from "../../context/ReplyDataContext";
import { useData } from "../../context/DataContext";
import InlineAdBanner from "../ads/InlineAdBanner";

// ===== 共通ユーティリティ =====
// 匿名ユーザー情報（再利用）
const MOCK_USER = { uid: "user_anonymous", displayName: "匿名ユーザー" };

// 日付フォーマット（一度だけ定義して再利用）
const formatDate = (date: string | Date) =>
  new Date(date).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

// スタイルの共通定義（JSXの重複を削減）
const STYLES = {
  highlight: `@keyframes highlight-pulse {
    0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
    100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
  }
  .comment-highlight {
    animation: highlight-pulse 2s 1;
    scroll-margin-top: 80px;
  }`,
  likeButton: (isLiked: boolean) =>
    `flex items-center text-xs ${
      isLiked
        ? "bg-indigo-100 text-indigo-600 cursor-default"
        : "bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
    } px-2 py-1 rounded-full shadow-sm transition`,
  replyToggle: "flex items-center text-xs text-gray-500 hover:text-gray-700",
  commentBase: (highlighted: boolean, type: string) =>
    `rounded-xl p-4 border transition duration-500 ${
      highlighted
        ? type === "support"
          ? "bg-green-100 border-green-300 shadow-md animate-pulse"
          : "bg-red-100 border-red-300 shadow-md animate-pulse"
        : type === "support"
        ? "bg-green-50 border-green-100 hover:shadow-md"
        : "bg-red-50 border-red-100 hover:shadow-md"
    }`,
};

// ソートの種類を定義
type SortType = "latest" | "replies" | "support" | "oppose";

// ===== メインのコメントセクションコンポーネント =====
export const CommentSection: React.FC<{
  entityId?: string;
  entityType?: "politician" | "policy" | "party"; // "party"を追加
}> = ({ entityId, entityType = "politician" }) => {
  const { id } = useParams<{ id: string }>();
  const targetId = entityId || id;
  const {
    comments,
    isLoadingComments,
    commentError,
    fetchCommentsByPolitician,
    newCommentId,
  } = useReplyData();
  const { handleVoteClick } = useData();

  // ソート方法の状態
  const [sortType, setSortType] = useState<SortType>("latest");
  // ドロップダウンの表示状態
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  // ドロップダウン参照（外側クリック検出用）
  const dropdownRef = useRef<HTMLDivElement>(null);

  // データ読み込み
  useEffect(() => {
    targetId && fetchCommentsByPolitician(targetId);
  }, [targetId, fetchCommentsByPolitician]);

  // ドロップダウン外のクリックを検出して閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ソートタイプに応じたラベルを取得
  const getSortLabel = (type: SortType): string => {
    switch (type) {
      case "latest":
        return "新着順";
      case "replies":
        return "返信の多い順";
      case "support":
        return "支持コメント";
      case "oppose":
        return "不支持コメント";
      default:
        return "並び順";
    }
  };

  // ソートされたコメントリストを計算
  const sortedComments = useMemo(() => {
    if (!comments.length) return [];

    switch (sortType) {
      case "latest":
        // 日付の新しい順（降順）に並べる
        return [...comments].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "replies":
        // 返信数の多い順に並べる
        return [...comments].sort((a, b) => b.repliesCount - a.repliesCount);
      case "support":
        // 支持コメントを先に表示
        return [...comments].sort((a, b) => {
          if (a.type === "support" && b.type !== "support") return -1;
          if (a.type !== "support" && b.type === "support") return 1;
          // 同じタイプの場合は日付順
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      case "oppose":
        // 不支持コメントを先に表示
        return [...comments].sort((a, b) => {
          if (a.type === "oppose" && b.type !== "oppose") return -1;
          if (a.type !== "oppose" && b.type === "oppose") return 1;
          // 同じタイプの場合は日付順
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      default:
        return [...comments];
    }
  }, [comments, sortType]);

  // コメント数と種類のサマリーを表示 - 位置の修正のみ
  const renderCommentSummary = () => {
    const supportCount = comments.filter((c) => c.type === "support").length;
    const opposeCount = comments.filter((c) => c.type === "oppose").length;
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold flex items-center text-lg">
            <MessageSquare size={16} className="mr-2 text-indigo-600" />
            {comments.length}件のコメント
          </h3>

          {/* ソートボタン - 位置を同じ高さに、色だけ変更 */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center px-3 mt-4 py-1.5 text-sm rounded-full shadow-sm 
              bg-white border border-gray-200 text-gray-700 hover:bg-gray-50
              transition-all duration-300 ease-in-out"
            >
              <Filter size={14} className="mr-2 text-gray-500" />
              <span>{getSortLabel(sortType)}</span>
              <div className="ml-2 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                <ChevronDown size={12} className="text-gray-600" />
              </div>
            </button>

            {showSortDropdown && (
              <div
                className="absolute top-full right-0 mt-1 w-44 bg-white rounded-md shadow-lg z-20 py-1 border border-gray-200
              overflow-hidden"
              >
                {(["latest", "replies", "support", "oppose"] as SortType[]).map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSortType(type);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center transition-colors
                      ${
                        sortType === type
                          ? "bg-indigo-50 text-indigo-600 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          sortType === type ? "bg-indigo-500" : "bg-gray-300"
                        }`}
                      ></span>
                      {getSortLabel(type)}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* コメント件数表示を下に移動 */}
        <div className="flex space-x-2 text-xs">
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center">
            <ThumbsUp size={12} className="mr-1" />
            {supportCount}
          </span>
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center">
            <ThumbsDown size={12} className="mr-1" />
            {opposeCount}
          </span>
        </div>
      </div>
    );
  };

  // 共通の追加コメントボタン
  // const renderAddCommentButton = () => (
  //   <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 my-6 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
  //     <span className="text-sm text-gray-700">
  //       <MessageSquare size={16} className="inline mr-1" />
  //       あなたも{entityType === "politician" ? "この政治家" : "この政策"}
  //       に対する評価を投稿できます
  //     </span>
  //     <div className="flex space-x-2">
  //       {["support", "oppose"].map((type) => (
  //         <button
  //           key={type}
  //           onClick={() => handleVoteClick(type as "support" | "oppose")}
  //           className={`px-4 py-1.5 ${
  //             type === "support"
  //               ? "bg-green-500 hover:bg-green-600"
  //               : "bg-red-500 hover:bg-red-600"
  //           } text-white text-sm rounded-full flex items-center transition`}
  //         >
  //           {type === "support" ? (
  //             <ThumbsUp size={14} className="mr-1" />
  //           ) : (
  //             <ThumbsDown size={14} className="mr-1" />
  //           )}
  //           支持{type === "oppose" ? "しない" : "する"}
  //         </button>
  //       ))}
  //     </div>
  //   </div>
  // );

  // ローディング状態
  if (isLoadingComments) {
    return (
      <div className="p-4 flex justify-center items-center">
        <div className="animate-pulse flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-2 w-2 bg-indigo-500 rounded-full"></div>
          ))}
        </div>
        <span className="ml-2 text-gray-500">読み込み中...</span>
      </div>
    );
  }

  // エラー状態
  if (commentError) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-500 text-center">
        <p>{commentError}</p>
        <button
          onClick={() => targetId && fetchCommentsByPolitician(targetId)}
          className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-full"
        >
          再読み込み
        </button>
      </div>
    );
  }

  // 最終レンダリング
  return (
    <>
      <style>{STYLES.highlight}</style>
      <InlineAdBanner format="rectangle" showCloseButton={true} />
      {/* {renderAddCommentButton()} */}
      {renderCommentSummary()}{" "}
      {/* この中にソートボタンも含まれるようになりました */}
      <div className="space-y-2">
        {sortedComments.map((comment, index) => (
          <React.Fragment key={comment.id}>
            <CommentItem
              comment={comment}
              type={comment.type}
              isNew={newCommentId === comment.id}
            />
            {/* 3番目のコメントの後に広告を表示 */}
            {/* {index === 2 && sortedComments.length > 3 && (
              <div className="my-4 flex justify-center">
                <InlineAdBanner format="rectangle" showCloseButton={true} />
              </div>
            )} */}
          </React.Fragment>
        ))}

        {/* コメントがない場合の表示 */}
        {comments.length === 0 && (
          <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
            まだコメントはありません。最初のコメントを投稿してみましょう。
          </div>
        )}
      </div>
    </>
  );
};

// ===== 統合コメントアイテムコンポーネント =====
interface CommentItemProps {
  comment: Comment;
  type: "support" | "oppose";
  isNew?: boolean;
  isReply?: boolean;
  parentComment?: Comment;
}

// 統合されたコメントアイテムコンポーネント - コメントとリプライの両方を処理
export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  type,
  isNew = false,
  isReply = false,
  parentComment,
}) => {
  const [isRepliesExpanded, setIsRepliesExpanded] = useState(false);
  const [isReplyFormVisible, setIsReplyFormVisible] = useState(false);
  const [highlighted, setHighlighted] = useState(isNew);

  const {
    comments,
    newCommentId,
    clearNewCommentId,
    likeComment,
    hasUserLikedComment,
  } = useReplyData();

  const commentRef = useRef<HTMLDivElement>(null);

  // いいね済みステータス
  const isLiked = hasUserLikedComment(
    isReply ? parentComment?.id || "" : comment.id,
    isReply ? comment.id : undefined
  );

  // ハイライト効果
  useEffect(() => {
    if (isNew || (!isReply && newCommentId === comment.id)) {
      setHighlighted(true);
      const timer = setTimeout(() => {
        setHighlighted(false);
        if (newCommentId) clearNewCommentId();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isNew, newCommentId, comment.id, clearNewCommentId, isReply]);

  // 返信セクション展開ロジック
  useEffect(() => {
    if (!isReply && isReplyFormVisible) {
      const latestComment = comments.find((c) => c.id === comment.id);
      if ((latestComment?.repliesCount ?? 0) > 0) setIsRepliesExpanded(true);
    }
  }, [comments, comment.id, isReplyFormVisible, isReply]);

  // トグル・アクション関数
  const toggleReplies = () => setIsRepliesExpanded((prev) => !prev);
  const openReplyForm = () => setIsReplyFormVisible(true);
  const closeReplyForm = () => setIsReplyFormVisible(false);

  // いいねハンドラー - 最適化（リプライとコメントで共通の処理）
  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!isLiked) {
      likeComment(
        isReply ? parentComment?.id || "" : comment.id,
        isReply ? comment.id : undefined
      );
    }
  };

  // レンダー関数 - リプライの場合とコメントの場合で条件分岐
  // 返信対象情報の正規化（クライアント/サーバー命名規則の両方に対応）
  const replyTo = isReply
    ? (comment as unknown as Reply).reply_to ||
      ((comment as unknown as Reply).replyTo
        ? {
            reply_id: (comment as unknown as Reply).replyTo?.replyID,
            reply_to_user_id: (comment as unknown as Reply).replyTo
              ?.replyToUserID,
            reply_to_username: (comment as unknown as Reply).replyTo
              ?.replyToUserName,
          }
        : null)
    : null;

  // ユーザー名の正規化
  const userName = isReply
    ? (comment as unknown as Reply).userName ||
      (comment as unknown as Reply).user_name
    : comment.userName;

  return (
    <div
      className={isReply ? "mt-2 animate-fadeIn" : ""}
      id={`comment-${comment.id}`}
      ref={commentRef}
    >
      <div
        className={
          isReply
            ? "rounded-lg p-3 border bg-white border-gray-100"
            : STYLES.commentBase(highlighted, type)
        }
      >
        {/* Reply reference header - リプライの場合のみ表示 */}
        {isReply && replyTo && (
          <div className="flex items-center mb-2 text-xs text-gray-500">
            <CornerDownRight size={12} className="mr-1" />
            <span className="font-medium text-gray-600">
              @{replyTo.reply_to_username}
            </span>
            <span className="ml-1">への返信</span>
          </div>
        )}

        {/* コメント本文 - スタイルのみ条件分岐 */}
        <p className={`text-gray-700 ${isReply ? "text-sm" : ""}`}>
          {comment.text}
        </p>

        {/* メタデータ＆アクション - 共通化 */}
        <div className="flex justify-between mt-2 items-center">
          <div className="flex items-center text-xs text-gray-500">
            <span className="font-medium">{userName}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(comment.createdAt)}</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleLike}
              disabled={isLiked}
              className={STYLES.likeButton(isLiked)}
            >
              <ThumbsUp size={isReply ? 10 : 12} className="mr-1" />
              <span>{comment.likes}</span>
            </button>

            <button
              className="text-xs text-indigo-600 hover:text-indigo-800 transition"
              onClick={openReplyForm}
            >
              返信
            </button>
          </div>
        </div>

        {/* 返信トグル - 非リプライかつ返信がある場合のみ表示 */}
        {!isReply && comment.repliesCount > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-200">
            <button className={STYLES.replyToggle} onClick={toggleReplies}>
              <MessageSquare size={14} className="mr-1" />
              <span>{comment.repliesCount} 返信</span>
              {isRepliesExpanded ? (
                <ChevronUp size={14} className="ml-1" />
              ) : (
                <ChevronDown size={14} className="ml-1" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* 返信フォーム - 表示/非表示を条件で制御 */}
      {isReplyFormVisible && (
        <ReplyForm
          comment={isReply ? (parentComment as Comment) : comment}
          replyingTo={isReply ? (comment as unknown as Reply) : undefined}
          onClose={closeReplyForm}
        />
      )}

      {/* 返信一覧 - 展開時のみ表示 */}
      {!isReply && isRepliesExpanded && comment.replies?.length > 0 && (
        <div className="mt-2 pl-2 ml-2 border-l-2 border-gray-200">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply as unknown as Comment}
              type={type}
              isReply={true}
              parentComment={comment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ===== 返信フォームコンポーネント =====
interface ReplyFormProps {
  comment: Comment;
  replyingTo?: Reply;
  onClose: () => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  comment,
  replyingTo,
  onClose,
}) => {
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addReply, updateLocalReplies } = useReplyData();

  // 送信処理関数
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 入力検証
    if (!replyText.trim()) {
      setError("返信内容を入力してください");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 返信データ構築
      const newReply = {
        text: replyText,
        userID: MOCK_USER.uid,
        userName: MOCK_USER.displayName,
        replyTo: replyingTo
          ? {
              replyID: replyingTo.id,
              replyToUserID: replyingTo.userID || replyingTo.user_id,
              replyToUserName: replyingTo.userName || replyingTo.user_name,
            }
          : undefined,
      };

      // APIを呼び出して返信を追加
      const createdReply = await addReply(comment.id, newReply);

      // ローカルUIを更新（再取得なしで効率化）
      updateLocalReplies(comment.id, createdReply);

      // フォームをリセットして閉じる
      setReplyText("");
      onClose();
    } catch (err) {
      console.error("返信の送信中にエラーが発生しました:", err);
      setError("返信の送信に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 返信対象ユーザー名を取得
  const getReplyTargetName = () =>
    replyingTo
      ? replyingTo.userName || replyingTo.user_name || "不明なユーザー"
      : "";

  return (
    <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 animate-slideUp">
      <form onSubmit={handleSubmit}>
        {/* 返信対象表示 */}
        {replyingTo && (
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <CornerDownRight size={12} className="mr-1" />
            <span className="font-medium text-gray-600">
              @{getReplyTargetName()}
            </span>
            <span className="ml-1">に返信</span>
          </div>
        )}

        {/* エラーメッセージ */}
        {error && (
          <div className="text-red-500 text-xs mb-2 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {/* 入力フィールド */}
        <div className="flex items-center">
          <input
            type="text"
            value={replyText}
            onChange={(e) => {
              setReplyText(e.target.value);
              if (error) setError(null);
            }}
            placeholder="返信を入力..."
            className={`flex-1 border ${
              error
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-indigo-500"
            } rounded-l-lg p-2 text-sm focus:outline-none focus:ring-2`}
            disabled={isSubmitting}
            maxLength={300}
          />
          <button
            type="submit"
            disabled={isSubmitting || !replyText.trim()}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-r-lg text-sm transition ${
              isSubmitting || !replyText.trim()
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <Send size={16} />
          </button>
        </div>

        {/* 文字数カウントとキャンセルボタン */}
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-400">{replyText.length}/300</span>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
};
