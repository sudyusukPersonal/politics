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
} from "firebase/firestore";
import { db } from "../config/firebaseConfig"; // Ensure you have a Firebase config file
import { Comment, Reply } from "../types";

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
        createdAt: convertTimestamp(reply.createdAt),
      })),
      repliesCount: doc.data().replies?.length || 0,
      type: doc.data().type,
    }));

    console.log("Fetched Comments:", comments);

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

// Add a reply to an existing comment
export const addReplyToComment = async (
  commentId: string,
  newReply: Omit<Reply, "id" | "createdAt">
): Promise<void> => {
  try {
    // Reference to the specific comment document
    const commentRef = doc(db, "comments", commentId);

    // Prepare the reply with server timestamp
    const replyToAdd = {
      ...newReply,
      createdAt: Timestamp.now(),
      id: "", // Firebase will generate a unique ID
    };

    // Update the comment document to add the new reply
    await updateDoc(commentRef, {
      replies: [...(replyToAdd.replies || []), replyToAdd],
      repliesCount: (replyToAdd.repliesCount || 0) + 1,
    });
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
      ...newComment,
      createdAt: Timestamp.now(),
      replies: [],
      repliesCount: 0,
    });

    return commentRef.id;
  } catch (error) {
    console.error("コメントの追加中にエラーが発生しました:", error);
    throw error;
  }
};

// Like a comment or reply

export const likeComment = async (
  commentId: string,
  replyId?: string
): Promise<void> => {
  try {
    const commentRef = doc(db, "comments", commentId);

    // Logic to increment likes depends on whether it's a main comment or a reply
    if (replyId) {
      // For replies, you'd need to update a specific reply's likes
      await updateDoc(commentRef, {
        // Specific logic to update reply likes
      });
    } else {
      // For main comments
      await updateDoc(commentRef, {
        likes: increment(1),
      });
    }
  } catch (error) {
    console.error("いいねの追加中にエラーが発生しました:", error);
    throw error;
  }
};
