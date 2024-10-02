import * as Comlink from "comlink";
import { Remote } from "comlink";
import { NonSandboxApi } from "@/pages/main/nonSandboxApi";

export class SandboxLink {
  private comlink!: Remote<NonSandboxApi>;

  public constructor() {
    this.comlink = Comlink.wrap(Comlink.windowEndpoint(self.parent));
  }

  public async copyText(text: string): Promise<void> {
    return await this.comlink.copyText(text);
  }
}
