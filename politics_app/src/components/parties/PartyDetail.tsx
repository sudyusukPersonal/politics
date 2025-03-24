// src/components/parties/PartyDetail.tsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Users, ExternalLink, MessageSquare } from "lucide-react";
import { useData } from "../../context/DataContext";
import InlineAdBanner from "../ads/InlineAdBanner";
import LoadingAnimation from "../common/LoadingAnimation";
import { Party } from "../../types";
import { ReplyDataProvider } from "../../context/ReplyDataContext";
import { CommentSection } from "../comments/OptimizedCommentSystem";
import EntityRatingsSection from "../common/EntityRatingsSectio";
import UnifiedVoteComponent from "../common/UnifiedVoteComponent";
import { styles } from "../../utils/styleUtils";

const PartyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    handleBackToParties,
    setSelectedParty,
    getPartyById,
    dataInitialized,
  } = useData();

  const [party, setParty] = useState<Party | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 所属議員一覧ページへ遷移する関数
  const navigateToPartyMembers = useCallback(() => {
    if (party) {
      const encodedPartyName = encodeURIComponent(party.name);
      navigate(
        `/politicians?page=1&sort=supportDesc&party=${encodedPartyName}`
      );
    }
  }, [party, navigate]);

  // グローバルデータから政党データを取得（メモ化）
  const selectedParty = useMemo(() => {
    if (!id || !dataInitialized) return null;
    return getPartyById(id);
  }, [id, dataInitialized, getPartyById]);

  // データ読み込み状態の管理
  useEffect(() => {
    if (dataInitialized) {
      if (selectedParty) {
        setParty(selectedParty);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [dataInitialized, selectedParty]);

  // 選択された政党をコンテキストに設定
  useEffect(() => {
    if (party) {
      setSelectedParty(party);
      window.scrollTo(0, 0);
    }
  }, [party, setSelectedParty]);

  // リダイレクト処理（データロード後に政党が見つからない場合）
  useEffect(() => {
    if (!isLoading && !party && dataInitialized) {
      navigate("/parties");
    }
  }, [party, isLoading, navigate, dataInitialized]);

  // モダンなローディング表示
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 min-h-[400px] flex items-center justify-center">
        <LoadingAnimation type="pulse" message="政党情報を読み込んでいます" />
      </div>
    );
  }

  if (!party) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <div className="text-red-500 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          政党が見つかりません
        </h3>
        <p className="mt-2 text-gray-600">
          指定されたIDの政党情報を取得できませんでした。
        </p>
        <button
          onClick={() => navigate("/parties")}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          政党一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={handleBackToParties}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>政党一覧に戻る</span>
        </button>
      </div>

      {/* ルートレベルでReplyDataProviderをラップ */}
      <ReplyDataProvider>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-fadeIn">
          {/* Party header */}
          <div
            className="p-5 border-b border-gray-100"
            style={{ backgroundColor: `${party.color}10` }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              {/* 左側: 党ロゴ、党名、メンバー数、ボタン (デスクトップ) */}
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 sm:mb-0"
                  style={{ backgroundColor: party.color }}
                >
                  {party.name.charAt(0)}
                </div>
                <div className="sm:ml-6 text-center sm:text-left">
                  <h2
                    className="text-xl font-bold"
                    style={{ color: party.color }}
                  >
                    {party.name}
                  </h2>
                  <div className="flex flex-wrap justify-center sm:justify-start items-center text-sm text-gray-500 mt-1">
                    <span>所属議員: {party.members}名</span>
                    <span className="mx-2 hidden sm:inline">•</span>
                    <span className="sm:hidden">
                      総投票数: {party.totalVotes.toLocaleString()}
                    </span>
                  </div>

                  {/* デスクトップ: ボタンを党名の横に配置 */}
                  <div className="mt-2">
                    <button
                      onClick={navigateToPartyMembers}
                      className="group flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
                      style={{
                        backgroundColor: `${party.color}15`,
                        color: party.color,
                        borderColor: `${party.color}30`,
                        border: `1px solid ${party.color}30`,
                      }}
                    >
                      <Users
                        size={14}
                        className="mr-1.5 opacity-70 group-hover:opacity-100"
                      />
                      <span>所属議員一覧へ</span>
                      <ExternalLink
                        size={12}
                        className="ml-1.5 opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* 右側: デスクトップでの総得票数 */}
              <div className="hidden sm:flex items-center justify-end">
                <span className="text-sm text-gray-500">
                  総投票数: {party.totalVotes.toLocaleString()}
                </span>
              </div>
            </div>

            {/* EntityRatingsSection（支持率・不支持率表示） */}
            <EntityRatingsSection
              supportRate={party.supportRate}
              opposeRate={party.opposeRate}
              totalVotes={party.totalVotes}
            />

            {/* 投票コンポーネント */}
            <UnifiedVoteComponent entityType="party" entityId={party.id} />

            {/* Ad banner */}
            <InlineAdBanner format="large-banner" showCloseButton={true} />

            {/* Party description */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700">政党概要</h3>
              <p className="text-sm text-gray-600 mt-1">{party.description}</p>
            </div>

            {/* Key policies */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                主要政策
              </h3>
              <div className="flex flex-wrap gap-2">
                {party.keyPolicies.map((policy, i) => (
                  <span
                    key={i}
                    className="text-xs py-1 px-3 rounded-full border"
                    style={{
                      backgroundColor: `${party.color}15`,
                      borderColor: `${party.color}30`,
                      color: party.color,
                    }}
                  >
                    {policy}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* コメントセクション - 同じReplyDataProviderコンテキスト内 */}
          <div
            className={styles.cards.base + " animate-fadeIn"}
            style={{ animationDelay: "0.2s" }}
          >
            <div className="p-3">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <MessageSquare size={18} className="mr-2 text-indigo-600" />
                評価理由
              </h3>

              <CommentSection entityType="party" entityId={party.id} />
            </div>
          </div>
        </div>
      </ReplyDataProvider>
    </section>
  );
};

export default PartyDetail;
