// src/components/policies/PolicyDetail.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  TrendingUp,
  Calendar,
  Share2,
  Bookmark,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Building,
  Activity,
  Eye,
} from "lucide-react";
import { fetchPolicyById } from "../../services/policyService";
import LoadingAnimation from "../common/LoadingAnimation";
import { CommentSection } from "../comments/OptimizedCommentSystem";
import { ReplyDataProvider } from "../../context/ReplyDataContext";
import UnifiedVoteComponent from "../common/UnifiedVoteComponent";
import EntityRatingsSection from "../common/EntityRatingsSectio";
import {
  getPartyColorStyles,
  commonAnimations,
  styles,
} from "../../utils/styleUtils";
import { getPartyColor, saveRecentlyViewedPolicy } from "../../utils/dataUtils";
import { useData } from "../../context/DataContext";
import { navigateToParty } from "../../utils/navigationUtils";
import { getVoteFromLocalStorage } from "../../utils/voteStorage";

const PolicyDiscussionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 状態管理
  const [policy, setPolicy] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voteType, setVoteType] = useState<"support" | "oppose" | null>(null);
  const [showReasonForm, setShowReasonForm] = useState(false);

  const PARTY_ID_MAP = [
    { id: "pZJ4UiwBC5DsYGiQKjIO", name: "自由民主党", color: "#555555" },
    { id: "BoxdMFpJBC6bTGYJ9zCA", name: "立憲民主党", color: "#4361EE" },
    { id: "L5jBD6a2BSBJIMCMx7hF", name: "公明党", color: "#7209B7" },
    { id: "z13CDRj4DASfG7VOMt29", name: "日本維新の会", color: "#228B22" },
    { id: "hs4jWlLgLgulQiKRTJDr", name: "国民民主党", color: "#000080" },
    { id: "8HaVrxHMjnYnWzQTabYZ", name: "日本共産党", color: "#E63946" },
    { id: "HQh3QrLCkpshhlMItGkp", name: "れいわ新選組", color: "#F72585" },
    { id: "GThYfAHQTQjWsiyX9w9I", name: "社民党", color: "#118AB2" },
    { id: "F4PhicYTj6U6YcFiNyYB", name: "参政党", color: "#FF4500" },
  ];

  // 政党名クリック時のハンドラー
  const handlePartyClick = useCallback(
    (partyName: string) => {
      // 静的マッピングから政党IDを探す
      const party = PARTY_ID_MAP.find((p) => p.name === partyName);

      if (party) {
        // 見つかった場合は政党詳細ページに遷移
        navigateToParty(navigate, party.id);
      } else {
        console.warn(`Party not found with name: ${partyName}`);
      }
    },
    [navigate]
  );
  // 政策データの取得
  useEffect(() => {
    const loadPolicy = async () => {
      if (!id) {
        setError("政策IDが指定されていません");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Firestoreから政策データを取得
        const policyData = await fetchPolicyById(id);

        if (policyData) {
          setPolicy(policyData);
          console.log("政策データを取得しました:", policyData);
          const voteType = getVoteFromLocalStorage(policyData.id);
          console.log(`政策ID ${id} の投票タイプ:`, voteType);

          // 最近見た政策として保存
          saveRecentlyViewedPolicy({
            id: policyData.id,
            title: policyData.title,
          });
        } else {
          setError("指定された政策データが見つかりませんでした");
        }
      } catch (err) {
        console.error("政策データの取得中にエラーが発生しました:", err);
        setError(
          "政策データの読み込みに失敗しました。もう一度お試しください。"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPolicy();
    // ページトップにスクロール
    window.scrollTo(0, 0);
  }, [id]);

  // UI handlers
  const handleVoteClick = (type: "support" | "oppose") => {
    setVoteType(type);
    setShowReasonForm(true);
  };

  // PolicyVoteFormから呼び出されるコールバック関数
  const handleVoteComplete = () => {
    // 投票フォームをリセット
    setVoteType(null);
    setShowReasonForm(false);
  };

  // 戻るボタンのハンドラ
  const handleBackToList = () => {
    navigate("/policy");
  };

  const formatDate = (dateString: string | number | Date) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (e) {
      return dateString; // 日付形式でない場合はそのまま返す
    }
  };

  // ローディング表示
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 min-h-[400px] flex items-center justify-center">
        <LoadingAnimation type="dots" message="政策情報を読み込んでいます" />
      </div>
    );
  }

  // エラー表示
  if (error || !policy) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <div className="text-red-500 mb-2">
          <AlertCircle className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          政策が見つかりません
        </h3>
        <p className="mt-2 text-gray-600">
          {error || "指定されたIDの政策情報を取得できませんでした。"}
        </p>
        <button
          onClick={handleBackToList}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          政策一覧に戻る
        </button>
      </div>
    );
  }

  // 政党カラーに基づくスタイル設定を取得
  const partyColor = getPartyColor(policy.name);
  const colorStyles = getPartyColorStyles(partyColor);

  return (
    <div className="flex flex-col w-full min-h-screen font-sans bg-slate-50">
      {/* Main content */}
      <main className="flex-1 pb-16 sm:p-4 p-0 container mx-auto max-w-7xl">
        <div className="mx-auto max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
          <section className="space-y-4">
            {/* <div className="flex items-center justify-between mb-2">
              <button
                className={`flex items-center text-[${colorStyles.mainColor}] hover:text-[${colorStyles.textColor}] transition`}
                onClick={handleBackToList}
              >
                <ArrowLeft size={16} className="mr-1" />
                <span>政策一覧に戻る</span>
              </button>

              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition">
                  <Share2 size={18} />
                </button>
                <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition">
                  <Bookmark size={18} />
                </button>
              </div>
            </div> */}

            {/* Policy Card - Main Visual Focus */}
            <div className="bg-white shadow-lg overflow-hidden animate-fadeIn lg:rounded-2xl">
              {/* Hero section with gradient based on party color */}
              <div
                className="relative p-6 text-white"
                style={{ background: colorStyles.heroBg }}
              >
                {/* Sparkling animation overlay */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="sparkles"></div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold mb-2 relative z-10 text-shadow-sm">
                  {policy.title}
                </h1>

                <div className="flex flex-wrap items-center text-sm mb-4 relative z-10">
                  <div className="flex items-center mr-2 mb-2">
                    <img
                      src={`${window.location.origin}/cm_parly_images/${
                        policy.name || ""
                      }.jpg`}
                      alt={`${policy.name || "政党"} アイコン`}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md mr-2 cursor-pointer hover:opacity-80 transition-opacity active:transform active:scale-95"
                      onClick={() => handlePartyClick(policy.name)}
                      onError={(e) => {
                        console.log("画像読み込みエラー:", e);
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <span
                      className="bg-white bg-opacity-20 backdrop-blur-md px-2 py-1 rounded-md cursor-pointer hover:bg-opacity-30 transition-all duration-200 active:transform active:scale-95"
                      onClick={() => handlePartyClick(policy.name)}
                    >
                      {policy.name}
                    </span>
                  </div>
                </div>

                <p className="mb-6 relative z-10 text-sm sm:text-base leading-relaxed bg-white bg-opacity-20 backdrop-blur-md p-3 rounded-lg text-white font-normal">
                  {policy.description}
                </p>
                <div className="py-2 relative z-10">
                  <h3 className="text-sm font-semibold mb-2">
                    影響を受ける分野:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {policy.affectedFields.map((area: string, i: number) => (
                      <span
                        key={i}
                        className="bg-white bg-opacity-20 backdrop-blur-md px-3 py-1 rounded-full text-xs"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Key points with animated gradient border based on party color */}
              <div className="relative p-5 border-b border-gray-100 overflow-hidden">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: `linear-gradient(90deg, ${colorStyles.mainColor}, ${colorStyles.mainColor}99, ${colorStyles.mainColor}BB, ${colorStyles.mainColor})`,
                    backgroundSize: "300% 100%",
                    animation: "gradient-slide 4s linear infinite",
                  }}
                ></div>
                <h3 className="font-bold text-gray-800 mb-3">主要ポイント</h3>
                <ul className="space-y-3">
                  {policy.keyPoints.map((point: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-start hover:transform hover:scale-102 transition-transform"
                    >
                      <div
                        className="text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3 shadow-sm"
                        style={{
                          background: `linear-gradient(to right, ${colorStyles.mainColor}, ${colorStyles.mainColor}99)`,
                        }}
                      >
                        {i + 1}
                      </div>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Impact on citizens section with party colors */}
              <div className="px-3 py-8 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-2 text-xl">👥</span>
                  国民への影響
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 経済への影響 */}
                  <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-slate-50 shadow-md transition-all duration-300 hover:shadow-xl">
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: colorStyles.lightGradient }}
                    ></div>
                    <div
                      className="absolute h-full w-1 left-0 top-0"
                      style={{
                        background: `linear-gradient(to bottom, ${colorStyles.mainColor}, ${colorStyles.mainColor}99)`,
                      }}
                    ></div>

                    <div className="p-6 relative z-10">
                      <div className="flex items-center mb-4">
                        <div
                          className="flex items-center justify-center w-12 h-12 rounded-full shadow-inner text-2xl"
                          style={{
                            background: `linear-gradient(to bottom right, ${colorStyles.mediumBg}, ${colorStyles.lightBg})`,
                          }}
                        >
                          💰
                        </div>
                        <h4
                          className="font-bold text-xl ml-4 text-gray-800 group-hover:transition-colors duration-300"
                          style={{
                            color: "inherit",
                          }}
                        >
                          経済的影響
                        </h4>
                      </div>

                      <p className="text-gray-600 leading-relaxed mb-5 group-hover:text-gray-700 transition-colors duration-300">
                        {policy.economicImpact}
                      </p>
                    </div>
                  </div>

                  {/* 生活への影響 */}
                  <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-slate-50 shadow-md transition-all duration-300 hover:shadow-xl">
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: colorStyles.lightGradient }}
                    ></div>
                    <div
                      className="absolute h-full w-1 left-0 top-0"
                      style={{
                        background: `linear-gradient(to bottom, ${colorStyles.mainColor}, ${colorStyles.mainColor}99)`,
                      }}
                    ></div>

                    <div className="p-6 relative z-10">
                      <div className="flex items-center mb-4">
                        <div
                          className="flex items-center justify-center w-12 h-12 rounded-full shadow-inner text-2xl"
                          style={{
                            background: `linear-gradient(to bottom right, ${colorStyles.mediumBg}, ${colorStyles.lightBg})`,
                          }}
                        >
                          🏠
                        </div>
                        <h4
                          className="font-bold text-xl ml-4 text-gray-800 group-hover:transition-colors duration-300"
                          style={{
                            color: "inherit",
                          }}
                        >
                          生活への影響
                        </h4>
                      </div>

                      <p className="text-gray-600 leading-relaxed mb-5 group-hover:text-gray-700 transition-colors duration-300">
                        {policy.lifeImpact}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Party positions - with dynamic party colors */}
              {/* 各政党ごとの主張　　主張の値がある場合だけ登録 */}
              {policy.politicalParties &&
                policy.politicalParties.length > 0 && (
                  <div className="px-3 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                      <Building
                        size={18}
                        className="mr-2"
                        style={{ color: colorStyles.mainColor }}
                      />
                      政党の立場
                    </h3>

                    {(() => {
                      const validParties = policy.politicalParties.filter(
                        (party: any) => party && party.partyName && party.claims
                      );

                      // Determine grid column layout based on number of valid parties
                      const gridCols =
                        validParties.length > 1
                          ? "grid grid-cols-1 md:grid-cols-2 gap-2"
                          : "grid grid-cols-1 gap-4";

                      return (
                        <div className={gridCols}>
                          {validParties.map((party: any, index: number) => {
                            // 提案政党は最初のもの、それ以外は対立政党
                            const isProposingParty = index === 0;

                            // 色の設定
                            const partyStyle = isProposingParty
                              ? colorStyles
                              : getPartyColorStyles("#EF4444"); // 反対派は赤系統で固定

                            return (
                              <div
                                key={index}
                                className="rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow"
                                style={{
                                  background: isProposingParty
                                    ? `linear-gradient(to bottom right, ${colorStyles.lightBg}, ${colorStyles.mediumBg})`
                                    : `linear-gradient(to bottom right, #FEE2E2, #FECACA)`,
                                  borderColor: isProposingParty
                                    ? colorStyles.borderColor
                                    : "#FECACA",
                                }}
                              >
                                <div className="flex items-center">
                                  <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl text-white shadow-sm mr-3"
                                    style={{
                                      background: isProposingParty
                                        ? `linear-gradient(to right, ${colorStyles.mainColor}, ${colorStyles.mainColor}99)`
                                        : "linear-gradient(to right, #EF4444, #B91C1C)",
                                    }}
                                  >
                                    {isProposingParty ? "🌱" : "⚙️"}
                                  </div>
                                  <div>
                                    <h4
                                      className="font-semibold"
                                      style={{
                                        color: isProposingParty
                                          ? colorStyles.mainColor
                                          : "#B91C1C",
                                      }}
                                    >
                                      {isProposingParty
                                        ? "提案政党: "
                                        : "対立政党: "}
                                      <span
                                        className="cursor-pointer underline decoration-dotted hover:decoration-solid transition-all"
                                        onClick={() =>
                                          handlePartyClick(party.partyName)
                                        }
                                      >
                                        {party.partyName}
                                      </span>
                                    </h4>
                                    <div
                                      className="h-1 w-16 rounded-full mt-1"
                                      style={{
                                        background: isProposingParty
                                          ? `linear-gradient(to right, ${colorStyles.mainColor}, ${colorStyles.mainColor}99)`
                                          : "linear-gradient(to right, #EF4444, #B91C1C)",
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                <p
                                  className="mt-3 text-sm text-gray-600 italic border-l-2 pl-3 ml-2"
                                  style={{
                                    borderColor: isProposingParty
                                      ? colorStyles.mainColor
                                      : "#EF4444",
                                  }}
                                >
                                  "{party.claims}"
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}
              {/* ReplyDataProviderをこのレベルに配置する */}
              <ReplyDataProvider>
                {/* 評価セクション (共通コンポーネントに置き換え) */}
                <div className="p-3">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-inner">
                    <EntityRatingsSection
                      supportRate={policy.supportRate}
                      opposeRate={policy.opposeRate}
                      totalVotes={policy.totalVotes}
                    />
                  </div>
                  <UnifiedVoteComponent
                    entityType="policy"
                    entityId={policy.id}
                  />
                </div>

                {/* コメントセクション - ReplyDataProviderの中に配置 */}
                <div
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-fadeIn"
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="p-3">
                    <h3 className="font-bold text-lg mb-4 flex items-center">
                      <MessageSquare
                        size={18}
                        className="mr-2"
                        style={{ color: colorStyles.mainColor }}
                      />
                      議論フォーラム
                    </h3>

                    {/* CommentSectionコンポーネントにはReplyDataProviderが不要に */}
                    <CommentSection
                      entityType="policy"
                      entityId={policy.id}
                      totalCommentCount={policy.totalCommentCount}
                    />
                  </div>
                </div>
              </ReplyDataProvider>
            </div>
          </section>
        </div>
      </main>

      {/* CSS animations */}
      <style>{commonAnimations}</style>
    </div>
  );
};

export default PolicyDiscussionPage;
