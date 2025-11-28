import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Fix DOMPurify resolution for packages that import it dynamically (e.g. jspdf)
      // Point to a concrete distributable build so Vite/esbuild can prebundle correctly.
      "dompurify": path.resolve(
        __dirname,
        "./node_modules/dompurify/dist/purify.js"
      ),
    },
  },
  optimizeDeps: {
    include: ["dompurify"],
  },
}));
