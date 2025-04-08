// src/context/ReplyDataContext.tsx・・
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Comment, Reply } from "../types";
import {
  addReplyToComment,
  fetchCommentsByPoliticianId,
  likeComment as likeCommentApi,
} from "../services/commentService";

// Context type definition
interface ReplyDataContextType {
  // State
  comments: Comment[];
  isLoadingComments: boolean;
  commentError: string | null;
  newCommentId: string | null;
  hasMoreComments: boolean;
  isLoadingMoreComments: boolean;

  // Methods
  fetchCommentsByPolitician: (
    politicianId: string,
    startAfterId?: string | null,
    limitSize?: number,
    sortType?: "latest" | "replies" | "support" | "oppose"
  ) => Promise<void>;
  addReply: (commentId: string, replyData: any) => Promise<Reply>;
  refreshComments: (politicianId: string) => Promise<void>;
  // Method to update local comments state
  updateLocalComments: (newComment: Comment, isNew?: boolean) => void;
  updateLocalReplies: (commentId: string, newReply: Reply) => void;
  // Method to scroll to comment
  scrollToComment: (commentId: string) => void;
  // Method to clear new comment ID
  clearNewCommentId: () => void;
  // いいね関連のメソッド
  likeComment: (commentId: string, replyId?: string) => Promise<void>;
  hasUserLikedComment: (commentId: string, replyId?: string) => boolean;
  // 無限スクロール用のメソッド
  loadMoreComments: (
    sortType?: "latest" | "replies" | "support" | "oppose"
  ) => Promise<void>;
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
  // いいねしたコメントを追跡する状態
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  // 無限スクロール用の状態
  const [lastCommentId, setLastCommentId] = useState<string | null>(null);
  const [hasMoreComments, setHasMoreComments] = useState<boolean>(true);
  const [isLoadingMoreComments, setIsLoadingMoreComments] =
    useState<boolean>(false);
  const [isFetchingFirstBatch, setIsFetchingFirstBatch] =
    useState<boolean>(false);
  // 現在のpoliticianIdを保持する参照
  const currentPoliticianIdRef = useRef<string | null>(null);

  // Ref to track timeout for auto-scrolling
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 初期化時にlocal storageからいいね済みコメントを読み込む
  useEffect(() => {
    try {
      const savedLikes = localStorage.getItem("likedComments");
      if (savedLikes) {
        setLikedComments(new Set(JSON.parse(savedLikes)));
      }
    } catch (error) {
      console.error("いいね済みコメントの読み込みエラー:", error);
    }
  }, []);

  // いいね済みコメントの更新時にlocal storageに保存
  useEffect(() => {
    if (likedComments.size > 0) {
      localStorage.setItem("likedComments", JSON.stringify([...likedComments]));
    }
  }, [likedComments]);

  // Fetch comments for a specific politician
  const fetchCommentsByPolitician = useCallback(
    async (
      politicianId: string,
      startAfterId: string | null = null,
      limitSize: number = 5,
      sortType: "latest" | "replies" | "support" | "oppose" = "latest"
    ) => {
      try {
        // 初回取得の場合はローディング状態を設定
        if (!startAfterId) {
          setIsLoadingComments(true);
          setCommentError(null);
          setIsFetchingFirstBatch(true);

          // 初回読み込みのためにリセット
          setLastCommentId(null);
          setHasMoreComments(true);

          // 現在のpoliticianIdを保存
          currentPoliticianIdRef.current = politicianId;
        }

        const { fetchedComments, lastDocId, hasMore } =
          await fetchCommentsByPoliticianId(
            politicianId,
            startAfterId,
            limitSize,
            sortType
          );

        if (!startAfterId) {
          // 初回読み込みの場合は置き換え
          setComments(fetchedComments);
        } else {
          // 追加読み込みの場合は追加
          setComments((prev) => [...prev, ...fetchedComments]);
        }

        setLastCommentId(lastDocId);
        setHasMoreComments(hasMore);
      } catch (error) {
        console.error("コメントの取得中にエラーが発生しました:", error);
        setCommentError("コメントの取得に失敗しました");
      } finally {
        if (!startAfterId) {
          setIsLoadingComments(false);
          setIsFetchingFirstBatch(false);
        }
      }
    },
    []
  );

