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
  entityType: "politician" | "policy" | "party", // "party"を追加
  voteType: "support" | "oppose",
  reason: string
): Promise<{ success: boolean; commentId: string }> => {
  try {
    if (!entityId || !voteType || !reason.trim()) {
      throw new Error("必要なパラメータが不足しています");
    }

    // 1. エンティティのvoteカウントを更新（政治家/政策/政党に応じて適切な関数を呼び出す）
    if (entityType === "politician") {
      await addVoteToPolitician(entityId, voteType);
    } else if (entityType === "policy") {
      // 明示的な条件分岐に変更
      await addVoteToPolicy(entityId, voteType);
    } else if (entityType === "party") {
      // 政党の場合
      await addVoteToParty(entityId, voteType);
    }

    // 2. コメントを追加（全エンティティタイプで共通処理）
    const newCommentId = await addNewComment({
      text: reason,
      userID: MOCK_CURRENT_USER.uid,
      userName: MOCK_CURRENT_USER.displayName,
      politicianID: entityId, // Firestoreのフィールド名が統一されていないためpoliticianIDを使用
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
  voteType: "support" | "oppose"
): Comment => {
  return {
    id: commentId,
    text: reason,
    userID: MOCK_CURRENT_USER.uid,
    userName: MOCK_CURRENT_USER.displayName,
    politicianID: entityId,
    createdAt: new Date(),
    likes: 0,
    replies: [],
    repliesCount: 0,
    type: voteType,
  };
};
