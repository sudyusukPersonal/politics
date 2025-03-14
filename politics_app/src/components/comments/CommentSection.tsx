// src/components/comments/CommentSection.tsx
import React, { useEffect, useMemo } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { useParams } from "react-router-dom";
import CommentItem from "./CommentItem";
import InlineAdBanner from "../ads/InlineAdBanner";
import { useReplyData } from "../../context/ReplyDataContext";
import { useData } from "../../context/DataContext";

// コメントセクションのスタイルを追加
const commentHighlightStyle = `
  @keyframes highlight-pulse {
    0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
    100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
  }
  
  .comment-highlight {
    animation: highlight-pulse 2s 1;
    scroll-margin-top: 80px;
  }
`;

const CommentSection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    comments,
    isLoadingComments,
    commentError,
    fetchCommentsByPolitician,
    newCommentId,
  } = useReplyData();

  // DataContextから投票関連の状態を取得
  const { handleVoteClick } = useData();

  // 最初のマウント時にコメントを取得
  useEffect(() => {
    // 政治家IDがある場合、そのコメントを取得
    if (id) {
      fetchCommentsByPolitician(id);
    }
  }, [id, fetchCommentsByPolitician]);

  // Support/Opposeで区分けしたコメント
  const { supportComments, opposeComments } = useMemo(() => {
    const support = comments.filter((comment) => comment.type === "support");
    const oppose = comments.filter((comment) => comment.type === "oppose");
    return { supportComments: support, opposeComments: oppose };
  }, [comments]);

  // 新規コメント追加ボタン
  const renderAddCommentButton = () => (
    <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 my-6 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
      <span className="text-sm text-gray-700">
        <MessageSquare size={16} className="inline mr-1" />
        あなたもこの政治家に対する評価を投稿できます
      </span>
      <div className="flex space-x-2">
        <button
          onClick={() => handleVoteClick("support")}
          className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-full flex items-center transition"
        >
          <ThumbsUp size={14} className="mr-1" />
          支持する
        </button>
        <button
          onClick={() => handleVoteClick("oppose")}
          className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-full flex items-center transition"
        >
          <ThumbsDown size={14} className="mr-1" />
          支持しない
        </button>
      </div>
    </div>
  );

  if (isLoadingComments) {
    return (
      <div className="p-4 flex justify-center items-center">
        <div className="animate-pulse flex space-x-2">
          <div className="h-2 w-2 bg-indigo-500 rounded-full"></div>
          <div className="h-2 w-2 bg-indigo-500 rounded-full"></div>
          <div className="h-2 w-2 bg-indigo-500 rounded-full"></div>
        </div>
        <span className="ml-2 text-gray-500">読み込み中...</span>
      </div>
    );
  }

  if (commentError) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-500 text-center">
        <p>{commentError}</p>
        <button
          onClick={() => id && fetchCommentsByPolitician(id)}
          className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-full"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <>
      {/* スタイルを追加 */}
      <style>{commentHighlightStyle}</style>

      {/* Ad banner above comments */}
      <InlineAdBanner format="rectangle" showCloseButton={true} />

      {/* コメント投稿ボタン */}
      {renderAddCommentButton()}

      {/* Support comments */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-green-600 flex items-center">
            <ThumbsUp size={16} className="mr-1" />
            支持の理由
          </h4>
          <span className="text-xs py-1 px-2 bg-green-100 text-green-700 rounded-full">
            {supportComments.length} コメント
          </span>
        </div>

        <div className="space-y-3">
          {supportComments.map((comment, index) => (
            <React.Fragment key={comment.id}>
              <CommentItem
                comment={comment}
                type="support"
                isNew={newCommentId === comment.id}
              />

              {/* Show ad after 3rd comment if more than 3 */}
              {supportComments.indexOf(comment) === 2 &&
                supportComments.length > 3 && (
                  <div className="my-4 flex justify-center">
                    <InlineAdBanner format="rectangle" showCloseButton={true} />
                  </div>
                )}
            </React.Fragment>
          ))}

          {supportComments.length === 0 && (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
              まだ支持するコメントはありません。
              <button
                onClick={() => handleVoteClick("support")}
                className="mt-2 ml-2 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-sm rounded-full transition"
              >
                <ThumbsUp size={14} className="inline mr-1" />
                支持する理由を投稿
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Oppose comments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-red-600 flex items-center">
            <ThumbsDown size={16} className="mr-1" />
            不支持の理由
          </h4>
          <span className="text-xs py-1 px-2 bg-red-100 text-red-700 rounded-full">
            {opposeComments.length} コメント
          </span>
        </div>

        <div className="space-y-3">
          {opposeComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              type="oppose"
              isNew={newCommentId === comment.id}
            />
          ))}

          {opposeComments.length === 0 && (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
              まだ不支持のコメントはありません。
              <button
                onClick={() => handleVoteClick("oppose")}
                className="mt-2 ml-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-full transition"
              >
                <ThumbsDown size={14} className="inline mr-1" />
                不支持の理由を投稿
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CommentSection;
