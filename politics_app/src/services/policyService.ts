// src/services/policyService.ts
import {
  collection,
  getDocs,
  query,
  doc,
  getDoc,
  where,
  orderBy,
  limit,
  startAfter,
  Firestore,
  updateDoc,
  increment,
  OrderByDirection,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { getPartyColor } from "./politicianService";

// 政策データの型定義
export interface Policy {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  proposedDate: string;
  supportRate: number;
  opposeRate: number;
  totalVotes: number;
  trending: "up" | "down" | "none";
  commentsCount: number;
  proposingParty: {
    name: string;
    color: string;
  };
  affectedFields: string[];
  keyPoints: string[];
  economicImpact: string;
  lifeImpact: string;
  politicalParties: {
    partyName: string;
    claims: string;
  }[];
}

// Firestoreのデータを型に合わせて変換する関数
const convertToPolicyObject = (id: string, data: any): Policy => {
  // 支持率と不支持率の計算
  const supportRate = data.SupportRate || 50; // デフォルト値として50%を設定
  const opposeRate = data.NonSupportRate || 50;
  const totalVotes = supportRate + opposeRate;

  // SupportRateとNonSupportRateから正規化した割合を計算
  const normalizedSupportRate =
    totalVotes > 0 ? Math.round((supportRate / totalVotes) * 100) : 50;
  const normalizedOpposeRate =
    totalVotes > 0 ? Math.round((opposeRate / totalVotes) * 100) : 50;

  // コメント数（実際のデータにない場合はランダムな値を生成）
  const commentsCount = Math.floor(Math.random() * 300) + 50;

  // トレンドの決定（実際のデータにない場合はランダムに設定）
  const trendOptions: Array<"up" | "down" | "none"> = ["up", "down", "none"];
  const trending =
    normalizedSupportRate > 60
      ? "up"
      : normalizedSupportRate < 40
      ? "down"
      : trendOptions[Math.floor(Math.random() * 3)];

  // 政党情報の処理
  const politicalParties =
    data.PoliticalParties?.map((party: any) => ({
      partyName: party.PartyName,
      claims: party.Claims,
    })) || [];

  // 提案政党（最初の政党を提案政党とする）
  const proposingParty =
    politicalParties.length > 0
      ? {
          name: politicalParties[0].partyName,
          color: getPartyColor(politicalParties[0].partyName),
        }
      : {
          name: "不明",
          color: "#808080",
        };

  return {
    id,
    title: data.Title || "不明なタイトル",
    description: data.Description || "説明なし",
    category: data.AffectedFields?.[0] || "その他", // 最初のカテゴリを主カテゴリとする
    status: data.Status || "審議中",
    proposedDate: data.ProposedDate || "2023年", // 適切なデフォルト値を設定
    supportRate: normalizedSupportRate,
    opposeRate: normalizedOpposeRate,
    totalVotes: totalVotes,
    trending,
    commentsCount,
    proposingParty,
    affectedFields: data.AffectedFields || [],
    keyPoints: data.KeyPoints || [],
    economicImpact: data.EconomicImpact || "",
    lifeImpact: data.LifeImpact || "",
    politicalParties,
  };
};

// 全ての政策を取得する関数
export const fetchAllPolicies = async (): Promise<Policy[]> => {
  try {
    const policiesRef = collection(db, "policy");
    const querySnapshot = await getDocs(policiesRef);

    return querySnapshot.docs.map((doc) =>
      convertToPolicyObject(doc.id, doc.data())
    );
  } catch (error) {
    console.error("政策データの取得エラー:", error);
    throw error;
  }
};

// 特定のカテゴリの政策を取得する関数
export const fetchPoliciesByCategory = async (
  category: string
): Promise<Policy[]> => {
  try {
    const policiesRef = collection(db, "policy");
    let q;

    if (category === "all") {
      // すべてのカテゴリを取得する場合
      q = query(policiesRef);
    } else {
      // 特定のカテゴリに属する政策を取得する場合
      q = query(
        policiesRef,
        where("AffectedFields", "array-contains", category)
      );
    }

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) =>
      convertToPolicyObject(doc.id, doc.data())
    );
  } catch (error) {
    console.error(`${category}カテゴリの政策データ取得エラー:`, error);
    throw error;
  }
};

