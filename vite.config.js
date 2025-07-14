import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@eulertour/studio": "/src/index.ts"
    }
  },
  build: {
    lib: {
      entry: "src/index.ts",
      name: "studio",
      fileName: "index",
      formats: ["es"],
    },
    sourcemap: true,
  },
  test: {
    include: ["**/*.test.ts"],
    environment: "node",
  },
});
