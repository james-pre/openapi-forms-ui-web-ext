import { MediaTypeSerializer } from "@/utils/mediaTypeSerializer";
import { createContext, useContext } from "react";

export type AppConfig = {
  mediaTypeSerializer: MediaTypeSerializer;
};

export const AppConfigContext = createContext({} as AppConfig);

const useAppConfig = () => {
  return useContext(AppConfigContext);
};

export default useAppConfig;
