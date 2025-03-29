// src/components/home/PoliticiansTab.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users, FileText, ChevronRight, MessageSquare } from "lucide-react";
import { useData } from "../../context/DataContext";
import PoliticianCard from "../politicians/PoliticianCard";
import PolicyCard from "../policies/PolicyCard";
import InlineAdBanner from "../ads/InlineAdBanner";
import PremiumBanner from "../common/PremiumBanner";
import LoadingAnimation from "../common/LoadingAnimation";
import {
  getRecentlyViewedPoliticians,
  getRecentlyViewedPolicyIds,
} from "../../utils/dataUtils";
import { fetchPolicyById } from "../../services/policyService";
import { Politician } from "../../types";

const PoliticiansTab: React.FC = () => {
  const navigate = useNavigate();
  // globalPoliticiansへの依存を削除し、必要なものだけimport
  const { dataInitialized, showAllPoliticiansList } = useData();

  // 統合されたローディング状態
  const [loading, setLoading] = useState(true);
  const [recentPolicies, setRecentPolicies] = useState<any[]>([]);
  const [dataLoadingComplete, setDataLoadingComplete] = useState(false);

  // 表示用の状態 - これが重要なポイント
  const [isVisible, setIsVisible] = useState(false);

  // 最近見た政治家のデータを取得 - ローカルストレージから直接取得
  const recentlyViewedPoliticians = useMemo(() => {
    return getRecentlyViewedPoliticians().slice(0, 3); // 最大3件を表示
  }, []); // 依存配列を空に - ローカルストレージのみ参照するため

  // データ取得
  useEffect(() => {
    const initializeData = async () => {
      if (!dataInitialized) return;

      try {
        setLoading(true);
        setIsVisible(false); // 重要: データ取得中は表示をオフに

        // 政策データを取得
        const recentIds = getRecentlyViewedPolicyIds();
        if (recentIds.length > 0) {
          const policiesPromises = recentIds
            .slice(0, 3)
            .map((id) => fetchPolicyById(id));
          const policiesData = await Promise.all(policiesPromises);
          setRecentPolicies(policiesData.filter(Boolean));
        }

        // すべてのデータロードが完了
        setDataLoadingComplete(true);
      } catch (error) {
        console.error("データの取得に失敗しました:", error);
        setDataLoadingComplete(true);
      } finally {
        setLoading(false);

        // データロード完了後、少し遅延させてから表示
        setTimeout(() => {
          setIsVisible(true);
        }, 50); // 小さな遅延でDOM更新を確実に
      }
    };

    initializeData();
  }, [dataInitialized]);

  // 政策一覧ページへのナビゲーション
  const navigateToPolicyList = () => {
    navigate("/policy");
    window.scrollTo(0, 0);
  };

  // ロード中表示
  if (loading && !dataLoadingComplete) {
    return (
      <div className="space-y-6">
        {/* Premium banner */}
        <PremiumBanner />

        {/* スケルトンローディング - 両方のセクション用 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 h-[300px]">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="p-8 flex flex-col items-center justify-center">
            <LoadingAnimation
              type="spinner"
              message="政治家データを読み込んでいます"
            />
          </div>
        </div>

        {/* 政策カードのスケルトン */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 h-[300px]">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="p-8 flex flex-col items-center justify-center">
            <LoadingAnimation
              type="spinner"
              message="政策データを読み込んでいます"
            />
          </div>
        </div>
      </div>
    );
  }

  // コンテンツ表示（データ取得済み）
  return (
    <section className="space-y-6">
      {/* Premium banner */}
      <PremiumBanner />

      {/* 両方のセクションを共通のアニメーションでラップ */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* 最近見た政治家カード */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 mb-6">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <Users size={18} className="mr-2 text-indigo-600" />
                最近見た政治家
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                あなたが最近閲覧した政治家
              </p>
            </div>

            <button
              onClick={() => showAllPoliticiansList()}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
            >
              全議員を見る
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>

          <div>
            {/* 最近見た政治家を表示 */}
            {recentlyViewedPoliticians.length > 0 ? (
              recentlyViewedPoliticians.map(
                (politician: Politician, index: number) => {
                  if (!politician) return null; // Ensure politician is defined
                  return (
                    <PoliticianCard
                      key={politician.id}
                      politician={politician}
                      index={index}
                    />
                  );
                }
              )
            ) : (
              <div className="p-6 text-center">
                <div className="text-gray-500 mb-4">
                  まだ政治家プロフィールを閲覧していません
                </div>

                <button
                  onClick={() => showAllPoliticiansList()}
                  className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-3 text-white shadow-lg transition-all duration-300 hover:shadow-slate-300/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                  {/* ボタン内容 */}
                  <span className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></span>
                  <span className="relative flex items-center justify-center">
                    <Users size={18} className="mr-2 animate-pulse" />
                    全議員一覧を見る
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </span>
                </button>

                <div className="mt-4 text-xs text-gray-400 max-w-xs mx-auto">
                  政治家プロフィールを閲覧すると、このセクションに最近見た政治家が表示されます
                </div>
              </div>
            )}
          </div>

          {/* Ad banner */}
          {/* <InlineAdBanner format="rectangle" showCloseButton={true} /> */}
        </div>

        {/* 最近見た政策カード */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 min-h-[200px]">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <FileText size={18} className="mr-2 text-indigo-600" />
                最近見た政策
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                あなたが最近閲覧した政策
              </p>
            </div>

            <button
              onClick={navigateToPolicyList}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
            >
              全政策を見る
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>

          <div>
            {recentPolicies.length > 0 ? (
              recentPolicies.map((policy, index) => (
                <PolicyCard key={policy.id} policy={policy} index={index} />
              ))
            ) : (
              <div className="p-6 text-center">
                <div className="text-gray-500 mb-4">
                  まだ政策を閲覧していません
                </div>

                <button
                  onClick={navigateToPolicyList}
                  className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-3 text-white shadow-lg transition-all duration-300 hover:shadow-slate-300/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                  {/* ボタン内容 */}
                  <span className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></span>
                  <span className="relative flex items-center justify-center">
                    <FileText size={18} className="mr-2 animate-pulse" />
                    全政策一覧を見る
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </span>
                </button>

                <div className="mt-4 text-xs text-gray-400 max-w-xs mx-auto">
                  政策を閲覧すると、このセクションに最近見た政策が表示されます
                </div>
              </div>
            )}
          </div>

          {/* 政策タブ用の広告バナー */}
          {/* <InlineAdBanner format="rectangle" showCloseButton={true} /> */}
        </div>
      </div>
    </section>
  );
};

export default PoliticiansTab;
