import postcssImport from "postcss-import";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import postcssPresetEnv from "postcss-preset-env";

export default {
  plugins: [
    postcssImport({}),
    tailwindcss({}),
    autoprefixer({}),
    cssnano({
      preset: "default",
    }),
    postcssPresetEnv({}),
  ],
};
