import React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useData } from "../../context/DataContext";
import CommentItem from "./CommentItem";
import InlineAdBanner from "../ads/InlineAdBanner";

const CommentSection: React.FC = () => {
  const { reasonsData } = useData();

  return (
    <>
      {/* Ad banner above comments */}
      {/* ここに広告バナーを追加ーーーーーーーーーーーーーーーーー */}
      <InlineAdBanner format="rectangle" showCloseButton={true} />

      {/* Support comments */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-green-600 flex items-center">
            <ThumbsUp size={16} className="mr-1" />
            支持する理由
          </h4>
          <span className="text-xs py-1 px-2 bg-green-100 text-green-700 rounded-full">
            {reasonsData.support.length}件
          </span>
        </div>

        <div className="space-y-3">
          {reasonsData.support.map((comment, index) => (
            <React.Fragment key={comment.id}>
              <CommentItem comment={comment} type="support" />

              {/* Show ad after 3rd comment if there are more than 3 */}
              {/* ここに広告バナーを追加ーーーーーーーーーーーーーーーーーーーーーーーーーーーー */}
              {/* {index === 2 && reasonsData.support.length > 3 && (
                <div className="my-4 flex justify-center">
                  <InlineAdBanner format="rectangle" showCloseButton={true} />
                </div>
              )} */}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Oppose comments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-red-600 flex items-center">
            <ThumbsDown size={16} className="mr-1" />
            支持しない理由
          </h4>
          <span className="text-xs py-1 px-2 bg-red-100 text-red-700 rounded-full">
            {reasonsData.oppose.length}件
          </span>
        </div>

        <div className="space-y-3">
          {reasonsData.oppose.map((comment) => (
            <CommentItem key={comment.id} comment={comment} type="oppose" />
          ))}
        </div>
      </div>
    </>
  );
};

export default CommentSection;
