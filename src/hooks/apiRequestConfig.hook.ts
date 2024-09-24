import { createContext, useContext } from "react";

export type ApiRequestConfig = {
  includeCredentials: boolean;
  requestHeaders: Record<string, string>;
  targetServer: string;
};

export const ApiRequestConfigContext = createContext({} as ApiRequestConfig);

const useApiRequestConfig = () => {
  return useContext(ApiRequestConfigContext);
};

export default useApiRequestConfig;
