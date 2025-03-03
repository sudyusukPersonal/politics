import React from "react";
import Header from "./components/layout/Header";
import MobileMenu from "./components/layout/MobileMenu";
import MainContent from "./components/layout/MainContent";
import { DataProvider } from "./context/DataContext";

const App: React.FC = () => {
  return (
    <DataProvider>
      <div className="flex flex-col w-full min-h-screen font-sans bg-amber-50">
        {/* Mobile menu overlay */}
        <MobileMenu />

        {/* Header */}
        <Header />

        {/* Main content */}
        <MainContent />

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
    </DataProvider>
  );
};

export default App;
