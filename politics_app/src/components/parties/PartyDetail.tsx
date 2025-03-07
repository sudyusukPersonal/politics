// politics_app/src/components/parties/PartyDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Activity,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import PoliticianCard from "../politicians/PoliticianCard";
import InlineAdBanner from "../ads/InlineAdBanner";
import { Politician } from "../../types";

const PartyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getPartyById,
    handleBackToParties,
    getPoliticiansByParty,
    getSortedPoliticians,
    sortMethod,
    handleSortChange,
    setSelectedParty,
  } = useData();

  interface Party {
    id: string;
    name: string;
    color: string;
    supportRate: number;
    opposeRate: number;
    totalVotes: number;
    members: number;
    keyPolicies: string[];
    description: string;
  }

  interface Politician {
    id: string;
    name: string;
    position: string;
    age: number;
    party: {
      id: string;
      name: string;
      color: string;
    };
    supportRate: number;
    opposeRate: number;
    totalVotes: number;
    activity: number;
    image: string;
    trending: string;
    recentActivity: string;
  }

  interface PartyResponse {
    party: Party;
    members: Politician[];
  }

  const [pol, setPol] = useState<Party | null>(null);
  const [men, setMen] = useState<Politician[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPoliticians = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:8080/parties/" + id);
        console.log("リクエストしたよ");
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data: PartyResponse = await response.json();
        setPol(data.party);
        setMen(data.members);
      } catch (error) {
        console.error("Failed to fetch politicians:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPoliticians();
  }, [id]);

  useEffect(() => {
    // データ読み込み中はチェックしない
    if (isLoading) return;

    // データ読み込み完了後、政治家が見つからなかった場合のみリダイレクト
    if (!pol) {
      navigate("/politicians");
      return;
    }

    setSelectedParty(pol);
    window.scrollTo(0, 0);
  }, [pol, isLoading, navigate, setSelectedParty]);

  const party = getPartyById(id || "");

  // Get politicians belonging to this party
  ///////////↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓政党ユーザーはバックエンドで取得↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓//////
  const sortedPartyPoliticians = getSortedPoliticians(men);

  return (
    <section className="space-y-4">
      <div className="flex items-center mb-2">
        <button
          onClick={handleBackToParties}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>政党一覧に戻る</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {/* Party header */}
        <div
          className="p-5 border-b border-gray-100"
          style={{ backgroundColor: `${pol?.color}10` }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 sm:mb-0"
              style={{ backgroundColor: pol?.color }}
            >
              {pol?.name.charAt(0)}
            </div>
            <div className="sm:ml-4">
              <h2 className="text-xl font-bold" style={{ color: pol?.color }}>
                {pol?.name}
              </h2>
              <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1">
                <span>所属議員: {men.length}名</span>
                <span className="mx-2 hidden sm:inline">•</span>
                <span>総投票数: {pol?.totalVotes.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            {/* Support/oppose stats */}
            <div className="mb-2 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <div className="flex items-center">
                <ThumbsUp size={14} className="text-green-500 mr-1" />
                <span className="text-sm font-medium">支持率: </span>
                <span className="font-bold ml-1 text-green-600">
                  {pol?.supportRate}%
                </span>
              </div>
              <div className="flex items-center">
                <ThumbsDown size={14} className="text-red-500 mr-1" />
                <span className="text-sm font-medium">不支持率: </span>
                <span className="font-bold ml-1 text-red-600">
                  {pol?.opposeRate}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
              <div
                className="h-full rounded-l-full"
                style={{
                  width: `${pol?.supportRate}%`,
                  backgroundColor: "#10B981",
                }}
              ></div>
              <div
                className="h-full rounded-r-full"
                style={{
                  width: `${pol?.opposeRate}%`,
                  backgroundColor: "#EF4444",
                }}
              ></div>
            </div>
          </div>

          {/* Ad banner */}
          <InlineAdBanner format="large-banner" showCloseButton={true} />

          {/* pol? description */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">政党概要</h3>
            <p className="text-sm text-gray-600 mt-1">{pol?.description}</p>
          </div>

          {/* Key policies */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">主要政策</h3>
            <div className="flex flex-wrap gap-2">
              {pol?.keyPolicies.map((policy: string, i: number) => (
                <span
                  key={i}
                  className="text-xs py-1 px-3 rounded-full border"
                  style={{
                    backgroundColor: `${pol?.color}15`,
                    borderColor: `${pol?.color}30`,
                    color: pol?.color,
                  }}
                >
                  {policy}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Party members */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 flex items-center">
            <Users size={18} className="mr-2 text-indigo-600" />
            所属議員
          </h2>

          {/* Sorting dropdown */}
          <div className="relative">
            <button
              className="flex items-center bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
              onClick={() => {
                const element = document.getElementById("party-sort-dropdown");
                if (element) {
                  element.classList.toggle("hidden");
                }
              }}
            >
              <Filter size={14} className="mr-1.5" />
              <span>
                {sortMethod === "supportDesc"
                  ? "支持率（高い順）"
                  : sortMethod === "supportAsc"
                  ? "支持率（低い順）"
                  : sortMethod === "activityDesc"
                  ? "活動指数（高い順）"
                  : "ソート基準"}
              </span>
            </button>

            {/* Sort dropdown options */}
            <div
              id="party-sort-dropdown"
              className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-10 hidden"
            >
              <div className="w-48 text-sm">
                <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b border-gray-100">
                  ソート基準
                </div>
                <button
                  onClick={() => {
                    handleSortChange("supportDesc");
                    const element = document.getElementById(
                      "party-sort-dropdown"
                    );
                    if (element) {
                      element.classList.toggle("hidden");
                    }
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
                    sortMethod === "supportDesc"
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  支持率（高い順）
                </button>
                <button
                  onClick={() => {
                    handleSortChange("supportAsc");
                    const element = document.getElementById(
                      "party-sort-dropdown"
                    );
                    if (element) {
                      element.classList.toggle("hidden");
                    }
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
                    sortMethod === "supportAsc"
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  支持率（低い順）
                </button>
                <button
                  onClick={() => {
                    handleSortChange("activityDesc");
                    const dropdown = document.getElementById(
                      "party-sort-dropdown"
                    );
                    if (dropdown) {
                      dropdown.classList.add("hidden");
                    }
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
                    sortMethod === "activityDesc"
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  活動指数（高い順）
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Party members list */}
        <div>
          {sortedPartyPoliticians.map(
            (politician: Politician, index: number) => (
              <React.Fragment key={politician.id}>
                <PoliticianCard politician={politician} index={index} />

                {/* Ad after 3rd politician */}
                {index === 2 && sortedPartyPoliticians.length > 3 && (
                  <div className="py-3 flex justify-center border-b border-gray-100">
                    <InlineAdBanner format="rectangle" showCloseButton={true} />
                  </div>
                )}
              </React.Fragment>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default PartyDetail;
