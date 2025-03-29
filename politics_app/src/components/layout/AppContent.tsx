// politics_app/src/components/layout/AppContent.tsx
import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./Header";
import LoadingAnimation from "../common/LoadingAnimation";

// コンポーネントを遅延読み込み（レイジーロード）
const MobileMenu = lazy(() => import("./MobileMenu"));
const PoliticianDetail = lazy(() => import("../politicians/PoliticianDetail"));
const PartyDetail = lazy(() => import("../parties/PartyDetail"));
const AllPoliticiansList = lazy(
  () => import("../politicians/AllPoliticiansList")
);
const HomeScreen = lazy(() => import("../home/HomeScreen"));
const PolicyDiscussionPage = lazy(() => import("../policies/PolicyDetail"));
const PolicyListingPage = lazy(() => import("../policies/PolicyListingPage"));
const PrivacyPolicyPage = lazy(() => import("../privacy/PrivacyPolicyPage"));

// Suspenseのフォールバック用ローディングコンポーネント
const PageLoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <LoadingAnimation type="pulse" message="ページを読み込んでいます..." />
  </div>
);

const AppContent: React.FC = () => {
  return (
    <div className="flex flex-col w-full min-h-screen font-sans bg-slate-50">
      {/* ヘッダーはレイジーロードしない（常に表示されるため） */}
      <Header />

      {/* モバイルメニューは別途Suspenseでラップ（表示・非表示が切り替わるため） */}
      <Suspense fallback={null}>
        <MobileMenu />
      </Suspense>

      {/* メインコンテンツ */}
      <main className="flex-1 pb-16 sm:p-4 px-0 container mx-auto max-w-7xl">
        <div className="mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl w-full">
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              <Route path="*" element={<Navigate to="/" replace />} />
              <Route path="/" element={<HomeScreen />} />
              <Route path="/politicians" element={<AllPoliticiansList />} />
              <Route path="/politicians/:id" element={<PoliticianDetail />} />
              <Route
                path="/parties"
                element={<HomeScreen initialTab="parties" />}
              />
              <Route path="/parties/:id" element={<PartyDetail />} />
              <Route path="/policy/:id" element={<PolicyDiscussionPage />} />
              <Route path="/policy" element={<PolicyListingPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            </Routes>
          </Suspense>
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
