import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 追加: ナビゲーション用
import PoliticiansTab from "./PoliticiansTab";
import {
  FileText,
  Building,
  Users,
  TrendingUp,
  ChevronRight,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate(); // 追加: useNavigate フックを使用

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen font-sans bg-slate-50">
      <main className="flex-1 pb-16 sm:p-4 p-0 container mx-auto max-w-7xl">
        <div className="mx-auto max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
          <section className="space-y-4">
            {/* メインカード - アップデート済み */}
            <div className="bg-white shadow-lg overflow-hidden lg:rounded-2xl">
              {/* 改良されたヒーローセクション - 新しい配色 */}
              <div
                className="relative p-6 text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #1a237e, #283593, #3949ab)",
                }}
              >
                <div className="relative z-10">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-shadow-sm">
                    政治を、もっと身近なものに
                  </h1>

                  {/* メッセージUIの更新 - 投稿促進メッセージを追加 */}
                  <div className="relative bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden shadow-lg">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-indigo-300"></div>
                    <div className="p-4">
                      <p className="text-sm sm:text-base leading-relaxed">
                        あなたの意見が未来を形作ります。政治家・政党・政策に対する評価と議論を通じて、社会をより良い方向へ導きましょう。
                      </p>
                    </div>
                    <div className="bg-white/5 p-3 border-t border-white/10">
                      <div className="flex items-center text-sm text-white/90">
                        <MessageSquare size={14} className="mr-2" />
                        <span>あなたの声を政治に反映させましょう</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 統計情報 - アニメーションなし */}
              <div className="px-3 py-4 border-b border-gray-100">
                <div className="grid grid-cols-3 gap-3">
                  <StatCard
                    icon={<Users size={14} className="text-blue-500" />}
                    label="政治家数"
                    value="682"
                  />

                  <StatCard
                    icon={<ThumbsUp size={14} className="text-green-500" />}
                    label="政策数"
                    value="178"
                  />

                  <StatCard
                    icon={
                      <MessageSquare size={14} className="text-purple-500" />
                    }
                    label="政党数"
                    value="10"
                  />
                </div>
              </div>
            </div>

            {/* ナビゲーションカード - リンク機能を追加 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NavCardWithAnimation
                icon={<Users size={20} />}
                title="政治家一覧"
                description="議員への評価と議論に参加"
                color="#4361EE"
                index={0}
                path="/politicians" // 追加: 遷移先パス
                navigate={navigate} // 追加: navigate関数を渡す
              />

              <NavCardWithAnimation
                icon={<Building size={20} />}
                title="政党一覧"
                description="政党の政策と支持率をチェック"
                color="#7209B7"
                index={1}
                path="/parties" // 追加: 遷移先パス
                navigate={navigate} // 追加: navigate関数を渡す
              />

              <NavCardWithAnimation
                icon={<FileText size={20} />}
                title="政策一覧"
                description="政策への評価と議論に参加"
                color="#228B22"
                index={2}
                path="/policy" // 追加: 遷移先パス
                navigate={navigate} // 追加: navigate関数を渡す
              />
            </div>

            {/* 既存のPoliticiansTab */}
            <div className={isVisible ? "" : "opacity-0"}>
              <PoliticiansTab />
            </div>
          </section>
        </div>
      </main>

      {/* CSS アニメーション - リンクカード専用 */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulseAction {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
        
        .link-card-animation {
          opacity: 0;
          animation: slideIn 0.5s forwards;
        }
        
        .pulse-arrow {
          animation: pulseAction 1.5s ease-in-out infinite;
        }
        
        .text-shadow-sm {
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

// 統計カードコンポーネント - アニメーションなし
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
    <div className="flex items-center mb-1 text-sm font-medium text-gray-700">
      {icon}
      <span className="ml-1.5">{label}</span>
    </div>
    <div className="text-2xl font-bold text-gray-800">{value}</div>
  </div>
);

// ナビゲーションカード - ナビゲーション機能を追加
interface NavCardWithAnimationProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  index: number;
  path: string; // 追加: 遷移先パス
  navigate: (path: string) => void; // 追加: ナビゲーション関数
}

const NavCardWithAnimation = ({
  icon,
  title,
  description,
  color,
  index,
  path, // 追加: 遷移先パス
  navigate, // 追加: ナビゲーション関数
}: NavCardWithAnimationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // カードを順番に表示するための遅延
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 100 + index * 150); // 150msずつ遅延

    return () => clearTimeout(timeout);
  }, [index]);

  // 追加: ページ遷移処理関数
  const handleClick = () => {
    navigate(path);
    window.scrollTo(0, 0); // ページトップにスクロール
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-lg bg-white shadow-sm cursor-pointer border border-gray-100 link-card-animation`}
      style={{
        animationDelay: `${index * 150}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(15px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
      onClick={handleClick} // 追加: クリックイベントハンドラー
    >
      <div
        className="absolute top-0 left-0 h-1 w-full"
        style={{
          background: `linear-gradient(to right, ${color}, ${color}99)`,
        }}
      ></div>

      <div className="p-5 flex items-center">
        {/* 左側の大きなアイコン */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm text-white flex-shrink-0"
          style={{
            background: `linear-gradient(to right, ${color}, ${color}99)`,
          }}
        >
          {icon}
        </div>

        {/* 右側のテキスト情報 */}
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm text-gray-800">{title}</h3>

            <div
              className="inline-flex items-center text-xs font-medium"
              style={{ color }}
            >
              詳細
              <ChevronRight size={14} className="ml-1 pulse-arrow" />
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
