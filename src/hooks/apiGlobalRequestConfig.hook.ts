import { createContext, useContext } from "react";
import { AuthorizationValues } from "@/utils/authorization";

export type ApiGlobalRequestConfig = {
  authorization: AuthorizationValues;
  requestHeaders: Record<string, string>;
  targetServer: string;
};

export const ApiGlobalRequestConfigContext = createContext(
  {} as ApiGlobalRequestConfig,
);

const useApiGlobalRequestConfig = () => {
  return useContext(ApiGlobalRequestConfigContext);
};

export default useApiGlobalRequestConfig;
