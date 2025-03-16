// src/App.tsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import { ReplyDataProvider } from "./context/ReplyDataContext";
import { AuthProvider } from "./context/AuthContext";
import AppContent from "./components/layout/AppContent";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <DataProvider>
        <ReplyDataProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ReplyDataProvider>
      </DataProvider>
    </BrowserRouter>
  );
};

export default App;
