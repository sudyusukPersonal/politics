// components/comments/CommentSection.tsx (MODIFIED)
import React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useData } from "../../context/DataContext";
import CommentItem from "./CommentItem";
import InlineAdBanner from "../ads/InlineAdBanner";

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

  const supportCommentGroups = groupCommentsByParent(reasonsData.support);
  const opposeCommentGroups = groupCommentsByParent(reasonsData.oppose);

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
            {supportCommentGroups.length} comments
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
