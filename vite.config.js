import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import EnvironmentPlugin from 'vite-plugin-environment';
import path from 'path';

// Get require functionality in ESM
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

function rewriteUrlWithExtension(url, fileName) {
  if (url.match(new RegExp(`^/${fileName}($|\\?)`))) {
    return url.replace(new RegExp(`^/${fileName}`), `/${fileName}.html`);
  }
  return url;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgrPlugin(),
    EnvironmentPlugin({
      ETHEREUM_CHAIN_ID: 1,
      AZTEC_CHAIN_ID: 677868, // TODO remove this
      NODE_ENV: 'production',
      ROLLUP_HOST: 'https://api.aztec.network/aztec-connect-prod/falafel',
      WALLETCONNECT_PROJECT_ID: process.env.WALLETCONNECT_PROJECT_ID,
    }),
    viteStaticCopy({
      targets: [
        {
          src: `${path.dirname(require.resolve('@aztec/sdk-incubator'))}/aztec-connect.wasm`,
          dest: '',
        },
        {
          src: `${path.dirname(require.resolve('@aztec/sdk-incubator'))}/web_worker.js`,
          dest: '',
        },
      ],
    }),
    {
      name: 'configure-server',
      configureServer(server) {
        server.middlewares.use((req, _, next) => {
          ['wc', 'iframe', 'popup'].forEach(fileName => {
            req.url = rewriteUrlWithExtension(req.url, fileName);
          });
          next();
        });
      },
    },
  ],
  resolve: {
    alias: { buffer: 'buffer/' },
  },
  build: {
    outDir: 'dest',
    rollupOptions: {
      input: {
        iframe: path.resolve(__dirname, 'src/iframe/main.tsx'),
        popup: path.resolve(__dirname, 'src/popup/main.tsx'),
        standalone: path.resolve(__dirname, 'src/standalone/main.tsx'),
        'iframe-index': path.resolve(__dirname, 'iframe.html'),
        'popup-index': path.resolve(__dirname, 'popup.html'),
        wc: path.resolve(__dirname, 'wc.html'),
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true, // Enable @walletconnect/web3-provider which has some code in CommonJS
    },
  },
  optimizeDeps: {
    // NOTE: fixes locally linked aztec-ui, but only for dev builds
    include: ['@aztec/aztec-ui'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
    port: 1235,
    host: '0.0.0.0',
  },
});
