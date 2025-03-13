// src/context/ReplyDataContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { Comment, Reply } from "../types";
import {
  addReplyToComment,
  fetchCommentsByPoliticianId,
} from "../services/commentService";

// Context type definition
interface ReplyDataContextType {
  // State
  comments: Comment[];
  isLoadingComments: boolean;
  commentError: string | null;

  // Methods
  fetchCommentsByPolitician: (politicianId: string) => Promise<void>;
  addReply: (commentId: string, replyData: any) => Promise<Reply>;
  refreshComments: (politicianId: string) => Promise<void>;
  // New method to update local comments state
  updateLocalComments: (commentId: string, newReply: Reply) => void;
}

// Context creation
const ReplyDataContext = createContext<ReplyDataContextType | undefined>(
  undefined
);

// Provider component
export const ReplyDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Fetch comments for a specific politician
  const fetchCommentsByPolitician = useCallback(
    async (politicianId: string) => {
      try {
        setIsLoadingComments(true);
        setCommentError(null);

        const fetchedComments = await fetchCommentsByPoliticianId(politicianId);
        setComments(fetchedComments);

        console.log(`${fetchedComments.length}件のコメントを取得しました`);
      } catch (error) {
        console.error("コメントの取得中にエラーが発生しました:", error);
        setCommentError("コメントの取得に失敗しました");
      } finally {
        setIsLoadingComments(false);
      }
    },
    []
  );

  // Refresh comments for a politician
  const refreshComments = useCallback(
    async (politicianId: string) => {
      await fetchCommentsByPolitician(politicianId);
    },
    [fetchCommentsByPolitician]
  );

  // New method to update local comments state without fetching from database
  const updateLocalComments = useCallback(
    (commentId: string, newReply: Reply) => {
      setComments((prevComments) => {
        return prevComments.map((comment) => {
          if (comment.id === commentId) {
            // Create a new comment object with updated replies array and incremented repliesCount
            return {
              ...comment,
              replies: [...comment.replies, newReply],
              repliesCount: comment.repliesCount + 1,
            };
          }
          return comment;
        });
      });
    },
    []
  );

  // Add a reply to a comment
  const addReply = useCallback(
    async (commentId: string, replyData: any): Promise<Reply> => {
      try {
        // Call API to add reply to the database
        const createdReply = await addReplyToComment(commentId, replyData);

        // Return the created reply to be used in UI update
        return createdReply;
      } catch (error) {
        console.error("返信の追加中にエラーが発生しました:", error);
        return Promise.reject(error);
      }
    },
    []
  );

  return (
    <ReplyDataContext.Provider
      value={{
        comments,
        isLoadingComments,
        commentError,
        fetchCommentsByPolitician,
        addReply,
        refreshComments,
        updateLocalComments, // Export the new method
      }}
    >
      {children}
    </ReplyDataContext.Provider>
  );
};

// Custom hook to use the reply data context
export const useReplyData = () => {
  const context = useContext(ReplyDataContext);
  if (context === undefined) {
    throw new Error("useReplyData must be used within a ReplyDataProvider");
  }
  return context;
};
