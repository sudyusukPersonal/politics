import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      "Content-Security-Policy":
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com",
    },
  },
  // 本番ビルド時の設定も追加
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Google APIs
          if (id.includes("googleapis.com")) {
            return "external";
          }

          // node_modules内のライブラリを分割
          if (id.includes("node_modules")) {
            // Firebase関連
            if (id.includes("firebase")) {
              return "vendor-firebase";
            }
            // Reactとその周辺
            if (id.includes("react") || id.includes("scheduler")) {
              return "vendor-react";
            }
            // その他のライブラリ
            return "vendor-others";
          }
        },
      },
    },
  },
});
