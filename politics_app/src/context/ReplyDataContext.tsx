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
  addReply: (commentId: string, replyData: any) => Promise<void>;
  refreshComments: (politicianId: string) => Promise<void>;
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

  // Add a reply to a comment
  const addReply = useCallback(
    async (commentId: string, replyData: any) => {
      try {
        await addReplyToComment(commentId, replyData);

        // Find the comment that was updated
        const currentPoliticianId = comments.find(
          (c) => c.id === commentId
        )?.politicianID;

        // Refresh comments if possible
        if (currentPoliticianId) {
          await refreshComments(currentPoliticianId);
        }

        return Promise.resolve();
      } catch (error) {
        console.error("返信の追加中にエラーが発生しました:", error);
        return Promise.reject(error);
      }
    },
    [comments, refreshComments]
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
