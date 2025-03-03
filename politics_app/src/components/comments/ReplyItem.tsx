import React from "react";
import { CornerDownRight, ThumbsUp } from "lucide-react";
import { Reply, Comment } from "../../types";
import { useData } from "../../context/DataContext";

interface ReplyItemProps {
  reply: Reply;
  parentComment: Comment;
  depth?: number;
}

const ReplyItem: React.FC<ReplyItemProps> = ({
  reply,
  parentComment,
  depth = 0,
}) => {
  const { handleReplyClick, replyingTo } = useData();
  const maxDepth = 2; // Maximum nesting depth
  const displayDepth = Math.min(depth, maxDepth);
  const marginLeft = displayDepth * 12; // Indentation per level

  return (
    <div
      className="mt-2 animate-fadeIn"
      style={{ marginLeft: `${marginLeft}px` }}
    >
      <div
        className={`rounded-lg p-3 border ${
          depth % 2 === 0
            ? "bg-gray-50 border-gray-200"
            : "bg-white border-gray-100"
        }`}
      >
        {/* Reply reference header */}
        {reply.replyTo && (
          <div className="flex items-center mb-2 text-xs text-gray-500">
            <CornerDownRight size={12} className="mr-1" />
            <span className="font-medium text-gray-600">@{reply.replyTo}</span>
            <span className="ml-1">への返信</span>
          </div>
        )}

        {/* Reply content */}
        <p className="text-gray-700 text-sm">{reply.text}</p>

        {/* Reply metadata and actions */}
        <div className="flex justify-between mt-2 items-center">
          <div className="flex items-center text-xs text-gray-500">
            <span className="font-medium">{reply.user}</span>
            <span className="mx-2">•</span>
            <span>{reply.date}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-xs text-gray-600 px-2 py-1 rounded-full bg-gray-100">
              <ThumbsUp size={10} className="mr-1" />
              <span>{reply.likes}</span>
            </div>
            {depth < maxDepth && (
              <button
                className="text-xs text-indigo-600 hover:text-indigo-800 transition"
                onClick={() => handleReplyClick(reply, parentComment)}
              >
                返信する
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recursively render nested replies, but limit depth */}
      {reply.replies && reply.replies.length > 0 && depth < maxDepth && (
        <div className="ml-2 pl-2 border-l-2 border-gray-200 mt-2">
          {reply.replies.map((nestedReply) => (
            <ReplyItem
              key={nestedReply.id}
              reply={nestedReply}
              parentComment={parentComment}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {/* Show reply form if this reply is selected for replying */}
      {replyingTo &&
        replyingTo.comment &&
        replyingTo.comment.id === reply.id &&
        replyingTo.parentComment &&
        replyingTo.parentComment.id === parentComment.id && (
          <div className="mt-2 ml-2 pl-2 border-l-2 border-gray-200">
            {/* The ReplyForm component will handle this nested reply */}
          </div>
        )}
    </div>
  );
};

export default ReplyItem;
