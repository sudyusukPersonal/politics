// ReplyForm component for adding new replies to comments
import React, { useState } from "react";
import { Send, CornerDownRight } from "lucide-react";
import { Comment, Reply } from "../../types";
import { addReplyToComment } from "../../services/commentService";

// 仮のユーザー情報（後で本格的な認証に置き換える）
const MOCK_CURRENT_USER = {
  uid: "user_123",
  displayName: "匿名ユーザー",
  email: "anonymous@example.com",
};

interface ReplyFormProps {
  comment: Comment; // The parent comment to which the reply is being added
  replyingTo?: Reply; // Optional: the specific reply being responded to
  onClose: () => void; // Callback to close the reply form
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  comment,
  replyingTo,
  onClose,
}) => {
  // State to manage the text input for the reply
  const [replyText, setReplyText] = useState("");

  // State to handle submission in progress
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State to manage any submission errors
  const [error, setError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate reply text
    if (!replyText.trim()) {
      setError("返信内容を入力してください");
      return;
    }

    try {
      // Prevent multiple submissions
      setIsSubmitting(true);
      setError(null);

      // Prepare the new reply object
      const newReply: Omit<Reply, "id" | "createdAt"> = {
        text: replyText,
        userID: MOCK_CURRENT_USER.uid,
        userName: MOCK_CURRENT_USER.displayName || "匿名ユーザー",
        likes: 0,
        replyTo: replyingTo
          ? {
              replyID: replyingTo.id,
              replyToUserID: replyingTo.userID,
              replyToUserName: replyingTo.userName,
            }
          : undefined,
      };

      // Add reply to the comment in Firestore
      await addReplyToComment(comment.id, newReply);

      // Reset form and close
      setReplyText("");
      onClose();
    } catch (err) {
      // Handle any errors during submission
      console.error("返信の送信中にエラーが発生しました:", err);
      setError("返信の送信に失敗しました。もう一度お試しください。");
    } finally {
      // Always reset submission state
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 animate-slideUp">
      <form onSubmit={handleSubmit}>
        {/* Display who we're replying to */}
        {replyingTo && (
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <CornerDownRight size={12} className="mr-1" />
            <span className="font-medium text-gray-600">
              @{replyingTo.userName}
            </span>
            <span className="ml-1">に返信</span>
          </div>
        )}

        {/* Error message display */}
        {error && (
          <div className="text-red-500 text-xs mb-2 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {/* Reply input area */}
        <div className="flex items-center">
          <input
            type="text"
            value={replyText}
            onChange={(e) => {
              setReplyText(e.target.value);
              // Clear any previous errors when user starts typing
              if (error) setError(null);
            }}
            placeholder="返信を入力..."
            className={`flex-1 border ${
              error
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-indigo-500"
            } rounded-l-lg p-2 text-sm focus:outline-none focus:ring-2`}
            required
            disabled={isSubmitting}
            maxLength={300} // Optional: limit reply length
          />

          {/* Submit button */}
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

        {/* Character count and cancel button */}
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

export default ReplyForm;
