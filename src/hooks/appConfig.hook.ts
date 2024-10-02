import { MediaTypeSerializer } from "@/utils/mediaTypeSerializer";
import { createContext, useContext } from "react";
import { SandboxLink } from "@/utils/sandboxLink";

export type AppConfig = {
  mediaTypeSerializer: MediaTypeSerializer;
  sandboxLink: SandboxLink;
};

export const AppConfigContext = createContext({} as AppConfig);

const useAppConfig = () => {
  return useContext(AppConfigContext);
};

export default useAppConfig;
