import React, { useState } from "react";
import {
  Search,
  Filter,
  TrendingUp,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Clock,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Activity,
  Users,
  MessageSquare,
} from "lucide-react";

const PolicyListingPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Sample policy data
  const policies = [
    {
      id: "p1",
      title: "所得税の「103万円の壁」撤廃",
      description:
        "国民民主党は所得税がかかり始める「年収103万円の壁」を178万円まで引き上げることを提案している。",
      category: "経済",
      status: "審議中",
      proposedDate: "2023年10月15日",
      supportRate: 64,
      opposeRate: 36,
      totalVotes: 12583,
      trending: "up",
      commentsCount: 152,
      proposingParty: {
        name: "国民民主党",
        color: "#10B981",
      },
    },
    {
      id: "p2",
      title: "再生可能エネルギー普及促進法案",
      description:
        "2030年までに国内の電力供給における再生可能エネルギーの割合を60%に引き上げることを目標とする法案。",
      category: "環境",
      status: "委員会審議",
      proposedDate: "2023年9月28日",
      supportRate: 72,
      opposeRate: 28,
      totalVotes: 18392,
      trending: "up",
      commentsCount: 237,
      proposingParty: {
        name: "立憲民主党",
        color: "#3B82F6",
      },
    },
    {
      id: "p3",
      title: "高等教育無償化拡大法案",
      description:
        "世帯年収590万円未満の学生に対する大学等の高等教育の無償化対象を拡大する法案。",
      category: "教育",
      status: "可決",
      proposedDate: "2023年8月5日",
      supportRate: 81,
      opposeRate: 19,
      totalVotes: 22145,
      trending: "up",
      commentsCount: 319,
      proposingParty: {
        name: "自由民主党",
        color: "#EF4444",
      },
    },
    {
      id: "p4",
      title: "少子化対策総合支援法案",
      description:
        "出産・育児に関する経済的支援を拡充し、保育施設の整備を促進する包括的な少子化対策法案。",
      category: "社会保障",
      status: "審議中",
      proposedDate: "2023年10月2日",
      supportRate: 77,
      opposeRate: 23,
      totalVotes: 15729,
      trending: "up",
      commentsCount: 187,
      proposingParty: {
        name: "公明党",
        color: "#F59E0B",
      },
    },
    {
      id: "p5",
      title: "デジタル人材育成推進法案",
      description:
        "ITスキル向上のための教育プログラムを全国の学校に導入し、デジタル人材の育成を促進する法案。",
      category: "教育",
      status: "審議中",
      proposedDate: "2023年9月10日",
      supportRate: 68,
      opposeRate: 32,
      totalVotes: 9876,
      trending: "none",
      commentsCount: 91,
      proposingParty: {
        name: "自由民主党",
        color: "#EF4444",
      },
    },
    {
      id: "p6",
      title: "防衛力強化推進法案",
      description:
        "防衛予算のGDP比2%への増額と装備品の国内調達促進を柱とする防衛力強化法案。",
      category: "安全保障",
      status: "委員会審議",
      proposedDate: "2023年10月5日",
      supportRate: 53,
      opposeRate: 47,
      totalVotes: 19254,
      trending: "down",
      commentsCount: 348,
      proposingParty: {
        name: "自由民主党",
        color: "#EF4444",
      },
    },
  ];

  const categories = [
    {
      id: "all",
      name: "すべて",
      color: "#6366F1",
      icon: <Activity size={14} />,
    },
    {
      id: "経済",
      name: "経済",
      color: "#06B6D4",
      icon: <TrendingUp size={14} />,
    },
    {
      id: "環境",
      name: "環境",
      color: "#10B981",
      icon: <AlertCircle size={14} />,
    },
    { id: "教育", name: "教育", color: "#F59E0B", icon: <Users size={14} /> },
    {
      id: "社会保障",
      name: "社会保障",
      color: "#8B5CF6",
      icon: <Users size={14} />,
    },
    {
      id: "安全保障",
      name: "安全保障",
      color: "#EF4444",
      icon: <AlertCircle size={14} />,
    },
    { id: "外交", name: "外交", color: "#3B82F6", icon: <Users size={14} /> },
  ];

  // Filter policies based on search and active category
  const filteredPolicies = policies.filter((policy) => {
    const matchesCategory =
      activeCategory === "all" || policy.category === activeCategory;
    const matchesSearch =
      policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePolicyClick = (policyId) => {
    // In a real app, this would navigate to the policy detail page
    console.log(`Navigate to policy ${policyId}`);
  };

  const getTrendingIcon = (trend) => {
    if (trend === "up") {
      return <TrendingUp size={16} className="text-green-500" />;
    } else if (trend === "down") {
      return (
        <TrendingUp size={16} className="text-red-500 transform rotate-180" />
      );
    }
    return null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "可決":
        return "bg-green-100 text-green-800 border-green-200";
      case "審議中":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "委員会審議":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "否決":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryById = (id) => {
    return categories.find((cat) => cat.id === id) || categories[0];
  };

  // Get current active category
  const activeTab = getCategoryById(activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-bl from-gray-50 via-amber-50 to-gray-50">
      {/* Compact header with modern design */}
      <div className="relative bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400 via-transparent to-transparent opacity-20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-400 via-transparent to-transparent opacity-20"></div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h1 className="text-2xl font-bold mb-1 inline-flex items-center">
              <div className="mr-2 p-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded">
                <AlertCircle size={18} className="text-white" />
              </div>
              政策提案データベース
            </h1>
            <p className="text-sm md:text-base opacity-80">
              最新政策の動向把握と意見表明プラットフォーム
            </p>
          </div>

          <div className="relative w-full md:w-auto md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-white opacity-70" />
            </div>
            <input
              type="text"
              placeholder="政策を検索..."
              className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-opacity-20 text-white placeholder-white placeholder-opacity-70 backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {/* Category tabs - Original horizontal layout */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-3 pb-2">
            {categories.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  className={`relative px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
                  }`}
                  style={{
                    backgroundColor: isActive ? category.color : "",
                  }}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{category.icon}</span>
                    <span className={`${isActive ? "font-bold" : ""}`}>
                      {category.name}
                    </span>
                    {isActive && (
                      <span className="relative ml-1.5 flex h-2 w-2">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content title */}
        <div className="relative mb-8">
          <div
            className="absolute left-0 top-0 h-full w-2 rounded-full"
            style={{ backgroundColor: activeTab.color }}
          ></div>

          <div className="flex justify-between items-center pl-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <span
                  className="mr-2 text-transparent bg-clip-text bg-gradient-to-r"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${activeTab.color}, ${activeTab.color}99)`,
                  }}
                >
                  {activeTab.name}
                </span>
                <span>政策一覧</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredPolicies.length}件の政策が見つかりました
              </p>
            </div>

            <div className="relative">
              <button
                className="flex items-center bg-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all border border-gray-200"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <Filter size={16} className="mr-2 text-indigo-600" />
                <span>並び替え</span>
              </button>

              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-indigo-100">
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center">
                      <ArrowUp size={16} className="mr-2 text-indigo-600" />
                      <span>支持率（高い順）</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center">
                      <ArrowDown size={16} className="mr-2 text-indigo-600" />
                      <span>支持率（低い順）</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center">
                      <Clock size={16} className="mr-2 text-indigo-600" />
                      <span>新しい順</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Policy Cards - Changed to display one per row in a vertical list */}
        <div className="space-y-4">
          {filteredPolicies.map((policy) => {
            const category = getCategoryById(policy.category);

            return (
              <div
                key={policy.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                style={{ border: `2px solid ${policy.proposingParty.color}` }}
                onClick={() => handlePolicyClick(policy.id)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div
                      className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: `${policy.proposingParty.color}15`,
                        color: policy.proposingParty.color,
                      }}
                    >
                      {policy.proposingParty.name}
                    </div>
                    {getTrendingIcon(policy.trending)}
                  </div>

                  <h3 className="font-bold text-lg mb-2 text-gray-800">
                    {policy.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4">
                    {policy.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full text-white"
                      style={{
                        backgroundColor: category.color,
                      }}
                    >
                      {policy.category}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 flex items-center">
                      <MessageSquare size={12} className="mr-1 flex-shrink-0" />
                      {policy.commentsCount}件のコメント
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <div className="flex items-center">
                        <ThumbsUp
                          size={14}
                          className="text-green-500 mr-1.5 animate-bounce-slow"
                        />
                        <span className="font-medium text-green-600">
                          {policy.supportRate}%
                        </span>
                      </div>
                      <div className="flex items-center">
                        <ThumbsDown
                          size={14}
                          className="text-red-500 mr-1.5 animate-bounce-slow"
                        />
                        <span className="font-medium text-red-600">
                          {policy.opposeRate}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden flex">
                      <div
                        className="h-full rounded-l-full"
                        style={{
                          width: `${policy.supportRate}%`,
                          backgroundColor: "#10B981", // Green
                        }}
                      ></div>
                      <div
                        className="h-full rounded-r-full"
                        style={{
                          width: `${policy.opposeRate}%`,
                          backgroundColor: "#EF4444", // Red
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load more button - simplified */}
        <div className="mt-8 text-center">
          <button className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
            <span className="flex items-center">
              さらに表示する
              <ChevronRight size={16} className="ml-1" />
            </span>
          </button>
        </div>
      </div>

      {/* Floating action button */}
      <div className="fixed bottom-6 right-6">
        <button className="w-12 h-12 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-indigo-700 transition-colors">
          <TrendingUp size={20} />
        </button>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PolicyListingPage;
