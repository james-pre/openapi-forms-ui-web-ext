import * as Comlink from "comlink";

export const nonSandboxApi = {
  copyText: async (text: string) => {
    await navigator.clipboard.writeText(text);
  },
  storage: Comlink.proxy(window.localStorage),
};

export type NonSandboxApi = typeof nonSandboxApi;
