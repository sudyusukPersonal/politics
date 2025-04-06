// src/components/comments/ReportModal.tsx
import React, { useEffect, useRef, useState } from "react";
import { X, CheckCircle } from "lucide-react";
import ReactDOM from "react-dom";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  commentId: string;
  isReply?: boolean;
}

// 通報完了トースト用のインターフェース
interface ReportSuccessProps {
  isVisible: boolean;
  onAnimationComplete: () => void;
}

// 通報完了トーストコンポーネント
const ReportSuccess: React.FC<ReportSuccessProps> = ({
  isVisible,
  onAnimationComplete,
}) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (isVisible) {
      // 2.5秒後にフェードアウトアニメーションを開始
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // アニメーション完了時の処理
  const handleAnimationEnd = () => {
    if (!isAnimating) {
      onAnimationComplete();
    }
  };

  if (!isVisible) return null;

  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-500 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onTransitionEnd={handleAnimationEnd}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4 flex items-center space-x-3 animate-fadeIn">
        <CheckCircle size={24} className="text-green-500" />
        <p className="text-gray-800 font-medium">コメントを通報しました</p>
      </div>
    </div>,
    document.body
  );
};

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  commentId,
  isReply = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // 通報確定ハンドラー
  const handleConfirm = () => {
    onConfirm();
    setShowSuccess(true);
  };

  // 成功メッセージのアニメーション完了後処理
  const handleSuccessComplete = () => {
    setShowSuccess(false);
    onClose();
  };

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  // モーダル外のクリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // 成功メッセージまたはモーダルのどちらかを表示
  if (showSuccess) {
    return (
      <ReportSuccess
        isVisible={showSuccess}
        onAnimationComplete={handleSuccessComplete}
      />
    );
  }

  // モーダルが非表示の場合は何もレンダリングしない
  if (!isOpen) return null;

  // Portal を使用して body 直下にモーダルをレンダリング
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 animate-fadeIn"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">コメントの通報</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-6 text-gray-600">
          このコメントを通報しますか？通報したコメントは表示されなくなります。
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition"
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            通報する
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReportModal;
