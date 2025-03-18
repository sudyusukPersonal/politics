import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomeScreen from "../components/home/HomeScreen";
import PoliticianDetail from "../components/politicians/PoliticianDetail";
import PartyDetail from "../components/parties/PartyDetail";
import AllPoliticiansList from "../components/politicians/AllPoliticiansList";
import PolicyDiscussionPage from "../components/policies/PolicyDetail";
import PolicyListingPage from "../components/policies/PolicyListingPage";

const AppRoutes: React.FC = () => {
  return (
    <main className="flex-1 p-4 pb-16 container mx-auto max-w-7xl">
      <div className="mx-auto max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        <Routes>
          <Route path="/" element={<HomeScreen initialTab="politicians" />} />
          <Route path="/politicians" element={<AllPoliticiansList />} />
          {/* クエリパラメータでページ番号を受け取れるようにする */}
          <Route
            path="/politicians/:politicianId"
            element={<PoliticianDetail />}
          />
          <Route path="/parties/:partyId" element={<PartyDetail />} />
          <Route path="/policy" element={<PolicyDiscussionPage />} />
          <Route path="/policys" element={<PolicyListingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </main>
  );
};

export default AppRoutes;
