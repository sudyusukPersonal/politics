// src/components/parties/PartyDetail.tsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  ExternalLink,
  MessageSquare,
  FileText,
} from "lucide-react";
import InlineAdBanner from "../ads/InlineAdBanner";
import LoadingAnimation from "../common/LoadingAnimation";
import { Party } from "../../types";
import { ReplyDataProvider } from "../../context/ReplyDataContext";
import { CommentSection } from "../comments/OptimizedCommentSystem";
import EntityRatingsSection from "../common/EntityRatingsSectio";
import UnifiedVoteComponent from "../common/UnifiedVoteComponent";
import { styles } from "../../utils/styleUtils";
import { navigateToPolicyList } from "../../utils/navigationUtils";
import { fetchPartyById } from "../../services/partyService";
import { getVoteFromLocalStorage } from "../../utils/voteStorage";

const PartyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [party, setParty] = useState<Party | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 追加: コメント表示制御のための状態
  const [showComments, setShowComments] = useState(false);

  // 所属議員一覧ページへ遷移する関数
  const navigateToPartyMembers = useCallback(() => {
    if (party) {
      const encodedPartyName = encodeURIComponent(party.name);
      navigate(
        `/politicians?page=1&sort=supportDesc&party=${encodedPartyName}`
      );
    }
  }, [party, navigate]);

  // 政党の政策一覧ページへ遷移する関数
  const navigateToPartyPolicies = useCallback(() => {
    if (party) {
      navigateToPolicyList(navigate, {
        party: party.name,
        sort: "supportDesc",
      });
    }
  }, [party, navigate]);

  // 戻るボタンのハンドラ
  const handleBackToParties = () => {
    navigate("/parties");
  };

  // 政党データの取得
  useEffect(() => {
    const loadParty = async () => {
      if (!id) {
        setError("政党IDが指定されていません");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setShowComments(false); // データ読み込み時にコメント表示をリセット

        // Firestoreから政党データを取得
        const partyData = await fetchPartyById(id);

        if (partyData) {
          setParty(partyData);

          // メインコンテンツ表示後に少し遅れてコメント表示
          setTimeout(() => {
            setShowComments(true);
          }, 200);
        } else {
          setError("指定された政党データが見つかりませんでした");
        }
      } catch (err) {
        console.error("政党データの取得中にエラーが発生しました:", err);
        setError(
          "政党データの読み込みに失敗しました。もう一度お試しください。"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadParty();
    // ページトップにスクロール
    window.scrollTo(0, 0);
  }, [id]);

  // リダイレクト処理（データロード後に政党が見つからない場合）
  useEffect(() => {
    if (!isLoading && !party && !error) {
      navigate("/parties");
    }
  }, [party, isLoading, navigate, error]);

  // モダンなローディング表示
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 min-h-[400px] flex items-center justify-center">
        <LoadingAnimation type="pulse" message="政党情報を読み込んでいます" />
      </div>
    );
  }

  // エラー表示
  if (error || !party) {
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
          {error || "指定されたIDの政党情報を取得できませんでした。"}
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
      {/* ルートレベルでReplyDataProviderをラップ */}
      <ReplyDataProvider>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-fadeIn">
          {/* Party header */}
          <div
            className="p-5 border-b border-gray-100"
            style={{ backgroundColor: `${party.color}10` }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              {/* 党ロゴ、党名、メンバー数、ボタン */}
              <div className="flex flex-col sm:flex-row sm:items-center w-full">
                {/* 党ロゴ - モバイルでセンタリング */}
                <div className="flex justify-center sm:justify-start w-full sm:w-auto">
                  <div
                    className="w-20 h-20 rounded-full mb-4 sm:mb-0 overflow-hidden border-2 flex items-center justify-center"
                    style={{ borderColor: party.color }}
                  >
                    <img
                      src={party.image}
                      alt={party.name}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        // エラー時に元のイニシャル表示に戻す
                        e.currentTarget.style.display = "none";
                      }}
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="sm:ml-6 text-center sm:text-left w-full">
                  <h2
                    className="text-xl font-bold"
                    style={{ color: party.color }}
                  >
                    {party.name}
                  </h2>
                  <div className="flex flex-wrap justify-center sm:justify-start items-center text-sm text-gray-500 mt-1">
                    <span>所属議員: {party.members}名</span>
                  </div>

                  {/* ボタンエリア - モバイルでの等間隔配置 */}
                  <div className="mt-4 sm:mt-2 flex justify-center sm:justify-start w-full">
                    <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                      {/* 所属議員一覧へのボタン */}
                      <button
                        onClick={navigateToPartyMembers}
                        className="group flex items-center justify-center px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
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
                        <span>所属議員一覧</span>
                        <ExternalLink
                          size={12}
                          className="ml-1.5 opacity-70 group-hover:opacity-100 transition-opacity"
                        />
                      </button>

                      {/* 政策一覧へのボタン */}
                      <button
                        onClick={navigateToPartyPolicies}
                        className="group flex items-center justify-center px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
                        style={{
                          backgroundColor: `${party.color}15`,
                          color: party.color,
                          borderColor: `${party.color}30`,
                          border: `1px solid ${party.color}30`,
                        }}
                      >
                        <FileText
                          size={14}
                          className="mr-1.5 opacity-70 group-hover:opacity-100"
                        />
                        <span>政策一覧</span>
                        <ExternalLink
                          size={12}
                          className="ml-1.5 opacity-70 group-hover:opacity-100 transition-opacity"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右側: デスクトップでの総得票数 */}
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

          {/* コメントセクション - 条件付きで表示 */}
          {showComments && (
            <div className={styles.cards.base + " animate-fadeIn"}>
              <div className="p-3">
                <h3 className="font-bold text-lg mb-4 flex items-center">
                  <MessageSquare size={18} className="mr-2 text-indigo-600" />
                  評価理由
                </h3>
                <CommentSection
                  entityType="policy"
                  entityId={party.id}
                  totalCommentCount={party.totalCommentCount}
                />
              </div>
            </div>
          )}
        </div>
      </ReplyDataProvider>
    </section>
  );
};

export default PartyDetail;
