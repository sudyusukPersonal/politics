// src/utils/navigationUtils.ts
import { NavigateFunction } from "react-router-dom";

/**
 * ナビゲーション関連のユーティリティ関数を提供するモジュール
 * DataContextから分離して再利用性を高めています
 */

// 政治家詳細ページへナビゲーションする関数
export const navigateToPolitician = (
  navigate: NavigateFunction,
  politicianId: string
) => {
  navigate(`/politicians/${politicianId}`);
  window.scrollTo(0, 0);
};

// 政党詳細ページへナビゲーションする関数
export const navigateToParty = (
  navigate: NavigateFunction,
  partyId: string
) => {
  navigate(`/parties/${partyId}`);
  window.scrollTo(0, 0);
};

// 政治家一覧へ戻る関数
export const navigateToPoliticians = (
  navigate: NavigateFunction,
  page: number = 1
) => {
  navigate(`/politicians?page=${page}`);
  window.scrollTo(0, 0);
};

// 政党一覧へ戻る関数
export const navigateToParties = (navigate: NavigateFunction) => {
  navigate("/parties");
  window.scrollTo(0, 0);
};

// 政策一覧ページへナビゲーションする関数（フィルタパラメータ付き）
export const navigateToPolicyList = (
  navigate: NavigateFunction,
  params?: {
    party?: string;
    category?: string;
    sort?: string;
  }
) => {
  // パラメータがなければ単純に政策リストページへ遷移
  if (!params) {
    navigate("/policy");
    window.scrollTo(0, 0);
    return;
  }

  // URLパラメータを構築
  const searchParams = new URLSearchParams();

  if (params.party && params.party !== "all") {
    searchParams.set("party", params.party);
  }

  if (params.category && params.category !== "all") {
    searchParams.set("category", params.category);
  }

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  // 構築したパラメータでURLを生成して遷移
  const queryString = searchParams.toString();
  navigate(`/policy${queryString ? `?${queryString}` : ""}`);

  // ページトップにスクロール
  window.scrollTo(0, 0);
};

// 政策詳細ページへナビゲーションする関数
export const navigateToPolicy = (
  navigate: NavigateFunction,
  policyId: string
) => {
  navigate(`/policy/${policyId}`);
  window.scrollTo(0, 0);
};
