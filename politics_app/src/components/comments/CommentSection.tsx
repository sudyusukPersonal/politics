// Updated CommentSection to work with Firebase comments
import React, { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useParams } from "react-router-dom";
import { useData } from "../../context/DataContext";
import CommentItem from "./CommentItem";
import InlineAdBanner from "../ads/InlineAdBanner";
import { Comment } from "../../types";
import { fetchCommentsByPoliticianId } from "../../services/commentService";

const CommentSection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComments = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const fetchedComments = await fetchCommentsByPoliticianId(id);
        // console.log(fetchedComments);
        setComments(fetchedComments);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
        setError("コメントの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    loadComments();
  }, [id]);

  // Separate comments by type
  const supportComments = comments.filter(
    (comment) => comment.type === "support"
  );
  const opposeComments = comments.filter(
    (comment) => comment.type === "oppose"
  );

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div>{error}</div>;
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
        </div>
      </div>
    </>
  );
};

export default CommentSection;
