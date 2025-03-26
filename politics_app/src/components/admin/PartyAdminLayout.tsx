// src/components/admin/PartyAdminLayout.tsx
import React, { useState, useEffect } from "react";
import {
  useParams,
  useLocation,
  useNavigate,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { getPartyAdminData } from "./adminPartyService"; // 専用サービスをインポート
import AdminSidebar from "./AdminSidebar";
import PartyDetailsPanel from "./PartyDetailsPanel";
import PolicyManagementPanel from "./PolicyManagementPanel";
import LoadingAnimation from "../common/LoadingAnimation";
import { HelpCircle } from "lucide-react";

// 設定パネルの簡易コンポーネント
const SettingsPanel = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-fadeIn">
    <h3 className="text-lg font-bold text-gray-800 mb-4">管理設定</h3>
    <p className="text-gray-500">この機能は現在開発中です。近日公開予定。</p>
  </div>
);

// メインのレイアウトコンポーネント
const PartyAdminLayout: React.FC = () => {
  // URLパラメータと履歴管理
  const { partyId } = useParams<{ partyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // サイドバーの開閉状態
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // データ取得状態の管理
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partyData, setPartyData] = useState<any | null>(null);
  const [policiesData, setPoliciesData] = useState<any[]>([]);

  // データ取得とエラーハンドリング
  useEffect(() => {
    const fetchData = async () => {
      if (!partyId) {
        setError("政党IDが指定されていません");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 専用サービスを使用して政党データと政策データを取得
        const { party, policies } = await getPartyAdminData(partyId);

        setPartyData(party);
        setPoliciesData(policies);
      } catch (error) {
        console.error("データ取得エラー:", error);
        setError(
          error instanceof Error
            ? error.message
            : "データの取得中にエラーが発生しました"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [partyId]); // partyIdが変わったら再取得

  // 現在のアクティブタブを取得する関数
  const getActiveTabFromPath = () => {
    if (location.pathname.includes("/policies")) return "policies";
    if (location.pathname.includes("/settings")) return "settings";
    return "details"; // デフォルトは政党詳細
  };

  // ページタイトルを取得する関数
  const getPageTitle = () => {
    const activeTab = getActiveTabFromPath();
    if (activeTab === "policies") return "政策の追加・編集・管理";
    if (activeTab === "settings") return "設定";
    return "政党情報の編集・管理";
  };

  // ローディング中の表示
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100 text-gray-800 justify-center items-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <LoadingAnimation type="dots" message="政党情報を読み込んでいます" />
        </div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100 text-gray-800 justify-center items-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            エラーが発生しました
          </h3>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => navigate("/admin")}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
          >
            管理ページに戻る
          </button>
        </div>
      </div>
    );
  }

  // 政党データがない場合
  if (!partyData) {
    return (
      <div className="flex min-h-screen bg-gray-100 text-gray-800 justify-center items-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-yellow-500 mb-4">
            <HelpCircle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            政党が指定されていません
          </h3>
          <p className="mt-2 text-gray-600">
            URLに有効な政党IDを指定してください
          </p>
          <button
            onClick={() => navigate("/parties")}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
          >
            政党一覧へ
          </button>
        </div>
      </div>
    );
  }

  // メインレイアウトのレンダリング
  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      {/* サイドバー */}
      <AdminSidebar
        partyData={partyData}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* メインコンテンツエリア */}
      <div className="flex-1 p-4 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダーセクション */}
          <header className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">政党管理</h1>
              <p className="text-sm text-gray-500">{getPageTitle()}</p>
            </div>

            {/* 政党情報バッジ */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-white rounded-full px-3 py-1 shadow-sm border border-gray-200">
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0 border-2"
                  style={{ borderColor: partyData.color }}
                >
                  <img
                    src={partyData.image}
                    alt={partyData.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      // 画像読み込みエラー時の処理
                      e.currentTarget.src = "/api/placeholder/24/24";
                    }}
                  />
                </div>
                <span className="ml-2 text-sm font-medium">
                  {partyData.name}
                </span>
              </div>
            </div>
          </header>

          {/* ルートに基づいてパネルをレンダリング */}
          <Routes>
            <Route
              path="details"
              element={<PartyDetailsPanel partyData={partyData} />}
            />
            <Route
              path="policies"
              element={
                <PolicyManagementPanel
                  policiesData={policiesData}
                  partyData={partyData}
                />
              }
            />
            <Route path="settings" element={<SettingsPanel />} />
            {/* デフォルトで詳細画面にリダイレクト */}
            <Route
              path="/"
              element={
                <Navigate to={`/admin/party/${partyId}/details`} replace />
              }
            />
          </Routes>
        </div>
      </div>

      {/* スクロールトップボタン */}
      <button
        className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors focus:outline-none"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="トップに戻る"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* アニメーション用のグローバルスタイル */}
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

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PartyAdminLayout;
