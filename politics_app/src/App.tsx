// politics_app/src/App.tsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import { ReplyDataProvider } from "./context/ReplyDataContext"; // 新しいコンテキストをインポート
import AppContent from "./components/layout/AppContent";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <DataProvider>
        <ReplyDataProvider>
          <AppContent />
        </ReplyDataProvider>
      </DataProvider>
    </BrowserRouter>
  );
};

export default App;
