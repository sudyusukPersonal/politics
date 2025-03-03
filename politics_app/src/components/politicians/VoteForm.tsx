import React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useData } from "../../context/DataContext";

interface VoteFormProps {
  voteType: "support" | "oppose" | null;
}

const VoteForm: React.FC<VoteFormProps> = ({ voteType }) => {
  const { reason, setReason, handleSubmit, setShowReasonForm } = useData();

  return (
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
  );
};

export default VoteForm;
