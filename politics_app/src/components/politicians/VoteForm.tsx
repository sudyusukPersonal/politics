// src/components/politicians/VoteForm.tsx
import React, { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useData } from "../../context/DataContext";
import { useReplyData } from "../../context/ReplyDataContext";
import { useParams } from "react-router-dom";
import { Comment } from "../../types";

interface VoteFormProps {
  voteType: "support" | "oppose" | null;
}

// 匿名ユーザー情報（実際のアプリでは認証システムと連携）
const MOCK_CURRENT_USER = {
  uid: "user_anonymous",
  displayName: "匿名ユーザー",
};

const VoteForm: React.FC<VoteFormProps> = ({ voteType }) => {
  const { id: politicianId } = useParams<{ id: string }>();
  const { reason, setReason, setShowReasonForm, setVoteType, resetVoteData } =
    useData();
  const { updateLocalComments } = useReplyData();

  // 送信状態管理
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // コメント送信処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 入力チェック
    if (!reason.trim()) {
      setSubmitError("理由を入力してください");
      return;
    }

    if (!politicianId) {
      setSubmitError("政治家IDが取得できませんでした");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Firebaseサービスを使ってコメントを追加
      const { addNewComment } = await import("../../services/commentService");

      // 新しいコメントを作成して保存
      const newCommentId = await addNewComment({
        text: reason,
        userID: MOCK_CURRENT_USER.uid,
        userName: MOCK_CURRENT_USER.displayName,
        politicianID: politicianId,
        type: voteType || "support", // voteTypeがnullの場合はデフォルトで"support"
        likes: 0,
      });

      // UIを即時更新するための新しいコメントオブジェクトを作成
      const newComment: Comment = {
        id: newCommentId,
        text: reason,
        userID: MOCK_CURRENT_USER.uid,
        userName: MOCK_CURRENT_USER.displayName,
        politicianID: politicianId,
        createdAt: new Date(),
        likes: 0,
        replies: [],
        repliesCount: 0,
        type: voteType || "support",
      };

      // ローカルUIのコメント一覧に新しいコメントを追加
      updateLocalComments(newComment, true);

      // スクロール処理はReplyDataContextに任せる

      // フォームをリセット
      resetVoteData();
    } catch (error) {
      console.error("評価の送信中にエラーが発生しました:", error);
      setSubmitError("評価の送信に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              onClick={resetVoteData}
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

export default VoteForm;
