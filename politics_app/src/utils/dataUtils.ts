// src/utils/dataUtils.ts
import politiciansData from "../data/politicians_with_id.json";
import { Politician, Party } from "../types";

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

// JSONデータから政党一覧を生成する（キャッシング機能付き）
export const processPartiesData = (): Party[] => {
  // キャッシュがあれば、それを返す（処理の重複を避ける）
  if (cachedParties !== null) {
    return cachedParties;
  }

  console.time("政党データ処理時間");

  // JSONデータから一意の政党リストを抽出
  const uniqueParties = Array.from(
    new Set(politiciansData.map((item) => item.affiliation))
  );

  // 政党データを作成
  const parties = uniqueParties.map((partyName) => {
    const supportRate = Math.floor(Math.random() * 40) + 30; // 30-70%のランダムな支持率
    const partyId = generatePartyId(partyName);

    return {
      id: partyId,
      name: partyName,
      color: getPartyColor(partyName),
      supportRate: supportRate,
      opposeRate: 100 - supportRate, // 支持率と不支持率の合計が100%になるように
      totalVotes: Math.floor(Math.random() * 10000) + 5000, // ランダムな投票数
      members: politiciansData.filter((p) => p.affiliation === partyName)
        .length,
      keyPolicies: getRandomPolicies(partyName),
      description: `${partyName}の政策と理念に基づいた政党です。`,
    };
  });

  console.timeEnd("政党データ処理時間");

  // 結果をキャッシュして今後の呼び出しで再利用できるようにする
  cachedParties = parties;

  return parties;
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
      const partyId = generatePartyId(item.affiliation);

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
          id: partyId,
          name: item.affiliation,
          color: getPartyColor(item.affiliation),
        },
        supportRate: Math.floor(Math.random() * 40) + 30, // 30-70%のランダムな支持率
        opposeRate: 0, // あとで計算
        totalVotes: Math.floor(Math.random() * 5000) + 2000, // ランダムな投票数
        activity: Math.floor(Math.random() * 40) + 50, // 50-90のランダムな活動指数
        image: item.image_url || getLocalImagePath(item.name), // 画像URLがある場合はそれを使用、無い場合はローカル画像を参照
        trending: Math.random() > 0.5 ? "up" : "down", // ランダムなトレンド
        recentActivity: "最近の活動情報",
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

// キャッシュをクリアする関数（データ更新時などに使用）
export const clearDataCache = () => {
  cachedPoliticians = null;
  cachedParties = null;
  console.log("データキャッシュをクリアしました");
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

// 政党ごとにランダムな政策を生成する補助関数
const getRandomPolicies = (partyName: string): string[] => {
  const allPolicies = [
    "経済再生",
    "社会保障拡充",
    "教育改革",
    "デジタル化推進",
    "環境保護",
    "地方創生",
    "外交安全保障",
    "憲法改正",
    "財政再建",
    "行政改革",
    "農業振興",
    "中小企業支援",
    "エネルギー政策",
    "少子化対策",
    "働き方改革",
  ];

  // 政党ごとに3-5個のランダムな政策を選ぶ
  const count = Math.floor(Math.random() * 3) + 3;
  const shuffled = [...allPolicies].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
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
export const getPartyById = (id: string): Party | undefined => {
  // まずキャッシュをチェック
  if (!cachedParties) {
    processPartiesData(); // キャッシュがなければデータを処理
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
