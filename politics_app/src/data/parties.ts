import { Party } from "../types";

export const parties: Party[] = [
  {
    id: "party1",
    name: "未来創造党",
    color: "#4361EE",
    supportRate: 52,
    opposeRate: 48,
    totalVotes: 12478,
    members: 84,
    keyPolicies: ["教育改革", "デジタル化推進", "環境保護"],
    description:
      "技術革新と持続可能な発展を掲げ、教育とデジタル化を通じた社会変革を目指す政党。特に若年層の支持を集めている。",
  },
  {
    id: "party2",
    name: "国民連合",
    color: "#F72585",
    supportRate: 38,
    opposeRate: 62,
    totalVotes: 9341,
    members: 67,
    keyPolicies: ["経済再生", "社会保障拡充", "伝統文化保護"],
    description:
      "経済成長と社会保障の充実を重視し、日本の伝統的価値観を守ることを主張する政党。中高年層を中心に支持基盤を持つ。",
  },
  {
    id: "party3",
    name: "市民第一党",
    color: "#7209B7",
    supportRate: 61,
    opposeRate: 39,
    totalVotes: 15023,
    members: 103,
    keyPolicies: ["地方分権", "透明性向上", "持続可能な開発"],
    description:
      "地方自治体への権限移譲や政治の透明性向上を訴え、草の根の市民運動から発展した比較的新しい政党。環境問題にも積極的に取り組んでいる。",
  },
];
