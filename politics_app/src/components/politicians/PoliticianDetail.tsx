// src/components/politicians/PoliticianDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building,
  Calendar,
  Activity,
  ThumbsUp,
  ThumbsDown,
  Eye,
  MessageSquare,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import TrendIcon from "../common/TrendIcon";
// import VoteButtons from "../common/VoteButtons";
// import VoteForm from "./VoteForm";
import UnifiedVoteComponent from "../common/UnifiedVoteComponent";

import { CommentSection } from "../comments/OptimizedCommentSystem";
import LoadingAnimation from "../common/LoadingAnimation";
import { Politician } from "../../types";
import { fetchPoliticianById } from "../../services/politicianService";

const PoliticianDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { handlePartySelect, voteType, showReasonForm, setSelectedPolitician } =
    useData();

  // Local state for politician data
  const [politician, setPolitician] = useState<Politician | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch politician data from Firebase when component mounts or ID changes
  useEffect(() => {
    const loadPolitician = async () => {
      if (!id) {
        setError("政治家IDが指定されていません");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch politician data from Firebase
        const politicianData = await fetchPoliticianById(id);
        console.log(politicianData);

        if (politicianData) {
          setPolitician(politicianData);
          // Update in DataContext so other components can access it
          setSelectedPolitician(politicianData);
        } else {
          setError("指定された政治家データが見つかりませんでした");
        }
      } catch (err) {
        console.error("政治家データの取得中にエラーが発生しました:", err);
        setError(
          "政治家データの読み込みに失敗しました。もう一度お試しください。"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPolitician();
    // Scroll to top when loading a new politician
    window.scrollTo(0, 0);
  }, [id, setSelectedPolitician]);

  // 政党詳細ページへの移動
  const handlePartyClick = () => {
    if (politician) {
      navigate(`/parties/${politician.party.id}`);
    }
  };

  // モダンなローディング表示
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 min-h-[400px] flex items-center justify-center">
        <LoadingAnimation type="dots" message="政治家情報を読み込んでいます" />
      </div>
    );
  }

  // エラー表示
  if (error || !politician) {
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
          政治家が見つかりません
        </h3>
        <p className="mt-2 text-gray-600">
          {error || "指定されたIDの政治家情報を取得できませんでした。"}
        </p>
        <button
          onClick={() => navigate("/politicians")}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          政治家一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-fadeIn">
        <div className="p-5">
          {/* Politician header with image and basic info */}
          <div className="flex flex-col sm:flex-row sm:items-start">
            <div className="relative mx-auto sm:mx-0 mb-4 sm:mb-0">
              <div
                className="absolute inset-0 rounded-full blur-sm opacity-30"
                style={{ backgroundColor: politician.party.color }}
              ></div>
              <img
                src={politician.image}
                alt={politician.name}
                className="w-20 h-20 relative rounded-full object-cover border-2 z-10"
                style={{ borderColor: politician.party.color }}
              />
            </div>
            <div className="sm:ml-6 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <h2 className="text-xl font-bold">{politician.name}</h2>
                <div className="mt-1 sm:mt-0 sm:ml-3">
                  <TrendIcon trend={politician.trending} />
                </div>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start items-center text-sm text-gray-500 mt-1">
                <span>{politician.position}</span>
                {politician.region && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="truncate">{politician.region}</span>
                  </>
                )}
                {politician.furigana && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="text-gray-400">{politician.furigana}</span>
                  </>
                )}
              </div>
              {/* Party badge/button */}
              <div
                className="mt-2 px-3 py-1 rounded-full text-white text-xs inline-flex items-center cursor-pointer"
                style={{ backgroundColor: politician.party.color }}
                onClick={handlePartyClick}
              >
                <Building size={12} className="mr-1" />
                {politician.party.name}
              </div>
            </div>
          </div>

          {/* Approval ratings section */}
          <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <h3 className="font-bold text-gray-700 mb-1 sm:mb-0">市民評価</h3>
              <span className="text-sm text-gray-500">
                総投票数: {politician.totalVotes.toLocaleString()}
              </span>
            </div>

            {/* Support/Oppose stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <div className="bg-white rounded-lg p-3 shadow-sm border border-green-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <ThumbsUp size={16} className="text-green-500 mr-2" />
                    <span className="text-sm font-medium">支持</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    {politician.supportRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${politician.supportRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm border border-red-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <ThumbsDown size={16} className="text-red-500 mr-2" />
                    <span className="text-sm font-medium">不支持</span>
                  </div>
                  <span className="text-xl font-bold text-red-600">
                    {politician.opposeRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                  <div
                    className="h-full rounded-full bg-red-500"
                    style={{ width: `${politician.opposeRate}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Combined progress bar */}
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex my-3">
              <div
                className="h-full rounded-l-full transition-all duration-700 ease-in-out"
                style={{
                  width: `${politician.supportRate}%`,
                  backgroundColor: "#10B981",
                }}
              ></div>
              <div
                className="h-full rounded-r-full transition-all duration-700 ease-in-out"
                style={{
                  width: `${politician.opposeRate}%`,
                  backgroundColor: "#EF4444",
                }}
              ></div>
            </div>

            {/* Activity metrics */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500">
              <span className="flex items-center mb-1 sm:mb-0">
                <Eye size={12} className="mr-1" />
                最近の活動: {politician.recentActivity}
              </span>
              <span className="flex items-center">
                <Activity size={12} className="mr-1" />
                活動指数: {politician.activity}
              </span>
            </div>
          </div>

          {/* Vote buttons or vote form */}
          {/* {!showReasonForm ? <VoteButtons /> : <VoteForm voteType={voteType} />} */}
          <UnifiedVoteComponent
            entityType="politician"
            entityId={politician.id}
          />
        </div>
      </div>

      {/* Comments section */}
      <div
        className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-fadeIn"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="p-4">
          <h3 className="font-bold text-lg mb-4 flex items-center">
            <MessageSquare size={18} className="mr-2 text-indigo-600" />
            評価理由
          </h3>

          <CommentSection />
        </div>
      </div>
    </section>
  );
};

export default PoliticianDetail;
