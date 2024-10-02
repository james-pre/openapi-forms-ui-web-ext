import path from "node:path";
import webpack, { Configuration } from "webpack";
import CopyWebpackPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";

const outputDirectory = path.resolve(import.meta.dirname, "dist/");

const configuration: Configuration = {
  context: import.meta.dirname,
  entry: {
    app: "./src/pages/app/main.ts",
    main: "./src/pages/main/main.ts",
    options: "./src/pages/options/main.ts",
    service_worker: "./src/service-worker/service_worker.ts",
    content_script: "./src/content_script.ts",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "ts-loader",
        options: {
          getCustomTransformers: () => ({
            before: [],
          }),
        },
      },
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
          { loader: "postcss-loader" },
        ],
      },
      /*{
        test: /manifest\.json/,
        type: "asset/resource",
      },*/
      /*{
        test: /ace-builds.*\/worker-.*$/,
        type: "asset/resource",
      },*/
    ],
  },
  output: {
    clean: true,
    filename: "[name].js",
    path: outputDirectory,
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_DISABLE_COLORS: "true",
    }),
    new webpack.DefinePlugin({
      "process.browser": JSON.stringify(true),
      "process.platform": JSON.stringify("linux"),
    }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new CopyWebpackPlugin({
      options: {},
      patterns: [
        { from: "manifest.json", to: "manifest.json" },
        { from: "src/assets/", to: "assets/" },
        /*{
          from: "pages/!**!/!*.html",
          context: path.resolve(import.meta.dirname, "src/"),
        },*/
      ],
    }),
    new HtmlWebpackPlugin({
      chunks: ["options"],
      filename: "options.html",
      template: "src/pages/options/index.html",
    }),
    new HtmlWebpackPlugin({
      chunks: ["app"],
      filename: "app.html",
      template: "src/pages/app/index.html",
    }),
    new HtmlWebpackPlugin({
      chunks: ["main"],
      filename: "main.html",
      template: "src/pages/main/index.html",
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      buffer: "buffer",
      fs: "@zenfs/core",
      http: "stream-http",
      https: "https-browserify",
      path: "path-browserify",
      util: "util",
      url: "url",
    },
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(import.meta.dirname, "tsconfig.json"),
      }),
    ],
  },
  target: ["web"],
};

export default configuration;
