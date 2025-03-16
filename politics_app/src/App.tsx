// politics_app/src/App.tsx (Modified)
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import { ReplyDataProvider } from "./context/ReplyDataContext";
import { AuthProvider } from "./context/AuthContext"; // Import the AuthProvider
import AppContent from "./components/layout/AppContent";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <DataProvider>
        <ReplyDataProvider>
          <AuthProvider>
            {" "}
            {/* Add AuthProvider wrapper */}
            <AppContent />
          </AuthProvider>
        </ReplyDataProvider>
      </DataProvider>
    </BrowserRouter>
  );
};

export default App;
