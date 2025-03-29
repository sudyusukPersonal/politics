// Modified politicianService.ts with Firebase Storage integration

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
  OrderByDirection,
  runTransaction,
} from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage"; // Import Firebase Storage
import { db } from "../config/firebaseConfig";
import { Politician, Party } from "../types";

// Get the party color based on the party name
export const getPartyColor = (affiliation: string): string => {
  switch (affiliation) {
    case "自由民主党":
      return "#555555"; // 青
    case "立憲民主党":
      return "#4361EE"; // 赤
    case "公明党":
      return "#7209B7"; // 紫
    case "日本維新の会":
      return "#228B22"; // オレンジ
    case "国民民主党":
      return "#000080"; // 水色
    case "日本共産党":
      return "#E63946"; // 赤
    case "れいわ新選組":
      return "#F72585"; // 緑
    case "社民党":
      return "#118AB2"; // 青緑
    case "参政党":
      return "#FF4500"; // 黄色
    default:
      return "#808080"; // グレー
  }
};

// Generate a unique party ID from the party name
const generatePartyId = (partyName: string): string => {
  return `party-${partyName.replace(/\s+/g, "-")}`;
};

const getPartyID = (affiliation: string): string => {
  switch (affiliation) {
    case "自由民主党":
      return "mJV3F03DLgaLLeBzfCdG"; // 青
    case "立憲民主党":
      return "lMixB0EYLpBHl0uQlo16"; // 赤
    case "公明党":
      return "neEopBo0RyDA2yBBszOp"; // 紫
    case "日本維新の会":
      return "R4ZedESxj6ZRqfB4Ak4z"; // オレンジ
    case "国民民主党":
      return "YY0BG8CCjpeBaATG9KvF"; // 水色
    case "日本共産党":
      return "Mn7qK9AvCbZNtMaQY8Wz"; // 赤
    case "れいわ新選組":
      return "yFV5XVFt5GCdzA0LU5c0"; // 緑
    case "社民党":
      return "ufc1i9eAFULfldtQ04DQ"; // 青緑
    case "参政党":
      return "E9BuFD9eUKNMpCBDCSDM"; // 黄色
    default:
      return "#808080"; // グレー
  }
};

// Get Firebase Storage image URL for politician
export const getPoliticianImageUrl = async (
  politicianName: string
): Promise<string> => {
  try {
    const storage = getStorage();
    const imagePath = `list_images/${encodeURIComponent(politicianName)}.jpg`;
    const imageRef = ref(storage, imagePath);

    // Get the download URL
    const url = await getDownloadURL(imageRef);
    return url;
  } catch (error) {
    console.error(`Failed to load image for ${politicianName}:`, error);
    return "/api/placeholder/80/80"; // Fallback to placeholder image
  }
};

// Record a vote for a politician (support or oppose)
export const addVoteToPolitician = async (
  politicianId: string,
  voteType: "support" | "oppose"
): Promise<void> => {
  try {
    const politicianRef = doc(db, "politicians", politicianId);

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
        updateData.opposeCount = increment(1);
      }

      // supportRateを計算するために必要な現在の値を取得
      const politicianDoc = await transaction.get(politicianRef);

      if (!politicianDoc.exists()) {
        throw new Error(`政治家 ${politicianId} が見つかりません`);
      }

      const data = politicianDoc.data();
      // 現在の値を取得して新しい値を計算
      const currentSupportCount = data.supportCount || 0;
      const currentOpposeCount = data.opposeCount || 0;

      // 新しい値を計算
      const newSupportCount =
        voteType === "support" ? currentSupportCount + 1 : currentSupportCount;
      const newOpposeCount =
        voteType === "oppose" ? currentOpposeCount + 1 : currentOpposeCount;
      const newTotalVotes = newSupportCount + newOpposeCount;

      // 支持率を計算して更新データに追加
      updateData.supportRate = Math.round(
        (newSupportCount / newTotalVotes) * 100
      );

      // トランザクション内で更新を実行
      transaction.update(politicianRef, updateData);
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

    // Process in parallel for better performance
    const politiciansPromises = querySnapshot.docs.map(
      async (doc) => await convertToPolitician(doc.id, doc.data())
    );

    return await Promise.all(politiciansPromises);
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

    // Process in parallel for better performance
    const politiciansPromises = querySnapshot.docs.map(
      async (doc) => await convertToPolitician(doc.id, doc.data())
    );

    const politicians = await Promise.all(politiciansPromises);

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
  limitCount: number = 15,
  page: number = 1
): Promise<{
  politicians: Politician[];
  lastDocumentId?: string;
  hasMore: boolean;
  currentPage: number;
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

    // Process in parallel for better performance
    const politiciansPromises = querySnapshot.docs.map(
      async (doc) => await convertToPolitician(doc.id, doc.data())
    );

    const politicians = await Promise.all(politiciansPromises);

    // 次のページがあるかどうかを確認
    const hasMore = politicians.length === limitCount;

    const lastVisibleDocument =
      querySnapshot.docs[querySnapshot.docs.length - 1];

    return {
      politicians,
      lastDocumentId: lastVisibleDocument ? lastVisibleDocument.id : undefined,
      hasMore,
      currentPage: page,
    };
  } catch (error) {
    console.error("全政治家取得エラー:", error);
    throw error;
  }
};

