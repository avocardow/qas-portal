import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    env: {
      SKIP_ENV_VALIDATION: "1",
    },
    setupFiles: ["vitest.setup.ts"],
  },
});
