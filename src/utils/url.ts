export const concatUrlPaths = (...urls: string[]) => {
  return urls.reduce((acc, url) => {
    if (acc === "" || url === "") {
      return acc + url;
    }
    return acc.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
  }, "");
};
