import React, { useState } from "react";
import { XCircle, Info } from "lucide-react";
import { useData } from "../../context/DataContext";

interface InlineAdBannerProps {
  format?: "banner" | "rectangle" | "large-banner";
  showCloseButton?: boolean;
}

const InlineAdBanner: React.FC<InlineAdBannerProps> = ({
  format = "rectangle",
  showCloseButton = true,
}) => {
  const [closed, setClosed] = useState(false);
  const { showInlineAd } = useData();

  if (closed || !showInlineAd) return null;

  // Choose ad size based on format
  let adStyle = {};
  let adLabel = "広告";

  switch (format) {
    case "large-banner":
      adStyle = { height: "100px", maxWidth: "320px", width: "100%" };
      adLabel = "おすすめ";
      break;
    case "rectangle":
      adStyle = { height: "250px", maxWidth: "300px", width: "100%" };
      adLabel = "PR";
      break;
    default:
      adStyle = { height: "50px", maxWidth: "320px", width: "100%" };
  }

  return (
    <div className="my-4 border-t border-b border-gray-200 py-4">
      <div className="relative">
        {showCloseButton && (
          <button
            onClick={() => setClosed(true)}
            className="absolute -top-2 -right-2 bg-white rounded-full shadow-md z-10"
            aria-label="広告を閉じる"
          >
            <XCircle size={16} className="text-gray-500" />
          </button>
        )}
        <div className="flex justify-center">
          <div
            className="ad-banner mx-auto overflow-hidden rounded-lg border border-gray-200 shadow-sm flex items-center justify-center relative"
            style={adStyle}
          >
            <div className="flex flex-col items-center justify-center w-full h-full p-1 bg-gradient-to-r from-gray-50 to-white">
              <div className="text-xs font-medium text-gray-400 absolute top-1 left-2 flex items-center">
                <Info size={10} className="mr-1" />
                {adLabel}
              </div>
              <div className="flex items-center justify-center flex-1">
                <div className="text-sm text-gray-400">
                  広告が表示される領域
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineAdBanner;
