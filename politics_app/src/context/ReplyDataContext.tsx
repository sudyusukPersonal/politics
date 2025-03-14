// src/context/ReplyDataContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useRef,
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
  newCommentId: string | null;

  // Methods
  fetchCommentsByPolitician: (politicianId: string) => Promise<void>;
  addReply: (commentId: string, replyData: any) => Promise<Reply>;
  refreshComments: (politicianId: string) => Promise<void>;
  // Method to update local comments state
  updateLocalComments: (newComment: Comment, isNew?: boolean) => void;
  updateLocalReplies: (commentId: string, newReply: Reply) => void;
  // Method to scroll to comment
  scrollToComment: (commentId: string) => void;
  // Method to clear new comment ID
  clearNewCommentId: () => void;
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
  const [newCommentId, setNewCommentId] = useState<string | null>(null);

  // Ref to track timeout for auto-scrolling
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Refresh comments for a politician - only use when absolutely necessary
  const refreshComments = useCallback(
    async (politicianId: string) => {
      await fetchCommentsByPolitician(politicianId);
    },
    [fetchCommentsByPolitician]
  );

  // Method to scroll to a specific comment
  const scrollToComment = useCallback((commentId: string) => {
    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set a small timeout to ensure the comment has been rendered
    scrollTimeoutRef.current = setTimeout(() => {
      const commentElement = document.getElementById(`comment-${commentId}`);
      if (commentElement) {
        commentElement.scrollIntoView({ behavior: "smooth", block: "center" });

        // Briefly highlight the element for visibility
        commentElement.classList.add("comment-highlight");
        setTimeout(() => {
          commentElement.classList.remove("comment-highlight");
        }, 2000);
      }
    }, 100);
  }, []);

  // Clear new comment ID
  const clearNewCommentId = useCallback(() => {
    setNewCommentId(null);
  }, []);

  // Method to add a new comment to local state without fetch
  // isNew flag indicates if this is a newly created comment
  const updateLocalComments = useCallback(
    (newComment: Comment, isNew: boolean = false) => {
      setComments((prevComments) => {
        // Sort comments, placing the newest at the top if it's a new comment
        const updatedComments = isNew
          ? [newComment, ...prevComments]
          : [...prevComments, newComment];

        // Sort by type if needed
        return updatedComments;
      });

      // Set the new comment ID to trigger scrolling
      if (isNew) {
        setNewCommentId(newComment.id);
        // Auto-scroll to the new comment after a short delay
        setTimeout(() => {
          scrollToComment(newComment.id);
        }, 200);
      }
    },
    [scrollToComment]
  );

  // Method to update local comments state with a new reply without fetching from database
  const updateLocalReplies = useCallback(
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
        newCommentId,
        fetchCommentsByPolitician,
        addReply,
        refreshComments,
        updateLocalComments,
        updateLocalReplies,
        scrollToComment,
        clearNewCommentId,
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