// 検索条件に基づいて政策を取得する関数
export const searchPolicies = async (searchTerm: string): Promise<Policy[]> => {
  try {
    // Firestoreはフルテキスト検索に対応していないため、
    // すべてのドキュメントを取得してクライアント側でフィルタリングする
    const policiesRef = collection(db, "policy");
    const querySnapshot = await getDocs(policiesRef);

    const allPolicies = querySnapshot.docs.map((doc) =>
      convertToPolicyObject(doc.id, doc.data())
    );

    // クライアント側で検索条件に基づいてフィルタリング
    if (!searchTerm.trim()) {
      return allPolicies;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return allPolicies.filter(
      (policy) =>
        policy.title.toLowerCase().includes(lowerSearchTerm) ||
        policy.description.toLowerCase().includes(lowerSearchTerm)
    );
  } catch (error) {
    console.error("政策検索エラー:", error);
    throw error;
  }
};

// 政策の詳細を取得する関数
export const fetchPolicyById = async (
  policyId: string
): Promise<Policy | null> => {
  try {
    const policyRef = doc(db, "policy", policyId);
    const policySnap = await getDoc(policyRef);

    if (policySnap.exists()) {
      return convertToPolicyObject(policyId, policySnap.data());
    } else {
      console.error(`ID: ${policyId} の政策が見つかりません`);
      return null;
    }
  } catch (error) {
    console.error(`政策ID: ${policyId} の取得エラー:`, error);
    throw error;
  }
};

// ソート方法に基づいて政策を並べ替える関数
export const sortPolicies = (
  policies: Policy[],
  sortMethod: string
): Policy[] => {
  const sortedPolicies = [...policies];

  switch (sortMethod) {
    case "supportDesc": // 支持率（高い順）
      return sortedPolicies.sort((a, b) => b.supportRate - a.supportRate);
    case "supportAsc": // 支持率（低い順）
      return sortedPolicies.sort((a, b) => a.supportRate - b.supportRate);
    case "newest": // 新しい順
      return sortedPolicies.sort((a, b) => {
        const dateA = new Date(a.proposedDate);
        const dateB = new Date(b.proposedDate);
        return dateB.getTime() - dateA.getTime();
      });
    case "oldest": // 古い順
      return sortedPolicies.sort((a, b) => {
        const dateA = new Date(a.proposedDate);
        const dateB = new Date(b.proposedDate);
        return dateA.getTime() - dateB.getTime();
      });
    case "commentsDesc": // コメント数（多い順）
      return sortedPolicies.sort((a, b) => b.commentsCount - a.commentsCount);
    default:
      return sortedPolicies;
  }
};

// 利用可能なカテゴリをすべて取得する関数
export const fetchAllCategories = async (): Promise<string[]> => {
  try {
    const policiesRef = collection(db, "policy");
    const querySnapshot = await getDocs(policiesRef);

    // すべての政策から一意なカテゴリのリストを作成
    const categoriesSet = new Set<string>();

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.AffectedFields && Array.isArray(data.AffectedFields)) {
        data.AffectedFields.forEach((field: string) => {
          categoriesSet.add(field);
        });
      }
    });

    return Array.from(categoriesSet);
  } catch (error) {
    console.error("カテゴリ取得エラー:", error);
    throw error;
  }
};

export const addVoteToPolicy = async (
  policyId: string,
  voteType: "support" | "oppose"
): Promise<void> => {
  try {
    const policyRef = doc(db, "policy", policyId);

    // 投票タイプに応じたフィールドを更新
    // policy コレクションでは SupportRate と NonSupportRate フィールドを使用
    await updateDoc(policyRef, {
      [voteType === "support" ? "SupportRate" : "NonSupportRate"]: increment(1),
    });

    console.log(`政策 ${policyId} に ${voteType} 票を追加しました`);
  } catch (error) {
    console.error(`政策への ${voteType} 投票追加エラー:`, error);
    throw error;
  }
};

export const fetchPoliciesWithFilterAndSort = async (
  categoryFilter: string,
  partyFilter: string,
  sortMethod: string,
  searchTerm: string = "",
  lastDocumentId?: string,
  limitCount: number = 5
): Promise<{
  policies: Policy[];
  lastDocumentId?: string;
  hasMore: boolean;
}> => {
  try {
    const policiesRef = collection(db, "policy");
    let q;

    // ソートのフィールドと方向を定義
    let orderByField = "SupportRate";
    let orderDirection: OrderByDirection = "desc";

    switch (sortMethod) {
      case "supportDesc":
        orderByField = "SupportRate";
        orderDirection = "desc";
        break;
      case "supportAsc":
        orderByField = "SupportRate";
        orderDirection = "asc";
        break;
      case "opposeDesc":
        orderByField = "NonSupportRate";
        orderDirection = "desc";
        break;
    }

    // フィルタリングと検索の処理
    const conditions: any[] = [];

    if (categoryFilter !== "all") {
      conditions.push(
        where("AffectedFields", "array-contains", categoryFilter)
      );
    }

    if (partyFilter !== "all") {
      conditions.push(where("name", "==", partyFilter));
    }

    if (searchTerm.trim()) {
      // クライアントサイドでの絞り込みは別途実装する
    }

    conditions.push(orderBy(orderByField, orderDirection));

    // クエリ構築
    if (lastDocumentId) {
      try {
        const lastDoc = await getDoc(doc(db, "policy", lastDocumentId));

        if (lastDoc.exists()) {
          conditions.push(startAfter(lastDoc));
        } else {
          console.warn(
            `最後のドキュメントID ${lastDocumentId} が見つかりません`
          );
        }
      } catch (docError) {
        console.error("ドキュメント取得エラー:", docError);
      }
    }

    conditions.push(limit(limitCount));

    // クエリの実行
    q = query(policiesRef, ...conditions);

    const querySnapshot = await getDocs(q);

    // 検索語による追加のフィルタリング（クライアントサイド）
    let policies = querySnapshot.docs.map((doc) =>
      convertToPolicyObject(doc.id, doc.data())
    );

    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      policies = policies.filter(
        (policy) =>
          policy.title.toLowerCase().includes(lowerSearchTerm) ||
          policy.description.toLowerCase().includes(lowerSearchTerm)
      );
    }

    const hasMore = policies.length === limitCount;
    const lastVisibleDocument =
      querySnapshot.docs[querySnapshot.docs.length - 1];

    return {
      policies,
      lastDocumentId: lastVisibleDocument ? lastVisibleDocument.id : undefined,
      hasMore,
    };
  } catch (error) {
    console.error("政策データ取得エラー:", error);
    throw error;
  }
};
