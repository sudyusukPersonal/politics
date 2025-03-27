// src/services/voteService.ts
import { addVoteToPolitician } from "./politicianService";
import { addVoteToPolicy } from "./policyService";
import { addNewComment } from "./commentService";
import { Comment } from "../types";
import { addVoteToParty } from "./partyService"; // 新しいインポート

// 匿名ユーザー情報
const MOCK_CURRENT_USER = {
  uid: "user_anonymous",
  displayName: "匿名ユーザー",
};

// 統合投票サービス関数 - entityTypeに"party"を追加
export const addEntityVote = async (
  entityId: string,
  entityType: "politician" | "policy" | "party",
  voteType: "support" | "oppose",
  reason: string
): Promise<{ success: boolean; commentId: string }> => {
  try {
    if (!entityId || !voteType || !reason.trim()) {
      throw new Error("必要なパラメータが不足しています");
    }

    // 1. エンティティのvoteカウントを更新
    if (entityType === "politician") {
      await addVoteToPolitician(entityId, voteType);
    } else if (entityType === "policy") {
      await addVoteToPolicy(entityId, voteType);
    } else if (entityType === "party") {
      await addVoteToParty(entityId, voteType);
    }

    // 2. コメントを追加（entityTypeを渡す）
    const newCommentId = await addNewComment({
      text: reason,
      userID: MOCK_CURRENT_USER.uid,
      userName: MOCK_CURRENT_USER.displayName,
      politicianID: entityId,
      entityType: entityType, // ここで明示的にentityTypeを渡す
      type: voteType,
      likes: 0,
    });

    return {
      success: true,
      commentId: newCommentId,
    };
  } catch (error) {
    console.error(`${entityType}の評価送信中にエラーが発生しました:`, error);
    throw error;
  }
};

// コメント表示用にUIで使用する新しいコメントオブジェクトを作成するヘルパー関数
export const createUIComment = (
  commentId: string,
  entityId: string,
  reason: string,
  voteType: "support" | "oppose",
  entityType: "politician" | "policy" | "party" = "politician" // デフォルト値を追加
): Comment => {
  return {
    id: commentId,
    text: reason,
    userID: MOCK_CURRENT_USER.uid,
    userName: MOCK_CURRENT_USER.displayName,
    politicianID: entityId,
    entityType: entityType, // entityTypeを明示的に追加
    createdAt: new Date(),
    likes: 0,
    replies: [],
    repliesCount: 0,
    type: voteType,
  };
};
