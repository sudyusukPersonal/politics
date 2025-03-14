// src/components/comments/ReplyItem.tsx
import React, { useState } from "react";
import { CornerDownRight, ThumbsUp } from "lucide-react";
import { Reply, Comment } from "../../types";
import ReplyForm from "./ReplyForm";
import { useReplyData } from "../../context/ReplyDataContext";

interface ReplyItemProps {
  reply: Reply;
  parentComment: Comment;
}

const ReplyItem: React.FC<ReplyItemProps> = ({ reply, parentComment }) => {
  const [isReplyFormVisible, setIsReplyFormVisible] = useState(false);
  const { likeComment, hasUserLikedComment } = useReplyData();

  // この返信がいいね済みか確認
  const isLiked = hasUserLikedComment(parentComment.id, reply.id);

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

  const openReplyForm = () => {
    setIsReplyFormVisible(true);
  };

  const closeReplyForm = () => {
    setIsReplyFormVisible(false);
  };

  // 返信へのいいねハンドラー
  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // イベントの伝播を停止
    if (!isLiked) {
      likeComment(parentComment.id, reply.id);
    }
  };

  // Use normalized properties to handle both client and server naming conventions
  const userName = reply.userName || reply.user_name;
  const replyTo =
    reply.reply_to ||
    (reply.replyTo
      ? {
          reply_id: reply.replyTo.replyID,
          reply_to_user_id: reply.replyTo.replyToUserID,
          reply_to_username: reply.replyTo.replyToUserName,
        }
      : null);

  return (
    <div className="mt-2 animate-fadeIn">
      <div className="rounded-lg p-3 border bg-white border-gray-100">
        {/* Reply reference header */}
        {replyTo && (
          <div className="flex items-center mb-2 text-xs text-gray-500">
            <CornerDownRight size={12} className="mr-1" />
            <span className="font-medium text-gray-600">
              @{replyTo.reply_to_username}
            </span>
            <span className="ml-1">への返信</span>
          </div>
        )}

        {/* Reply content */}
        <p className="text-gray-700 text-sm">{reply.text}</p>

        {/* Reply metadata and actions */}
        <div className="flex justify-between mt-2 items-center">
          <div className="flex items-center text-xs text-gray-500">
            <span className="font-medium">{userName}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(reply.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLike}
              disabled={isLiked}
              className={`flex items-center text-xs ${
                isLiked
                  ? "bg-indigo-100 text-indigo-600 cursor-default"
                  : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
              } px-2 py-1 rounded-full transition`}
            >
              <ThumbsUp size={10} className="mr-1" />
              <span>{reply.likes}</span>
            </button>
            <button
              className="text-xs text-indigo-600 hover:text-indigo-800 transition"
              onClick={openReplyForm}
            >
              返信
            </button>
          </div>
        </div>
      </div>

      {/* Reply form */}
      {isReplyFormVisible && (
        <ReplyForm
          comment={parentComment}
          replyingTo={reply}
          onClose={closeReplyForm}
        />
      )}
    </div>
  );
};

export default ReplyItem;
