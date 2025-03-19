// politics_app/src/components/layout/Header.tsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Search, X, Menu as MenuIcon } from "lucide-react";
import { useData } from "../../context/DataContext";
import LoginButton from "../auth/LoginButtons";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isScrolled,
    activeTab,
    setActiveTab,
    setMobileMenuOpen,
    globalPoliticians,
  } = useData();

  // 検索機能の状態管理
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  // モバイル向けの状態管理
  const [hideBackButton, setHideBackButton] = useState(false);
  // タイトル表示制御用の状態を追加
  const [hideTitleCompletely, setHideTitleCompletely] = useState(false);

  // refs for handling outside clicks
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPoliticianDetail =
    location.pathname.includes("/politicians/") &&
    location.pathname !== "/politicians";
  const isPartyDetail =
    location.pathname.includes("/parties/") && location.pathname !== "/parties";

  // 検索入力の処理
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length === 0) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // グローバル政治家データで検索を実行
    const results = globalPoliticians.filter((politician) => {
      const name = politician.name.toLowerCase();
      const furigana = politician.furigana?.toLowerCase() || "";
      const search = value.toLowerCase();

      return name.includes(search) || furigana.includes(search);
    });

    setSearchResults(results);
    setShowResults(true);
  };

  // 検索をクリア
  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);

    // 入力フォーカスも外す
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  // 検索バーを閉じる
  const collapseSearchBar = () => {
    clearSearch();
    setIsSearchExpanded(false);

    // タイトルと戻るボタンはトランジション完了後に表示する
    // hideTitleCompletelyはすぐには変更せず、トランジション完了後に変更
    setTimeout(() => {
      setHideBackButton(false);
      setHideTitleCompletely(false);
    }, 300); // 300msはsearch barのtransition durationと同じ値
  };

  // 検索バーを開く
  const expandSearchBar = () => {
    // モバイルの場合、「戻るボタン」とタイトルを即時非表示
    if (isMobile) {
      setHideBackButton(true);
      setHideTitleCompletely(true);
    }

    setIsSearchExpanded(true);

    // 少し遅延させてフォーカス
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  // 検索の表示/非表示を切り替え
  const toggleSearch = () => {
    if (!isSearchExpanded) {
      expandSearchBar();
    } else {
      collapseSearchBar();
    }
  };

  // 検索結果から政治家を選択する処理
  const handleSelectPolitician = (politician: any) => {
    navigate(`/politicians/${politician.id}`);
    collapseSearchBar();
  };

  // 外部クリックを検出して検索バーを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSearchExpanded &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        collapseSearchBar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchExpanded]);

  // モバイルかどうか判定
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  // 画面サイズに基づく検索バーの幅を計算
  const getSearchBarWidth = () => {
    // モバイルサイズでは画面幅に基づいて計算（小さめに）
    if (isMobile) {
      return isSearchExpanded ? "calc(100vw - 120px)" : "40px";
    }
    // デスクトップサイズでは固定サイズ
    return isSearchExpanded ? "220px" : "40px";
  };

  return (
    <header
      className={`sticky top-0 z-20 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-sm"
          : "bg-gradient-to-r from-slate-900 to-slate-800"
      }`}
    >
      <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center">
          {/* Mobile menu button - 元の実装を維持 */}
          <button
            className="flex items-center justify-center w-8 h-8 mr-3"
            onClick={() => setMobileMenuOpen(true)}
          >
            <MenuIcon
              size={20}
              className={isScrolled ? "text-slate-700" : "text-white"}
            />
          </button>
          {/* App title - hideTitleCompletelyに基づいて完全に表示/非表示（元の動作を維持） */}
          {!hideTitleCompletely && (
            <Link
              to="/"
              className={`flex items-center transition-opacity duration-300 ${
                isSearchExpanded && isMobile ? "opacity-0" : "opacity-100"
              }`}
            >
              <h1
                className={`font-bold tracking-wide transition-all duration-300 ${
                  isScrolled ? "text-slate-800 text-lg" : "text-white text-lg"
                }`}
              >
                POLITICS HUB
              </h1>
            </Link>
          )}
        </div>
        {/* 右側コンテンツ - 検索と LoginButton */}
        <div className="flex items-center space-x-4">
          {/* "一覧に戻る"ボタンは削除 - UIが崩れる原因 */}
          {/* Search component - 検索機能を修正 */}
          <div ref={searchContainerRef} className="relative">
            <div
              className={`flex items-center overflow-hidden transition-all duration-300 ${
                isScrolled ? "bg-slate-100" : "bg-slate-700"
              } rounded-full`}
              style={{
                width: getSearchBarWidth(),
              }}
            >
              <div
                className={`flex items-center h-9 ${
                  isSearchExpanded
                    ? "justify-start pl-3"
                    : "justify-center w-full cursor-pointer"
                }`}
                onClick={toggleSearch}
              >
                <Search
                  size={16}
                  className={isScrolled ? "text-slate-500" : "text-white"}
                />
              </div>

              <input
                ref={inputRef}
                type="text"
                placeholder="政治家を検索"
                value={searchTerm}
                onChange={handleSearch}
                className={`${
                  isScrolled
                    ? "text-slate-900 placeholder-slate-500"
                    : "text-white placeholder-slate-300"
                } bg-transparent border-none outline-none text-sm flex-grow py-2 px-2 transition-opacity duration-300 ${
                  isSearchExpanded ? "opacity-100 w-full" : "opacity-0 w-0 p-0"
                }`}
              />
              {isSearchExpanded && searchTerm && (
                <button
                  onClick={clearSearch}
                  className={`p-1 rounded-full mr-1 ${
                    isScrolled
                      ? "text-slate-500 hover:bg-slate-200"
                      : "text-white hover:bg-slate-600"
                  }`}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          {/* User login button */}
          <div>
            <LoginButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
