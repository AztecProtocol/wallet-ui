import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { createRequire } from 'module';
import path from 'path';
import ResolveTypeScriptPlugin from 'resolve-typescript-plugin';
import { fileURLToPath } from 'url';
import webpack from 'webpack';

const require = createRequire(import.meta.url);

export default {
  target: 'web',
  mode: 'development',
  entry: './src/index.tsx',
  entry: {
    'popup-entry': './src/popup/index.tsx',
    'iframe-entry': './src/iframe/index.tsx',
  },
  // NOTE: if the default devtool of 'eval' is used, there are issues
  // loading development versions of the sdkw
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{ loader: 'ts-loader' }],
      },
    ],
  },
  optimization: {
    // we split our chunks so they can be shared between our iframe and pop-up entry points
    // as a more subtle point, given the sensitive nature of the wallet it may make sense to
    // audit or freeze these chunk dependencies
    splitChunks: {
      chunks: 'all',
    },
  },
  output: {
    path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), './dest'),
    filename: '[name].js',
  },
  plugins: [
    new webpack.EnvironmentPlugin({ NODE_DEBUG: false, ROLLUP_HOST: '', ETHEREUM_HOST: '' }),
    new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: `${path.dirname(require.resolve(`@aztec/sdk`))}/aztec-connect.wasm`,
          to: 'aztec-connect.wasm',
        },
      ],
    }),
    new HtmlWebpackPlugin({
      filename: 'popup-index.html',
      template: 'src/popup/index.html',
      chunks: ['popup-entry'],
    }),
    new HtmlWebpackPlugin({
      filename: 'iframe-index.html',
      template: 'src/iframe/index.html',
      chunks: ['iframe-entry'],
    }),
  ],
  resolve: {
    plugins: [new ResolveTypeScriptPlugin()],
    fallback: {
      crypto: false,
      os: false,
      fs: false,
      path: false,
      url: false,
      events: require.resolve('events/'),
      buffer: require.resolve('buffer/'),
      util: require.resolve('util/'),
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert/'),
    },
  },
  devServer: {
    port: 1235,
    historyApiFallback: true,
    static: [
      {
        directory: path.resolve(path.dirname(fileURLToPath(import.meta.url)), './dest'),
      },
    ],
  },
};
