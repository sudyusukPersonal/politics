// politics_app/src/components/layout/AppContent.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./Header";
import MobileMenu from "./MobileMenu";
import PoliticianDetail from "../politicians/PoliticianDetail";
import PartyDetail from "../parties/PartyDetail";
import AllPoliticiansList from "../politicians/AllPoliticiansList";
import HomeScreen from "../home/HomeScreen";

const AppContent: React.FC = () => {
  return (
    <div className="flex flex-col w-full min-h-screen font-sans bg-amber-50">
      {/* Mobile menu overlay */}
      <MobileMenu />

      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-1 p-4 pb-16 container mx-auto max-w-7xl">
        <div className="mx-auto max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/politicians" element={<AllPoliticiansList />} />
            <Route path="/politicians/:id" element={<PoliticianDetail />} />
            <Route
              path="/parties"
              element={<HomeScreen initialTab="parties" />}
            />
            <Route path="/parties/:id" element={<PartyDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
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
      `}</style>
    </div>
  );
};

export default AppContent;
