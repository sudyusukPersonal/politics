import React from "react";
import { Calendar, ChevronRight } from "lucide-react";
import { Politician } from "../../types";
import { useData } from "../../context/DataContext";
import TrendIcon from "../common/TrendIcon";

interface PoliticianCardProps {
  politician: Politician;
  index: number;
}

const PoliticianCard: React.FC<PoliticianCardProps> = ({
  politician,
  index,
}) => {
  const { handlePoliticianSelect, getTrendIcon } = useData();

  return (
    <div
      key={politician.id}
      className={`border-b border-gray-100 last:border-0 hover:bg-indigo-50/30 transition-colors ${
        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
      }`}
      onClick={() => handlePoliticianSelect(politician)}
    >
      <div className="p-4 flex items-center">
        <div className="relative flex-shrink-0">
          <img
            src={politician.image}
            alt={politician.name}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 transform transition hover:scale-105"
            style={{ borderColor: politician.party.color }}
          />
          <div
            className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-lg"
            style={{ backgroundColor: politician.party.color }}
          >
            {politician.party.name.charAt(0)}
          </div>
        </div>

        <div className="ml-3 sm:ml-4 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base truncate">
              {politician.name}
            </h3>
            {getTrendIcon(politician.trending)}
          </div>

          <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
            <span className="truncate">{politician.position}</span>
            <span className="mx-2 flex-shrink-0">•</span>
            <span className="flex-shrink-0">{politician.age}歳</span>
          </div>

          <div className="mt-2">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center">
                  <ThumbsUpIcon className="text-green-500 mr-1 flex-shrink-0" />
                  <span className="font-medium text-green-700">
                    {politician.supportRate}%
                  </span>
                </div>
                <div className="flex items-center">
                  <ThumbsDownIcon className="text-red-500 mr-1 flex-shrink-0" />
                  <span className="font-medium text-red-700">
                    {politician.opposeRate}%
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {politician.totalVotes.toLocaleString()}票
              </span>
            </div>

            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden flex">
              <div
                className="h-full rounded-l-full"
                style={{
                  width: `${politician.supportRate}%`,
                  backgroundColor: "#10B981",
                }}
              ></div>
              <div
                className="h-full rounded-r-full"
                style={{
                  width: `${politician.opposeRate}%`,
                  backgroundColor: "#EF4444",
                }}
              ></div>
            </div>

            <div className="flex items-center mt-2 text-xs text-gray-500 truncate">
              <Calendar size={12} className="mr-1 flex-shrink-0" />
              <span className="truncate">
                最近の活動: {politician.recentActivity}
              </span>
            </div>
          </div>
        </div>

        <ChevronRight size={18} className="text-gray-400 ml-2 flex-shrink-0" />
      </div>
    </div>
  );
};

// Simple icon components to keep the file small
const ThumbsUpIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

const ThumbsDownIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17 14V2" />
    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
  </svg>
);

export default PoliticianCard;
