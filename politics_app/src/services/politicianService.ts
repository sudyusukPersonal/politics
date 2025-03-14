// src/services/politicianService.ts
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  increment,
  limit,
  Firestore,
  orderBy,
  startAfter,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Politician, Party } from "../types";

// Get the party color based on the party name
const getPartyColor = (affiliation: string): string => {
  switch (affiliation) {
    case "自由民主党":
      return "#4361EE"; // 青
    case "立憲民主党":
      return "#F72585"; // 赤
    case "公明党":
      return "#7209B7"; // 紫
    case "日本維新の会":
      return "#FF9E00"; // オレンジ
    case "国民民主党":
      return "#4CC9F0"; // 水色
    case "日本共産党":
      return "#E63946"; // 赤
    case "れいわ新選組":
      return "#06D6A0"; // 緑
    case "社民党":
      return "#118AB2"; // 青緑
    case "参政党":
      return "#FFD166"; // 黄色
    default:
      return "#808080"; // グレー
  }
};

// Generate a unique party ID from the party name
const generatePartyId = (partyName: string): string => {
  return `party-${partyName.replace(/\s+/g, "-")}`;
};

// Get local image path based on politician name
const getLocalImagePath = (name: string): string => {
  try {
    // Encode name to create a safe URL
    return `/images/${encodeURIComponent(name)}.jpg`;
  } catch (error) {
    console.warn(`画像が見つかりません: ${name}.jpg`);
    return "/api/placeholder/80/80";
  }
};

// Function to convert Firestore data to Politician type
const convertToPolitician = (id: string, data: any): Politician => {
  // Create a party object from the affiliation
  const party = {
    id: generatePartyId(data.affiliation),
    name: data.affiliation,
    color: getPartyColor(data.affiliation),
  };

  // Calculate support/oppose rates
  const totalVotes = (data.supportCount || 0) + (data.opposeCount || 0);
  const supportRate =
    totalVotes > 0
      ? Math.round(((data.supportCount || 0) / totalVotes) * 100)
      : 50; // Default to 50% if no votes

  return {
    id,
    name: data.name,
    furigana: data.furigana,
    position: data.type || "議員",
    region: data.region || "",
    age: data.age || Math.floor(Math.random() * 30) + 35, // Default age if not provided
    party,
    supportRate,
    opposeRate: 100 - supportRate,
    totalVotes: totalVotes || 0,
    activity: data.activity || Math.floor(Math.random() * 40) + 50, // Random activity score
    image: getLocalImagePath(data.name), // Use local image path based on name
    trending: data.trending || (Math.random() > 0.5 ? "up" : "down"), // Random trend if not provided
    recentActivity: data.recentActivity || "最近の活動情報",
  };
};

// Fetch a politician by ID
export const fetchPoliticianById = async (
  id: string
): Promise<Politician | null> => {
  try {
    const politicianRef = doc(db, "politicians", id);
    const politicianSnap = await getDoc(politicianRef);

    if (politicianSnap.exists()) {
      return convertToPolitician(id, politicianSnap.data());
    } else {
      console.error(`Politician with ID ${id} not found`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching politician:", error);
    throw error;
  }
};

// Record a vote for a politician (support or oppose)
export const addVoteToPolitician = async (
  politicianId: string,
  voteType: "support" | "oppose"
): Promise<void> => {
  try {
    const politicianRef = doc(db, "politicians", politicianId);

    // Use increment to atomically update the vote count
    await updateDoc(politicianRef, {
      [voteType === "support" ? "supportCount" : "opposeCount"]: increment(1),
    });

    console.log(`Added ${voteType} vote to politician ${politicianId}`);
  } catch (error) {
    console.error(`Error adding ${voteType} vote:`, error);
    throw error;
  }
};

// Fetch all politicians from a specific party
export const fetchPoliticiansByParty = async (
  partyName: string
): Promise<Politician[]> => {
  try {
    const politiciansRef = collection(db, "politicians");
    const q = query(politiciansRef, where("affiliation", "==", partyName));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) =>
      convertToPolitician(doc.id, doc.data())
    );
  } catch (error) {
    console.error("Error fetching politicians by party:", error);
    throw error;
  }
};

// 政党に所属する議員を支持率の高い順に取得（ページネーション対応）
export const fetchPoliticiansByPartyWithPagination = async (
  partyName: string,
  lastDocumentId?: string,
  limitCount: number = 15
): Promise<{
  politicians: Politician[];
  lastDocumentId?: string;
  hasMore: boolean;
}> => {
  try {
    const politiciansRef = collection(db, "politicians");

    let q;
    if (!lastDocumentId) {
      // 初回: 最初の15件のみを取得
      q = query(
        politiciansRef,
        where("affiliation", "==", partyName),
        orderBy("supportCount", "desc"),
        limit(limitCount)
      );
    } else {
      // 追加読み込み: 前回の最後のドキュメントから次の15件
      const lastDoc = await getDoc(doc(db, "politicians", lastDocumentId));

      q = query(
        politiciansRef,
        where("affiliation", "==", partyName),
        orderBy("supportCount", "desc"),
        startAfter(lastDoc),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);

    const politicians = querySnapshot.docs.map((doc) =>
      convertToPolitician(doc.id, doc.data())
    );

    // 次のページがあるかどうかを確認（取得した件数が15件未満なら追加データなし）
    const hasMore = politicians.length === limitCount;

    const lastVisibleDocument =
      querySnapshot.docs[querySnapshot.docs.length - 1];

    return {
      politicians,
      lastDocumentId: lastVisibleDocument ? lastVisibleDocument.id : undefined,
      hasMore,
    };
  } catch (error) {
    console.error(
      "Error fetching politicians by party with pagination:",
      error
    );
    throw error;
  }
};

// 全政治家を15件ずつページネーションで取得
export const fetchPoliticiansWithPagination = async (
  lastDocumentId?: string,
  limitCount: number = 15
): Promise<{
  politicians: Politician[];
  lastDocumentId?: string;
  hasMore: boolean;
}> => {
  try {
    const politiciansRef = collection(db, "politicians");

    let q;
    if (!lastDocumentId) {
      // 初回: 最初の15件のみを取得
      q = query(
        politiciansRef,
        orderBy("supportCount", "desc"),
        limit(limitCount)
      );
    } else {
      // 追加読み込み: 前回の最後のドキュメントから次の15件
      const lastDoc = await getDoc(doc(db, "politicians", lastDocumentId));

      q = query(
        politiciansRef,
        orderBy("supportCount", "desc"),
        startAfter(lastDoc),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    console.log("querySnapshot", querySnapshot.docs);

    const politicians = querySnapshot.docs.map((doc) =>
      convertToPolitician(doc.id, doc.data())
    );

    // 次のページがあるかどうかを確認
    const hasMore = politicians.length === limitCount;

    const lastVisibleDocument =
      querySnapshot.docs[querySnapshot.docs.length - 1];

    return {
      politicians,
      lastDocumentId: lastVisibleDocument ? lastVisibleDocument.id : undefined,
      hasMore,
    };
  } catch (error) {
    console.error("全政治家取得エラー:", error);
    throw error;
  }
};
