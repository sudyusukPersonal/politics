// // src/components/comments/CommentItem.tsx
// import React, { useState, useEffect, useRef } from "react";
// import { MessageCircle, ThumbsUp, ChevronUp, ChevronDown } from "lucide-react";
// import { Comment, Reply } from "../../types";
// import ReplyItem from "./ReplyItem";
// import ReplyForm from "./ReplyForm";
// import { useReplyData } from "../../context/ReplyDataContext";

// interface CommentItemProps {
//   comment: Comment;
//   type: "support" | "oppose";
//   isNew?: boolean; // 新しく追加されたコメントかどうか
// }

// const CommentItem: React.FC<CommentItemProps> = ({
//   comment,
//   type,
//   isNew = false,
// }) => {
//   const [isRepliesExpanded, setIsRepliesExpanded] = useState(false);
//   const [isReplyFormVisible, setIsReplyFormVisible] = useState(false);
//   const [highlighted, setHighlighted] = useState(isNew); // 新しいコメントをハイライト
//   const {
//     comments,
//     newCommentId,
//     clearNewCommentId,
//     likeComment,
//     hasUserLikedComment,
//   } = useReplyData();
//   const commentRef = useRef<HTMLDivElement>(null);

//   // コメントがいいね済みか確認
//   const isLiked = hasUserLikedComment(comment.id);

//   // 新しいコメントの場合、ハイライト表示を一定時間後に解除
//   useEffect(() => {
//     // APIからのnewCommentIdと現在のコメントIDが一致する場合もハイライト
//     if (isNew || (newCommentId && newCommentId === comment.id)) {
//       setHighlighted(true);
//       const timer = setTimeout(() => {
//         setHighlighted(false);
//         // ハイライトが消えたら新規コメントIDもクリア
//         if (newCommentId) {
//           clearNewCommentId();
//         }
//       }, 3000); // 3秒後にハイライトを解除

//       return () => clearTimeout(timer);
//     }
//   }, [isNew, newCommentId, comment.id, clearNewCommentId]);

//   // Use effect to expand replies section when new replies are added
//   useEffect(() => {
//     // Find this comment in the latest comments array to check if replies were added
//     const latestComment = comments.find((c) => c.id === comment.id);
//     if (latestComment && latestComment.repliesCount > 0 && isReplyFormVisible) {
//       // If we just added a reply (form is visible) and there are replies, expand them
//       setIsRepliesExpanded(true);
//     }
//   }, [comments, comment.id, isReplyFormVisible]);

//   const toggleReplies = () => {
//     setIsRepliesExpanded(!isRepliesExpanded);
//   };

//   const openReplyForm = () => {
//     setIsReplyFormVisible(true);
//   };

//   const closeReplyForm = () => {
//     setIsReplyFormVisible(false);
//   };

//   const formatDate = (dateString: string | Date) => {
//     const date = new Date(dateString);
//     return date.toLocaleString("ja-JP", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   // いいねボタンのハンドラー
//   const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.stopPropagation(); // イベントの伝播を停止
//     if (!isLiked) {
//       likeComment(comment.id);
//     }
//   };

//   return (
//     <div className="mb-3" id={`comment-${comment.id}`} ref={commentRef}>
//       {/* Parent comment */}
//       <div
//         className={`rounded-xl p-4 border transition duration-500 ${
//           highlighted
//             ? type === "support"
//               ? "bg-green-100 border-green-300 shadow-md animate-pulse"
//               : "bg-red-100 border-red-300 shadow-md animate-pulse"
//             : type === "support"
//             ? "bg-green-50 border-green-100 hover:shadow-md"
//             : "bg-red-50 border-red-100 hover:shadow-md"
//         }`}
//       >
//         <p className="text-gray-700">{comment.text}</p>

//         <div className="flex justify-between mt-3 items-center">
//           <div className="flex items-center text-xs text-gray-500">
//             <span className="font-medium">{comment.userName}</span>
//             <span className="mx-2">•</span>
//             <span>{formatDate(comment.createdAt)}</span>
//           </div>

//           <div className="flex items-center space-x-3">
//             <button
//               onClick={handleLike}
//               disabled={isLiked}
//               className={`flex items-center text-xs ${
//                 isLiked
//                   ? "bg-indigo-100 text-indigo-600 cursor-default"
//                   : "bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
//               } px-2 py-1 rounded-full shadow-sm transition`}
//             >
//               <ThumbsUp size={12} className="mr-1" />
//               <span>{comment.likes}</span>
//             </button>

//             <button
//               className="text-xs text-indigo-600 hover:text-indigo-800 transition"
//               onClick={openReplyForm}
//             >
//               返信
//             </button>
//           </div>
//         </div>

//         {comment.repliesCount > 0 && (
//           <div className="mt-3 pt-2 border-t border-gray-200">
//             <button
//               className="flex items-center text-xs text-gray-500 hover:text-gray-700"
//               onClick={toggleReplies}
//             >
//               <MessageCircle size={14} className="mr-1" />
//               <span>{comment.repliesCount} 返信</span>
//               {isRepliesExpanded ? (
//                 <ChevronUp size={14} className="ml-1" />
//               ) : (
//                 <ChevronDown size={14} className="ml-1" />
//               )}
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Reply form */}
//       {isReplyFormVisible && (
//         <ReplyForm comment={comment} onClose={closeReplyForm} />
//       )}

//       {/* Replies */}
//       {isRepliesExpanded && comment.replies && comment.replies.length > 0 && (
//         <div className="mt-2 pl-2 ml-2 border-l-2 border-gray-200">
//           {comment.replies.map((reply) => (
//             <ReplyItem key={reply.id} reply={reply} parentComment={comment} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CommentItem;
