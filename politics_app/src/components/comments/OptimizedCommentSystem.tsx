// src/components/comments/OptimizedCommentSystem.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  CornerDownRight,
  Send,
  ChevronUp,
  ChevronDown,
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

// ===== メインのコメントセクションコンポーネント =====
export const CommentSection: React.FC<{
  entityId?: string;
  entityType?: "politician" | "policy";
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

  // コメントタイプによる分類（最適化: useMemoで一度だけ計算）
  const { supportComments, opposeComments } = React.useMemo(
    () => ({
      supportComments: comments.filter((c) => c.type === "support"),
      opposeComments: comments.filter((c) => c.type === "oppose"),
    }),
    [comments]
  );

  // データ読み込み（最適化: useEffectの依存配列を最小限に）
  useEffect(() => {
    targetId && fetchCommentsByPolitician(targetId);
  }, [targetId, fetchCommentsByPolitician]);

  // レンダリング関数の最適化（共通化）
  const renderCommentsList = useCallback(
    (comments: Comment[], type: "support" | "oppose") => {
      const isSupport = type === "support";
      return (
        <div className={!isSupport ? "" : "mb-6"}>
          <div className="flex items-center justify-between mb-3">
            <h4
              className={`font-medium ${
                isSupport ? "text-green-600" : "text-red-600"
              } flex items-center`}
            >
              {isSupport ? (
                <ThumbsUp size={16} className="mr-1" />
              ) : (
                <ThumbsDown size={16} className="mr-1" />
              )}
              {isSupport ? "支持の理由" : "不支持の理由"}
            </h4>
            <span
              className={`text-xs py-1 px-2 ${
                isSupport
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              } rounded-full`}
            >
              {comments.length} コメント
            </span>
          </div>

          <div className="space-y-3">
            {comments.map((comment, index) => (
              <React.Fragment key={comment.id}>
                <CommentItem
                  comment={comment}
                  type={type}
                  isNew={newCommentId === comment.id}
                />
                {/* 3番目のコメントの後に広告を表示（条件付きレンダリングの最適化） */}
                {index === 2 && comments.length > 3 && (
                  <div className="my-4 flex justify-center">
                    <InlineAdBanner format="rectangle" showCloseButton={true} />
                  </div>
                )}
              </React.Fragment>
            ))}

            {/* コメントがない場合の最適化された表示 */}
            {comments.length === 0 && (
              <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                まだ{isSupport ? "支持する" : "不支持の"}コメントはありません。
                <button
                  onClick={() => handleVoteClick(type)}
                  className={`mt-2 ml-2 px-3 py-1 ${
                    isSupport
                      ? "bg-green-100 hover:bg-green-200 text-green-700"
                      : "bg-red-100 hover:bg-red-200 text-red-700"
                  } text-sm rounded-full transition`}
                >
                  {isSupport ? (
                    <ThumbsUp size={14} className="inline mr-1" />
                  ) : (
                    <ThumbsDown size={14} className="inline mr-1" />
                  )}
                  {isSupport ? "支持する理由" : "不支持の理由"}を投稿
                </button>
              </div>
            )}
          </div>
        </div>
      );
    },
    [newCommentId, handleVoteClick]
  );

  // 共通の追加コメントボタン
  const renderAddCommentButton = useCallback(
    () => (
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 my-6 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
        <span className="text-sm text-gray-700">
          <MessageSquare size={16} className="inline mr-1" />
          あなたも{entityType === "politician" ? "この政治家" : "この政策"}
          に対する評価を投稿できます
        </span>
        <div className="flex space-x-2">
          {["support", "oppose"].map((type) => (
            <button
              key={type}
              onClick={() => handleVoteClick(type as "support" | "oppose")}
              className={`px-4 py-1.5 ${
                type === "support"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              } text-white text-sm rounded-full flex items-center transition`}
            >
              {type === "support" ? (
                <ThumbsUp size={14} className="mr-1" />
              ) : (
                <ThumbsDown size={14} className="mr-1" />
              )}
              支持{type === "oppose" ? "しない" : "する"}
            </button>
          ))}
        </div>
      </div>
    ),
    [entityType, handleVoteClick]
  );

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
      {renderAddCommentButton()}
      {renderCommentsList(supportComments, "support")}
      {renderCommentsList(opposeComments, "oppose")}
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
const CommentItem: React.FC<CommentItemProps> = ({
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
      className={isReply ? "mt-2 animate-fadeIn" : "mb-3"}
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
