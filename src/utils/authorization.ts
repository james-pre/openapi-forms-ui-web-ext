export type AuthorizationValue =
  | {
      type: "api-key";
      value?: string;
    }
  | {
      type: "basic";
      username?: string;
      password?: string;
    }
  | {
      type: "bearer";
      value?: string;
    }
  | {
      type: "cookie";
    }
  | {
      type: "header";
      name?: string;
      value?: string;
    }
  | {
      type: "query";
      name?: string;
      value?: string;
    }
  | {
      type: "none";
    };

export type AuthorizationType =
  | "api-key"
  | "basic"
  | "bearer"
  | "cookie"
  | "header"
  | "query"
  | "none";

export const applyRequestOptionsFromAuthorizationValues = (
  url: string | URL,
  requestInit: RequestInit,
  ...authorizationValues: AuthorizationValue[]
): {
  url: URL;
} => {
  let credentials: Required<RequestInit["credentials"]> = "same-origin";
  const headers: Record<string, string> = {};
  const query: Record<string, string> = {};
  const finalUrl = typeof url === "string" ? new URL(url) : url;

  // Apply the most significant authorization value that is not "none"
  const authorizationValue = authorizationValues
    .reverse()
    .find((a) => a.type !== "none") || { type: "none" };
  switch (authorizationValue.type) {
    case "api-key":
      if (authorizationValue.value !== undefined) {
        headers["apiKey"] = authorizationValue.value;
      }
      break;
    case "basic":
      if (
        authorizationValue.username !== undefined &&
        authorizationValue.password !== undefined
      ) {
        headers["Authorization"] = `Basic ${btoa(
          `${authorizationValue.username}:${authorizationValue.password}`,
        )}`;
      }
      break;
    case "bearer":
      if (authorizationValue.value !== undefined) {
        headers["Authorization"] = `Bearer ${authorizationValue.value}`;
      }
      break;
    case "cookie":
      credentials = "include";
      break;
    case "header":
      if (
        authorizationValue.name !== undefined &&
        authorizationValue.value !== undefined
      ) {
        headers[authorizationValue.name] = authorizationValue.value;
      }
      break;
    case "query":
      if (authorizationValue.name && authorizationValue.value) {
        query[authorizationValue.name] = authorizationValue.value;
      }
  }

  const applyCredentials = () => {
    requestInit.credentials = credentials;
  };

  const applyHeaders = () => {
    requestInit.headers = new Headers(requestInit.headers);
    for (const [key, value] of Object.entries(headers)) {
      requestInit.headers.append(key, value);
    }
  };

  const applyQuery = () => {
    const searchParams = new URLSearchParams(finalUrl.search);
    for (const [key, value] of Object.entries(query)) {
      searchParams.set(key, value);
    }
    finalUrl.search = searchParams.toString();
  };

  applyCredentials();
  applyHeaders();
  applyQuery();

  return {
    url: finalUrl,
  };
};
