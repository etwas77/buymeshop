import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("react-router-dom") || id.includes("react-dom") || id.includes("react")) {
            return "react";
          }

          if (id.includes("@reduxjs/toolkit") || id.includes("react-redux")) {
            return "redux";
          }

          if (
            id.includes("react-bootstrap") ||
            id.includes("react-icons") ||
            id.includes("react-slick") ||
            id.includes("slick-carousel")
          ) {
            return "ui";
          }

          if (
            id.includes("axios") ||
            id.includes("lodash") ||
            id.includes("react-toastify") ||
            id.includes("react-medium-image-zoom")
          ) {
            return "utils";
          }
        },
      },
    },
  },
});
