import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  Timestamp,
  arrayUnion,
  increment,
  runTransaction,
  orderBy,
  startAfter,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Comment, Reply } from "../types";
import { incrementPolicyCommentCount } from "./policyService";
import { incrementPartyCommentCount } from "./partyService";
import { incrementPoliticianCommentCount } from "./politicianService";

// Helper to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: Timestamp): Date =>
  timestamp ? timestamp.toDate() : new Date();

// Fetch comments for a specific politician
export const fetchCommentsByPoliticianId = async (
  politicianId: string,
  startAfterId?: string | null,
  limitSize: number = 5,
  sortType: "latest" | "replies" | "support" | "oppose" = "latest"
): Promise<{
  fetchedComments: Comment[];
  lastDocId: string | null;
  hasMore: boolean;
}> => {
  try {
    // Create a query to fetch comments for the specific politician
    const commentsRef = collection(db, "comments");
    let q;

    // 基本的なフィルター - 指定した政治家のコメントのみを取得
    const baseFilters = [where("politician_id", "==", politicianId)];

    // ソートタイプに基づいてクエリを構築
    switch (sortType) {
      case "latest":
        // 新しい順（デフォルト）
        q = query(
          commentsRef,
          ...baseFilters,
          orderBy("created_at", "desc"),
          limit(limitSize)
        );
        break;

      case "replies":
        // 返信の多い順
        q = query(
          commentsRef,
          ...baseFilters,
          orderBy("repliesCount", "desc"),
          orderBy("created_at", "desc"), // 同じ返信数の場合は新しい順
          limit(limitSize)
        );
        break;

      case "support":
        // 支持コメント + 新しい順
        q = query(
          commentsRef,
          ...baseFilters,
          where("type", "==", "support"),
          orderBy("created_at", "desc"),
          limit(limitSize)
        );
        break;

      case "oppose":
        // 不支持コメント + 新しい順
        q = query(
          commentsRef,
          ...baseFilters,
          where("type", "==", "oppose"),
          orderBy("created_at", "desc"),
          limit(limitSize)
        );
        break;

      default:
        // デフォルトは新しい順
        q = query(
          commentsRef,
          ...baseFilters,
          orderBy("created_at", "desc"),
          limit(limitSize)
        );
    }

    // If startAfterId is provided, get that document and use it as a starting point
    if (startAfterId) {
      const startAfterDoc = await getDoc(doc(db, "comments", startAfterId));
      if (startAfterDoc.exists()) {
        // 基本フィルタとソートの条件を維持したまま、startAfterを追加
        let orderByFields;

        switch (sortType) {
          case "replies":
            orderByFields = [
              orderBy("repliesCount", "desc"),
              orderBy("created_at", "desc"),
            ];
            break;
          case "support":
          case "oppose":
            orderByFields = [orderBy("created_at", "desc")];
            break;
          default:
            orderByFields = [orderBy("created_at", "desc")];
        }

        // ソートタイプに応じたフィルターを適用
        const whereConditions = [...baseFilters];
        if (sortType === "support") {
          whereConditions.push(where("type", "==", "support"));
        } else if (sortType === "oppose") {
          whereConditions.push(where("type", "==", "oppose"));
        }

        q = query(
          commentsRef,
          ...whereConditions,
          ...orderByFields,
          startAfter(startAfterDoc),
          limit(limitSize)
        );
      }
    }

    // Execute the query
    const querySnapshot = await getDocs(q);

    // Convert documents to Comment type
    const comments: Comment[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      text: doc.data().text,
      userID: doc.data().user_id,
      userName: doc.data().user_name,
      politicianID: doc.data().politician_id,
      createdAt: convertTimestamp(doc.data().created_at),
      likes: doc.data().likes || 0,
      replies: (doc.data().replies || []).map((reply: any) => ({
        ...reply,
        createdAt: convertTimestamp(reply.created_at),
      })),
      repliesCount: doc.data().replies?.length || 0,
      type: doc.data().type,
    }));

    // Determine if there are more comments to load
    const hasMore = comments.length === limitSize;

    // Get the last document ID for pagination
    const lastDocId =
      comments.length > 0 ? comments[comments.length - 1].id : null;

    return {
      fetchedComments: comments,
      lastDocId,
      hasMore,
    };
  } catch (error) {
    console.error("コメントの取得中にエラーが発生しました:", error);
    throw error;
  }
};
// Fetch a specific comment by ID
export const fetchCommentById = async (commentId: string): Promise<void> => {
  try {
    const commentRef = doc(db, "comments", commentId);
    const commentSnap = await getDoc(commentRef);

    if (commentSnap.exists()) {
      console.log("Fetched Comment:", commentSnap.data());
    } else {
      console.log("Comment not found");
    }
  } catch (error) {
    console.error("コメントの取得中にエラーが発生しました:", error);
  }
};

