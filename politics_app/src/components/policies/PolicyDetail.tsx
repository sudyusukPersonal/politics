import React, { useState } from "react";
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

const PolicyDiscussionPage = () => {
  // Sample policy data
  const policy = {
    id: "p1",
    title: "カーボンニュートラル推進法案",
    description:
      "2050年までに温室効果ガスの排出を全体としてゼロにする政策。再生可能エネルギーの導入促進や、CO2排出量の多い産業への課税強化が含まれる。",
    category: "環境・エネルギー",
    proposedDate: "2023年10月15日",
    status: "審議中",
    supportRate: 64,
    opposeRate: 36,
    totalVotes: 12583,
    impactAreas: ["経済", "環境", "エネルギー", "国際関係"],
    keyPoints: [
      "2030年までに再生可能エネルギー比率を40%に引き上げ",
      "CO2排出量の多い企業への炭素税導入",
      "電気自動車への補助金拡大",
      "森林保全と植林の推進",
    ],
    impacts: [
      {
        category: "経済的影響",
        icon: "💰",
        description:
          "短期的には電気料金や化石燃料コストの上昇により家計負担が増加。長期的には再生可能エネルギーコストの低減や新産業の創出による経済成長が期待される。",
        aspects: ["光熱費上昇", "新産業創出", "雇用構造変化", "省エネ投資促進"],
      },
      {
        category: "生活への影響",
        icon: "🏠",
        description:
          "生活様式の変化（電気自動車の普及、省エネ住宅の標準化）が必要になる一方、大気汚染の減少による健康改善効果や、気候変動による災害リスク低減が期待される。",
        aspects: ["移動手段変化", "住環境向上", "健康増進", "災害リスク低減"],
      },
    ],
    proposingParty: {
      name: "環境未来党",
      color: "#10B981",
      logo: "🌱",
      statement:
        "気候変動対策は国家の最優先事項であり、産業構造の変革に踏み出す時です。",
    },
    opposingParty: {
      name: "経済成長党",
      color: "#F43F5E",
      logo: "⚙️",
      statement:
        "経済成長とのバランスを欠いた環境政策は国民生活を圧迫します。段階的な移行が必要です。",
    },
  };

  // Sample comments
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

  // UI state
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [voteType, setVoteType] = useState(null);

  // UI handlers
  const handleVoteClick = (type) => {
    setVoteType(type);
    setShowVoteForm(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col w-full min-h-screen font-sans bg-slate-50">
      {/* Header for preview purposes */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-teal-600 to-emerald-500 shadow-lg">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <h1 className="font-bold tracking-wide text-white text-lg">
            POLITICS HUB
          </h1>
          <div className="flex space-x-4">
            <button className="text-white hover:text-teal-200 transition">
              ログイン
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 pb-16 container mx-auto max-w-7xl">
        <div className="mx-auto max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
          <section className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <button className="flex items-center text-teal-600 hover:text-teal-800 transition">
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
              {/* Hero section with dramatic gradient */}
              <div className="relative bg-gradient-to-br from-teal-600 via-emerald-500 to-cyan-600 p-6 text-white">
                {/* Sparkling animation overlay */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="sparkles"></div>
                </div>

                {/* Removed trending indicator as requested */}

                <h1 className="text-2xl sm:text-3xl font-bold mb-2 relative z-10 text-shadow-sm">
                  {policy.title}
                </h1>

                <div className="flex flex-wrap items-center text-sm mb-4 relative z-10">
                  <span className="bg-white bg-opacity-20 backdrop-blur-md px-2 py-1 rounded-md mr-2 mb-2">
                    {policy.category}
                  </span>
                  <span className="flex items-center mr-2 mb-2">
                    <Calendar size={14} className="mr-1" />
                    提案: {policy.proposedDate}
                  </span>
                  <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md mb-2">
                    {policy.status}
                  </span>
                </div>

                <p className="mb-6 text-white text-opacity-90 relative z-10 text-sm sm:text-base leading-relaxed">
                  {policy.description}
                </p>

                <div className="py-2 relative z-10">
                  <h3 className="text-sm font-semibold mb-2">
                    影響を受ける分野:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {policy.impactAreas.map((area, i) => (
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

              {/* Key points with animated gradient border */}
              <div className="relative p-5 border-b border-gray-100 overflow-hidden">
                <div className="absolute inset-0 gradient-border opacity-10"></div>
                <h3 className="font-bold text-gray-800 mb-3">主要ポイント</h3>
                <ul className="space-y-3">
                  {policy.keyPoints.map((point, i) => (
                    <li
                      key={i}
                      className="flex items-start hover:transform hover:scale-102 transition-transform"
                    >
                      <div className="bg-gradient-to-r from-teal-500 to-emerald-400 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3 shadow-sm">
                        {i + 1}
                      </div>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Impact on citizens section - SOPHISTICATED & INTEGRATED */}
              <div className="px-5 py-8 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-2 text-xl">👥</span>
                  国民への影響
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {policy.impacts.map((impact, i) => (
                    <div
                      key={i}
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-slate-50 shadow-md transition-all duration-300 hover:shadow-xl"
                    >
                      {/* Decorative gradient accent */}
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="absolute h-full w-1 bg-gradient-to-b from-teal-400 to-emerald-500 left-0 top-0"></div>

                      <div className="p-6 relative z-10">
                        <div className="flex items-center mb-4">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 shadow-inner text-2xl">
                            {impact.icon}
                          </div>
                          <h4 className="font-bold text-xl ml-4 text-gray-800 group-hover:text-teal-800 transition-colors duration-300">
                            {impact.category}
                          </h4>
                        </div>

                        <p className="text-gray-600 leading-relaxed mb-5 group-hover:text-gray-700 transition-colors duration-300">
                          {impact.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-auto">
                          {impact.aspects.map((aspect, j) => (
                            <span
                              key={j}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 border border-teal-100"
                            >
                              {aspect}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Party positions - New section */}
              <div className="px-5 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Building size={18} className="mr-2 text-teal-600" />
                  政党の立場
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Proposing party */}
                  <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 flex items-center justify-center text-xl text-white shadow-sm mr-3">
                        {policy.proposingParty.logo}
                      </div>
                      <div>
                        <h4 className="font-semibold text-teal-700">
                          提案政党: {policy.proposingParty.name}
                        </h4>
                        <div className="h-1 w-16 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full mt-1"></div>
                      </div>
                    </div>
                    <p
                      className="mt-3 text-sm text-gray-600 italic border-l-2 pl-3 ml-2"
                      style={{ borderColor: policy.proposingParty.color }}
                    >
                      "{policy.proposingParty.statement}"
                    </p>
                  </div>

                  {/* Opposing party */}
                  <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-4 border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-500 to-red-400 flex items-center justify-center text-xl text-white shadow-sm mr-3">
                        {policy.opposingParty.logo}
                      </div>
                      <div>
                        <h4 className="font-semibold text-rose-700">
                          反対政党: {policy.opposingParty.name}
                        </h4>
                        <div className="h-1 w-16 bg-gradient-to-r from-rose-500 to-red-400 rounded-full mt-1"></div>
                      </div>
                    </div>
                    <p
                      className="mt-3 text-sm text-gray-600 italic border-l-2 pl-3 ml-2"
                      style={{ borderColor: policy.opposingParty.color }}
                    >
                      "{policy.opposingParty.statement}"
                    </p>
                  </div>
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

                {/* Support/Oppose stats */}
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
                      className="flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 px-6 rounded-full font-medium shadow-sm hover:shadow-lg transition transform hover:-translate-y-0.5 hover:shadow-green-200"
                    >
                      <ThumbsUp size={16} className="mr-2" />
                      支持する
                    </button>
                    <button
                      onClick={() => handleVoteClick("oppose")}
                      className="flex items-center justify-center bg-gradient-to-r from-red-500 to-rose-600 text-white py-2.5 px-6 rounded-full font-medium shadow-sm hover:shadow-lg transition transform hover:-translate-y-0.5 hover:shadow-red-200"
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
                            className={`py-2.5 rounded-lg text-white font-medium transition transform hover:scale-105 flex items-center justify-center ${
                              voteType === "support"
                                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-md"
                                : "bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-md"
                            }`}
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

            {/* Comments section */}
            <div
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-fadeIn"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center">
                  <MessageSquare size={18} className="mr-2 text-teal-600" />
                  議論フォーラム
                </h3>

                {/* Comment form */}
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 my-6 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg border border-teal-100 shadow-inner">
                  <span className="text-sm text-gray-700">
                    <MessageSquare size={16} className="inline mr-1" />
                    あなたもこの政策について議論に参加できます
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleVoteClick("support")}
                      className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-md text-white text-sm rounded-full flex items-center transition transform hover:scale-105"
                    >
                      <ThumbsUp size={14} className="mr-1" />
                      支持する
                    </button>
                    <button
                      onClick={() => handleVoteClick("oppose")}
                      className="px-4 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-md text-white text-sm rounded-full flex items-center transition transform hover:scale-105"
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
                          <span>{formatDate(comment.createdAt)}</span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <button className="flex items-center text-xs bg-white text-gray-600 hover:bg-teal-50 hover:text-teal-700 px-2 py-1 rounded-full shadow-sm transition">
                            <ThumbsUp size={12} className="mr-1" />
                            <span>{comment.likes}</span>
                          </button>

                          <button className="text-xs text-teal-600 hover:text-teal-800 transition">
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

                  {/* Sample expanded comment with replies */}
                  <div className="rounded-xl p-4 border transition-all duration-300 hover:shadow-md bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
                    <p className="text-gray-700">
                      気候変動対策は待ったなしの状況です。この法案は明確な目標を示しており、産業界にも変化を促す良い政策だと思います。特に再生可能エネルギー比率の引き上げは非常に重要なポイントです。
                    </p>

                    <div className="flex justify-between mt-3 items-center">
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="font-medium">匿名ユーザー</span>
                        <span className="mx-2">•</span>
                        <span>2023/10/15 16:45</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button className="flex items-center text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full shadow-sm">
                          <ThumbsUp size={12} className="mr-1" />
                          <span>156</span>
                        </button>
                        <button className="text-xs text-teal-600 hover:text-teal-800 transition">
                          返信
                        </button>
                      </div>
                    </div>

                    {/* Replies section (expanded) */}
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <div className="pl-4 ml-2 border-l-2 border-green-200 space-y-3 mt-2">
                        {/* Reply 1 */}
                        <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm mt-2 hover:shadow-md transition-shadow">
                          <div className="flex items-center mb-2 text-xs text-gray-500">
                            <svg
                              className="w-3 h-3 mr-1 text-gray-400"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="9 14 4 9 9 4"></polyline>
                              <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                            </svg>
                            <span className="font-medium text-gray-600">
                              @匿名ユーザー
                            </span>
                            <span className="ml-1">への返信</span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            目標設定は良いですが、実現可能性はどうでしょうか？特に地方での対応が遅れそうです。
                          </p>
                          <div className="flex justify-between mt-2 items-center">
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="font-medium">匿名ユーザー</span>
                              <span className="mx-2">•</span>
                              <span>2023/10/15 18:12</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <button className="flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                <ThumbsUp size={10} className="mr-1" />
                                <span>32</span>
                              </button>
                              <button className="text-xs text-teal-600 hover:text-teal-800 transition">
                                返信
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Reply 2 */}
                        <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center mb-2 text-xs text-gray-500">
                            <svg
                              className="w-3 h-3 mr-1 text-gray-400"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="9 14 4 9 9 4"></polyline>
                              <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                            </svg>
                            <span className="font-medium text-gray-600">
                              @匿名ユーザー
                            </span>
                            <span className="ml-1">への返信</span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            地方こそ再生可能エネルギーの潜在力が高いですよ。太陽光や風力、バイオマスなど地域資源を活用できます。
                          </p>
                          <div className="flex justify-between mt-2 items-center">
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="font-medium">匿名ユーザー</span>
                              <span className="mx-2">•</span>
                              <span>2023/10/15 19:05</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <button className="flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                <ThumbsUp size={10} className="mr-1" />
                                <span>47</span>
                              </button>
                              <button className="text-xs text-teal-600 hover:text-teal-800 transition">
                                返信
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* View more button */}
                  <div className="text-center mt-6">
                    <button className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:shadow-lg text-white font-medium py-2 px-8 rounded-full text-sm transition-all duration-300 transform hover:-translate-y-1 shadow-md">
                      さらに表示する
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Related policies */}
            <div
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-fadeIn"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center">
                  <AlertCircle size={18} className="mr-2 text-teal-600" />
                  関連政策
                </h3>
              </div>

              <div className="divide-y divide-gray-100">
                <div className="p-4 hover:bg-gradient-to-r hover:from-teal-50 hover:to-white transition-colors transform hover:scale-[1.01] cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        再生可能エネルギー促進法
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        太陽光・風力発電の導入を促進するための法案
                      </p>
                      <div className="flex items-center mt-2">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mr-2">
                          支持率: 72%
                        </span>
                        <span className="text-xs text-gray-500">
                          投票数: 8,543
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                </div>

                <div className="p-4 hover:bg-gradient-to-r hover:from-teal-50 hover:to-white transition-colors transform hover:scale-[1.01] cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        電気自動車普及拡大政策
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        電気自動車の購入補助金と充電設備の拡充
                      </p>
                      <div className="flex items-center mt-2">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mr-2">
                          支持率: 68%
                        </span>
                        <span className="text-xs text-gray-500">
                          投票数: 7,129
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                </div>

                <div className="p-4 hover:bg-gradient-to-r hover:from-teal-50 hover:to-white transition-colors transform hover:scale-[1.01] cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        企業向け炭素排出権取引制度
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        排出量に上限を設定し、企業間での排出枠取引を可能に
                      </p>
                      <div className="flex items-center mt-2">
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full mr-2">
                          支持率: 52%
                        </span>
                        <span className="text-xs text-gray-500">
                          投票数: 5,872
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="p-4 text-center">
                <button className="text-teal-600 hover:text-teal-800 text-sm font-medium hover:underline transition-all">
                  すべての関連政策を見る
                </button>
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
        
        .hover\:scale-102:hover {
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
