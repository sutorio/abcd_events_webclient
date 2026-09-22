import { defineConfig } from "npm:vite@^8.3.0";
import { default as solidPlugin } from "npm:@solidjs/vite-plugin@^3.0.0-next.44";
import { fileRoutes } from "npm:filesystem-routing@0.3.0/vite";
import "npm:@solidjs/diagnostics@^2.0.0-rc.9";


export default defineConfig({
  clearScreen: false,
  plugins: [
    solidPlugin({
      start: true,
      extensions: [".jsx", ".tsx"],
      diagnostics: true,
    }),
    fileRoutes(),
  ],
});
