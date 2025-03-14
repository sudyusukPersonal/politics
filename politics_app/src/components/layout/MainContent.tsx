import React from "react";
import { useData } from "../../context/DataContext";
import PoliticianDetail from "../politicians/PoliticianDetail";
import PartyDetail from "../parties/PartyDetail";
import AllPoliticiansList from "../politicians/AllPoliticiansList";
import HomeScreen from "../home/HomeScreen";
import { Politician } from "../../types";

const MainContent: React.FC = () => {
  const { selectedPolitician, selectedParty, showAllPoliticians } = useData();

  return (
    <main className="flex-1 p-4 pb-16 container mx-auto max-w-7xl">
      <div className="mx-auto max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        {selectedPolitician ? (
          <PoliticianDetail />
        ) : selectedParty ? (
          <PartyDetail />
        ) : showAllPoliticians ? (
          <AllPoliticiansList />
        ) : (
          <HomeScreen />
        )}
      </div>
    </main>
  );
};

export default MainContent;
