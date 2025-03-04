// politics_app/src/components/politicians/PoliticianDetail.tsx
import React, { useEffect } from "react";
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
import VoteButtons from "../common/VoteButtons";
import VoteForm from "./VoteForm";
import CommentSection from "../comments/CommentSection";
import PremiumBanner from "../common/PremiumBanner";

const PoliticianDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getPoliticianById,
    handlePartySelect,
    voteType,
    showReasonForm,
    parties,

    setSelectedPolitician,
  } = useData();

  const politician = getPoliticianById(id || "");

  useEffect(() => {
    if (!politician) {
      // Redirect to politicians list if politician not found
      navigate("/politicians");
      return;
    }

    // Set selected politician in context for other components that might need it
    setSelectedPolitician(politician);

    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, [politician, navigate, setSelectedPolitician]);

  if (!politician) {
    return null; // Or a loading state
  }

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
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
                <span className="mx-2">•</span>
                <span>{politician.age}歳</span>
              </div>
              {/* Party badge/button */}
              <div
                className="mt-2 px-3 py-1 rounded-full text-white text-xs inline-flex items-center cursor-pointer"
                style={{ backgroundColor: politician.party.color }}
                onClick={(e) => {
                  e.stopPropagation();
                  const party = parties.find(
                    (p) => p.id === politician.party.id
                  );
                  if (party) {
                    handlePartySelect(party);
                  }
                }}
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
          {!showReasonForm ? <VoteButtons /> : <VoteForm voteType={voteType} />}
        </div>
      </div>
      <PremiumBanner />

      {/* Comments section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
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
