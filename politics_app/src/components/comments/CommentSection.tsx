// Updated CommentSection with optimized rendering
import React, { useEffect, useMemo } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useParams } from "react-router-dom";
import CommentItem from "./CommentItem";
import InlineAdBanner from "../ads/InlineAdBanner";
import { useReplyData } from "../../context/ReplyDataContext";

const CommentSection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    comments,
    isLoadingComments,
    commentError,
    fetchCommentsByPolitician,
  } = useReplyData();

  // Initial fetch of comments when component mounts
  useEffect(() => {
    // 政治家IDがある場合、そのコメントを取得
    if (id) {
      fetchCommentsByPolitician(id);
    }
  }, [id, fetchCommentsByPolitician]);

  // Memoize the separated comments to avoid unnecessary re-renders
  const { supportComments, opposeComments } = useMemo(() => {
    const support = comments.filter((comment) => comment.type === "support");
    const oppose = comments.filter((comment) => comment.type === "oppose");
    return { supportComments: support, opposeComments: oppose };
  }, [comments]);

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
      {/* Ad banner above comments */}
      <InlineAdBanner format="rectangle" showCloseButton={true} />

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
          {supportComments.map((comment) => (
            <React.Fragment key={comment.id}>
              <CommentItem comment={comment} type="support" />

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
            <CommentItem key={comment.id} comment={comment} type="oppose" />
          ))}

          {opposeComments.length === 0 && (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
              まだ不支持のコメントはありません。
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CommentSection;
