// politics_app/src/components/layout/AppContent.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./Header";
import MobileMenu from "./MobileMenu";
import PoliticianDetail from "../politicians/PoliticianDetail";
import PartyDetail from "../parties/PartyDetail";
import AllPoliticiansList from "../politicians/AllPoliticiansList";
import PolicyDiscussionPage from "../policies/PolicyDetail";
import PolicyListingPage from "../policies/PolicyListingPage";
import PrivacyPolicyPage from "../privacy/PrivacyPolicyPage";
import Home from "../home/Home";
import PartiesTab from "../home/PartiesTab";
import PolicyInfoComponent from "../policies/PolicyInfoComponent";
import ForPoliticalPartiesPage from "../policies/ForPoliticalPartiesPage";

const AppContent: React.FC = () => {
  return (
    <div className="flex flex-col w-full min-h-screen font-sans bg-slate-50">
      {/* ヘッダー */}
      <Header />

      {/* モバイルメニュー */}
      <MobileMenu />

      {/* メインコンテンツ */}
      <main className="flex-1 pb-16 sm:p-4 px-0 container mx-auto max-w-7xl">
        <div className="mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl w-full">
          <Routes>
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/" element={<Home />} />
            <Route path="/politicians" element={<AllPoliticiansList />} />
            <Route path="/politicians/:id" element={<PoliticianDetail />} />
            <Route path="/parties" element={<PartiesTab />} />
            <Route path="/parties/:id" element={<PartyDetail />} />
            <Route path="/policy/:id" element={<PolicyDiscussionPage />} />
            <Route path="/policy" element={<PolicyListingPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/partyinfo" element={<ForPoliticalPartiesPage />} />
            <Route path="/policyinfo" element={<PolicyInfoComponent />} />
          </Routes>
        </div>
      </main>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes premiumReveal {
          0% { 
            opacity: 0; 
            transform: translateY(20px);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0);
          }
        }

        .premium-reveal-animation {
          animation: premiumReveal 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          animation-iteration-count: 1;
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }

        @keyframes slide-in-left {
          0% {
            transform: translateX(-100%);
            opacity: 0.5;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slide-out-left {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(-100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AppContent;
