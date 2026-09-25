/// <reference types="node" />
/**
 * SolidJS 2.0 — turnkey Vite config (SPA / `start: true`).
 *
 * @see https://www.solidjs.com/blog/solid-2-0-rc-the-big-reveal
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import solidPlugin from "@solidjs/vite-plugin";
import { fileRoutes } from "filesystem-routing/vite";
import "@solidjs/diagnostics";
import { mockApiPlugin } from "./mock/vite-plugin.ts";

const root = path.dirname(fileURLToPath(import.meta.url));
const privateDir = path.join(root, "private");

export default defineConfig({
  clearScreen: false,
  resolve: {
    // Read compilerOptions.paths from tsconfig — no duplicate alias map.
    tsconfigPaths: true,
  },
  plugins: [
    mockApiPlugin(),
    solidPlugin({
      start: true,
      extensions: [".jsx", ".tsx"],
      diagnostics: true,
    }),
    fileRoutes({ types: true }),
  ],
  server: {
    https: {
      key: fs.readFileSync(path.join(privateDir, "devkey.pem")),
      cert: fs.readFileSync(path.join(privateDir, "devcert.pem")),
    },
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "vitest.setup.ts",
  },
});
