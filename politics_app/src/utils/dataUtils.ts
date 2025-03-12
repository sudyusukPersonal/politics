// src/utils/dataUtils.ts
import politiciansData from "../data/merged_politicians.json";
import { Politician, Party } from "../types";

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

// JSONデータから政党一覧を生成する
export const processPartiesData = (): Party[] => {
  // JSONデータから一意の政党リストを抽出
  const uniqueParties = Array.from(
    new Set(politiciansData.map((item) => item.affiliation))
  );

  return uniqueParties.map((partyName) => {
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
};

// JSONデータを処理してアプリケーションのデータモデルに合わせる
export const processPoliticiansData = (): Politician[] => {
  return politiciansData
    .filter(
      (item): item is typeof item & { name: string } => item.name !== undefined
    )
    .map((item, index) => {
      const partyId = generatePartyId(item.affiliation);

      return {
        id: `p${index + 1}`, // 一意のIDを生成
        name: item.name,
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
        image: getLocalImagePath(item.name), // public/images/内の画像を参照
        trending: Math.random() > 0.5 ? "up" : "down", // ランダムなトレンド
        recentActivity: "最近の活動情報",
      };
    })
    .map((politician) => {
      // 支持率と不支持率の合計が100%になるように調整
      politician.opposeRate = 100 - politician.supportRate;
      return politician;
    });
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

// 特定の政党に所属する政治家を取得する
export const getPoliticiansByParty = (partyId: string): Politician[] => {
  const allPoliticians = processPoliticiansData();
  return allPoliticians.filter((politician) => politician.party.id === partyId);
};

// 特定のIDの政治家を取得する
export const getPoliticianById = (id: string): Politician | undefined => {
  const allPoliticians = processPoliticiansData();
  return allPoliticians.find((politician) => politician.id === id);
};

// 特定のIDの政党を取得する
export const getPartyById = (id: string): Party | undefined => {
  const allParties = processPartiesData();
  return allParties.find((party) => party.id === id);
};
