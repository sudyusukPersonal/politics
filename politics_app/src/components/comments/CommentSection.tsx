// components/comments/CommentSection.tsx (MODIFIED)
import React, { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useData } from "../../context/DataContext";
import CommentItem from "./CommentItem";
import InlineAdBanner from "../ads/InlineAdBanner";

interface Comment {
  id: string;
  type: "support" | "oppose";
  text: string;
  user: string;
  likes: number;
  date: string;
  isParentComment: boolean;
  politicianId: string;
  parentId?: string;
  replyToId?: string;
  replyToUser?: string;
}

// レスポンスデータ構造のインターフェース
interface CommentsResponse {
  comments: Comment[];
}

const CommentSection: React.FC = () => {
  const { reasonsData } = useData();

  // Group comments by parent comment
  const groupCommentsByParent = (comments: any[]) => {
    const parentComments = comments.filter(
      (comment) => comment.isParentComment
    );

    const commentGroups = parentComments.map((parent) => {
      const replies = comments.filter(
        (comment) => !comment.isParentComment && comment.parentId === parent.id
      );
      return {
        parent,
        replies,
      };
    });

    return commentGroups;
  };

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // サーバーからコメントを取得する関数
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        // サーバーへのリクエスト
        const response = await fetch("http://localhost:8080/comments");
        console.log("リクエストしたよ");

        // リクエストが成功したかチェック
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // JSONレスポンスのパース
        const data: CommentsResponse = await response.json();

        // 取得したコメントでステートを更新
        setComments(data.comments);
        setError(null);
      } catch (err) {
        // 取得中に発生したエラーの処理
        setError(
          err instanceof Error ? err : new Error("不明なエラーが発生しました")
        );
        console.error("コメント取得エラー:", err);
      } finally {
        // 結果に関わらずローディングを終了
        setIsLoading(false);
      }
    };

    // コンポーネントのマウント時に取得関数を呼び出し
    fetchComments();

    // 空の依存配列でこのエフェクトがマウント時に一度だけ実行されるようにする
  }, []);

  // const supportCommentGroups = groupCommentsByParent(reasonsData.support);
  // const opposeCommentGroups = groupCommentsByParent(reasonsData.oppose);

  const supportComments = comments.filter(
    (comment) => comment.type === "support"
  );
  const opposeComments = comments.filter(
    (comment) => comment.type === "oppose"
  );

  // Group them by parent
  const supportCommentGroups = groupCommentsByParent(supportComments);
  const opposeCommentGroups = groupCommentsByParent(opposeComments);

  return (
    <>
      {/* Ad banner above comments */}
      <InlineAdBanner format="rectangle" showCloseButton={true} />

      {/* Support comments */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-green-600 flex items-center">
            <ThumbsUp size={16} className="mr-1" />
            Support Reasons
          </h4>
          <span className="text-xs py-1 px-2 bg-green-100 text-green-700 rounded-full">
            {comments.filter((comment) => comment.type === "support").length}{" "}
            comments
          </span>
        </div>

        <div className="space-y-3">
          {supportCommentGroups.map((group, index) => (
            <React.Fragment key={group.parent.id}>
              <CommentItem
                parentComment={group.parent}
                replies={group.replies}
                type="support"
              />

              {/* Show ad after 3rd comment if there are more than 3 */}
              {index === 2 && supportCommentGroups.length > 3 && (
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
            Opposition Reasons
          </h4>
          <span className="text-xs py-1 px-2 bg-red-100 text-red-700 rounded-full">
            {opposeCommentGroups.length} comments
          </span>
        </div>

        <div className="space-y-3">
          {opposeCommentGroups.map((group) => (
            <CommentItem
              key={group.parent.id}
              parentComment={group.parent}
              replies={group.replies}
              type="oppose"
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default CommentSection;
