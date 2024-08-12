import common from "./webpack.common.js";
import { merge } from "webpack-merge";
import webpack from "webpack";

export default merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development",
      NODE_DEBUG: false,
    }),
  ],
});
