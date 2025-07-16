// This Vite config is used with `bun run devBundle` to run development
// using the bundled version of the library instead of TypeScript sources
import { ViteUserConfig } from "vitest/config";

export default {
  resolve: {
    alias: {
      "@eulertour/studio": "/build/studio/bundle/index.js"
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
} satisfies ViteUserConfig;