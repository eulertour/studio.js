import { defineConfig } from "vite";

export default defineConfig({
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
