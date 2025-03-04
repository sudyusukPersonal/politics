// components/comments/ReplyForm.tsx (MODIFIED)
import React from "react";
import { Send, CornerDownRight } from "lucide-react";
import { Comment } from "../../types";
import { useData } from "../../context/DataContext";

interface ReplyFormProps {
  commentUser: string;
  parentComment: Comment;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  commentUser,
  parentComment,
}) => {
  const { replyText, setReplyText, handleSubmitReply, handleCancelReply } =
    useData();

  return (
    <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 animate-slideUp">
      <form onSubmit={handleSubmitReply}>
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <CornerDownRight size={12} className="mr-1" />
          <span className="font-medium text-gray-600">@{commentUser}</span>
          <span className="ml-1">Reply to</span>
        </div>

        <div className="flex items-center">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply..."
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
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReplyForm;
