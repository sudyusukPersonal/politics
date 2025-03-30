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

// ===== 共通ユーティリティと定数 =====
// 匿名ユーザー情報
const MOCK_USER = { uid: "user_anonymous", displayName: "匿名ユーザー" };

// 日付フォーマット
const formatDate = (date: string | Date) =>
  new Date(date).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

// 共通スタイル定義
const STYLES = {
  // アニメーションCSS
  css: `
      @keyframes highlight-pulse {
        0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
        100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
      }
      .comment-highlight {
        animation: highlight-pulse 2s 1;
        scroll-margin-top: 80px;
      }
    `,
  // ボタンスタイル
  button: {
    like: (isLiked: boolean) =>
      `flex items-center text-xs ${
        isLiked
          ? "bg-indigo-100 text-indigo-600 cursor-default"
          : "bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
      } px-2 py-1 rounded-full shadow-sm transition`,
    reply: "text-xs text-indigo-600 hover:text-indigo-800 transition",
    toggle: "flex items-center text-xs text-gray-500 hover:text-gray-700",
    sort: (
      isActive: boolean
    ) => `w-full text-left px-4 py-2 text-sm flex items-center transition-colors
          ${
            isActive
              ? "bg-indigo-50 text-indigo-600 font-medium"
              : "text-gray-700 hover:bg-gray-50"
          }`,
  },
  // コンテナスタイル
  container: {
    comment: (highlighted: boolean, type: string) =>
      `rounded-xl p-4 border transition duration-500 ${
        highlighted
          ? type === "support"
            ? "bg-green-100 border-green-300 shadow-md animate-pulse"
            : "bg-red-100 border-red-300 shadow-md animate-pulse"
          : type === "support"
          ? "bg-green-50 border-green-100 hover:shadow-md"
          : "bg-red-50 border-red-100 hover:shadow-md"
      }`,
    reply: "rounded-lg p-3 border bg-white border-gray-100",
    replyForm:
      "mt-3 p-3 bg-white rounded-lg border border-gray-200 animate-slideUp",
    replyList: "mt-2 pl-2 ml-2 border-l-2 border-gray-200",
  },
};

// ソートタイプ定義
type SortType = "latest" | "replies" | "support" | "oppose";

// ヘルパー関数
// ソートラベル取得
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

// ユーザーデータの正規化
const normalizeUserData = (comment: any, isReply: boolean) => {
  return {
    name: isReply ? comment.userName || comment.user_name : comment.userName,
    id: isReply ? comment.userID || comment.user_id : comment.userID,
  };
};

// 返信参照情報の取得
const getReplyReference = (reply: any) => {
  return (
    reply.reply_to ||
    (reply.replyTo
      ? {
          reply_id: reply.replyTo?.replyID,
          reply_to_user_id: reply.replyTo?.replyToUserID,
          reply_to_username: reply.replyTo?.replyToUserName,
        }
      : null)
  );
};

