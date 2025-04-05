// src/components/common/SortDropdown.tsx
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Filter } from "lucide-react";

interface SortDropdownProps {
  currentSort: string;
  onSortChange: (sort: string) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  currentSort,
  onSortChange,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get sort label based on value
  const getSortLabel = (sort: string): string => {
    switch (sort) {
      case "supportDesc":
        return "支持率（高い順）";
      case "supportAsc":
        return "支持率（低い順）";
      case "totalVotesDesc":
        return "投票数（多い順）";
      case "commentCountDesc":
        return "コメント数（多い順）";
      default:
        return "並び順";
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center px-3 py-1.5 text-sm rounded-full shadow-sm 
        bg-white border border-gray-200 text-gray-700 hover:bg-gray-50
        transition-all duration-300 ease-in-out"
      >
        <Filter size={14} className="mr-2 text-gray-500" />
        <span>{getSortLabel(currentSort)}</span>
        <div className="ml-2 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
          <ChevronDown size={12} className="text-gray-600" />
        </div>
      </button>

      {showDropdown && (
        <div
          className="absolute top-full right-0 mt-1 w-44 bg-white rounded-md shadow-lg z-20 py-1 border border-gray-200
          overflow-hidden"
        >
          {[
            "supportDesc",
            "supportAsc",
            "totalVotesDesc",
            "commentCountDesc",
          ].map((sort) => (
            <button
              key={sort}
              onClick={() => {
                onSortChange(sort);
                setShowDropdown(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center transition-colors
              ${
                currentSort === sort
                  ? "bg-indigo-50 text-indigo-600 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  currentSort === sort ? "bg-indigo-500" : "bg-gray-300"
                }`}
              ></span>
              {getSortLabel(sort)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
