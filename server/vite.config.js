import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@eulertour/studio": resolve(__dirname, "./studio"),
    },
  },
});