// ===== メインコメントセクションコンポーネント =====
// src/components/comments/OptimizedCommentSystem.tsx の一部
/////
export const CommentSection: React.FC<{
  entityId?: string;
  entityType?: "politician" | "policy" | "party";
  totalCommentCount?: number; // 追加：エンティティの総コメント数
}> = ({ entityId, entityType = "politician", totalCommentCount }) => {
  const { id } = useParams<{ id: string }>();
  const targetId = entityId || id;
  const {
    comments,
    isLoadingComments,
    commentError,
    fetchCommentsByPolitician,
    newCommentId,
  } = useReplyData();

  // ソート状態
  const [sortType, setSortType] = useState<SortType>("latest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // データ読み込み
  useEffect(() => {
    targetId && fetchCommentsByPolitician(targetId);
  }, [targetId, fetchCommentsByPolitician]);

  // ドロップダウン外クリック検出
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ソートされたコメントリスト
  const sortedComments = useMemo(() => {
    if (!comments.length) return [];

    switch (sortType) {
      case "latest":
        return [...comments].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "replies":
        return [...comments].sort((a, b) => b.repliesCount - a.repliesCount);
      case "support":
        return [...comments].sort((a, b) => {
          if (a.type === "support" && b.type !== "support") return -1;
          if (a.type !== "support" && b.type === "support") return 1;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      case "oppose":
        return [...comments].sort((a, b) => {
          if (a.type === "oppose" && b.type !== "oppose") return -1;
          if (a.type !== "oppose" && b.type === "oppose") return 1;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      default:
        return [...comments];
    }
  }, [comments, sortType]);

  // コメントサマリーのレンダリング
  const renderCommentSummary = () => {
    const supportCount = comments.filter((c) => c.type === "support").length;
    const opposeCount = comments.filter((c) => c.type === "oppose").length;

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold flex items-center text-lg">
            <MessageSquare size={16} className="mr-2 text-indigo-600" />
            {/* totalCommentCountがあればそれを使用、なければcommentsの長さを使用 */}
            {totalCommentCount !== undefined
              ? totalCommentCount
              : comments.length}
            件のコメント
          </h3>

          {/* ソートボタン */}
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
              <div className="absolute top-full right-0 mt-1 w-44 bg-white rounded-md shadow-lg z-20 py-1 border border-gray-200 overflow-hidden">
                {(["latest", "replies", "support", "oppose"] as SortType[]).map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSortType(type);
                        setShowSortDropdown(false);
                      }}
                      className={STYLES.button.sort(sortType === type)}
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

        {/* コメント件数表示 */}
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
      <style>{STYLES.css}</style>
      <InlineAdBanner format="rectangle" showCloseButton={true} />
      {renderCommentSummary()}
      <div className="space-y-2">
        {sortedComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            type={comment.type}
            isNew={newCommentId === comment.id}
          />
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

  // いいねハンドラー
  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!isLiked) {
      likeComment(
        isReply ? parentComment?.id || "" : comment.id,
        isReply ? comment.id : undefined
      );
    }
  };

  // ユーザーとリプライデータの正規化
  const user = normalizeUserData(comment, isReply);
  const replyTo = isReply
    ? getReplyReference(comment as unknown as Reply)
    : null;

  return (
    <div
      className={isReply ? "mt-2 animate-fadeIn" : ""}
      id={`comment-${comment.id}`}
      ref={commentRef}
    >
      <div
        className={
          isReply
            ? STYLES.container.reply
            : STYLES.container.comment(highlighted, type)
        }
      >
        {/* 一段目: 投稿者名と投稿時間 + アクションボタン */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <div className="flex items-center">
            <span className="font-medium">{user.name}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(comment.createdAt)}</span>
          </div>

          {/* アクションボタンを1段目に移動 */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLike}
              disabled={isLiked}
              className={STYLES.button.like(isLiked)}
            >
              <ThumbsUp size={isReply ? 10 : 12} className="mr-1" />
              <span>{comment.likes}</span>
            </button>

            <button className={STYLES.button.reply} onClick={openReplyForm}>
              返信
            </button>
          </div>
        </div>

        {/* コメント本文 - リプライ情報を内部に組み込む */}
        <div className="text-gray-700">
          {isReply && replyTo && (
            <span className="inline-flex items-center mr-1 text-xs text-gray-600">
              <CornerDownRight size={12} className="mr-0.5" />
              <span className="font-medium">@{replyTo.reply_to_username}</span>
              {/* →をスペースに変更 */}
              <span className="mx-1"> </span>
            </span>
          )}
          <span className={isReply ? "text-sm" : ""}>{comment.text}</span>
        </div>

        {/* 返信トグル - 非リプライかつ返信がある場合のみ */}
        {!isReply && comment.repliesCount > 0 && (
          <div className="mt-2 pt-1 border-t border-gray-200">
            <button className={STYLES.button.toggle} onClick={toggleReplies}>
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
      {/* 返信フォーム ///////////- 表示/非表示を条件で制御 */}
      {isReplyFormVisible && (
        <ReplyForm
          comment={isReply ? (parentComment as Comment) : comment}
          replyingTo={isReply ? (comment as unknown as Reply) : undefined}
          onClose={closeReplyForm}
        />
      )}
      {/* 返信一覧 - 展開時のみ表示 */}
      {!isReply && isRepliesExpanded && comment.replies?.length > 0 && (
        <div className={STYLES.container.replyList}>
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 入力欄に自動フォーカス
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

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

      // 改行をそのまま保存するため、テキストを加工せずに送信
      const newReply = {
        text: replyText, // 改行を含むテキストをそのまま保存
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
    <div className={STYLES.container.replyForm}>
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
        <div className="relative border border-gray-800 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-black focus-within:border-transparent transition-all duration-200">
          <div className="flex items-center bg-gray-50 focus-within:bg-white">
            <textarea
              ref={textareaRef}
              value={replyText}
              onChange={(e) => {
                setReplyText(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (replyText.trim()) {
                    handleSubmit(
                      e as unknown as React.FormEvent<HTMLFormElement>
                    );
                  }
                }
                // Shift+Enterは通常の改行動作を許可(デフォルト)
              }}
              placeholder="返信を入力..."
              className="flex-1 bg-transparent border-none p-2.5 text-sm outline-none resize-none h-[40px] overflow-hidden"
              disabled={isSubmitting}
              maxLength={300}
            />
            <button
              type="submit"
              disabled={isSubmitting || !replyText.trim()}
              className={`flex items-center justify-center bg-transparent text-black hover:text-gray-700 px-3 h-auto text-sm transition mr-1 ${
                isSubmitting || !replyText.trim()
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <Send size={16} />
            </button>
          </div>
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
/////
