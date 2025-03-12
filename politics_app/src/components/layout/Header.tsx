// politics_app/src/components/layout/Header.tsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, ArrowLeft, Search, X } from "lucide-react";
import { useData } from "../../context/DataContext";

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

    // モバイルの場合、わずかな遅延後に「戻るボタン」を表示
    if (isMobile) {
      setTimeout(() => {
        setHideBackButton(false);
      }, 300);
    }
  };

  // 検索バーを開く
  const expandSearchBar = () => {
    // モバイルの場合、「戻るボタン」を非表示
    if (isMobile) {
      setHideBackButton(true);
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
          {/* Mobile menu button - 常に表示 */}
          <button
            className="lg:hidden flex items-center justify-center w-8 h-8 mr-3"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu
              size={20}
              className={isScrolled ? "text-slate-700" : "text-white"}
            />
          </button>

          {/* App title - モバイルの検索バー展開時は非表示 */}
          <Link
            to="/"
            className={`flex items-center ${
              isSearchExpanded && isMobile ? "hidden sm:flex" : "flex"
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
        </div>

        <div className="flex items-center">
          {/* Tabs for navigation - デスクトップのみ表示 */}
          {(location.pathname === "/" ||
            location.pathname === "/politicians" ||
            location.pathname === "/parties") && (
            <div
              className={`hidden md:flex space-x-1 rounded-full mr-4 ${
                isScrolled ? "bg-slate-100" : "bg-slate-700"
              } p-1`}
            >
              <button
                onClick={() => {
                  setActiveTab("politicians");
                  navigate("/");
                }}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition ${
                  activeTab === "politicians"
                    ? isScrolled
                      ? "bg-white text-slate-700 shadow-sm"
                      : "bg-slate-900 text-white"
                    : isScrolled
                    ? "text-slate-600 hover:bg-slate-200"
                    : "text-slate-300 hover:bg-slate-600"
                }`}
              >
                政治家
              </button>
              <button
                onClick={() => {
                  setActiveTab("parties");
                  navigate("/parties");
                }}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition ${
                  activeTab === "parties"
                    ? isScrolled
                      ? "bg-white text-slate-700 shadow-sm"
                      : "bg-slate-900 text-white"
                    : isScrolled
                    ? "text-slate-600 hover:bg-slate-200"
                    : "text-slate-300 hover:bg-slate-600"
                }`}
              >
                政党
              </button>
            </div>
          )}

          {/* Back button - モバイルかつ検索バー展開時は非表示 */}
          {!hideBackButton && isPoliticianDetail && (
            <button
              onClick={() => navigate(-1)}
              className={`mr-4 flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition ${
                isScrolled
                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  : "bg-slate-700 text-white hover:bg-slate-600"
              }`}
            >
              <ArrowLeft size={14} className="mr-1" />
              <span>一覧に戻る</span>
            </button>
          )}

          {/* Back button for party detail - モバイルかつ検索バー展開時は非表示 */}
          {!hideBackButton && isPartyDetail && (
            <button
              onClick={() => navigate("/parties")}
              className={`mr-4 flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition ${
                isScrolled
                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  : "bg-slate-700 text-white hover:bg-slate-600"
              }`}
            >
              <ArrowLeft size={14} className="mr-1" />
              <span>政党一覧に戻る</span>
            </button>
          )}

          {/* Search component - どのページでも表示 */}
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
                className={`flex items-center justify-center h-9 ${
                  isSearchExpanded ? "pl-3 w-auto" : "w-full cursor-pointer"
                }`}
                onClick={toggleSearch}
              >
                <Search
                  size={16}
                  className={`${isScrolled ? "text-slate-500" : "text-white"}`}
                />
              </div>

              <input
                ref={inputRef}
                type="text"
                placeholder="政治家を検索..."
                value={searchTerm}
                onChange={handleSearch}
                className={`${
                  isScrolled
                    ? "text-slate-900"
                    : "text-white placeholder-slate-300"
                } bg-transparent border-none outline-none text-sm flex-grow py-2 transition-opacity duration-300 ${
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

            {/* 検索結果ドロップダウン */}
            {showResults && (
              <div className="absolute top-full right-0 mt-2 w-64 sm:w-72 bg-white rounded-lg shadow-lg overflow-hidden z-50 max-h-96 overflow-y-auto animate-fadeIn">
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {searchResults.map((politician) => (
                      <div
                        key={politician.id}
                        className="p-3 hover:bg-slate-50 cursor-pointer flex items-center"
                        onClick={() => handleSelectPolitician(politician)}
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={politician.image}
                            alt={politician.name}
                            className="w-10 h-10 rounded-full object-cover border-2"
                            style={{ borderColor: politician.party.color }}
                          />
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-slate-800">
                            {politician.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {politician.party.name}
                            {politician.furigana && (
                              <span className="ml-2 text-slate-400">
                                {politician.furigana}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-500">
                    該当する政治家が見つかりません
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