// Cache for image URLs to avoid redundant storage calls
const imageUrlCache: Record<string, string> = {};

// Function to convert Firestore data to Politician type
const convertToPolitician = async (
  id: string,
  data: any,
  isDetailPage: boolean = false
): Promise<Politician> => {
  // Create a party object from the affiliation
  const party = {
    id: getPartyID(data.affiliation || ""),
    name: data.affiliation || "",
    color: getPartyColor(data.affiliation || ""),
  };
  //////
  // Calculate support/oppose rates
  const totalVotes = (data.supportCount || 0) + (data.opposeCount || 0);
  const supportRate =
    data.supportRate ||
    (totalVotes > 0
      ? Math.round(((data.supportCount || 0) / totalVotes) * 100)
      : 50); // Default to 50% if no votes or supportRate field

  // Get politician image URL - THIS IS THE KEY CHANGE
  const politicianName = data.name || "";

  // ここが重要な変更点: Firebase Storageから画像を取得
  let imageUrl;

  // キャッシュキーには詳細ページかどうかの情報も含める
  const cacheKey = `detail_${politicianName}`;

  // Check if image URL is already cached for performance
  if (isDetailPage) {
    // Firebase Storageから画像URLを取得
    try {
      const storage = getStorage();
      // 詳細ページか一覧ページかに応じて異なるパスを使用
      const imagePath = `detail_images/${politicianName}.jpg`;

      imageUrl = await getDownloadURL(ref(storage, imagePath));

      // キャッシュに保存して再利用
      imageUrlCache[cacheKey] = imageUrl;
    } catch (error) {
      console.error(
        `Firebase Storage画像取得エラー: ${politicianName} (${
          isDetailPage ? "detail" : "list"
        })`,
        error
      );
      // エラー時はフォールバックとしてimage_urlを使用するか、プレースホルダーを表示
      imageUrl = data.imageUrl || "/api/placeholder/80/80";
    }
  }

  return {
    id,
    name: data.name || "",
    furigana: data.furigana || "",
    position: data.type || "議員",
    region: data.region || "",
    age: data.age || Math.floor(Math.random() * 30) + 35, // Default age if not provided
    party,
    supportRate,
    opposeRate: 100 - supportRate,
    totalVotes: data.totalVotes || totalVotes || 0,
    activity: data.activity || Math.floor(Math.random() * 40) + 50, // Random activity score
    image: imageUrl, // Firebase Storageから取得した画像URLを使用
    trending: data.trending || (Math.random() > 0.5 ? "up" : "down"), // Random trend if not provided
    recentActivity: data.recentActivity || "最近の活動情報",
    totalCommentCount: data.totalCommentCount || 0, // ここを追加
  };
};

