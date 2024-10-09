export type AuthorizationValues = {
  cookie: { [key: string]: string };
  header: { [key: string]: string };
  query: { [key: string]: string };
};

export const applyRequestOptionsFromAuthorizationValues = (
  url: string | URL,
  requestInit: RequestInit,
  ...authorizationValues: AuthorizationValues[]
): {
  url: URL;
} => {
  const finalUrl = typeof url === "string" ? new URL(url) : url;

  const applyHeaders = () => {
    for (const authorizationValue of authorizationValues) {
      requestInit.headers = new Headers(requestInit.headers);
      for (const [key, value] of Object.entries(authorizationValue.header)) {
        requestInit.headers.append(key, value);
      }
    }
  };

  const applyQuery = () => {
    const searchParams = new URLSearchParams(finalUrl.search);

    for (const authorizationValue of authorizationValues) {
      for (const [key, value] of Object.entries(authorizationValue.query)) {
        searchParams.set(key, value);
      }
    }
    finalUrl.search = searchParams.toString();
  };

  applyHeaders();
  applyQuery();

  return {
    url: finalUrl,
  };
};
