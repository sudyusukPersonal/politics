import React, { useState } from "react";
import {
  Building,
  FileText,
  Settings,
  Users,
  ChevronDown,
  ChevronRight,
  Plus,
  PenSquare,
  Trash2,
  Save,
  X,
  ArrowLeft,
  Eye,
  Info,
  HelpCircle,
} from "lucide-react";

const PartyAdminPage = () => {
  const [activeTab, setActiveTab] = useState("party-details");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePolicyId, setActivePolicyId] = useState<string | null>(null);
  const [isEditingParty, setIsEditingParty] = useState(false);
  const [isAddingPolicy, setIsAddingPolicy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // サンプルデータ
  const partyData = {
    id: "mJV3F03DLgaLLeBzfCdG",
    name: "自由民主党",
    color: "#555555",
    supportRate: 58,
    opposeRate: 42,
    totalVotes: 48500,
    members: 275,
    keyPolicies: ["経済成長", "安全保障", "教育改革"],
    description: "国民の生活を第一に考え、経済と安全を守る政策を推進します。",
    image: "/cm_parly_images/%E8%87%AA%E7%94%B1%E6%B0%91%E4%B8%BB%E5%85%9A.jpg",
  };

  const policiesData = [
    {
      id: "policy1",
      title: "経済成長政策",
      description: "消費税減税と規制緩和による経済成長を促進します。",
      supportRate: 65,
      opposeRate: 35,
      keyPoints: ["消費税時限的減税", "各種規制緩和", "投資促進税制の拡充"],
      ownPosition: "経済活性化のために積極的な減税と規制緩和を推進します。",
      opposingPositions: [
        {
          party: "立憲民主党",
          position: "選択的減税と福祉充実を優先すべきとの立場です",
        },
      ],
    },
    {
      id: "policy2",
      title: "安全保障強化法案",
      description: "国の安全を守るための防衛力強化と国際協力を推進します。",
      supportRate: 72,
      opposeRate: 28,
      keyPoints: ["防衛予算の拡充", "同盟国との協力強化", "安全保障技術の開発"],
      ownPosition:
        "国の安全を守るため防衛力強化は必須であり、積極的に推進します。",
      opposingPositions: [
        {
          party: "日本共産党",
          position: "軍事費増大には反対し、平和外交を重視すべきとの立場です",
        },
      ],
    },
  ];

  const renderHelp = () => (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => setShowHelp(false)}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">政党管理パネルヘルプ</h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowHelp(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-indigo-700 mb-2">政党詳細の編集</h4>
            <p>
              政党の基本情報（名前、説明、カラー等）を編集できます。情報は一般向けサイトに即時反映されます。
            </p>
          </div>

          <div>
            <h4 className="font-medium text-indigo-700 mb-2">政策管理</h4>
            <p>
              政党の政策を追加・編集できます。作成した政策は支持率・不支持率と共に表示されます。有権者から評価を得ることで、支持率が変動します。
            </p>
          </div>

          <div>
            <h4 className="font-medium text-indigo-700 mb-2">
              政策の作成のコツ
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>明確な政策タイトルをつけましょう</li>
              <li>政策の効果や影響を具体的に説明しましょう</li>
              <li>主要ポイントは簡潔に、わかりやすく記述しましょう</li>
              <li>自党の立場を明確に示しましょう</li>
              <li>対立政党の立場も公平に記載することで信頼性が高まります</li>
            </ul>
          </div>

          <div className="bg-indigo-50 p-3 rounded-md border-l-4 border-indigo-500">
            <h4 className="font-medium text-indigo-700">ヒント</h4>
            <p className="text-sm">
              政策の編集中でも「プレビュー」ボタンで一般向け表示を確認できます。公開前に内容を確認しましょう。
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPartyDetailsTab = () => (
    <div className="animate-fadeIn p-4">
      {isEditingParty ? (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">
                政党情報の編集
              </h3>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md flex items-center transition"
                  onClick={() => setIsEditingParty(false)}
                >
                  <X size={14} className="mr-1" />
                  キャンセル
                </button>
                <button
                  className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center transition shadow-sm"
                  onClick={() => setIsEditingParty(false)}
                >
                  <Save size={14} className="mr-1" />
                  保存する
                </button>
              </div>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      政党名
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      defaultValue={partyData.name}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      政党カラー
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        className="h-9 w-20 border border-gray-300 rounded-md cursor-pointer"
                        defaultValue={partyData.color}
                      />
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        defaultValue={partyData.color}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      政党のテーマカラーです。ボタンや強調表示に使用されます。
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      主要政策キーワード
                      <span className="ml-1 text-xs text-gray-500">
                        （カンマ区切り）
                      </span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      defaultValue={partyData.keyPolicies.join(", ")}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      政党ページで表示される主要政策のキーワードです
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      政党ロゴ・画像
                    </label>
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-24 h-24 rounded-full overflow-hidden border-2 flex-shrink-0 bg-gray-50 flex items-center justify-center"
                        style={{ borderColor: partyData.color }}
                      >
                        <img
                          src={partyData.image}
                          alt={partyData.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          className="hidden"
                          id="party-logo-upload"
                        />
                        <label
                          htmlFor="party-logo-upload"
                          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none cursor-pointer inline-block transition shadow-sm"
                        >
                          新しい画像をアップロード
                        </label>
                        <p className="mt-2 text-xs text-gray-500">
                          推奨サイズ: 400×400ピクセル以上の正方形画像
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      政党説明
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 h-28 transition"
                      defaultValue={partyData.description}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      政党ページに表示される説明文です
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="p-4 bg-gray-50 rounded-b-lg border-t border-gray-100 flex justify-end">
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium text-gray-700 transition flex items-center"
                onClick={() => setIsEditingParty(false)}
              >
                <X size={16} className="mr-1.5" />
                キャンセル
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition flex items-center shadow-sm"
                onClick={() => setIsEditingParty(false)}
              >
                <Save size={16} className="mr-1.5" />
                変更を保存
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">政党情報</h3>
              <button
                className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center transition shadow-sm"
                onClick={() => setIsEditingParty(true)}
              >
                <PenSquare size={14} className="mr-1" />
                編集する
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex-shrink-0">
                <div
                  className="w-24 h-24 rounded-full overflow-hidden border-2 flex items-center justify-center"
                  style={{ borderColor: partyData.color }}
                >
                  <img
                    src={partyData.image}
                    alt={partyData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-1">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: partyData.color }}
                >
                  {partyData.name}
                </h2>

                <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1">
                  <span>所属議員: {partyData.members}名</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="bg-gray-50 rounded-md p-2">
                    <div className="text-xs text-gray-500 mb-1">支持率</div>
                    <div className="text-lg font-bold text-green-600">
                      {partyData.supportRate}%
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-md p-2">
                    <div className="text-xs text-gray-500 mb-1">不支持率</div>
                    <div className="text-lg font-bold text-red-600">
                      {partyData.opposeRate}%
                    </div>
                  </div>
                </div>

                <div className="mt-2 w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
                  <div
                    className="h-full rounded-l-full"
                    style={{
                      width: `${partyData.supportRate}%`,
                      backgroundColor: "#10B981",
                    }}
                  ></div>
                  <div
                    className="h-full rounded-r-full"
                    style={{
                      width: `${partyData.opposeRate}%`,
                      backgroundColor: "#EF4444",
                    }}
                  ></div>
                </div>

                <p className="text-sm text-gray-600 mt-3">
                  {partyData.description}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                主要政策
              </h4>
              <div className="flex flex-wrap gap-2">
                {partyData.keyPolicies.map((policy, i) => (
                  <span
                    key={i}
                    className="text-xs py-1 px-3 rounded-full border"
                    style={{
                      backgroundColor: `${partyData.color}15`,
                      borderColor: `${partyData.color}30`,
                      color: partyData.color,
                    }}
                  >
                    {policy}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4">管理統計</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 transition hover:shadow-sm">
                <div className="text-xs text-gray-500 mb-1">総投票数</div>
                <div className="text-xl font-bold">
                  {partyData.totalVotes.toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 transition hover:shadow-sm">
                <div className="text-xs text-gray-500 mb-1">公開政策数</div>
                <div className="text-xl font-bold">{policiesData.length}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 transition hover:shadow-sm">
                <div className="text-xs text-gray-500 mb-1">所属議員数</div>
                <div className="text-xl font-bold">{partyData.members}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPolicyEditor = (
    policy: (typeof policiesData)[number] | null = null
  ) => (
    <div className="bg-white rounded-lg shadow-md animate-fadeIn">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">
            {policy ? "政策を編集" : "新しい政策を作成"}
          </h3>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md flex items-center transition"
              onClick={() => {
                setIsAddingPolicy(false);
                setActivePolicyId(null);
              }}
            >
              <X size={14} className="mr-1" />
              キャンセル
            </button>
            <button
              className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md flex items-center transition"
              onClick={() => {
                /* プレビュー処理 */
              }}
            >
              <Eye size={14} className="mr-1" />
              プレビュー
            </button>
            <button
              className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center transition shadow-sm"
              onClick={() => {
                setIsAddingPolicy(false);
                setActivePolicyId(null);
              }}
            >
              <Save size={14} className="mr-1" />
              保存する
            </button>
          </div>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 左カラム: 基本情報 */}
            <div className="space-y-6">
              {/* 政策タイトル */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    政策タイトル
                  </label>
                  <div className="text-xs text-gray-500">必須</div>
                </div>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1 transition"
                  defaultValue={policy?.title || ""}
                  placeholder="例：教育改革法案"
                />
                <p className="mt-1 text-xs text-gray-500">
                  簡潔で明確なタイトルをつけてください
                </p>
              </div>

              {/* 政策の説明 */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    政策の説明
                  </label>
                  <div className="text-xs text-gray-500">必須</div>
                </div>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32 mt-1 transition"
                  defaultValue={policy?.description || ""}
                  placeholder="政策の目的と概要を説明してください"
                />
                <p className="mt-1 text-xs text-gray-500">
                  政策の目的とその意義を明確に説明してください
                </p>
              </div>

              {/* 影響を受ける分野 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  影響を受ける分野
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1 transition"
                  defaultValue="経済, 教育, 福祉"
                  placeholder="例: 経済, 教育, 医療"
                />
                <p className="mt-1 text-xs text-gray-500">
                  関連する分野をカンマ区切りで入力してください
                </p>
              </div>

              {/* 経済的影響 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  経済的影響
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 mt-1 transition"
                  defaultValue={
                    policy
                      ? "この政策による経済成長率の向上と雇用創出効果が期待されます。"
                      : ""
                  }
                  placeholder="この政策が経済に与える影響について説明してください"
                />
              </div>

              {/* 生活への影響 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  生活への影響
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 mt-1 transition"
                  defaultValue={
                    policy
                      ? "国民の生活の質が向上し、特に子育て世代の負担軽減が見込まれます。"
                      : ""
                  }
                  placeholder="この政策が市民の生活に与える影響について説明してください"
                />
              </div>
            </div>

            {/* 右カラム: 詳細情報 */}
            <div className="space-y-6">
              {/* 主要ポイント（4つ固定） */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    主要ポイント
                  </label>
                  <div className="text-xs text-gray-500">必須（4項目）</div>
                </div>
                <div className="space-y-2 mt-1">
                  {Array(4)
                    .fill("")
                    .map((_, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                          defaultValue={policy?.keyPoints?.[index] || ""}
                          placeholder={`ポイント ${index + 1}`}
                        />
                      </div>
                    ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  政策の重要なポイント4つを簡潔に入力してください
                </p>
              </div>

              {/* 自党の立場 */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    自党の立場
                  </label>
                  <div className="text-xs text-gray-500">必須</div>
                </div>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 mt-1 transition"
                  defaultValue={policy?.ownPosition || ""}
                  placeholder="この政策に対する自党の基本的な立場や主張を説明してください"
                />
              </div>

              {/* 対立政党の立場 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  対立政党の立場（オプション）
                </label>
                <div className="space-y-3 mt-1">
                  {(
                    policy?.opposingPositions || [
                      { party: "立憲民主党", position: "" },
                    ]
                  ).map((item, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-md bg-gray-50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <select
                          className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition"
                          defaultValue={item.party}
                        >
                          <option value="立憲民主党">立憲民主党</option>
                          <option value="公明党">公明党</option>
                          <option value="日本維新の会">日本維新の会</option>
                          <option value="日本共産党">日本共産党</option>
                        </select>
                        <button
                          type="button"
                          className="text-gray-400 hover:text-red-500 transition p-1 ml-auto"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition"
                        defaultValue={item.position}
                        placeholder="この政党の立場や主張"
                        rows={2}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 flex items-center transition"
                  >
                    <Plus size={14} className="mr-1" />
                    政党を追加
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  他政党の立場を追加すると、より公平で信頼性の高い政策提案になります
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="p-4 bg-gray-50 rounded-b-lg border-t border-gray-100 flex justify-between items-center">
        <div className="text-sm text-gray-500 flex items-center">
          <Info size={14} className="mr-1 text-indigo-500" />
          <span>
            入力内容はすべて保存され、一般公開前にプレビューで確認できます
          </span>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium text-gray-700 transition flex items-center"
            onClick={() => {
              setIsAddingPolicy(false);
              setActivePolicyId(null);
            }}
          >
            <X size={16} className="mr-1.5" />
            キャンセル
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition flex items-center shadow-sm"
            onClick={() => {
              setIsAddingPolicy(false);
              setActivePolicyId(null);
            }}
          >
            <Save size={16} className="mr-1.5" />
            保存して公開
          </button>
        </div>
      </div>
    </div>
  );

  const renderPoliciesTab = () => (
    <div className="animate-fadeIn p-4">
      {isAddingPolicy || activePolicyId ? (
        renderPolicyEditor(
          activePolicyId
            ? policiesData.find((p) => p.id === activePolicyId)
            : null
        )
      ) : (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">政策管理</h3>
            <div className="flex gap-2">
              <button
                className="px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center transition"
                onClick={() => setShowHelp(true)}
              >
                <HelpCircle size={14} className="mr-1" />
                ヘルプ
              </button>
              <button
                className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center transition shadow-sm"
                onClick={() => setIsAddingPolicy(true)}
              >
                <Plus size={14} className="mr-1" />
                新規政策を追加
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="p-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        政策タイトル
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32"
                      >
                        支持率
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32"
                      >
                        不支持率
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24"
                      >
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {policiesData.map((policy) => (
                      <tr
                        key={policy.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {policy.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {policy.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-green-700 font-medium mr-2">
                              {policy.supportRate}%
                            </div>
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${policy.supportRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-red-700 font-medium mr-2">
                              {policy.opposeRate}%
                            </div>
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500 rounded-full"
                                style={{ width: `${policy.opposeRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <button
                              className="text-indigo-600 hover:text-indigo-900 transition"
                              onClick={() =>
                                window.open("/policy/" + policy.id, "_blank")
                              }
                              title="公開ページを表示"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              className="text-indigo-600 hover:text-indigo-900 transition"
                              onClick={() => setActivePolicyId(policy.id)}
                              title="編集する"
                            >
                              <PenSquare size={18} />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 transition"
                              title="削除する"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {policiesData.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-3">
                  <FileText size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  政策がまだありません
                </h3>
                <p className="text-gray-500 mb-4">
                  「新規政策を追加」ボタンをクリックして、最初の政策を作成しましょう。
                </p>
                <button
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition shadow-sm"
                  onClick={() => setIsAddingPolicy(true)}
                >
                  <Plus size={16} className="mr-1.5 inline-block" />
                  新規政策を追加
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      {/* サイドバー */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-white shadow-md transition-all duration-300 flex flex-col p-3 z-10`}
      >
        <div className="flex items-center justify-between mb-6">
          {sidebarOpen && (
            <div className="text-lg font-bold text-gray-800">
              政党管理パネル
            </div>
          )}
          <button
            className="p-1 rounded-md hover:bg-gray-100 transition"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <ChevronLeft size={24} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>

        <div className="flex flex-col space-y-1">
          <button
            className={`flex items-center px-3 py-2 rounded-md ${
              activeTab === "party-details"
                ? "bg-indigo-50 text-indigo-600"
                : "hover:bg-gray-100"
            } transition`}
            onClick={() => setActiveTab("party-details")}
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
            onClick={() => setActiveTab("policies")}
          >
            <FileText
              size={sidebarOpen ? 18 : 20}
              className={sidebarOpen ? "mr-3" : ""}
            />
            {sidebarOpen && <span>政策管理</span>}
          </button>

          <button
            className={`flex items-center px-3 py-2 rounded-md ${
              activeTab === "members"
                ? "bg-indigo-50 text-indigo-600"
                : "hover:bg-gray-100"
            } transition`}
            onClick={() => setActiveTab("members")}
          >
            <Users
              size={sidebarOpen ? 18 : 20}
              className={sidebarOpen ? "mr-3" : ""}
            />
            {sidebarOpen && <span>所属議員</span>}
          </button>

          <button
            className={`flex items-center px-3 py-2 rounded-md ${
              activeTab === "settings"
                ? "bg-indigo-50 text-indigo-600"
                : "hover:bg-gray-100"
            } transition`}
            onClick={() => setActiveTab("settings")}
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
            onClick={() => (window.location.href = "/")}
          >
            <ArrowLeft
              size={sidebarOpen ? 18 : 20}
              className={sidebarOpen ? "mr-3" : ""}
            />
            {sidebarOpen && <span>サイトに戻る</span>}
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 p-4 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">政党管理</h1>
              <p className="text-sm text-gray-500">
                {activeTab === "party-details"
                  ? "政党情報の編集・管理"
                  : activeTab === "policies"
                  ? "政策の追加・編集・管理"
                  : activeTab === "members"
                  ? "所属議員の管理"
                  : "設定"}
              </p>
            </div>

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
                  />
                </div>
                <span className="ml-2 text-sm font-medium">
                  {partyData.name}
                </span>
              </div>
            </div>
          </header>

          {activeTab === "party-details" && renderPartyDetailsTab()}
          {activeTab === "policies" && renderPoliciesTab()}
          {activeTab === "members" && (
            <div className="bg-white rounded-lg shadow-md p-6 animate-fadeIn">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                所属議員管理
              </h3>
              <p className="text-gray-500">
                この機能は現在開発中です。近日公開予定。
              </p>
            </div>
          )}
          {activeTab === "settings" && (
            <div className="bg-white rounded-lg shadow-md p-6 animate-fadeIn">
              <h3 className="text-lg font-bold text-gray-800 mb-4">管理設定</h3>
              <p className="text-gray-500">
                この機能は現在開発中です。近日公開予定。
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ヘルプモーダル */}
      {showHelp && renderHelp()}
    </div>
  );
};

// コンポーネントとして左矢印アイコンを追加
const ChevronLeft = (props: { [x: string]: any; size?: 24 | undefined }) => {
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

export default PartyAdminPage;
