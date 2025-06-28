import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Enable client-side routing fallback
    // This ensures that all routes are served with index.html
    // which allows React Router to handle client-side routing
    historyApiFallback: true,
  },
});
