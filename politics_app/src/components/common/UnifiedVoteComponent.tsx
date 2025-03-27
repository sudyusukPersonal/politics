// src/components/common/UnifiedVoteComponent.tsx
import React, { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useReplyData } from "../../context/ReplyDataContext";
import { addEntityVote, createUIComment } from "../../services/voteService";

interface UnifiedVoteComponentProps {
  entityId: string;
  entityType: "politician" | "policy" | "party"; // "party"を追加
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

  // ReplyDataContextから必要な関数を取得
  const { updateLocalComments } = useReplyData();

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

  // コメント送信処理
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
          entityType // entityTypeも追加で渡す
        );

        // ローカルUIのコメント一覧に新しいコメントを追加
        updateLocalComments(newComment, true);
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
