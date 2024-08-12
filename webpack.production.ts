import { merge } from "webpack-merge";
import common from "./webpack.common.js";
import webpack from "webpack";

export default merge(common, {
  mode: "production",
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "production",
    }),
  ],
});
