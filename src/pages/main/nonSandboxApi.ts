export const nonSandboxApi = {
  copyText: async (text: string) => {
    await navigator.clipboard.writeText(text);
  },
};

export type NonSandboxApi = typeof nonSandboxApi;
