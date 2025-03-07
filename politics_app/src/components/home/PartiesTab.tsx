import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Users,
  Activity,
  ChevronRight,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import InlineAdBanner from "../ads/InlineAdBanner";
import PremiumBanner from "../common/PremiumBanner";

const PartiesTab: React.FC = () => {
  const { parties, getPoliticiansByParty, handlePartySelect } = useData();

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

  interface PertyResponse {
    parties: Party[];
  }

  const [po, setPo] = useState<Party[]>([]);

  useEffect(() => {
    const fetchPoliticians = async () => {
      try {
        const response = await fetch("http://localhost:8080/parties");
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data: PertyResponse = await response.json();
        setPo(data.parties);
      } catch (error) {
        console.error("Failed to fetch politicians:", error);
      }
    };
    fetchPoliticians();
  }, []);

  return (
    <section className="space-y-6">
      {/* Premium banner */}
      <PremiumBanner />

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <TrendingUp size={18} className="mr-2 text-indigo-600" />
            政党支持率
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            市民による評価に基づく政党支持率
          </p>
        </div>

        <div className="p-4 space-y-6">
          {po.map((party, index) => (
            <React.Fragment key={party.id}>
              <div
                className="relative hover:bg-gray-50 p-2 rounded-lg transition cursor-pointer"
                onClick={() => handlePartySelect(party)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span
                      className="w-4 h-4 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: party.color }}
                    ></span>
                    <span className="font-bold truncate">{party.name}</span>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-400 flex-shrink-0"
                  />
                </div>

                {/* Support/Oppose stats */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="flex items-center">
                      <ThumbsUp
                        size={14}
                        className="text-green-500 mr-1 flex-shrink-0"
                      />
                      <span className="font-medium text-green-700">
                        {party.supportRate}%
                      </span>
                    </div>
                    <div className="flex items-center">
                      <ThumbsDown
                        size={14}
                        className="text-red-500 mr-1 flex-shrink-0"
                      />
                      <span className="font-medium text-red-700">
                        {party.opposeRate}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {party.totalVotes.toLocaleString()}票
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex mb-2">
                  <div
                    className="h-full rounded-l-full"
                    style={{
                      width: `${party.supportRate}%`,
                      backgroundColor: "#10B981",
                    }}
                  ></div>
                  <div
                    className="h-full rounded-r-full"
                    style={{
                      width: `${party.opposeRate}%`,
                      backgroundColor: "#EF4444",
                    }}
                  ></div>
                </div>

                {/* Party details */}
                <div className="bg-gray-50 rounded-lg p-3 mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 mb-2">
                    <div className="flex items-center mb-1 sm:mb-0">
                      <Users size={12} className="mr-1 flex-shrink-0" />
                      <span>
                        所属議員: {getPoliticiansByParty(party.id).length}名
                      </span>
                    </div>
                    <span className="flex items-center">
                      <Activity size={12} className="mr-1 flex-shrink-0" />
                      <span>政策数: {party.keyPolicies.length}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {party.keyPolicies.map((policy, i) => (
                      <span
                        key={i}
                        className="text-xs py-1 px-2 rounded-full bg-white border border-gray-200"
                        style={{ color: party.color }}
                      >
                        {policy}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ad after first party */}
              {index === 0 && (
                <div className="flex justify-center py-2">
                  <InlineAdBanner format="rectangle" showCloseButton={true} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartiesTab;