  // 追加する関数: 次のコメントバッチを読み込む（ソートタイプを考慮）
  const loadMoreComments = useCallback(
    async (
      sortType: "latest" | "replies" | "support" | "oppose" = "latest"
    ) => {
      // 現在のpoliticianIdを取得
      const politicianId = currentPoliticianIdRef.current;

      if (
        !politicianId ||
        !lastCommentId ||
        !hasMoreComments ||
        isLoadingMoreComments ||
        isFetchingFirstBatch
      ) {
        return;
      }

      try {
        setIsLoadingMoreComments(true);

        await fetchCommentsByPolitician(
          politicianId,
          lastCommentId,
          10,
          sortType
        );

        console.log(`追加でコメントを取得しました (ソート: ${sortType})`);
      } catch (error) {
        console.error("追加コメントの取得中にエラーが発生しました:", error);
      } finally {
        setIsLoadingMoreComments(false);
      }
    },
    [
      fetchCommentsByPolitician,
      lastCommentId,
      hasMoreComments,
      isLoadingMoreComments,
      isFetchingFirstBatch,
    ]
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

  // ユーザーが既にコメントにいいねしているか確認
  const hasUserLikedComment = useCallback(
    (commentId: string, replyId?: string) => {
      const likeId = replyId ? `${commentId}:${replyId}` : commentId;
      return likedComments.has(likeId);
    },
    [likedComments]
  );

  // コメントにいいねしてUIを更新
  const likeComment = useCallback(
    async (commentId: string, replyId?: string) => {
      const likeId = replyId ? `${commentId}:${replyId}` : commentId;

      // 既にいいね済みならスキップ
      if (likedComments.has(likeId)) {
        return;
      }

      try {
        // 楽観的にUI更新（まずUIを先に更新）
        setComments((prevComments) => {
          return prevComments.map((comment) => {
            if (comment.id === commentId) {
              if (replyId) {
                // 特定の返信を更新
                return {
                  ...comment,
                  replies: comment.replies.map((reply) =>
                    reply.id === replyId
                      ? { ...reply, likes: reply.likes + 1 }
                      : reply
                  ),
                };
              } else {
                // メインコメントを更新
                return { ...comment, likes: comment.likes + 1 };
              }
            }
            return comment;
          });
        });

        // いいね済みとしてマーク
        setLikedComments((prev) => new Set([...prev, likeId]));

        // APIを呼び出してデータベースを更新
        await likeCommentApi(commentId, replyId);

        console.log("いいねを追加しました");
      } catch (error) {
        console.error("いいねの追加に失敗しました:", error);

        // エラー時にUI更新を元に戻す
        setComments((prevComments) => {
          return prevComments.map((comment) => {
            if (comment.id === commentId) {
              if (replyId) {
                return {
                  ...comment,
                  replies: comment.replies.map((reply) =>
                    reply.id === replyId
                      ? { ...reply, likes: reply.likes - 1 }
                      : reply
                  ),
                };
              } else {
                return { ...comment, likes: comment.likes - 1 };
              }
            }
            return comment;
          });
        });

        // いいね済みリストから削除
        setLikedComments((prev) => {
          const newSet = new Set(prev);
          newSet.delete(likeId);
          return newSet;
        });
      }
    },
    [likedComments]
  );

  return (
    <ReplyDataContext.Provider
      value={{
        comments,
        isLoadingComments,
        commentError,
        newCommentId,
        hasMoreComments,
        isLoadingMoreComments,
        fetchCommentsByPolitician,
        addReply,
        refreshComments,
        updateLocalComments,
        updateLocalReplies,
        scrollToComment,
        clearNewCommentId,
        likeComment,
        hasUserLikedComment,
        loadMoreComments,
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
