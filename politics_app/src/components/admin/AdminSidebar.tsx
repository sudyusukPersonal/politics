// src/components/admin/AdminSidebar.tsx
import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Building,
  FileText,
  Settings,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

interface AdminSidebarProps {
  partyData: any;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  partyData,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const navigate = useNavigate();
  const { partyId } = useParams<{ partyId: string }>();
  const location = useLocation();

  // 現在のアクティブタブを判定
  const getActiveTab = () => {
    if (location.pathname.includes("/policies")) return "policies";
    if (location.pathname.includes("/settings")) return "settings";
    return "details"; // デフォルトは政党詳細
  };

  const activeTab = getActiveTab();

  // 特定のタブへナビゲーションする関数
  const navigateToTab = (tab: string) => {
    navigate(`/admin/party/${partyId}/${tab}`);
  };

  return (
    <div
      className={`${
        sidebarOpen ? "w-64" : "w-16"
      } bg-white shadow-md transition-all duration-300 flex flex-col p-3 z-10 h-screen`}
    >
      <div className="flex items-center justify-between mb-6">
        {sidebarOpen && (
          <div className="text-lg font-bold text-gray-800">政党管理パネル</div>
        )}
        <button
          className="p-1 rounded-md hover:bg-gray-100 transition"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <div className="flex flex-col space-y-1">
        <button
          className={`flex items-center px-3 py-2 rounded-md ${
            activeTab === "details"
              ? "bg-indigo-50 text-indigo-600"
              : "hover:bg-gray-100"
          } transition`}
          onClick={() => navigateToTab("details")}
        >
          <Building
            size={sidebarOpen ? 18 : 20}
            className={sidebarOpen ? "mr-3" : ""}
          />
          {sidebarOpen && <span>政党詳細</span>}
        </button>

        <button
          className={`flex items-center px-3 py-2 rounded-md ${
            activeTab === "policies"
              ? "bg-indigo-50 text-indigo-600"
              : "hover:bg-gray-100"
          } transition`}
          onClick={() => navigateToTab("policies")}
        >
          <FileText
            size={sidebarOpen ? 18 : 20}
            className={sidebarOpen ? "mr-3" : ""}
          />
          {sidebarOpen && <span>政策管理</span>}
        </button>

        <button
          className={`flex items-center px-3 py-2 rounded-md ${
            activeTab === "settings"
              ? "bg-indigo-50 text-indigo-600"
              : "hover:bg-gray-100"
          } transition`}
          onClick={() => navigateToTab("settings")}
        >
          <Settings
            size={sidebarOpen ? 18 : 20}
            className={sidebarOpen ? "mr-3" : ""}
          />
          {sidebarOpen && <span>設定</span>}
        </button>
      </div>

      <div className="mt-auto">
        <button
          className="w-full flex items-center px-3 py-2 rounded-md hover:bg-gray-100 text-gray-600 transition"
          onClick={() => navigate("/")}
        >
          <ArrowLeft
            size={sidebarOpen ? 18 : 20}
            className={sidebarOpen ? "mr-3" : ""}
          />
          {sidebarOpen && <span>サイトに戻る</span>}
        </button>
      </div>
    </div>
  );
};

// Chevron Left アイコンコンポーネント
const ChevronLeft = (props: { size?: number; [x: string]: any }) => {
  const { size = 24, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  );
};

export default AdminSidebar;