// Fetch a politician by ID - modified to handle async image loading
export const fetchPoliticianById = async (
  id: string
): Promise<Politician | null> => {
  try {
    const politicianRef = doc(db, "politicians", id);
    const politicianSnap = await getDoc(politicianRef);

    if (politicianSnap.exists()) {
      // 詳細ページ用にisDetailPage=trueを指定
      return await convertToPolitician(id, politicianSnap.data(), true);
    } else {
      console.error(`Politician with ID ${id} not found`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching politician:", error);
    throw error;
  }
};

// Modified to handle async image loading for multiple politicians
export const fetchPoliticiansWithFilterAndSort = async (
  partyFilter: string,
  sortMethod: string,
  lastDocumentId?: string,
  limitCount: number = 15
): Promise<{
  politicians: Politician[];
  lastDocumentId?: string;
  hasMore: boolean;
}> => {
  try {
    console.log(
      `Fetching politicians: party=${partyFilter}, sort=${sortMethod}, lastDocId=${
        lastDocumentId || "none"
      }`
    );

    const politiciansRef = collection(db, "politicians");
    let q;

    // Define sort field and direction
    let orderByField = "supportRate";
    let orderDirection: OrderByDirection = "desc";

    switch (sortMethod) {
      case "supportDesc":
        orderByField = "supportRate";
        orderDirection = "desc";
        break;
      case "supportAsc":
        orderByField = "supportRate";
        orderDirection = "asc";
        break;
      case "totalVotesDesc":
        orderByField = "totalVotes";
        orderDirection = "desc";
        break;
      default:
        orderByField = "supportRate";
        orderDirection = "desc";
    }

    // Apply party filter if not "all"
    if (partyFilter !== "all") {
      console.log(
        `Filtering by party: "${partyFilter}" and sorting by ${orderByField} ${orderDirection}`
      );

      if (!lastDocumentId) {
        // First page with party filter
        q = query(
          politiciansRef,
          where("affiliation", "==", partyFilter),
          orderBy(orderByField, orderDirection),
          limit(limitCount)
        );
      } else {
        // Subsequent pages with party filter
        const lastDoc = await getDoc(doc(db, "politicians", lastDocumentId));
        q = query(
          politiciansRef,
          where("affiliation", "==", partyFilter),
          orderBy(orderByField, orderDirection),
          startAfter(lastDoc),
          limit(limitCount)
        );
      }
    } else {
      // No party filter, just sort
      console.log(
        `Sorting all politicians by ${orderByField} ${orderDirection}`
      );

      if (!lastDocumentId) {
        // First page without party filter
        q = query(
          politiciansRef,
          orderBy(orderByField, orderDirection),
          limit(limitCount)
        );
      } else {
        // Subsequent pages without party filter
        const lastDoc = await getDoc(doc(db, "politicians", lastDocumentId));
        q = query(
          politiciansRef,
          orderBy(orderByField, orderDirection),
          startAfter(lastDoc),
          limit(limitCount)
        );
      }
    }

    // Execute query
    console.log("Executing Firestore query");
    const querySnapshot = await getDocs(q);
    console.log(`Query returned ${querySnapshot.docs.length} documents`);

    // Map documents to politician objects - Process them in parallel for efficiency
    const politiciansPromises = querySnapshot.docs.map(async (doc) => {
      const data = doc.data();
      return await convertToPolitician(doc.id, data);
    });

    const politicians = await Promise.all(politiciansPromises);

    const hasMore = politicians.length === limitCount;
    const lastVisibleDocument =
      querySnapshot.docs[querySnapshot.docs.length - 1];

    return {
      politicians,
      lastDocumentId: lastVisibleDocument ? lastVisibleDocument.id : undefined,
      hasMore,
    };
  } catch (error) {
    console.error("Error fetching politicians:", error);
    throw error;
  }
};

// Keep other existing functions (getPartyColor, generatePartyId, etc.)
// Make sure to update any other functions that fetch multiple politicians to use the async convertToPolitician

// Rest of the file remains unchanged...
export const incrementPoliticianCommentCount = async (
  politicianId: string
): Promise<void> => {
  try {
    if (!politicianId) {
      console.warn(
        "政治家IDが指定されていないため、コメント数の更新をスキップします"
      );
      return;
    }

    // 存在確認なしで直接更新
    const politicianRef = doc(db, "politicians", politicianId);
    await updateDoc(politicianRef, {
      totalCommentCount: increment(1),
    });

    console.log(`政治家ID: ${politicianId} のコメント数を更新しました`);
  } catch (error) {
    console.error(`政治家のコメント数更新エラー:`, error);
    // エラーをスローせず、ログのみ出力
  }
};
