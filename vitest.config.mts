import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: [
      "lib/**/*.test.ts",
      "app/**/*.test.ts",
      "utils/**/*.test.ts",
      "components/**/*.test.{ts,tsx}",
    ],
    // DB-backed tests are excluded by default — unit tests only.
    exclude: ["node_modules", ".next", "**/*.e2e.test.ts"],
    testTimeout: 10_000,
  },
});
