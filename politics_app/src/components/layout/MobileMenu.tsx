// politics_app/src/components/layout/MobileMenu.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { X, Users, Building, BarChart3, Crown, FileText } from "lucide-react";
import { useData } from "../../context/DataContext";

const MobileMenu: React.FC = () => {
  const navigate = useNavigate();
  const { mobileMenuOpen, setMobileMenuOpen, setActiveTab } = useData();

  // メニューが閉じている場合は何も表示しない
  if (!mobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm transition-all duration-300">
      <div
        className="fixed left-0 top-0 h-full w-64 sm:w-72 bg-white shadow-xl transform transition-transform duration-500 ease-in-out"
        style={{ animation: "slide-in-left 0.3s forwards" }}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
          <h3 className="font-bold text-lg">POLITICS HUB</h3>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        <div className="py-4">
          <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            メインメニュー
          </div>
          <ul className="space-y-1 px-2">
            <li>
              <button
                onClick={() => {
                  setActiveTab("politicians");
                  navigate("/");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <Users size={18} className="mr-3 text-indigo-600" />
                政治家一覧
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab("parties");
                  navigate("/parties");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <Building size={18} className="mr-3 text-indigo-600" />
                政党一覧
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  navigate("/politicians");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <BarChart3 size={18} className="mr-3 text-indigo-600" />
                ランキング
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  navigate("/policy");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <FileText size={18} className="mr-3 text-indigo-600" />
                政策一覧
              </button>
            </li>
          </ul>

          <div className="mt-6 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            アカウント
          </div>
          <ul className="space-y-1 px-2">
            <li>
              <button className="flex items-center w-full px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-yellow-50 transition-colors">
                <Crown size={18} className="mr-3 text-yellow-500" />
                プレミアム会員登録
              </button>
            </li>
          </ul>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">© 2025 Politics Hub</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style>{`
        @keyframes slide-in-left {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MobileMenu;
