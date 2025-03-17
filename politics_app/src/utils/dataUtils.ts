// src/utils/dataUtils.ts
import politiciansData from "../data/politicians_with_id.json";
import { Politician, Party } from "../types";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseConfig"; // Firebaseの設定をインポート

// キャッシング用のグローバル変数
let cachedPoliticians: Politician[] | null = null;
let cachedParties: Party[] | null = null;

// 政党ごとの色を設定する関数
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

// 一意の政党IDを生成する関数
const generatePartyId = (partyName: string): string => {
  return `party-${partyName.replace(/\s+/g, "-")}`;
};

// ローカル画像パスを取得する関数
const getLocalImagePath = (name: string): string => {
  try {
    // public/images/の画像パスを返す
    // ファイル名にスペースなどが含まれているため、エンコードして安全なURLにする
    return `/images/${encodeURIComponent(name)}.jpg`;
  } catch (error) {
    // 画像が見つからない場合はプレースホルダー画像を返す
    console.warn(`画像が見つかりません: ${name}.jpg`);
    return "/api/placeholder/80/80";
  }
};

// Firestoreから政党データを取得して処理する（キャッシング機能付き）
export const processPartiesData = async (): Promise<Party[]> => {
  // キャッシュがあれば、それを返す（処理の重複を避ける）
  if (cachedParties !== null) {
    return cachedParties;
  }

  try {
    // Firestoreのpartiesコレクションからデータを取得
    const partiesCollection = collection(db, "parties");
    const partiesSnapshot = await getDocs(partiesCollection);

    // 取得したデータを処理
    const parties = partiesSnapshot.docs.map((doc) => {
      const data = doc.data();
      const partyName = data.name;

      return {
        id: doc.id, // ドキュメントIDを政党IDとして使用
        name: partyName,
        color: getPartyColor(partyName),
        supportRate: data.supportCount || 0,
        opposeRate: data.oppositionCount || 0,
        totalVotes: (data.supportCount || 0) + (data.oppositionCount || 0),
        // 既存の方法でメンバー数をカウント（JSONデータから）
        members: politiciansData.filter((p) => p.affiliation === partyName)
          .length,
        keyPolicies: data.majorPolicies || [],
        description:
          data.overview || `${partyName}の政策と理念に基づいた政党です。`,
      };
    });

    // 結果をキャッシュして今後の呼び出しで再利用できるようにする
    cachedParties = parties;

    return parties;
  } catch (error) {
    console.error("Firestoreからの政党データ取得に失敗しました:", error);
    return [];
  }
};

// JSONデータを処理してアプリケーションのデータモデルに合わせる（キャッシング機能付き）
export const processPoliticiansData = (): Politician[] => {
  // キャッシュがあれば、それを返す（処理の重複を避ける）
  if (cachedPoliticians !== null) {
    return cachedPoliticians;
  }

  console.time("政治家データ処理時間");

  // 政治家データを処理
  const politicians = politiciansData
    .filter(
      (item): item is typeof item & { name: string } => item.name !== undefined
    )
    .map((item, index) => {
      // const partyId = generatePartyId(item.affiliation);

      // ふりがなフィールドのサポート追加
      // JSONデータから直接furiganaを取得（存在する場合）
      const furigana = item.furigana || extractFurigana(item.name);

      return {
        id: item.id, // 一意のIDを生成
        name: item.name,
        furigana: furigana, // ふりがなフィールドを追加
        position: item.type || "議員",
        age: Math.floor(Math.random() * 30) + 35, // 35-65の乱数（元データにないため）
        party: {
          id: getPartyID(item.affiliation),
          name: item.affiliation,
          color: getPartyColor(item.affiliation),
        },
        supportRate: Math.floor(Math.random() * 40) + 30, // 30-70%のランダムな支持率
        opposeRate: 0, // あとで計算
        totalVotes: Math.floor(Math.random() * 5000) + 2000, // ランダムな投票数
        activity: Math.floor(Math.random() * 40) + 50, // 50-90のランダムな活動指数
        image: getLocalImagePath(item.name) || item.image_url, // 画像URLがある場合はそれを使用、無い場合はローカル画像を参照
        trending: Math.random() > 0.5 ? "up" : "down", // ランダムなトレンド
        recentActivity: "最近の活動情報",
        region: item.region || "未設定", // 地域情報を追加
      };
    })
    .map((politician) => {
      // 支持率と不支持率の合計が100%になるように調整
      politician.opposeRate = 100 - politician.supportRate;
      return politician;
    });

  console.timeEnd("政治家データ処理時間");

  // 結果をキャッシュして今後の呼び出しで再利用できるようにする
  cachedPoliticians = politicians;

  return politicians;
};

// 名前からふりがなを抽出する補助関数
const extractFurigana = (name: string): string => {
  if (!name) return "";

  // カタカナとひらがなの正規表現
  const kanaRegex = /[\u3040-\u30FF]+/g;
  const matches = name.match(kanaRegex);

  if (matches) {
    return matches.join("");
  }

  return "";
};

// キャッシュをクリアする関数（データ更新時などに使用）
export const clearDataCache = () => {
  cachedPoliticians = null;
  cachedParties = null;
  console.log("データキャッシュをクリアしました");
};

// 特定の政党に所属する政治家を取得する（キャッシュ利用）
export const getPoliticiansByParty = (partyId: string): Politician[] => {
  // まずキャッシュをチェック
  if (!cachedPoliticians) {
    processPoliticiansData(); // キャッシュがなければデータを処理
  }

  // キャッシュから直接フィルタリング
  return (cachedPoliticians || []).filter(
    (politician) => politician.party.id === partyId
  );
};

// 特定のIDの政治家を取得する（キャッシュ利用）
export const getPoliticianById = (id: string): Politician | undefined => {
  // まずキャッシュをチェック
  if (!cachedPoliticians) {
    processPoliticiansData(); // キャッシュがなければデータを処理
  }

  // キャッシュから直接検索
  return (cachedPoliticians || []).find((politician) => politician.id === id);
};

// 特定のIDの政党を取得する（キャッシュ利用）
export const getPartyById = async (id: string): Promise<Party | undefined> => {
  // まずキャッシュをチェック
  if (!cachedParties) {
    await processPartiesData(); // キャッシュがなければデータを処理
  }

  // キャッシュから直接検索
  return (cachedParties || []).find((party) => party.id === id);
};

// キーワードで政治家を検索する（名前とふりがなで部分一致検索）
export const searchPoliticians = (keyword: string): Politician[] => {
  if (!keyword.trim()) return [];

  // まずキャッシュをチェック
  if (!cachedPoliticians) {
    processPoliticiansData(); // キャッシュがなければデータを処理
  }

  const searchTerm = keyword.toLowerCase();

  // キャッシュから直接フィルタリング
  return (cachedPoliticians || []).filter((politician) => {
    const name = politician.name.toLowerCase();
    const furigana = politician.furigana?.toLowerCase() || "";

    return name.includes(searchTerm) || furigana.includes(searchTerm);
  });
};
