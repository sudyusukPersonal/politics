import { useEffect, useState } from "react";
import { politicians } from "../../data/politicians";
import { parties } from "../../data/parties";
import { Building, Eye, ThumbsDown, ThumbsUp, Activity } from "lucide-react";
import { TrendingUp } from "lucide-react";

export default function PartyDetail(props: {
  selectedPoliticianImage: string;
  selectedPoliticianName: string;
  selectedPoliticianTrending: string;
}) {
  const [reasons, setReasons] = useState([]);
  const [showReasonForm, setShowReasonForm] = useState(false);
  const [voteType, setVoteType] = useState<"support" | "oppose">("support");
  const [reason, setReason] = useState("");
  const [selectedPolitician, setSelectedPolitician] = useState(politicians[0]);

  const getTrendIcon = (trend: string) => {
    if (trend === "up") {
      return (
        <div className="inline-flex items-center text-green-500">
          <TrendingUp size={14} className="flex-shrink-0" />
          <span className="ml-1 text-xs whitespace-nowrap">上昇中</span>
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center text-red-500">
          <Activity size={14} className="flex-shrink-0" />
          <span className="ml-1 text-xs whitespace-nowrap">下降中</span>
        </div>
      );
    }
  };

  useEffect(() => {
    // ローカルストレージからデータを取得
    const reasonsData = localStorage.getItem("reasons");
    if (reasonsData) {
      setReasons(JSON.parse(reasonsData));
    }
  }, []);

  const handleVoteClick = (type: "support" | "oppose") => {
    setVoteType(type);
    setShowReasonForm(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 投票送信時のフィードバック
    alert(
      `${
        voteType === "support" ? "支持" : "不支持"
      }の理由を送信しました: ${reason}`
    );
    setReason("");
    setVoteType("support");
    setShowReasonForm(false);
  };

  <div className="p-5">
    <div className="flex flex-col sm:flex-row sm:items-start">
      <div className="relative mx-auto sm:mx-0 mb-4 sm:mb-0">
        <div
          className="absolute inset-0 rounded-full blur-sm opacity-30"
          style={{
            backgroundColor: selectedPolitician.party.color,
          }}
        ></div>
        <img
          src={props.selectedPoliticianImage}
          alt={props.selectedPoliticianName}
          className="w-20 h-20 relative rounded-full object-cover border-2 z-10"
          style={{ borderColor: selectedPolitician.party.color }}
        />
      </div>
      <div className="sm:ml-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <h2 className="text-xl font-bold">{selectedPolitician.name}</h2>
          <div className="mt-1 sm:mt-0 sm:ml-3">
            {getTrendIcon(props.selectedPoliticianTrending)}
          </div>
        </div>
        <div className="flex flex-wrap justify-center sm:justify-start items-center text-sm text-gray-500 mt-1">
          <span>{selectedPolitician.position}</span>
          <span className="mx-2">•</span>
          <span>{selectedPolitician.age}歳</span>
        </div>
        <div
          className="mt-2 px-3 py-1 rounded-full text-white text-xs inline-flex items-center cursor-pointer"
          style={{
            backgroundColor: selectedPolitician.party.color,
          }}
          onClick={(e) => {
            e.stopPropagation(); // イベントの伝播を停止
            const party = parties.find(
              (p) => p.id === selectedPolitician.party.id
            );
            if (party) {
              // handlePartySelect(party);
            }
          }}
        >
          <Building size={12} className="mr-1" />
          {selectedPolitician.party.name}
        </div>
      </div>
    </div>

    <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
        <h3 className="font-bold text-gray-700 mb-1 sm:mb-0">市民評価</h3>
        <span className="text-sm text-gray-500">
          総投票数: {selectedPolitician.totalVotes.toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-green-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ThumbsUp size={16} className="text-green-500 mr-2" />
              <span className="text-sm font-medium">支持</span>
            </div>
            <span className="text-xl font-bold text-green-600">
              {selectedPolitician.supportRate}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div
              className="h-full rounded-full bg-green-500"
              style={{
                width: `${selectedPolitician.supportRate}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-sm border border-red-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ThumbsDown size={16} className="text-red-500 mr-2" />
              <span className="text-sm font-medium">不支持</span>
            </div>
            <span className="text-xl font-bold text-red-600">
              {selectedPolitician.opposeRate}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div
              className="h-full rounded-full bg-red-500"
              style={{
                width: `${selectedPolitician.opposeRate}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex my-3">
        <div
          className="h-full rounded-l-full transition-all duration-700 ease-in-out"
          style={{
            width: `${selectedPolitician.supportRate}%`,
            backgroundColor: "#10B981",
          }}
        ></div>
        <div
          className="h-full rounded-r-full transition-all duration-700 ease-in-out"
          style={{
            width: `${selectedPolitician.opposeRate}%`,
            backgroundColor: "#EF4444",
          }}
        ></div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500">
        <span className="flex items-center mb-1 sm:mb-0">
          <Eye size={12} className="mr-1" />
          最近の活動: {selectedPolitician.recentActivity}
        </span>
        <span className="flex items-center">
          <Activity size={12} className="mr-1" />
          活動指数: {selectedPolitician.activity}
        </span>
      </div>
    </div>

    {/* 投票ボタン */}
    {!showReasonForm && (
      <div className="mt-6">
        <h3 className="text-center text-sm font-medium text-gray-500 mb-3">
          この政治家を評価する
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleVoteClick("support")}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl flex items-center justify-center font-medium transition transform hover:translate-y-0.5 active:scale-95 shadow-md"
          >
            <ThumbsUp size={18} className="mr-2" />
            支持する
          </button>
          <button
            onClick={() => handleVoteClick("oppose")}
            className="bg-gradient-to-r from-red-500 to-rose-600 text-white py-3 rounded-xl flex items-center justify-center font-medium transition transform hover:translate-y-0.5 active:scale-95 shadow-md"
          >
            <ThumbsDown size={18} className="mr-2" />
            支持しない
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">
          ※評価には理由の入力が必要です
        </p>
      </div>
    )}

    {/* 投票フォーム */}
    {showReasonForm && (
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
                <ThumbsUp size={16} className="text-green-500 mr-2" />
                <span className="text-green-700">支持する理由</span>
              </>
            ) : (
              <>
                <ThumbsDown size={16} className="text-red-500 mr-2" />
                <span className="text-red-700">支持しない理由</span>
              </>
            )}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            具体的な理由を記入してください（必須）
          </p>

          <form onSubmit={handleSubmit}>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:outline-none transition-shadow"
              style={{}}
              rows={4}
              placeholder="あなたの意見を書いてください..."
              required
            ></textarea>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-3">
              <button
                type="submit"
                className={`py-2.5 rounded-lg text-white font-medium transition transform active:scale-95 ${
                  voteType === "support"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                評価を送信
              </button>
              <button
                type="button"
                onClick={() => setShowReasonForm(false)}
                className="py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>;
}
