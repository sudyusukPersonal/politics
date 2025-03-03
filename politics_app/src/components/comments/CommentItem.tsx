import React from "react";
import { MessageCircle, ThumbsUp, ChevronUp, ChevronDown } from "lucide-react";
import { Comment } from "../../types";
import { useData } from "../../context/DataContext";
import ReplyItem from "./ReplyItem";
import ReplyForm from "./ReplyForm";

interface CommentItemProps {
  comment: Comment;
  type: "support" | "oppose";
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, type }) => {
  const {
    countAllReplies,
    expandedComments,
    toggleCommentReplies,
    replyingTo,
    handleReplyClick,
  } = useData();

  // Calculate total replies including nested ones
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

      {/* Reply thread */}
      {isExpanded && comment.replies.length > 0 && (
        <div className="mt-2 pl-2 ml-2 border-l-2 border-gray-200">
          {comment.replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              parentComment={comment}
              depth={1}
            />
          ))}
        </div>
      )}

      {/* Reply form for this comment */}
      {replyingTo &&
        replyingTo.comment.id === comment.id &&
        !replyingTo.parentComment && (
          <ReplyForm commentUser={comment.user} parentComment={comment} />
        )}
    </div>
  );
};

export default CommentItem;
