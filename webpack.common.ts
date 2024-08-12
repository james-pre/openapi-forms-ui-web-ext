import path from "node:path";
import webpack, { Configuration } from "webpack";
import CopyWebpackPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import WebExtPlugin from "web-ext-plugin";

const outputDirectory = path.resolve(import.meta.dirname, "dist/");

const configuration: Configuration = {
  entry: {
    app: "./src/pages/app/main.ts",
    options: "./src/pages/options/main.ts",
    background_script: "./src/background_script.ts",
    content_script: "./src/content_script.ts",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css|\.sass$/,
        use: [
          { loader: "style-loader" },
          {
            loader: "css-loader",
            options: {
              modules: true,
            },
          },
          { loader: "sass-loader" },
        ],
      },
      /*{
        test: /manifest\.json/,
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
    new webpack.EnvironmentPlugin([]),
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
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  target: ["web"],
};

export default configuration;
