import { dest, src } from "gulp";
import zip from "gulp-zip";
import fs from "node:fs/promises";

const clean = async () => {
  await fs.rm("dist/", { recursive: true, force: true });
  await fs.rm(`openapi-forms-ui-web-ext.zip`, { force: true });
};

const pack = async () => {
  return src("dist/**/*", {})
    .pipe(zip(`openapi-forms-ui-web-ext.zip`, { compress: true }))
    .pipe(dest(".", {}));
};

export { clean, pack };
