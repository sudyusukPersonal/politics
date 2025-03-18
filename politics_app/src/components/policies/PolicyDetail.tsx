// src/components/policies/PolicyDetail.tsx
import React, { useState, useEffect } from "react";
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

const PolicyDiscussionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 状態管理
  const [policy, setPolicy] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [voteType, setVoteType] = useState<string | null>(null);

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
  const handleVoteClick = (type: string) => {
    setVoteType(type);
    setShowVoteForm(true);
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

  // 政党カラーからグラデーションを生成するヘルパー関数
  // 政党カラーからグラデーションを生成するヘルパー関数
  const getGradientFromPartyColor = (color: string) => {
    // カラーに透明度を付けたり、微妙に異なる色合いを作成
    const lighterColor = color.replace(/^#/, "");
    const r = parseInt(lighterColor.substr(0, 2), 16);
    const g = parseInt(lighterColor.substr(2, 2), 16);
    const b = parseInt(lighterColor.substr(4, 2), 16);

    // 明るい色の輝度を抑え、暗めの色を生成する（テキストが見やすくなるよう）
    const lighter = `rgba(${Math.min(r + 20, 255)}, ${Math.min(
      g + 20,
      255
    )}, ${Math.min(b + 20, 255)}, 1)`;
    const darker = `rgba(${Math.max(r - 50, 0)}, ${Math.max(
      g - 50,
      0
    )}, ${Math.max(b - 50, 0)}, 1)`;

    return {
      mainColor: color,
      gradient: `from-[${color}] via-[${lighter}] to-[${darker}]`,
      // より暗めのグラデーションで背景を設定
      heroBg: `linear-gradient(to bottom right, ${darker}, ${color}, ${darker})`,
      lightBg: `${color}10`,
      mediumBg: `${color}20`,
      borderColor: `${color}30`,
      textColor: `${color}`,
      lightGradient: `linear-gradient(to right, ${color}10, ${lighter}10)`,
    };
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
  const partyColor = policy.proposingParty.color;
  const colorStyles = getGradientFromPartyColor(partyColor);

  // サンプルコメント（実際の実装では、コメントデータもFirestoreから取得する）
  const comments = [
    {
      id: "c1",
      type: "support",
      text: "将来世代のためにもカーボンニュートラルは必須です。この法案を強く支持します。具体的な年次目標があり、企業の責任を明確にしている点が評価できます。",
      userName: "匿名ユーザー",
      createdAt: new Date("2023-10-17T09:30:00"),
      likes: 247,
      repliesCount: 12,
    },
    {
      id: "c2",
      type: "oppose",
      text: "急激な移行は経済に打撃を与えます。もっと段階的なアプローチをとるべきです。特に中小企業への配慮が不足しています。地方経済への影響も懸念されます。",
      userName: "匿名ユーザー",
      createdAt: new Date("2023-10-16T14:22:00"),
      likes: 183,
      repliesCount: 8,
    },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen font-sans bg-slate-50">
      {/* Main content */}
      <main className="flex-1 p-4 pb-16 container mx-auto max-w-7xl">
        <div className="mx-auto max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
          <section className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <button
                className={`flex items-center text-[${colorStyles.mainColor}] hover:text-[${colorStyles.textColor}] transition`}
                onClick={handleBackToList}
              >
                <ArrowLeft size={16} className="mr-1" />
                <span>政策一覧に戻る</span>
              </button>

              {/* Right-side actions */}
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition">
                  <Share2 size={18} />
                </button>
                <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition">
                  <Bookmark size={18} />
                </button>
              </div>
            </div>

            {/* Policy Card - Main Visual Focus */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-fadeIn">
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
                  <span className="bg-white bg-opacity-20 backdrop-blur-md px-2 py-1 rounded-md mr-2 mb-2">
                    {policy.politicalParties[0].partyName}
                  </span>
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
              <div className="px-5 py-8 border-b border-gray-100">
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
                            groupHover: { color: colorStyles.mainColor },
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
                            groupHover: { color: colorStyles.mainColor },
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
              <div className="px-5 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Building
                    size={18}
                    className="mr-2"
                    style={{ color: colorStyles.mainColor }}
                  />
                  政党の立場
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {policy.politicalParties.map((party: any, index: number) => {
                    // 対抗政党の色を決定（ここではシンプルに赤系統を使用）
                    const opposingColor =
                      index === 0
                        ? colorStyles
                        : getGradientFromPartyColor("#EF4444"); // 反対派は赤系統で固定

                    return (
                      <div
                        key={index}
                        className="rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow"
                        style={{
                          background:
                            index === 0
                              ? `linear-gradient(to bottom right, ${colorStyles.lightBg}, ${colorStyles.mediumBg})`
                              : `linear-gradient(to bottom right, #FEE2E2, #FECACA)`,
                          borderColor:
                            index === 0 ? colorStyles.borderColor : "#FECACA",
                        }}
                      >
                        <div className="flex items-center">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xl text-white shadow-sm mr-3"
                            style={{
                              background:
                                index === 0
                                  ? `linear-gradient(to right, ${colorStyles.mainColor}, ${colorStyles.mainColor}99)`
                                  : "linear-gradient(to right, #EF4444, #B91C1C)",
                            }}
                          >
                            {index === 0 ? "🌱" : "⚙️"}
                          </div>
                          <div>
                            <h4
                              className="font-semibold"
                              style={{
                                color:
                                  index === 0
                                    ? colorStyles.mainColor
                                    : "#B91C1C",
                              }}
                            >
                              {index === 0 ? "提案政党: " : "対立政党: "}
                              {party.partyName}
                            </h4>
                            <div
                              className="h-1 w-16 rounded-full mt-1"
                              style={{
                                background:
                                  index === 0
                                    ? `linear-gradient(to right, ${colorStyles.mainColor}, ${colorStyles.mainColor}99)`
                                    : "linear-gradient(to right, #EF4444, #B91C1C)",
                              }}
                            ></div>
                          </div>
                        </div>
                        <p
                          className="mt-3 text-sm text-gray-600 italic border-l-2 pl-3 ml-2"
                          style={{
                            borderColor:
                              index === 0 ? colorStyles.mainColor : "#EF4444",
                          }}
                        >
                          "{party.claims}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Approval ratings section */}
              <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl mx-4 my-4 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <h3 className="font-bold text-gray-700 mb-1 sm:mb-0">
                    市民評価
                  </h3>
                  <span className="text-sm text-gray-500">
                    総投票数: {policy.totalVotes.toLocaleString()}
                  </span>
                </div>

                {/* Support/Oppose stats - これらは一貫性のためオリジナルカラーを保持 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <ThumbsUp size={16} className="text-green-500 mr-2" />
                        <span className="text-sm font-medium">支持</span>
                      </div>
                      <span className="text-xl font-bold text-green-600">
                        {policy.supportRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-expand"
                        style={{ width: `${policy.supportRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm border border-red-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <ThumbsDown size={16} className="text-red-500 mr-2" />
                        <span className="text-sm font-medium">不支持</span>
                      </div>
                      <span className="text-xl font-bold text-red-600">
                        {policy.opposeRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-400 to-rose-500 animate-expand"
                        style={{ width: `${policy.opposeRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Combined progress bar */}
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex my-3">
                  <div
                    className="h-full rounded-l-full transition-all duration-700 ease-in-out"
                    style={{
                      width: `${policy.supportRate}%`,
                      background: "linear-gradient(to right, #10B981, #059669)",
                    }}
                  ></div>
                  <div
                    className="h-full rounded-r-full transition-all duration-700 ease-in-out"
                    style={{
                      width: `${policy.opposeRate}%`,
                      background: "linear-gradient(to right, #F43F5E, #E11D48)",
                    }}
                  ></div>
                </div>

                {/* Vote buttons */}
                {!showVoteForm ? (
                  <div className="mt-4 flex flex-col sm:flex-row sm:justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                      onClick={() => handleVoteClick("support")}
                      className="flex items-center justify-center text-white py-2.5 px-6 rounded-full font-medium shadow-sm hover:shadow-lg transition transform hover:-translate-y-0.5 hover:shadow-green-200"
                      style={{
                        background:
                          "linear-gradient(to right, #10B981, #059669)",
                      }}
                    >
                      <ThumbsUp size={16} className="mr-2" />
                      支持する
                    </button>
                    <button
                      onClick={() => handleVoteClick("oppose")}
                      className="flex items-center justify-center text-white py-2.5 px-6 rounded-full font-medium shadow-sm hover:shadow-lg transition transform hover:-translate-y-0.5 hover:shadow-red-200"
                      style={{
                        background:
                          "linear-gradient(to right, #F43F5E, #E11D48)",
                      }}
                    >
                      <ThumbsDown size={16} className="mr-2" />
                      支持しない
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 animate-fadeIn">
                    <div
                      className={`rounded-xl p-4 mb-3 ${
                        voteType === "support"
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <h3 className="font-medium mb-1 flex items-center">
                        {voteType === "support" ? (
                          <>
                            <ThumbsUp
                              size={16}
                              className="text-green-500 mr-2"
                            />
                            <span className="text-green-700">支持する理由</span>
                          </>
                        ) : (
                          <>
                            <ThumbsDown
                              size={16}
                              className="text-red-500 mr-2"
                            />
                            <span className="text-red-700">支持しない理由</span>
                          </>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        具体的な理由を記入してください（必須）
                      </p>

                      <form>
                        <textarea
                          className={`w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:outline-none transition-shadow ${
                            voteType === "support"
                              ? "focus:ring-green-300"
                              : "focus:ring-red-300"
                          }`}
                          rows={4}
                          placeholder="あなたの意見を書いてください..."
                          required
                        ></textarea>

                        <div className="text-right text-xs text-gray-500 mt-1 mb-3">
                          0/500文字
                        </div>

                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-3">
                          <button
                            type="button"
                            className="py-2.5 rounded-lg text-white font-medium transition transform hover:scale-105 flex items-center justify-center"
                            style={{
                              background:
                                voteType === "support"
                                  ? "linear-gradient(to right, #10B981, #059669)"
                                  : "linear-gradient(to right, #F43F5E, #E11D48)",
                            }}
                          >
                            評価を送信
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowVoteForm(false)}
                            className="py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                          >
                            キャンセル
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comments section - これは指示により変更しない */}
            <div
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-fadeIn"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center">
                  <MessageSquare
                    size={18}
                    className="mr-2"
                    style={{ color: colorStyles.mainColor }}
                  />
                  議論フォーラム
                </h3>

                {/* Comment form */}
                <div
                  className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 my-6 p-4 rounded-lg border shadow-inner"
                  style={{
                    background: colorStyles.lightBg,
                    borderColor: colorStyles.borderColor,
                  }}
                >
                  <span className="text-sm text-gray-700">
                    <MessageSquare size={16} className="inline mr-1" />
                    あなたもこの政策について議論に参加できます
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleVoteClick("support")}
                      className="px-4 py-1.5 hover:shadow-md text-white text-sm rounded-full flex items-center transition transform hover:scale-105"
                      style={{
                        background:
                          "linear-gradient(to right, #10B981, #059669)",
                      }}
                    >
                      <ThumbsUp size={14} className="mr-1" />
                      支持する
                    </button>
                    <button
                      onClick={() => handleVoteClick("oppose")}
                      className="px-4 py-1.5 hover:shadow-md text-white text-sm rounded-full flex items-center transition transform hover:scale-105"
                      style={{
                        background:
                          "linear-gradient(to right, #F43F5E, #E11D48)",
                      }}
                    >
                      <ThumbsDown size={14} className="mr-1" />
                      支持しない
                    </button>
                  </div>
                </div>

                {/* Comments */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`rounded-xl p-4 border transition-all duration-300 hover:shadow-md ${
                        comment.type === "support"
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-100"
                          : "bg-gradient-to-r from-red-50 to-rose-50 border-red-100"
                      }`}
                    >
                      <p className="text-gray-700">{comment.text}</p>

                      <div className="flex justify-between mt-3 items-center">
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="font-medium">
                            {comment.userName}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{comment.createdAt.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <button className="flex items-center text-xs bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-700 px-2 py-1 rounded-full shadow-sm transition">
                            <ThumbsUp size={12} className="mr-1" />
                            <span>{comment.likes}</span>
                          </button>

                          <button
                            className="text-xs transition"
                            style={{
                              color: colorStyles.mainColor,
                              hoverColor: colorStyles.textColor,
                            }}
                          >
                            返信
                          </button>
                        </div>
                      </div>

                      {comment.repliesCount > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-200">
                          <button className="flex items-center text-xs text-gray-500 hover:text-gray-700">
                            <MessageSquare size={14} className="mr-1" />
                            <span>{comment.repliesCount} 返信</span>
                            <ChevronRight size={14} className="ml-1" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* View more button */}
                  <div className="text-center mt-6">
                    <button
                      className="text-white font-medium py-2 px-8 rounded-full text-sm transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg"
                      style={{
                        background: `linear-gradient(to right, ${colorStyles.mainColor}, ${colorStyles.mainColor}99)`,
                      }}
                    >
                      さらに表示する
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
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
        
        @keyframes pulse-subtle {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
        
        @keyframes expand {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        .animate-expand {
          animation: expand 1s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        
        .text-shadow-sm {
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        
        .gradient-border {
          background: linear-gradient(90deg, #10B981, #06B6D4, #3B82F6, #10B981);
          background-size: 300% 100%;
          animation: gradient-slide 4s linear infinite;
        }
        
        @keyframes gradient-slide {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        
        .sparkles {
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 2%),
            radial-gradient(circle at 75% 44%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 2%),
            radial-gradient(circle at 46% 52%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 1.5%),
            radial-gradient(circle at 33% 76%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 2%),
            radial-gradient(circle at 80% 18%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 2.5%);
          background-repeat: no-repeat;
          animation: sparkle 6s linear infinite;
        }
        
        @keyframes sparkle {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default PolicyDiscussionPage;
