import * as Comlink from "comlink";
import { nonSandboxApi } from "./nonSandboxApi";

const appFrame = document.querySelector<HTMLIFrameElement>("iframe#app-frame")!;

Comlink.expose(
  nonSandboxApi,
  Comlink.windowEndpoint(appFrame.contentWindow!, window, "*"),
);
