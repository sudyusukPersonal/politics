// src/components/common/UnifiedVoteComponent.tsx
import React, { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { useReplyData } from "../../context/ReplyDataContext";
import { addEntityVote, createUIComment } from "../../services/voteService";
import {
  saveVoteToLocalStorage,
  getVoteFromLocalStorage,
} from "../../utils/voteStorage";
import { addNewComment } from "../../services/commentService";

interface UnifiedVoteComponentProps {
  entityId: string;
  entityType: "politician" | "policy" | "party";
  onVoteComplete?: () => void;
}

const UnifiedVoteComponent: React.FC<UnifiedVoteComponentProps> = ({
  entityId,
  entityType,
  onVoteComplete,
}) => {
  // 状態管理
  const [voteType, setVoteType] = useState<"support" | "oppose" | null>(null);
  const [showReasonForm, setShowReasonForm] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // 追加: 既存の投票状態を保持する状態変数
  const [previousVote, setPreviousVote] = useState<"support" | "oppose" | null>(
    null
  );
  // 追加: 追加コメント入力用の状態変数
  const [additionalComment, setAdditionalComment] = useState("");

  // ReplyDataContextから必要な関数を取得
  const { updateLocalComments } = useReplyData();

  // コンポーネントマウント時に既存の投票状態を確認
  useEffect(() => {
    if (entityId) {
      const savedVote = getVoteFromLocalStorage(entityId);
      setPreviousVote(savedVote);
    }
  }, [entityId]);

  // 投票ボタンのハンドラ
  const handleVoteClick = (type: "support" | "oppose") => {
    setVoteType(type);
    setShowReasonForm(true);
  };

  // フォームリセット処理
  const resetForm = () => {
    setReason("");
    setVoteType(null);
    setShowReasonForm(false);
    setSubmitError(null);

    // 親コンポーネントのコールバックを呼び出す
    if (onVoteComplete) {
      onVoteComplete();
    }
  };

  // 追加コメント送信処理 - addNewComment を使用
  const handleAdditionalCommentSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!additionalComment.trim()) {
      setSubmitError("コメントを入力してください");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // addNewComment から commentId を取得
      const commentId = await addNewComment({
        text: additionalComment.trim(),
        userID: "user_anonymous", // 匿名ユーザーID
        userName: "匿名ユーザー", // 匿名ユーザー名
        politicianID: entityId, // 対象エンティティのID
        entityType: entityType, // "politician", "policy", "party"
        type: previousVote || "support", // 既存の投票タイプ
        likes: 0, // 初期いいね数
      });

      // ローカルUIのコメント一覧に新しいコメントを追加
      if (commentId) {
        const newComment = createUIComment(
          commentId,
          entityId,
          additionalComment.trim(),
          previousVote || "support",
          entityType
        );

        // UIを更新
        updateLocalComments(newComment, true);
      }

      // フォームをリセット
      setAdditionalComment("");
    } catch (error) {
      console.error("追加コメントの送信中にエラーが発生しました:", error);
      setSubmitError("コメントの送信に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // コメント送信処理 (既存の関数を変更せず維持)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 入力チェック
    if (!reason.trim()) {
      setSubmitError("理由を入力してください");
      return;
    }

    if (!entityId) {
      setSubmitError(
        `${
          entityType === "politician"
            ? "政治家"
            : entityType === "policy"
            ? "政策"
            : "政党"
        }IDが取得できませんでした`
      );
      return;
    }

    if (!voteType) {
      setSubmitError("投票タイプが指定されていません");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // 統合サービス関数を使用して投票を処理
      const result = await addEntityVote(
        entityId,
        entityType,
        voteType,
        reason
      );

      // 成功したら新しいコメントをUIに追加（即時反映）
      if (result.success) {
        const newComment = createUIComment(
          result.commentId,
          entityId,
          reason,
          voteType,
          entityType
        );

        // ローカルUIのコメント一覧に新しいコメントを追加
        updateLocalComments(newComment, true);
        saveVoteToLocalStorage(entityId, voteType);

        // 既存の投票状態を更新
        setPreviousVote(voteType);
      }

      // フォームをリセット
      resetForm();
    } catch (error) {
      console.error("評価の送信中にエラーが発生しました:", error);
      setSubmitError("評価の送信に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // エンティティタイプの表示名を取得する関数
  const getEntityTypeName = () => {
    switch (entityType) {
      case "politician":
        return "政治家";
      case "policy":
        return "政策";
      case "party":
        return "政党";
      default:
        return "対象";
    }
  };

  // 既に投票済みの場合は追加コメントフォームを表示
  if (previousVote) {
    return (
      <div className="mt-6 animate-fadeIn">
        <div
          className={`rounded-xl p-4 mb-3 ${
            previousVote === "support"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <h3 className="font-medium mb-3 flex items-center">
            {previousVote === "support" ? (
              <>
                <ThumbsUp size={16} className="text-green-500 mr-2" />
                <span className="text-green-700">
                  あなたはこの{getEntityTypeName()}を支持しました
                </span>
              </>
            ) : (
              <>
                <ThumbsDown size={16} className="text-red-500 mr-2" />
                <span className="text-red-700">
                  あなたはこの{getEntityTypeName()}を支持しませんでした
                </span>
              </>
            )}
          </h3>

          <form onSubmit={handleAdditionalCommentSubmit}>
            {/* エラーメッセージ表示 */}
            {submitError && (
              <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded-lg">
                {submitError}
              </div>
            )}

            <textarea
              value={additionalComment}
              onChange={(e) => {
                setAdditionalComment(e.target.value);
                if (submitError) setSubmitError(null);
              }}
              className={`w-full border ${
                submitError ? "border-red-300" : "border-gray-300"
              } rounded-lg p-3 text-sm focus:ring-2 focus:outline-none transition-shadow ${
                previousVote === "support"
                  ? "focus:ring-green-300"
                  : "focus:ring-red-300"
              }`}
              rows={3}
              placeholder="追加のコメントを送信しましょう"
              required
              maxLength={500}
            ></textarea>

            <div className="flex justify-between items-start mt-1 mb-3">
              <div className="text-left text-xs text-gray-500 ml-2">
                {additionalComment.length}/500文字
              </div>
              <button
                type="submit"
                className={`py-2 px-4 rounded-lg text-white font-medium transition transform active:scale-95 flex items-center justify-center ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                } ${
                  previousVote === "support"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    送信中...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    コメントを送信
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 投票ボタン表示（showReasonFormがfalseの場合）
  if (!showReasonForm) {
    return (
      <div className="mt-6">
        <h3 className="text-center text-sm font-medium text-gray-500 mb-3">
          この
          {entityType === "politician"
            ? "政治家"
            : entityType === "policy"
            ? "政策"
            : "政党"}
          を評価する
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleVoteClick("support")}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl flex items-center justify-center font-medium transition transform hover:translate-y-0.5 active:scale-95 shadow-md"
            disabled={!entityId}
          >
            <ThumbsUp size={18} className="mr-2" />
            支持する
          </button>
          <button
            onClick={() => handleVoteClick("oppose")}
            className="bg-gradient-to-r from-red-500 to-rose-600 text-white py-3 rounded-xl flex items-center justify-center font-medium transition transform hover:translate-y-0.5 active:scale-95 shadow-md"
            disabled={!entityId}
          >
            <ThumbsDown size={18} className="mr-2" />
            支持しない
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">
          ※評価には理由の入力が必要です
        </p>
      </div>
    );
  }

  // 理由入力フォーム表示（showReasonFormがtrueの場合）
  return (
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
              <ThumbsUp size={16} className="text-green-500 mr-2" />
              <span className="text-green-700">支持する理由</span>
            </>
          ) : (
            <>
              <ThumbsDown size={16} className="text-red-500 mr-2" />
              <span className="text-red-700">支持しない理由</span>
            </>
          )}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          具体的な理由を記入してください（必須）
        </p>

        <form onSubmit={handleSubmit}>
          {/* エラーメッセージ表示 */}
          {submitError && (
            <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded-lg">
              {submitError}
            </div>
          )}

          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (submitError) setSubmitError(null);
            }}
            className={`w-full border ${
              submitError ? "border-red-300" : "border-gray-300"
            } rounded-lg p-3 text-sm focus:ring-2 focus:outline-none transition-shadow ${
              voteType === "support"
                ? "focus:ring-green-300"
                : "focus:ring-red-300"
            }`}
            rows={4}
            placeholder="あなたの意見を書いてください..."
            required
            disabled={isSubmitting}
            maxLength={500}
          ></textarea>

          <div className="text-right text-xs text-gray-500 mt-1 mb-3">
            {reason.length}/500文字
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-3">
            <button
              type="submit"
              className={`py-2.5 rounded-lg text-white font-medium transition transform active:scale-95 flex items-center justify-center ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              } ${
                voteType === "support"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  送信中...
                </>
              ) : (
                "評価を送信"
              )}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnifiedVoteComponent;
