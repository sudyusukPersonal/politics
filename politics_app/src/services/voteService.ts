// src/services/voteService.ts
import { addVoteToPolitician } from "./politicianService";
import { addVoteToPolicy } from "./policyService";
import { addNewComment } from "./commentService";
import { Comment } from "../types";
import { addVoteToParty } from "./partyService"; // 新しいインポート
import { doc, updateDoc, increment, runTransaction } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { removeVoteFromLocalStorage } from "../utils/voteStorage";

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

export const removeEntityVote = async (
  entityId: string,
  entityType: "politician" | "policy" | "party",
  voteType: "support" | "oppose"
): Promise<boolean> => {
  try {
    if (!entityId || !voteType) {
      throw new Error("必要なパラメータが不足しています");
    }

    // 1. エンティティの投票カウントを更新
    if (entityType === "politician") {
      await removeVoteFromPolitician(entityId, voteType);
    } else if (entityType === "policy") {
      await removeVoteFromPolicy(entityId, voteType);
    } else if (entityType === "party") {
      await removeVoteFromParty(entityId, voteType);
    }

    // 2. ローカルストレージから投票情報を削除
    removeVoteFromLocalStorage(entityId);

    return true;
  } catch (error) {
    console.error(`${entityType}の評価削除中にエラーが発生しました:`, error);
    throw error;
  }
};

// 政治家からの投票を削除
const removeVoteFromPolitician = async (
  politicianId: string,
  voteType: "support" | "oppose"
): Promise<void> => {
  try {
    if (!politicianId) {
      console.warn("政治家IDが指定されていないため、投票削除をスキップします");
      return;
    }

    const politicianRef = doc(db, "politicians", politicianId);

    // トランザクションを使用して安全に更新
    await runTransaction(db, async (transaction) => {
      // 現在のデータを取得
      const politicianDoc = await transaction.get(politicianRef);

      if (!politicianDoc.exists()) {
        throw new Error(`政治家 ${politicianId} が見つかりません`);
      }

      const data = politicianDoc.data();
      // 現在の値を取得
      const currentSupportCount = data.supportCount || 0;
      const currentOpposeCount = data.opposeCount || 0;

      // 新しい値を計算（マイナス1、ただし0未満にはならないようにする）
      const newSupportCount =
        voteType === "support"
          ? Math.max(0, currentSupportCount - 1)
          : currentSupportCount;
      const newOpposeCount =
        voteType === "oppose"
          ? Math.max(0, currentOpposeCount - 1)
          : currentOpposeCount;
      const newTotalVotes = newSupportCount + newOpposeCount;

      // 更新データを準備
      const updateData: any = {
        totalVotes: newTotalVotes,
      };

      if (voteType === "support") {
        updateData.supportCount = newSupportCount;
      } else {
        updateData.opposeCount = newOpposeCount;
      }

      // 支持率を計算（0除算を防ぐ）
      if (newTotalVotes > 0) {
        updateData.supportRate = Math.round(
          (newSupportCount / newTotalVotes) * 100
        );
      } else {
        // 投票がゼロになった場合はデフォルト値をセット
        updateData.supportRate = 0;
      }

      // トランザクション内で更新を実行
      transaction.update(politicianRef, updateData);
    });

    console.log(`政治家ID ${politicianId} への ${voteType} 投票を削除しました`);
  } catch (error) {
    console.error("政治家からの投票削除中にエラーが発生しました:", error);
    // エラーをスローせず、ログのみ出力
  }
};

// 政策からの投票を削除
const removeVoteFromPolicy = async (
  policyId: string,
  voteType: "support" | "oppose"
): Promise<void> => {
  try {
    if (!policyId) {
      console.warn("政策IDが指定されていないため、投票削除をスキップします");
      return;
    }

    const policyRef = doc(db, "policy", policyId);

    // トランザクションを使用して安全に更新
    await runTransaction(db, async (transaction) => {
      // 現在のデータを取得
      const policyDoc = await transaction.get(policyRef);

      if (!policyDoc.exists()) {
        throw new Error(`政策 ${policyId} が見つかりません`);
      }

      const data = policyDoc.data();
      // 現在の値を取得
      const currentSupportCount = data.SupportRate || 0;
      const currentOpposeCount = data.NonSupportRate || 0;

      // 新しい値を計算（マイナス1、ただし0未満にはならないようにする）
      const newSupportCount =
        voteType === "support"
          ? Math.max(0, currentSupportCount - 1)
          : currentSupportCount;
      const newOpposeCount =
        voteType === "oppose"
          ? Math.max(0, currentOpposeCount - 1)
          : currentOpposeCount;
      const newTotalVotes = newSupportCount + newOpposeCount;

      // 更新データを準備
      const updateData: any = {
        totalcount: newTotalVotes,
      };

      if (voteType === "support") {
        updateData.SupportRate = newSupportCount;
      } else {
        updateData.NonSupportRate = newOpposeCount;
      }

      // 支持率を計算（0除算を防ぐ）
      if (newTotalVotes > 0) {
        updateData.supportRating = Math.round(
          (newSupportCount / newTotalVotes) * 100
        );
      } else {
        // 投票がゼロになった場合はデフォルト値をセット
        updateData.supportRating = 0;
      }

      // トランザクション内で更新を実行
      transaction.update(policyRef, updateData);
    });

    console.log(`政策ID ${policyId} への ${voteType} 投票を削除しました`);
  } catch (error) {
    console.error("政策からの投票削除中にエラーが発生しました:", error);
    // エラーをスローせず、ログのみ出力
  }
};

// 政党からの投票を削除
const removeVoteFromParty = async (
  partyId: string,
  voteType: "support" | "oppose"
): Promise<void> => {
  try {
    if (!partyId) {
      console.warn("政党IDが指定されていないため、投票削除をスキップします");
      return;
    }

    const partyRef = doc(db, "parties", partyId);

    // トランザクションを使用して安全に更新
    await runTransaction(db, async (transaction) => {
      // 現在のデータを取得
      const partyDoc = await transaction.get(partyRef);

      if (!partyDoc.exists()) {
        throw new Error(`政党 ${partyId} が見つかりません`);
      }

      const data = partyDoc.data();
      // 現在の値を取得
      const currentSupportCount = data.supportCount || 0;
      const currentOpposeCount = data.oppositionCount || 0;

      // 新しい値を計算（マイナス1、ただし0未満にはならないようにする）
      const newSupportCount =
        voteType === "support"
          ? Math.max(0, currentSupportCount - 1)
          : currentSupportCount;
      const newOpposeCount =
        voteType === "oppose"
          ? Math.max(0, currentOpposeCount - 1)
          : currentOpposeCount;
      const newTotalVotes = newSupportCount + newOpposeCount;

      // 更新データを準備
      const updateData: any = {
        totalVotes: newTotalVotes,
      };

      if (voteType === "support") {
        updateData.supportCount = newSupportCount;
      } else {
        updateData.oppositionCount = newOpposeCount;
      }

      // 支持率を計算（0除算を防ぐ）
      if (newTotalVotes > 0) {
        updateData.supportRate = Math.round(
          (newSupportCount / newTotalVotes) * 100
        );
      } else {
        // 投票がゼロになった場合はデフォルト値をセット
        updateData.supportRate = 0;
      }

      // トランザクション内で更新を実行
      transaction.update(partyRef, updateData);
    });

    console.log(`政党ID ${partyId} への ${voteType} 投票を削除しました`);
  } catch (error) {
    console.error("政党からの投票削除中にエラーが発生しました:", error);
    // エラーをスローせず、ログのみ出力
  }
};
