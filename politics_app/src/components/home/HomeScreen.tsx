// politics_app/src/components/home/HomeScreen.tsx
import React, { useEffect } from "react";
import { useData } from "../../context/DataContext";
import PoliticiansTab from "./PoliticiansTab";
import PartiesTab from "./PartiesTab";

interface HomeScreenProps {
  initialTab?: string;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ initialTab }) => {
  const { activeTab, setActiveTab } = useData();

  useEffect(() => {
    // If initialTab is provided, use it, otherwise default to "politicians"
    if (initialTab) {
      setActiveTab(initialTab);
    } else {
      // This ensures that without an explicit initialTab, we default to politicians
      setActiveTab("politicians");
    }
  }, [initialTab, setActiveTab]);

  return (
    <>
      {/* Mobile tabs navigation */}
      <div className="md:hidden flex mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("politicians")}
          className={`flex-1 py-3 text-center font-medium text-sm border-b-2 transition ${
            activeTab === "politicians"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500"
          }`}
        >
          政治家
        </button>
        <button
          onClick={() => setActiveTab("parties")}
          className={`flex-1 py-3 text-center font-medium text-sm border-b-2 transition ${
            activeTab === "parties"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500"
          }`}
        >
          政党
        </button>
      </div>

      {/* Conditional rendering of the active tab */}
      {activeTab === "politicians" ? <PoliticiansTab /> : <PartiesTab />}
    </>
  );
};

export default HomeScreen;
