import * as Comlink from "comlink";
import { nonSandboxApi } from "./nonSandboxApi";

Comlink.expose(nonSandboxApi, Comlink.windowEndpoint(self));
