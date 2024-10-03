const TAB = "\t";

const escapeShell = (cmd: string) => {
  return `${cmd.replace(/'/g, "'\\''")}`;
};

export const makeCurlCommand = (
  url: string,
  method?: string,
  headersInit?: HeadersInit,
  body?: BodyInit | null,
) => {
  method = escapeShell((method || "GET").toUpperCase());
  const urlText = `${TAB}'${url}'`;

  const headers = new Headers(headersInit);
  const headersArray: string[] = [];
  headers.forEach((value, key) => {
    headersArray.push(`${TAB}-H '${escapeShell(key)}: ${escapeShell(value)}'`);
  });
  const headersText = headersArray.join(" \\\n");
  const bodyText =
    typeof body === "string" ? `${TAB}-d '${escapeShell(body)}'` : "";

  return `
curl -X '${method}' \\
${urlText} \\
${headersText} \\
${bodyText}
  `.trim();
};
