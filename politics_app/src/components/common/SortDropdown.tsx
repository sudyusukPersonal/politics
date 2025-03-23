// src/components/common/SortDropdown.tsx
import React from "react";
import { ChevronDown, BarChart2 } from "lucide-react";

interface SortDropdownProps {
  currentSort: string;
  onSortChange: (sort: string) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  currentSort,
  onSortChange,
}) => {
  return (
    <div className="relative">
      <div className="flex items-center">
        <BarChart2 size={14} className="text-indigo-600 mr-1" />
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="supportDesc">支持率（高い順）</option>
          <option value="supportAsc">支持率（低い順）</option>
          <option value="totalVotesDesc">投票数（多い順）</option>
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
        />
      </div>
    </div>
  );
};

export default SortDropdown;
