// Updated CommentItem to work with Firebase comment structure
import React, { useState } from "react";
import { MessageCircle, ThumbsUp, ChevronUp, ChevronDown } from "lucide-react";
import { Comment, Reply } from "../../types";
import ReplyItem from "./ReplyItem";
import ReplyForm from "./ReplyForm";

interface CommentItemProps {
  comment: Comment;
  type: "support" | "oppose";
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, type }) => {
  const [isRepliesExpanded, setIsRepliesExpanded] = useState(false);
  const [isReplyFormVisible, setIsReplyFormVisible] = useState(false);

  const toggleReplies = () => {
    setIsRepliesExpanded(!isRepliesExpanded);
  };

  const openReplyForm = () => {
    setIsReplyFormVisible(true);
  };

  const closeReplyForm = () => {
    setIsReplyFormVisible(false);
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  // console.log(comment);
  return (
    <div className="mb-3">
      {/* Parent comment */}
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
            <span className="font-medium">{comment.userName}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(comment.createdAt)}</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center text-xs text-gray-600 bg-white px-2 py-1 rounded-full shadow-sm">
              <ThumbsUp size={12} className="mr-1" />
              <span>{comment.likes}</span>
            </div>

            <button
              className="text-xs text-indigo-600 hover:text-indigo-800 transition"
              onClick={openReplyForm}
            >
              返信
            </button>
          </div>
        </div>

        {comment.repliesCount > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-200">
            <button
              className="flex items-center text-xs text-gray-500 hover:text-gray-700"
              onClick={toggleReplies}
            >
              <MessageCircle size={14} className="mr-1" />
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

      {/* Reply form */}
      {isReplyFormVisible && (
        <ReplyForm comment={comment} onClose={closeReplyForm} />
      )}

      {/* Replies */}
      {isRepliesExpanded && comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 pl-2 ml-2 border-l-2 border-gray-200">
          {comment.replies.map((reply) => (
            <ReplyItem key={reply.id} reply={reply} parentComment={comment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
