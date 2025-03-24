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
  increment, // increment関数を追加
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";

// 既存のコード...

// 政党への投票を追加する関数
export const addVoteToParty = async (
  partyId: string,
  voteType: "support" | "oppose"
): Promise<void> => {
  try {
    const partyRef = doc(db, "parties", partyId);

    // 投票タイプに応じてフィールドを更新
    if (voteType === "support") {
      await updateDoc(partyRef, {
        supportCount: increment(1),
      });
    } else {
      await updateDoc(partyRef, {
        oppositionCount: increment(1),
      });
    }

    console.log(`政党 ${partyId} に ${voteType} 票を追加しました`);
  } catch (error) {
    console.error(`政党への ${voteType} 投票追加エラー:`, error);
    throw error;
  }
};
