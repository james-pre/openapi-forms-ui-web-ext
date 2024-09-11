# OpenAPI Forms UI

## Prerequisites

- Node v20

## One-time setup

`corepack enable`

`corepack install`

`pnpm install`

## Development workflow

Running `pnpm watch` will watch the source files and continuously build the extension in the `dist` directory.

Running `pnpm start:firefox` (or any other browser) will load the unpacked extension from the `dist` directory
and make it available in the browser, reloading it any time files in the `dist` directory change.

## Building for release

Running `pnpm run build:production` will build the extension source files in production mode.

Running `pnpm build-ext` will package the build output in a zip (output path is `web-ext-artifacts/openapi-forms-ui-web-ext-[version].zip`)
which can be uploaded on browser extension stores (or manually loaded in the browser).
~~~~