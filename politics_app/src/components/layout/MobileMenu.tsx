// politics_app/src/components/layout/MobileMenu.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { X, Users, Building, BarChart3, Crown } from "lucide-react";
import { useData } from "../../context/DataContext";

const MobileMenu: React.FC = () => {
  const navigate = useNavigate();
  const { mobileMenuOpen, setMobileMenuOpen, setActiveTab } = useData();

  if (!mobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
      <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-lg">メニュー</h3>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-4">
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => {
                  setActiveTab("politicians");
                  navigate("/");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center text-gray-700 font-medium"
              >
                <Users size={18} className="mr-2 text-indigo-600" />
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
                className="flex items-center text-gray-700 font-medium"
              >
                <Building size={18} className="mr-2 text-indigo-600" />
                政党一覧
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  navigate("/politicians");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center text-gray-700 font-medium"
              >
                <BarChart3 size={18} className="mr-2 text-indigo-600" />
                ランキング
              </button>
            </li>
            <li className="border-t border-gray-200 pt-4">
              <button className="flex items-center text-gray-700 font-medium">
                <Crown size={18} className="mr-2 text-yellow-500" />
                プレミアム会員登録
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
