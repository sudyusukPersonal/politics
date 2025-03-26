// src/components/admin/PolicyManagementPanel.tsx
import React, { useState } from "react";
import {
  Plus,
  PenSquare,
  Trash2,
  Eye,
  FileText,
  HelpCircle,
  Save,
  X,
  Info,
} from "lucide-react";

// 政策編集用コンポーネント - 別コンポーネントとして分離
interface PolicyEditorProps {
  policy?: {
    id?: string;
    title?: string;
    description?: string;
    economicImpact?: string;
    lifeImpact?: string;
    keyPoints?: string[];
    affectedFields?: string[];
    ownPosition?: string;
    opposingPositions?: { party: string; position: string }[];
    politicalParties?: {
      partyName: any;
      claims: string;
    }[];
  };
  onCancel: () => void;
  onSave: (policyData: any) => void;
}

const PolicyEditor: React.FC<PolicyEditorProps> = ({
  policy,
  onCancel,
  onSave,
}) => {
  console.log("政党データfdsfsfas:", policy);
  // フォーム状態の管理（トップレベルでHooksを使用）
  const [title, setTitle] = useState(policy?.title || "");
  const [description, setDescription] = useState(policy?.description || "");
  const [economicImpact, setEconomicImpact] = useState(
    policy?.economicImpact || ""
  );
  const [lifeImpact, setLifeImpact] = useState(policy?.lifeImpact || "");

  // 既存のキーポイントを使用し、常に4つの要素を持つ配列にする
  const [keyPoints, setKeyPoints] = useState(() => {
    const existing = policy?.keyPoints || [];
    return [...existing, ...Array(4 - existing.length).fill("")].slice(0, 4);
  });

  // 影響を受ける分野（最大5つ）
  const [affectedFields, setAffectedFields] = useState(() => {
    const existingFields = policy?.affectedFields || [];
    console.log("Initial affected fields:", existingFields);
    return [
      ...existingFields,
      ...Array(5 - existingFields.length).fill(""),
    ].slice(0, 5);
  });

  const [ownPosition, setOwnPosition] = useState(() => {
    // データが存在するかチェック
    if (policy?.politicalParties && policy.politicalParties.length > 0) {
      // 最初の政党（自党）の claims を取得
      return policy.politicalParties[0].claims || "";
    }
    return "";
  });
  const [opposingPositions, setOpposingPositions] = useState(() => {
    // 対立政党の立場（politicalPartiesの2番目以降の要素）
    if (policy?.politicalParties && policy.politicalParties.length > 1) {
      // 2番目以降の要素（インデックス1から）を変換
      return policy.politicalParties.slice(1).map((party) => ({
        party: party.partyName,
        position: party.claims || "",
      }));
    }
    // デフォルト値
    return [{ party: "", position: "" }];
  });

  // 対立政党の立場を追加
  const addOpposingPosition = () => {
    setOpposingPositions([
      ...opposingPositions,
      { party: "立憲民主党", position: "" },
    ]);
  };

  // 対立政党の立場を削除
  const removeOpposingPosition = (index: number) => {
    const newPositions = [...opposingPositions];
    newPositions.splice(index, 1);
    setOpposingPositions(newPositions);
  };

  // 対立政党の名前を更新
  const updateOpposingParty = (index: number, partyName: string) => {
    const newPositions = [...opposingPositions];
    newPositions[index].party = partyName;
    setOpposingPositions(newPositions);
  };

  // 対立政党の立場を更新
  const updateOpposingPosition = (index: number, position: string) => {
    const newPositions = [...opposingPositions];
    newPositions[index].position = position;
    setOpposingPositions(newPositions);
  };

  // 保存処理
  const handleSave = () => {
    const policyData = {
      id: policy?.id,
      title,
      description,
      affectedFields: affectedFields.filter(Boolean), // 空文字を除去
      economicImpact,
      lifeImpact,
      keyPoints: keyPoints.filter(Boolean), // 空文字を除去
      ownPosition,
      opposingPositions,
    };

    onSave(policyData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md animate-fadeIn">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">
            {policy ? "政策を編集" : "新しい政策を作成"}
          </h3>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md flex items-center transition"
              onClick={onCancel}
            >
              <X size={14} className="mr-1" />
              キャンセル
            </button>
            <button
              className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md flex items-center transition"
              onClick={() => {
                window.open(policy ? `/policy/${policy.id}` : "#", "_blank");
              }}
            >
              <Eye size={14} className="mr-1" />
              プレビュー
            </button>
            <button
              className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center transition shadow-sm"
              onClick={handleSave}
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="政策の目的と概要を説明してください"
                />
                <p className="mt-1 text-xs text-gray-500">
                  政策の目的とその意義を明確に説明してください
                </p>
              </div>

              {/* 影響を受ける分野（最大5つ） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  影響を受ける分野
                  <span className="ml-1 text-xs text-gray-500">
                    （最大5つまで）
                  </span>
                </label>
                <div className="space-y-2">
                  {affectedFields.map((field, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-6 h-6 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-sm">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        value={field}
                        onChange={(e) => {
                          const newFields = [...affectedFields];
                          newFields[index] = e.target.value;
                          setAffectedFields(newFields);
                        }}
                        placeholder={`分野 ${
                          index + 1
                        }（例: 経済、教育、環境など）`}
                        disabled={index > 0 && !affectedFields[index - 1]} // 前の欄が空の場合は入力不可
                      />
                      {field && (
                        <button
                          type="button"
                          className="p-2 text-gray-400 hover:text-red-500 transition"
                          onClick={() => {
                            const newFields = [...affectedFields];
                            // 削除して詰める
                            newFields.splice(index, 1);
                            newFields.push(""); // 最後に空欄を追加して5つを維持
                            setAffectedFields(newFields);
                          }}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  この政策が影響を与える主要な分野を入力してください
                </p>
              </div>

              {/* 経済的影響 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  経済的影響
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 mt-1 transition"
                  value={economicImpact}
                  onChange={(e) => setEconomicImpact(e.target.value)}
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
                  value={lifeImpact}
                  onChange={(e) => setLifeImpact(e.target.value)}
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
                  {keyPoints.map((point, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        value={point}
                        onChange={(e) => {
                          const newPoints = [...keyPoints];
                          newPoints[index] = e.target.value;
                          setKeyPoints(newPoints);
                        }}
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
                  value={ownPosition}
                  onChange={(e) => setOwnPosition(e.target.value)}
                  placeholder="この政策に対する自党の基本的な立場や主張を説明してください"
                />
              </div>

              {/* 対立政党の立場 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  対立政党の立場（オプション）
                </label>
                <div className="space-y-3 mt-1">
                  {opposingPositions.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-md bg-gray-50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <select
                          className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition"
                          value={item.party}
                          onChange={(e) =>
                            updateOpposingParty(index, e.target.value)
                          }
                        >
                          <option value="自由民主党">自由民主党</option>
                          <option value="立憲民主党">立憲民主党</option>
                          <option value="公明党">公明党</option>
                          <option value="日本維新の会">日本維新の会</option>
                          <option value="国民民主党">国民民主党</option>
                          <option value="日本共産党">日本共産党</option>
                          <option value="れいわ新選組">れいわ新選組</option>
                          <option value="社民党">社民党</option>
                          <option value="参政党">参政党</option>
                        </select>
                        <button
                          type="button"
                          className="text-gray-400 hover:text-red-500 transition p-1 ml-auto"
                          onClick={() => removeOpposingPosition(index)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition"
                        value={item.position}
                        onChange={(e) =>
                          updateOpposingPosition(index, e.target.value)
                        }
                        placeholder="この政党の立場や主張"
                        rows={2}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 flex items-center transition"
                    onClick={addOpposingPosition}
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
            onClick={onCancel}
          >
            <X size={16} className="mr-1.5" />
            キャンセル
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition flex items-center shadow-sm"
            onClick={handleSave}
          >
            <Save size={16} className="mr-1.5" />
            保存して公開
          </button>
        </div>
      </div>
    </div>
  );
};

// ヘルプモーダルコンポーネント
const HelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-lg shadow-xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">政策管理パネルヘルプ</h3>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-indigo-700 mb-2">政策管理</h4>
          <p>
            政党の政策を追加・編集できます。作成した政策は支持率・不支持率と共に表示されます。有権者から評価を得ることで、支持率が変動します。
          </p>
        </div>

        <div>
          <h4 className="font-medium text-indigo-700 mb-2">政策の作成のコツ</h4>
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

// メインの政策管理パネルコンポーネント
// Define the PolicyManagementPanelProps interface
interface PolicyManagementPanelProps {
  policiesData: {
    id: string;
    title: string;
    description: string;
    affectedFields?: string[];
    supportRate: number;
    opposeRate: number;
  }[];
  partyData: any; // Replace 'any' with the appropriate type if known
}

const PolicyManagementPanel: React.FC<PolicyManagementPanelProps> = ({
  policiesData,
}) => {
  console.log("政策データ!!!!!!!!!:", policiesData);
  // 状態管理（コンポーネントのトップレベルでHooksを使用）
  const [isAddingPolicy, setIsAddingPolicy] = useState(false);
  const [activePolicyId, setActivePolicyId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // アクティブな政策を取得
  const activePolicy = activePolicyId
    ? policiesData.find((p) => p.id === activePolicyId)
    : null;

  // キャンセル処理
  const handleCancel = () => {
    setIsAddingPolicy(false);
    setActivePolicyId(null);
  };

  // 保存処理
  const handleSave = (policyData: any) => {
    console.log("保存する政策データ:", policyData);
    // 実際の実装では、ここでFirestoreに保存する処理を追加

    // 編集モードを終了
    setIsAddingPolicy(false);
    setActivePolicyId(null);
  };

  // 政策がない場合の表示
  const renderEmptyState = () => (
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
  );

  // 政策一覧表示
  return (
    <div className="animate-fadeIn p-4">
      {isAddingPolicy || activePolicyId ? (
        <PolicyEditor
          policy={activePolicy || {}}
          onCancel={handleCancel}
          onSave={handleSave}
        />
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
            {policiesData.length > 0 ? (
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
                            <div className="flex flex-wrap gap-1 mt-1">
                              {policy.affectedFields &&
                                policy.affectedFields.map((field, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                                  >
                                    {field}
                                  </span>
                                ))}
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
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `政策「${policy.title}」を削除しますか？`
                                    )
                                  ) {
                                    console.log(
                                      `政策 ${policy.id} を削除します`
                                    );
                                    // 実装時はここでFirestoreからの削除処理
                                  }
                                }}
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
            ) : (
              renderEmptyState()
            )}
          </div>
        </div>
      )}

      {/* ヘルプモーダル */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
};

export default PolicyManagementPanel;
