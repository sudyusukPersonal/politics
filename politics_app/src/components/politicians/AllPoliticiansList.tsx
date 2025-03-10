import React from "react";
import { ArrowLeft, Users } from "lucide-react";
import { useData } from "../../context/DataContext";
import PoliticianCard from "./PoliticianCard";
import SortDropdown from "../common/SortDropdown";
import PremiumBanner from "../common/PremiumBanner";
import InlineAdBanner from "../ads/InlineAdBanner";

const AllPoliticiansList: React.FC = () => {
  const { handleBackToPoliticians, getSortedPoliticians, politicians } =
    useData();

  // Get sorted politicians based on the current sort method
  const sortedPoliticians = getSortedPoliticians(politicians);

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
