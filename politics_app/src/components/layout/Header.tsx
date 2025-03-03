import React from "react";
import { Menu, Award, Crown, ArrowLeft } from "lucide-react";
import { useData } from "../../context/DataContext";

const Header: React.FC = () => {
  const {
    isScrolled,
    selectedPolitician,
    selectedParty,
    showAllPoliticians,
    activeTab,
    setActiveTab,
    setSelectedPolitician,
    handlePartySelect,
    setMobileMenuOpen,
  } = useData();

  return (
    <header
      className={`sticky top-0 z-20 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-md py-2"
          : "bg-gradient-to-r from-indigo-600 to-purple-600 py-3 sm:py-4"
      }`}
    >
      <div className="container px-4 mx-auto flex items-center justify-between">
        {/* Mobile menu button */}
        <button
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full transition"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu
            size={20}
            className={isScrolled ? "text-gray-700" : "text-white"}
          />
        </button>

        {/* Premium button */}
        <div className="relative group hidden sm:block">
          <button className="flex items-center justify-center w-7 h-7 rounded-full transition">
            <Crown
              size={16}
              className={isScrolled ? "text-yellow-500" : "text-white"}
            />
          </button>
          <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-white rounded-lg shadow-lg p-2 w-48 border border-gray-200 z-10">
            <p className="text-xs text-gray-700 mb-2">
              広告なしでご利用いただけるプレミアムプランをお試しください。
            </p>
            <button className="w-full bg-indigo-600 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-indigo-700 transition">
              プレミアムに登録する
            </button>
          </div>
        </div>

        {/* App title */}
        <h1
          className={`font-bold transition-all duration-300 flex items-center ${
            isScrolled
              ? "text-gray-800 text-base sm:text-lg"
              : "text-white text-lg sm:text-xl"
          }`}
        >
          <Award size={isScrolled ? 20 : 24} className="mr-2" />
          政治家評価ポータル
        </h1>

        {/* Navigation or back button */}
        {selectedPolitician ? (
          <button
            onClick={() => {
              setSelectedPolitician(null);
              // If we came from a party detail, go back to that party
              if (selectedParty) {
                handlePartySelect(selectedParty);
              }
            }}
            className={`flex items-center rounded-full px-3 py-1 text-sm transition-all ${
              isScrolled
                ? "bg-indigo-100 text-indigo-600"
                : "bg-white/20 text-white backdrop-blur-sm"
            }`}
          >
            <span>一覧に戻る</span>
          </button>
        ) : !selectedParty && !showAllPoliticians ? (
          <div
            className={`hidden md:flex space-x-1 rounded-full backdrop-blur-sm p-1 ${
              isScrolled ? "bg-gray-100" : "bg-white/20"
            }`}
          >
            <button
              onClick={() => setActiveTab("politicians")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                activeTab === "politicians"
                  ? isScrolled
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "bg-white/90 text-indigo-600"
                  : isScrolled
                  ? "text-gray-600"
                  : "text-white"
              }`}
            >
              政治家
            </button>
            <button
              onClick={() => setActiveTab("parties")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                activeTab === "parties"
                  ? isScrolled
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "bg-white/90 text-indigo-600"
                  : isScrolled
                  ? "text-gray-600"
                  : "text-white"
              }`}
            >
              政党
            </button>
          </div>
        ) : (
          <div className="w-8 md:w-16"></div> // Spacer for layout consistency
        )}
      </div>
    </header>
  );
};

export default Header;
