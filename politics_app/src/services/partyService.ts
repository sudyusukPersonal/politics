// src/services/partyService.ts
// 既存のインポートに increment を追加
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  Firestore,
  updateDoc,
  increment,
  runTransaction, // increment関数を追加
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Party } from "../types";
import { getPartyColor } from "../utils/dataUtils"; // getPartyColor関数をインポート

// 既存のコード...

// 政党への投票を追加する関数
export const addVoteToParty = async (
  partyId: string,
  voteType: "support" | "oppose"
): Promise<void> => {
  try {
    const partyRef = doc(db, "parties", partyId);

    // トランザクションを使用
    await runTransaction(db, async (transaction) => {
      // increment()を使用してカウンターを更新する更新オブジェクトを準備
      const updateData: any = {
        totalVotes: increment(1),
      };

      // 投票タイプに応じたフィールドを更新
      if (voteType === "support") {
        updateData.supportCount = increment(1);
      } else {
        updateData.oppositionCount = increment(1);
      }

      // supportRateを計算するために必要な現在の値を取得
      const partyDoc = await transaction.get(partyRef);

      if (!partyDoc.exists()) {
        throw new Error(`政治家 ${partyId} が見つかりません`);
      }

      const data = partyDoc.data();
      // 現在の値を取得して新しい値を計算
      const currentSupportCount = data.supportCount || 0;
      const currentOpposeCount = data.oppositionCount || 0;

      // 新しい値を計算
      const newSupportCount =
        voteType === "support" ? currentSupportCount + 1 : currentSupportCount;
      const newOpposeCount =
        voteType === "oppose" ? currentOpposeCount + 1 : currentOpposeCount;
      const newTotalVotes = newSupportCount + newOpposeCount;
      console.log("11111", updateData.supportRate);

      // 支持率を計算して更新データに追加
      updateData.supportRate = Math.round(
        (newSupportCount / newTotalVotes) * 100
      );
      console.log("222222", updateData.supportRate);

      // トランザクション内で更新を実行
      transaction.update(partyRef, updateData);
    });

    console.log(`Added ${voteType} vote to politician ${partyRef}`);
  } catch (error) {
    console.error(`Error adding ${voteType} vote:`, error);
    throw error;
  }
};

export const incrementPartyCommentCount = async (
  partyId: string
): Promise<void> => {
  try {
    if (!partyId) {
      console.warn(
        "政党IDが指定されていないため、コメント数の更新をスキップします"
      );
      return;
    }

    // 存在確認なしで直接更新
    const partyRef = doc(db, "parties", partyId);
    await updateDoc(partyRef, {
      totalCommentCount: increment(1),
    });

    console.log(`政党ID: ${partyId} のコメント数を更新しました`);
  } catch (error) {
    console.error(`政党のコメント数更新エラー:`, error);
    // エラーをスローせず、ログのみ出力
  }
};

/**
 * Firestoreから全ての政党データを取得する
 * @returns 政党データの配列
 */
export const fetchAllParties = async (): Promise<Party[]> => {
  try {
    // Firestoreのpartiesコレクションからデータを取得
    const partiesCollection = collection(db, "parties");
    const partiesSnapshot = await getDocs(partiesCollection);

    // 取得したデータを処理
    const parties = partiesSnapshot.docs.map((doc) => {
      const data = doc.data();

      const supportRate =
        data.supportRate ||
        (data.totalVotes > 0
          ? Math.round(((data.supportCount || 0) / data.totalVotes) * 100)
          : 50); // デフォルト値を50に設定

      return {
        id: doc.id,
        name: data.name,
        color: getPartyColor(data.name),
        supportRate: supportRate,
        opposeRate: 100 - supportRate,
        totalVotes: data.totalVotes || 0,
        members: parseInt(data.politicians_count) || 0,
        keyPolicies: data.majorPolicies || [],
        description: data.overview || "",
        image: getPartyImagePath(data.name),
        totalCommentCount: data.totalCommentCount || 0,
      };
    });

    console.log(`${parties.length}件の政党データを取得しました`);
    return parties;
  } catch (error) {
    console.error("Firestoreからの政党データ取得に失敗しました:", error);
    throw error;
  }
};

/**
 * 特定の政党IDに基づいて詳細情報を取得する
 * @param partyId 政党のドキュメントID
 * @returns 政党データまたはnull
 */
export const fetchPartyById = async (
  partyId: string
): Promise<Party | null> => {
  try {
    if (!partyId) {
      console.error("政党IDが指定されていません");
      return null;
    }

    // 特定の政党ドキュメントを取得
    const partyRef = doc(db, "parties", partyId);
    const partySnap = await getDoc(partyRef);

    if (!partySnap.exists()) {
      console.error(`ID: ${partyId} の政党が見つかりません`);
      return null;
    }

    // ドキュメントデータを取得
    const data = partySnap.data();

    const supportRate =
      data.supportRate ||
      (data.totalVotes > 0
        ? Math.round(((data.supportCount || 0) / data.totalVotes) * 100)
        : 50); // デフォルト値を50に設定

    // 政党オブジェクトを構築して返す
    return {
      id: partyId,
      name: data.name,
      color: getPartyColor(data.name),
      supportRate: supportRate,
      opposeRate: 100 - supportRate,
      totalVotes: data.totalVotes || 0,
      members: parseInt(data.politicians_count) || 0,
      keyPolicies: data.majorPolicies || [],
      description: data.overview || "",
      image: getPartyImagePath(data.name),
      totalCommentCount: data.totalCommentCount || 0,
    };
  } catch (error) {
    console.error(`政党ID: ${partyId} の取得エラー:`, error);
    throw error;
  }
};

/**
 * 政党の画像パスを取得する補助関数
 * @param partyName 政党名
 * @returns 画像パス
 */
const getPartyImagePath = (partyName: string): string => {
  try {
    // 政党画像のパスを返す
    return `/cm_parly_images/${encodeURIComponent(partyName)}.jpg`;
  } catch (error) {
    // 画像が見つからない場合はプレースホルダー画像を返す
    console.warn(`政党画像が見つかりません: ${partyName}.jpg`);
    return "/api/placeholder/80/80";
  }
};
