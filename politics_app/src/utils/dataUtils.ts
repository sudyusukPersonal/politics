// src/utils/dataUtils.ts
import politiciansData from "../data/politicians_processed.json";
import { Politician, Party } from "../types";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseConfig"; // Firebaseの設定をインポート

// キャッシング用のグローバル変数
let cachedPoliticians: Politician[] | null = null;
let cachedParties: Party[] | null = null;

// 政党ごとの色を設定する関数
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
    case "日本保守党":
      return "#00BFFF"; // 黄色
    default:
      return "#808080"; // グレー
  }
};

export const getPartyID = (affiliation: string): string => {
  switch (affiliation) {
    case "自由民主党":
      return "pZJ4UiwBC5DsYGiQKjIO"; // 青
    case "立憲民主党":
      return "BoxdMFpJBC6bTGYJ9zCA"; // 赤
    case "公明党":
      return "L5jBD6a2BSBJIMCMx7hF"; // 紫
    case "日本維新の会":
      return "z13CDRj4DASfG7VOMt29"; // オレンジ
    case "国民民主党":
      return "hs4jWlLgLgulQiKRTJDr"; // 水色
    case "日本共産党":
      return "8HaVrxHMjnYnWzQTabYZ"; // 赤
    case "れいわ新選組":
      return "HQh3QrLCkpshhlMItGkp"; // 緑
    case "社民党":
      return "GThYfAHQTQjWsiyX9w9I"; // 青緑
    case "参政党":
      return "F4PhicYTj6U6YcFiNyYB"; // 黄色
    case "日本保守党":
      return "wPNEWyTnmbkz0ni7AIOa"; // 黄色
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
    return `/cm_images/${encodeURIComponent(name)}.jpg`;
  } catch (error) {
    // 画像が見つからない場合はプレースホルダー画像を返す
    console.warn(`画像が見つかりません: ${name}.jpg`);
    return "/api/placeholder/80/80";
  }
};

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
        position: "",
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
        image: getLocalImagePath(item.name) || "", // 画像URLがある場合はそれを使用、無い場合はローカル画像を参照
        trending: Math.random() > 0.5 ? "up" : "down", // ランダムなトレンド
        recentActivity: "最近の活動情報",
        region: "", // 地域情報を追加
      };
    })
    .map((politician) => {
      // 支持率と不支持率の合計が100%になるように調整
      politician.opposeRate = 100 - politician.supportRate;
      return politician;
    });

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

// src/utils/dataUtils.ts の末尾に追加

/**
 * 最近見た政治家のデータをlocalStorageに保存する
 * 最新の閲覧が先頭に来るように並び替え、最大5件まで保持する
 */
export const saveRecentlyViewedPolitician = (politician: {
  id: string;
  name: string;
  position?: string; // positionフィールドを追加
  totalCommentCount?: number;
  party?: {
    id: string;
    name: string;
    color?: string;
  };
  supportRate?: number;
  opposeRate?: number;
  totalVotes?: number;
  trending?: string;
}) => {
  try {
    // localStorage から既存のデータを取得
    const recentlyViewedString = localStorage.getItem(
      "recentlyViewedPoliticians"
    );
    let recentlyViewed: any[] = [];

    if (recentlyViewedString) {
      recentlyViewed = JSON.parse(recentlyViewedString);
    }

    // 既に同じIDが存在する場合は一度削除（重複を防ぐため）
    const existingIndex = recentlyViewed.findIndex(
      (item) => item.id === politician.id
    );
    if (existingIndex !== -1) {
      recentlyViewed.splice(existingIndex, 1);
    }

    // 政党情報の確認と修正
    const partyInfo = politician.party || { name: "不明", id: "unknown" };
    // 政党名からカラーを取得（既存のカラーがあればそれを使用、なければ関数から取得）
    const partyColor = partyInfo.color || getPartyColor(partyInfo.name);

    // 新しい項目を先頭に追加（拡張情報付き）
    recentlyViewed.unshift({
      id: politician.id,
      name: politician.name,
      position: politician.position || "", // positionフィールドを保存
      totalCommentCount: politician.totalCommentCount || 0,
      party: {
        id: partyInfo.id,
        name: partyInfo.name,
        color: partyColor, // 政党カラーを確実に設定
      },
      supportRate: politician.supportRate || 0,
      opposeRate: politician.opposeRate || 0,
      totalVotes: politician.totalVotes || 0,
      trending: politician.trending || "none",
      timestamp: Date.now(),
    });

    // 最大5件まで保持
    if (recentlyViewed.length > 5) {
      recentlyViewed = recentlyViewed.slice(0, 5);
    }

    // localStorageに保存
    localStorage.setItem(
      "recentlyViewedPoliticians",
      JSON.stringify(recentlyViewed)
    );
  } catch (error) {
    console.error("LocalStorageへの保存に失敗しました:", error);
  }
};
export const getRecentlyViewedPoliticians = () => {
  try {
    const recentlyViewedString = localStorage.getItem(
      "recentlyViewedPoliticians"
    );
    if (!recentlyViewedString) {
      return [];
    }

    return JSON.parse(recentlyViewedString);
  } catch (error) {
    console.error("LocalStorageからの読み込みに失敗しました:", error);
    return [];
  }
};
/**
 * localStorageから最近見た政治家のIDリストを取得する
 * 閲覧した順（新しい順）で返される
 */
export const getRecentlyViewedPoliticianIds = (): string[] => {
  try {
    const recentlyViewedString = localStorage.getItem(
      "recentlyViewedPoliticians"
    );
    if (!recentlyViewedString) {
      return [];
    }

    const recentlyViewed = JSON.parse(recentlyViewedString);
    return recentlyViewed.map((item: { id: string }) => item.id);
  } catch (error) {
    console.error("LocalStorageからの読み込みに失敗しました:", error);
    return [];
  }
};

export const saveRecentlyViewedPolicy = (policy: {
  id: string;
  title: string;
}) => {
  try {
    // localStorage から既存のデータを取得
    const recentlyViewedString = localStorage.getItem("recentlyViewedPolicies");
    let recentlyViewed: { id: string; title: string; timestamp: number }[] = [];

    if (recentlyViewedString) {
      recentlyViewed = JSON.parse(recentlyViewedString);
    }

    // 既に同じIDが存在する場合は一度削除
    const existingIndex = recentlyViewed.findIndex(
      (item) => item.id === policy.id
    );
    if (existingIndex !== -1) {
      recentlyViewed.splice(existingIndex, 1);
    }

    // 新しい項目を先頭に追加（タイムスタンプ付き）
    recentlyViewed.unshift({
      id: policy.id,
      title: policy.title,
      timestamp: Date.now(),
    });

    // 最大5件まで保持
    if (recentlyViewed.length > 5) {
      recentlyViewed = recentlyViewed.slice(0, 5);
    }

    // localStorageに保存
    localStorage.setItem(
      "recentlyViewedPolicies",
      JSON.stringify(recentlyViewed)
    );

    console.log("最近見た政策を保存しました:", policy.title);
  } catch (error) {
    console.error("LocalStorageへの政策保存に失敗しました:", error);
  }
};

// 最近見た政策のIDリストを取得
export const getRecentlyViewedPolicyIds = (): string[] => {
  try {
    const recentlyViewedString = localStorage.getItem("recentlyViewedPolicies");
    if (!recentlyViewedString) {
      return [];
    }

    const recentlyViewed = JSON.parse(recentlyViewedString);
    return recentlyViewed.map((item: { id: string }) => item.id);
  } catch (error) {
    console.error("LocalStorageからの政策読み込みに失敗しました:", error);
    return [];
  }
};
