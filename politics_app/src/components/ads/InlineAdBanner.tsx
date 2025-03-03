// // モバイル最適化された AdSense コンポーネント - レスポンシブ対応
// const MobileAd = ({
//   format = "banner",
//   className = "",
//   showCloseButton = false,
// }) => {
//   const [closed, setClosed] = useState(false);

//   if (closed) return null;

//   // 研究資料に基づいて最適なモバイル広告サイズを選択 - レスポンシブデザイン対応
//   let adStyle = {};
//   let adLabel = "広告";

//   switch (format) {
//     case "large-banner":
//       // レスポンシブデザイン - 幅はパーセンテージに基づく
//       adStyle = { height: "100px", maxWidth: "320px", width: "100%" };
//       adLabel = "おすすめ";
//       break;
//     case "rectangle":
//       // レスポンシブデザイン - 大きな画面では大きくなる
//       adStyle = { height: "250px", maxWidth: "300px", width: "100%" };
//       adLabel = "PR";
//       break;
//     case "fixed-bottom":
//       // 画面下部固定広告 - フルウィドゥで表示
//       adStyle = { height: "50px", width: "100%", maxWidth: "100%" };
//       adLabel = "広告";
//       break;
//     default:
//       // デフォルトは標準モバイルバナー (100%幅、最大320px)
//       adStyle = { height: "50px", maxWidth: "320px", width: "100%" };
//   }

//   // スタイルを調整して実際の広告に見えるようにする
//   const containerStyle =
//     format === "fixed-bottom"
//       ? "fixed bottom-0 left-0 right-0 z-20 flex justify-center shadow-lg animate-slideUp"
//       : `${className}`;

//   return (
//     <div className={`ad-container relative ${containerStyle}`}>
//       {showCloseButton && (
//         <button
//           onClick={() => setClosed(true)}
//           className="absolute -top-2 -right-2 bg-white rounded-full shadow-md z-10"
//           aria-label="広告を閉じる"
//         >
//           <XCircle size={16} className="text-gray-500" />
//         </button>
//       )}
//       <div
//         className="ad-banner mx-auto overflow-hidden rounded-lg border border-gray-200 shadow-sm flex items-center justify-center relative"
//         style={adStyle}
//       >
//         <div className="flex flex-col items-center justify-center w-full h-full p-1 bg-gradient-to-r from-gray-50 to-white">
//           <div className="text-xs font-medium text-gray-400 absolute top-1 left-2 flex items-center">
//             <Info size={10} className="mr-1" />
//             {adLabel}
//           </div>
//           <div className="flex items-center justify-center flex-1">
//             <div className="text-sm text-gray-400">Google AdSense</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // インフィード広告コンポーネント（政治家カードに似せた広告）- レスポンシブ対応
// const NativeAdCard = ({
//   index,
//   showCloseButton = false,
// }: {
//   index: number;
//   showCloseButton?: boolean;
// }) => {
//   const [closed, setClosed] = useState(false);

//   if (closed) return null;

//   return (
//     <div
//       className={`border-b border-gray-100 last:border-0 hover:bg-indigo-50/30 transition-colors relative ${
//         index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
//       }`}
//     >
//       {showCloseButton && (
//         <button
//           onClick={() => setClosed(true)}
//           className="absolute -top-2 -right-2 bg-white rounded-full shadow-md z-10"
//           aria-label="広告を閉じる"
//         >
//           <XCircle size={14} className="text-gray-500" />
//         </button>
//       )}
//       <div className="p-4">
//         <div className="text-xs font-medium text-gray-400 mb-1 flex items-center">
//           <Info size={10} className="mr-1" />
//           スポンサー
//         </div>
//         <div className="flex items-center">
//           <div className="relative">
//             <img
//               src="/api/placeholder/80/80"
//               alt="広告"
//               className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 transform transition hover:scale-105"
//               style={{ borderColor: "#6B7280" }}
//             />
//           </div>

//           <div className="ml-4 flex-1">
//             <div className="flex items-center justify-between">
//               <h3 className="font-bold text-sm sm:text-base">
//                 政治や選挙に関する広告
//               </h3>
//             </div>

//             <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
//               <span>政治関連の広告や情報が表示されます</span>
//             </div>

//             <div className="mt-2">
//               <div className="text-xs text-gray-500">
//                 詳しくはこちらをタップ
//               </div>
//             </div>
//           </div>

//           <ChevronRight size={18} className="text-gray-400 ml-2" />
//         </div>
//       </div>
//     </div>
//   );
// };

// インラインバナー広告（非スティッキー、通常の配置）
// const InlineAdBanner = ({ format = "rectangle", showCloseButton = true }) => {
//   const [closed, setClosed] = useState(false);

//   if (closed || !showInlineAd) return null;

//   return (
//     <div className="my-4 border-t border-b border-gray-200 py-4">
//       <div className="relative">
//         {showCloseButton && (
//           <button
//             onClick={() => setClosed(true)}
//             className="absolute -top-2 -right-2 bg-white rounded-full shadow-md z-10"
//             aria-label="広告を閉じる"
//           >
//             <XCircle size={16} className="text-gray-500" />
//           </button>
//         )}
//         {/* <div className="flex justify-center">
//           <MobileAd format={format} />
//         </div> */}
//       </div>
//     </div>
//   );
// };
