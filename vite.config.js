import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import { viteStaticCopy } from "vite-plugin-static-copy";
import EnvironmentPlugin from "vite-plugin-environment";
import path from "path";

// Get require functionality in ESM
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgrPlugin(),
    EnvironmentPlugin({ VITE_CHAINID: 1337, NODE_ENV: "development" }),
    viteStaticCopy({
      targets: [
        {
          src: `${path.dirname(
            require.resolve("@aztec/sdk")
          )}/aztec-connect.wasm`,
          dest: "",
        },
        {
          src: `${path.dirname(require.resolve("@aztec/sdk"))}/web_worker.js`,
          dest: "",
        },
      ],
    }),
  ],
  resolve: {
    alias: {},
  },
  build: {
    outDir: "dest",
    // sourcemap: true,
    rollupOptions: {
      input: {
        iframe: path.resolve(__dirname, "src/iframe/main.tsx"),
        popup: path.resolve(__dirname, "src/popup/main.tsx"),
        standalone: path.resolve(__dirname, "src/standalone/main.tsx"),
        "iframe-index": path.resolve(__dirname, "iframe-index.html"),
        "popup-index": path.resolve(__dirname, "popup-index.html"),
        "standalone-index": path.resolve(__dirname, "standalone-index.html"),
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    port: 1235,
    host: "0.0.0.0",
  },
});
