import React from "react";
import { ListFilter, SortDesc, SortAsc } from "lucide-react";
import { useData } from "../../context/DataContext";

interface SortDropdownProps {
  dropdownId: string;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ dropdownId }) => {
  const { sortMethod, handleSortChange, getSortLabel } = useData();

  return (
    <div className="relative">
      <button
        className="flex items-center bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
        onClick={() => {
          const dropdown = document.getElementById(dropdownId);
          if (dropdown) {
            dropdown.classList.toggle("hidden");
          }
        }}
      >
        <ListFilter size={14} className="mr-1.5 text-indigo-600" />
        <span>{getSortLabel(sortMethod)}</span>
      </button>

      <div
        id={dropdownId}
        className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-10 hidden"
      >
        <div className="w-48 text-sm">
          <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b border-gray-100">
            ソート基準
          </div>
          <button
            onClick={() => {
              handleSortChange("supportDesc");
              const dropdown = document.getElementById(dropdownId);
              if (dropdown) {
                dropdown.classList.add("hidden");
              }
            }}
            className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
              sortMethod === "supportDesc"
                ? "bg-indigo-50 text-indigo-700"
                : "hover:bg-gray-50"
            }`}
          >
            <SortDesc size={12} className="inline mr-1" /> 支持率（高い順）
          </button>
          <button
            onClick={() => {
              handleSortChange("supportAsc");
              const dropdown = document.getElementById(dropdownId);
              if (dropdown) {
                dropdown.classList.add("hidden");
              }
            }}
            className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
              sortMethod === "supportAsc"
                ? "bg-indigo-50 text-indigo-700"
                : "hover:bg-gray-50"
            }`}
          >
            <SortAsc size={12} className="inline mr-1" /> 支持率（低い順）
          </button>
          <button
            onClick={() => {
              handleSortChange("opposeDesc");
              const dropdown = document.getElementById(dropdownId);
              if (dropdown) {
                dropdown.classList.add("hidden");
              }
            }}
            className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
              sortMethod === "opposeDesc"
                ? "bg-indigo-50 text-indigo-700"
                : "hover:bg-gray-50"
            }`}
          >
            <SortDesc size={12} className="inline mr-1" /> 不支持率（高い順）
          </button>
          <button
            onClick={() => {
              handleSortChange("opposeAsc");
              const dropdown = document.getElementById(dropdownId);
              if (dropdown) {
                dropdown.classList.add("hidden");
              }
            }}
            className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
              sortMethod === "opposeAsc"
                ? "bg-indigo-50 text-indigo-700"
                : "hover:bg-gray-50"
            }`}
          >
            <SortAsc size={12} className="inline mr-1" /> 不支持率（低い順）
          </button>
          <button
            onClick={() => {
              handleSortChange("activityDesc");
              const dropdown = document.getElementById(dropdownId);
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
            <SortDesc size={12} className="inline mr-1" /> 活動指数（高い順）
          </button>
          <button
            onClick={() => {
              handleSortChange("activityAsc");
              const dropdown = document.getElementById(dropdownId);
              if (dropdown) {
                dropdown.classList.add("hidden");
              }
            }}
            className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${
              sortMethod === "activityAsc"
                ? "bg-indigo-50 text-indigo-700"
                : "hover:bg-gray-50"
            }`}
          >
            <SortAsc size={12} className="inline mr-1" /> 活動指数（低い順）
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortDropdown;