export const addReplyToComment = async (
  commentId: string,
  newReply: any
): Promise<Reply> => {
  try {
    // トランザクションを使用
    return await runTransaction(db, async (transaction) => {
      // Reference to the specific comment document
      const commentRef = doc(db, "comments", commentId);

      // Get the current comment data to check existing replies
      const commentSnap = await transaction.get(commentRef);
      if (!commentSnap.exists()) {
        throw new Error("コメントが見つかりません");
      }

      const commentData = commentSnap.data();

      // 匿名ユーザーの場合のみ、返信数+1を名前に付与
      let replyUserName = newReply.userName;
      if (replyUserName === "匿名ユーザー") {
        const currentReplies = commentData.replies || [];
        const replyCount = currentReplies.length + 1;
        replyUserName = `匿名${replyCount}`;
      }

      // Format the reply object to match Firestore structure
      const replyToAdd = {
        id: `reply_${Date.now()}`, // 一意のIDを生成
        text: newReply.text,
        user_id: newReply.userID,
        user_name: replyUserName, // 修正したユーザー名を使用（返信だけ番号付き）
        created_at: Timestamp.now(),
        likes: 0,
        reply_to: newReply.replyTo
          ? {
              reply_id: newReply.replyTo.replyID,
              reply_to_user_id: newReply.replyTo.replyToUserID,
              reply_to_username: newReply.replyTo.replyToUserName,
            }
          : null,
      };

      // Update the comment document by adding the new reply to the replies array
      transaction.update(commentRef, {
        replies: arrayUnion(replyToAdd),
        // Update the reply count
        repliesCount: (commentData.replies?.length || 0) + 1,
      });

      // エンティティタイプに応じてコメント数をインクリメント
      // トランザクション内では外部への非同期呼び出しができないため、
      // 実行後のデータと必要な情報を返します
      const entityData = {
        entityType: commentData.entity_type,
        politicianId: commentData.politician_id,
      };

      // Convert the reply to the format expected by the client
      const clientReply: Reply = {
        id: replyToAdd.id,
        text: replyToAdd.text,
        userID: replyToAdd.user_id,
        userName: replyToAdd.user_name, // 番号付きの名前を返す
        createdAt: convertTimestamp(replyToAdd.created_at),
        likes: replyToAdd.likes,
        reply_to: replyToAdd.reply_to || undefined,
        // Also include client-side format for compatibility
        replyTo: replyToAdd.reply_to
          ? {
              replyID: replyToAdd.reply_to.reply_id,
              replyToUserID: replyToAdd.reply_to.reply_to_user_id,
              replyToUserName: replyToAdd.reply_to.reply_to_username,
            }
          : undefined,
      };

      // Return the reply and entity data for post-transaction processing
      return { clientReply, entityData };
    }).then(async ({ clientReply, entityData }) => {
      // エンティティタイプに応じてコメント数をインクリメント
      if (entityData.entityType === "policy") {
        await incrementPolicyCommentCount(entityData.politicianId);
      } else if (entityData.entityType === "party") {
        await incrementPartyCommentCount(entityData.politicianId);
      } else if (entityData.entityType === "politician") {
        await incrementPoliticianCommentCount(entityData.politicianId);
      }

      console.log("返信が正常に追加されました", clientReply);

      // Return the reply for UI update
      return clientReply;
    });
  } catch (error) {
    console.error("返信の追加中にエラーが発生しました:", error);
    throw error;
  }
};
// Add a new comment///
export const addNewComment = async (
  newComment: Omit<Comment, "id" | "createdAt" | "replies" | "repliesCount">
): Promise<string> => {
  try {
    // Add the comment to Firestore
    const commentRef = await addDoc(collection(db, "comments"), {
      text: newComment.text,
      user_id: newComment.userID,
      user_name: newComment.userName,
      politician_id: newComment.politicianID,
      entity_type: newComment.entityType || "politician", // entityTypeフィールドを追加
      created_at: Timestamp.now(),
      likes: 0,
      replies: [],
      type: newComment.type,
    });

    // エンティティタイプに応じてコメント数をインクリメント
    if (newComment.entityType === "policy") {
      await incrementPolicyCommentCount(newComment.politicianID);
    } else if (newComment.entityType === "party") {
      await incrementPartyCommentCount(newComment.politicianID);
    } else if (newComment.entityType === "politician") {
      await incrementPoliticianCommentCount(newComment.politicianID);
    }

    return commentRef.id;
  } catch (error) {
    console.error("コメントの追加中にエラーが発生しました:", error);
    throw error;
  }
};
// Like a comment
export const likeComment = async (
  commentId: string,
  replyId?: string
): Promise<void> => {
  try {
    const commentRef = doc(db, "comments", commentId);

    if (replyId) {
      // For replies, we still need to read the document to find the specific reply
      const commentSnap = await getDoc(commentRef);

      if (!commentSnap.exists()) {
        throw new Error("コメントが見つかりません");
      }

      // For replies, we need to find and update a specific reply's likes
      const commentData = commentSnap.data();
      const replies = commentData.replies || [];
      const updatedReplies = replies.map((reply: any) => {
        if (reply.id === replyId) {
          return { ...reply, likes: (reply.likes || 0) + 1 };
        }
        return reply;
      });

      await updateDoc(commentRef, { replies: updatedReplies });
    } else {
      // For main comments, directly increment the likes counter without reading first
      await updateDoc(commentRef, {
        likes: increment(1),
      });
    }
  } catch (error) {
    console.error("いいねの追加中にエラーが発生しました:", error);
    throw error;
  }
};
