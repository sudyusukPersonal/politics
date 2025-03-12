// src/components/common/SearchBar.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { Politician } from "../../types";

interface SearchBarProps {
  isScrolled: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  isScrolled,
  onExpandChange,
}) => {
  const { globalPoliticians, dataInitialized } = useData();
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Politician[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchReady, setSearchReady] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // データの初期化状態を監視
  useEffect(() => {
    if (dataInitialized) {
      setSearchReady(true);
    }
  }, [dataInitialized]);

  // 検索拡張の切り替え処理
  const toggleSearch = () => {
    // データが準備できていない場合は何もしない
    if (!searchReady) return;

    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    // 親コンポーネントに展開状態の変更を通知
    if (onExpandChange) {
      onExpandChange(newExpandedState);
    }

    if (newExpandedState) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // アニメーション完了を待つ
    } else {
      setSearchTerm("");
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // 検索をクリアして折りたたむ
  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);

    if (inputRef.current) {
      inputRef.current.blur();
    }

    setTimeout(() => {
      setIsExpanded(false);

      // 親コンポーネントに展開状態の変更を通知
      if (onExpandChange) {
        onExpandChange(false);
      }
    }, 100);
  };

  // 検索結果のメモ化
  const performSearch = useMemo(() => {
    return (term: string): Politician[] => {
      if (!term.trim() || !globalPoliticians.length) return [];

      const searchTerm = term.toLowerCase();

      console.time("検索処理時間");
      const results = globalPoliticians.filter((politician) => {
        const name = politician.name.toLowerCase();
        const furigana = politician.furigana?.toLowerCase() || "";

        return name.includes(searchTerm) || furigana.includes(searchTerm);
      });
      console.timeEnd("検索処理時間");

      return results;
    };
  }, [globalPoliticians]);

  // 検索入力の処理
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length === 0) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // メモ化された検索関数を使用
    const results = performSearch(value);
    setSearchResults(results);
    setShowResults(true);
  };

  // 外部クリックで結果を閉じる処理とバーを折りたたむ処理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 検索バーの外側をクリックしたとき
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        // 検索結果を非表示にする
        setShowResults(false);

        // 検索バーが展開されている場合は折りたたむ
        if (isExpanded) {
          clearSearch();
        }
      }
      // 検索結果の外側かつ検索入力欄の外側をクリックしたとき
      else if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        // 検索結果のみを非表示にする
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  // 検索結果から政治家を選択する処理
  const handleSelectPolitician = (politician: Politician) => {
    navigate(`/politicians/${politician.id}`);
    clearSearch();
  };

  // モバイルかどうか判定（パフォーマンス向上のためメモ化）
  const isMobile = useMemo(() => {
    return typeof window !== "undefined" && window.innerWidth < 640;
  }, []);

  return (
    <div ref={searchBarRef} className="relative">
      <div
        className={`flex items-center overflow-hidden transition-all duration-300 ${
          isScrolled ? "bg-gray-100" : "bg-white/20 backdrop-blur-sm"
        } rounded-full ${
          isExpanded ? "w-40 sm:w-56" : "w-8 sm:w-8 cursor-pointer"
        } ${!searchReady ? "opacity-50" : ""}`}
      >
        {/* 虫眼鏡アイコンはボタンの中央に配置（非拡張時） */}
        <div
          className={`flex items-center justify-center ${
            isExpanded ? "pl-3 pr-2" : "w-full"
          }`}
          onClick={toggleSearch}
        >
          <Search
            size={16}
            className={`${
              isScrolled ? "text-gray-500" : "text-white"
            } cursor-pointer`}
          />
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder={searchReady ? "政治家を検索..." : "読み込み中..."}
          value={searchTerm}
          onChange={handleSearch}
          disabled={!searchReady}
          onFocus={() => setShowResults(searchResults.length > 0)}
          className={`${
            isScrolled ? "text-gray-900" : "text-white placeholder-white/70"
          } bg-transparent border-none outline-none text-sm flex-grow py-2 transition-opacity duration-300 ${
            isExpanded ? "opacity-100 w-full" : "opacity-0 w-0 p-0"
          }`}
        />

        {isExpanded && searchTerm && (
          <button
            onClick={clearSearch}
            className={`p-1 rounded-full mr-1 ${
              isScrolled
                ? "text-gray-500 hover:bg-gray-200"
                : "text-white hover:bg-white/20"
            }`}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 検索結果ドロップダウン */}
      {showResults && (
        <div
          ref={resultsRef}
          className="absolute top-full right-0 mt-2 w-64 sm:w-72 bg-white rounded-lg shadow-lg overflow-hidden z-50 max-h-96 overflow-y-auto animate-fadeIn"
        >
          {searchResults.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {searchResults.map((politician) => (
                <div
                  key={politician.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer flex items-center"
                  onClick={() => handleSelectPolitician(politician)}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={politician.image}
                      alt={politician.name}
                      className="w-10 h-10 rounded-full object-cover border-2"
                      style={{ borderColor: politician.party.color }}
                      loading="lazy" // 画像の遅延読み込み
                    />
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-800">
                      {politician.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {politician.party.name}
                      {politician.furigana && (
                        <span className="ml-2 text-gray-400">
                          {politician.furigana}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              該当する政治家が見つかりません
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// React.memoを使用してパフォーマンスを最適化
export default React.memo(SearchBar);
