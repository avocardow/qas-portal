import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import path from 'path';

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
  resolve: {
    alias: [
      {
        find: /\.svg$/,
        replacement: path.resolve(__dirname, 'test/__mocks__/svgMock.tsx'),
      },
    ],
  },
});
