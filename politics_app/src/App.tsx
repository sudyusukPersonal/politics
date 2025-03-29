// src/App.tsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import { ReplyDataProvider } from "./context/ReplyDataContext";
import AppContent from "./components/layout/AppContent";
import "./styles/smallMobileOptimization.css";

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
