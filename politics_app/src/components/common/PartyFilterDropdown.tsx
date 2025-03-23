// src/components/common/PartyFilterDropdown.tsx
import React from "react";
import { ChevronDown, Users } from "lucide-react";

interface PartyFilterDropdownProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

const PartyFilterDropdown: React.FC<PartyFilterDropdownProps> = ({
  currentFilter,
  onFilterChange,
}) => {
  return (
    <div className="relative">
      <div className="flex items-center">
        <Users size={14} className="text-indigo-600 mr-1" />
        <select
          value={currentFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="all">全政党</option>
          <option value="自由民主党">自由民主党</option>
          <option value="立憲民主党">立憲民主党</option>
          <option value="公明党">公明党</option>
          <option value="日本維新の会">日本維新の会</option>
          <option value="国民民主党">国民民主党</option>
          <option value="日本共産党">日本共産党</option>
          <option value="れいわ新選組">れいわ新選組</option>
          <option value="社民党">社民党</option>
          <option value="参政党">参政党</option>
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
        />
      </div>
    </div>
  );
};

export default PartyFilterDropdown;
