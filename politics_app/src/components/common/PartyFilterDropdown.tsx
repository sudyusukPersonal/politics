// src/components/common/PartyFilterDropdown.tsx
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Users } from "lucide-react";

interface PartyFilterDropdownProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

const PartyFilterDropdown: React.FC<PartyFilterDropdownProps> = ({
  currentFilter,
  onFilterChange,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Available party options
  const partyOptions = [
    { value: "all", label: "全政党" },
    { value: "自由民主党", label: "自由民主党" },
    { value: "立憲民主党", label: "立憲民主党" },
    { value: "公明党", label: "公明党" },
    { value: "日本維新の会", label: "日本維新の会" },
    { value: "国民民主党", label: "国民民主党" },
    { value: "日本共産党", label: "日本共産党" },
    { value: "れいわ新選組", label: "れいわ新選組" },
    { value: "社民党", label: "社民党" },
    { value: "参政党", label: "参政党" },
    { value: "日本保守党", label: "日本保守党" },
  ];

  // Get current party label
  const getCurrentPartyLabel = () => {
    const party = partyOptions.find((p) => p.value === currentFilter);
    return party ? party.label : "全政党";
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
        <Users size={14} className="mr-2 text-indigo-600" />
        <span>{getCurrentPartyLabel()}</span>
        <div className="ml-2 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
          <ChevronDown size={12} className="text-gray-600" />
        </div>
      </button>

      {showDropdown && (
        <div
          className="absolute top-full left-0 mt-1 w-44 bg-white rounded-md shadow-lg z-20 py-1 border border-gray-200
          overflow-hidden max-h-60 overflow-y-auto"
        >
          {partyOptions.map((party) => (
            <button
              key={party.value}
              onClick={() => {
                onFilterChange(party.value);
                setShowDropdown(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center transition-colors
              ${
                currentFilter === party.value
                  ? "bg-indigo-50 text-indigo-600 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  currentFilter === party.value
                    ? "bg-indigo-500"
                    : "bg-gray-300"
                }`}
              ></span>
              {party.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartyFilterDropdown;
