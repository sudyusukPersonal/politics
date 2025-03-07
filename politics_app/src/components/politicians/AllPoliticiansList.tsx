import React, { useEffect, useState } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { useData } from "../../context/DataContext";
import PoliticianCard from "./PoliticianCard";
import SortDropdown from "../common/SortDropdown";
import PremiumBanner from "../common/PremiumBanner";
import InlineAdBanner from "../ads/InlineAdBanner";

const AllPoliticiansList: React.FC = () => {
  const {
    handleBackToPoliticians,
    getSortedPoliticians,
    politicians,
    selectedPolitician,
  } = useData();

  interface Party {
    id: string;
    name: string;
    color: string;
    supportRate: number;
    // その他のパーティプロパティ
  }

  interface Politician {
    id: string;
    name: string;
    position: string;
    age: number;
    party: Party;
    supportRate: number;
    opposeRate: number;
    totalVotes: number;
    activity: number;
    image: string;
    trending: string;
    recentActivity: string;
  }

  interface PoliticiansResponse {
    politicians: Politician[];
  }

  const [po, setPo] = useState<Politician[]>([]);

  useEffect(() => {
    const fetchPoliticians = async () => {
      try {
        const response = await fetch("http://localhost:8080/politicians");
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data: PoliticiansResponse = await response.json();
        setPo(data.politicians);
      } catch (error) {
        console.error("Failed to fetch politicians:", error);
      }
    };
    fetchPoliticians();
  }, []);

  // Get sorted politicians based on the current sort method
  const sortedPoliticians = getSortedPoliticians(po);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={handleBackToPoliticians}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>戻る</span>
        </button>

        {/* Sort dropdown */}
        <SortDropdown dropdownId="sort-dropdown" />
      </div>

      {/* Premium banner */}
      <PremiumBanner />

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <Users size={18} className="mr-2 text-indigo-600" />
            全政治家一覧
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            評価順に並べ替えてランキング表示
          </p>
        </div>

        <div>
          {sortedPoliticians.map((politician, index) => (
            <React.Fragment key={politician.id}>
              <PoliticianCard politician={politician} index={index} />

              {/* Show ad after 3rd politician */}
              {index === 2 && (
                <div className="flex justify-center py-3 border-b border-gray-100">
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

export default AllPoliticiansList;
