export default {
  artifactsDir: "./web-ext-artifacts/",
  sourceDir: "./dist/",
  verbose: false,
  build: {
    overwriteDest: true,
  },
  run: {
    devtools: true,
    profileCreateIfMissing: true,
    keepProfileChanges: true,
  },
};
