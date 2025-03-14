// src/components/common/VoteButtons.tsx
import React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useData } from "../../context/DataContext";
import { useParams } from "react-router-dom"; // useParamsを追加

const VoteButtons: React.FC = () => {
  const { handleVoteClick } = useData();
  const { id } = useParams<{ id: string }>(); // 政治家IDを取得（状態確認用）

  return (
    <div className="mt-6">
      <h3 className="text-center text-sm font-medium text-gray-500 mb-3">
        この政治家を評価する
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => handleVoteClick("support")}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl flex items-center justify-center font-medium transition transform hover:translate-y-0.5 active:scale-95 shadow-md"
          // 政治家IDがない場合は無効化（通常はURLパラメータから取得されるはず）
          disabled={!id}
        >
          <ThumbsUp size={18} className="mr-2" />
          支持する
        </button>
        <button
          onClick={() => handleVoteClick("oppose")}
          className="bg-gradient-to-r from-red-500 to-rose-600 text-white py-3 rounded-xl flex items-center justify-center font-medium transition transform hover:translate-y-0.5 active:scale-95 shadow-md"
          // 政治家IDがない場合は無効化
          disabled={!id}
        >
          <ThumbsDown size={18} className="mr-2" />
          支持しない
        </button>
      </div>
      <p className="text-center text-xs text-gray-500 mt-2">
        ※評価には理由の入力が必要です
      </p>
    </div>
  );
};

export default VoteButtons;
