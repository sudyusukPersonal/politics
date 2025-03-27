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
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Comment, Reply } from "../types";
import { incrementPolicyCommentCount } from "./policyService";

// Helper to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: Timestamp): Date =>
  timestamp ? timestamp.toDate() : new Date();

// Fetch comments for a specific politician
export const fetchCommentsByPoliticianId = async (
  politicianId: string
): Promise<Comment[]> => {
  try {
    // Create a query to fetch comments for the specific politician
    const commentsRef = collection(db, "comments");
    const q = query(commentsRef, where("politician_id", "==", politicianId));

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

    return comments;
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

// Add a reply to an existing comment - now returns the created reply object
// export const addReplyToComment = async (
//   commentId: string,
//   newReply: any
// ): Promise<Reply> => {
//   try {
//     // Reference to the specific comment document
//     const commentRef = doc(db, "comments", commentId);

//     // Get the current comment data to check existing replies
//     const commentSnap = await getDoc(commentRef);
//     if (!commentSnap.exists()) {
//       throw new Error("コメントが見つかりません");
//     }

//     // Format the reply object to match Firestore structure
//     const replyToAdd = {
//       id: `reply_${Date.now()}`, // 一意のIDを生成
//       text: newReply.text,
//       user_id: newReply.userID,
//       user_name: newReply.userName,
//       created_at: Timestamp.now(),
//       likes: 0,
//       reply_to: newReply.replyTo
//         ? {
//             reply_id: newReply.replyTo.replyID,
//             reply_to_user_id: newReply.replyTo.replyToUserID,
//             reply_to_username: newReply.replyTo.replyToUserName,
//           }
//         : null,
//     };

//     // Update the comment document by adding the new reply to the replies array
//     await updateDoc(commentRef, {
//       replies: arrayUnion(replyToAdd),
//       // Update the reply count
//       repliesCount: (commentSnap.data().replies?.length || 0) + 1,
//     });

//     console.log("返信が正常に追加されました", replyToAdd);

//     // Convert the reply to the format expected by the client
//     const clientReply: Reply = {
//       id: replyToAdd.id,
//       text: replyToAdd.text,
//       userID: replyToAdd.user_id,
//       userName: replyToAdd.user_name,
//       createdAt: convertTimestamp(replyToAdd.created_at),
//       likes: replyToAdd.likes,
//       reply_to: replyToAdd.reply_to || undefined,
//       // Also include client-side format for compatibility
//       replyTo: replyToAdd.reply_to
//         ? {
//             replyID: replyToAdd.reply_to.reply_id,
//             replyToUserID: replyToAdd.reply_to.reply_to_user_id,
//             replyToUserName: replyToAdd.reply_to.reply_to_username,
//           }
//         : undefined,
//     };

//     // Return the reply for UI update
//     return clientReply;
//   } catch (error) {
//     console.error("返信の追加中にエラーが発生しました:", error);
//     throw error;
//   }
// };

export const addReplyToComment = async (
  commentId: string,
  newReply: any
): Promise<Reply> => {
  try {
    // Reference to the specific comment document
    const commentRef = doc(db, "comments", commentId);

    // Get the current comment data to check existing replies
    const commentSnap = await getDoc(commentRef);
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
    await updateDoc(commentRef, {
      replies: arrayUnion(replyToAdd),
      // Update the reply count
      repliesCount: (commentData.replies?.length || 0) + 1,
    });

    // コメントのentity_typeフィールドを確認
    // 政策への返信であれば、政策コメント数をインクリメント
    if (commentData.entity_type === "policy") {
      await incrementPolicyCommentCount(commentData.politician_id);
    }

    console.log("返信が正常に追加されました", replyToAdd);

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

    // Return the reply for UI update
    return clientReply;
  } catch (error) {
    console.error("返信の追加中にエラーが発生しました:", error);
    throw error;
  }
};
// Add a new comment
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

    // エンティティタイプが "policy" の場合、政策のコメント数をインクリメント
    if (newComment.entityType === "policy") {
      await incrementPolicyCommentCount(newComment.politicianID);
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
    const commentSnap = await getDoc(commentRef);

    if (!commentSnap.exists()) {
      throw new Error("コメントが見つかりません");
    }

    if (replyId) {
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
      // For main comments, simply increment the likes counter
      await updateDoc(commentRef, {
        likes: (commentSnap.data().likes || 0) + 1,
      });
    }
  } catch (error) {
    console.error("いいねの追加中にエラーが発生しました:", error);
    throw error;
  }
};
