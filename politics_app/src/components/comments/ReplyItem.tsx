// components/comments/ReplyItem.tsx (MODIFIED)
import React from "react";
import { CornerDownRight, ThumbsUp } from "lucide-react";
import { Comment } from "../../types";
import { useData } from "../../context/DataContext";
import ReplyForm from "./ReplyForm";

interface ReplyItemProps {
  reply: Comment;
  parentComment: Comment;
}

const ReplyItem: React.FC<ReplyItemProps> = ({ reply, parentComment }) => {
  const { handleReplyClick, replyingTo } = useData();

  return (
    <div className="mt-2 animate-fadeIn">
      <div className="rounded-lg p-3 border bg-white border-gray-100">
        {/* Reply reference header */}
        {reply.replyToUser && (
          <div className="flex items-center mb-2 text-xs text-gray-500">
            <CornerDownRight size={12} className="mr-1" />
            <span className="font-medium text-gray-600">
              @{reply.replyToUser}
            </span>
            <span className="ml-1">replied to</span>
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
            <button
              className="text-xs text-indigo-600 hover:text-indigo-800 transition"
              onClick={() => handleReplyClick(reply, parentComment)}
            >
              Reply
            </button>
          </div>
        </div>
      </div>

      {/* Show reply form if this reply is selected for replying */}
      {replyingTo &&
        replyingTo.comment &&
        replyingTo.comment.id === reply.id &&
        replyingTo.parentComment &&
        replyingTo.parentComment.id === parentComment.id && (
          <ReplyForm commentUser={reply.user} parentComment={parentComment} />
        )}
    </div>
  );
};

export default ReplyItem;
