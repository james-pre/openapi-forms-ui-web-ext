import * as Comlink from "comlink";
import { Remote } from "comlink";
import { NonSandboxApi } from "@/pages/main/nonSandboxApi";
import {
  SchemaHistoryEntries,
  SchemaHistoryEntry,
} from "@/components/SchemaHistory";

export class SandboxLink {
  private comlink!: Remote<NonSandboxApi>;

  public constructor() {
    this.comlink = Comlink.wrap(
      Comlink.windowEndpoint(self.parent, window, "*"),
    );
  }

  public async copyText(text: string): Promise<void> {
    return await this.comlink.copyText(text);
  }

  public async getSchemaHistory(): Promise<SchemaHistoryEntries> {
    const historyEntriesJson =
      await this.comlink.storage.getItem("schemaHistory");
    return historyEntriesJson
      ? (JSON.parse(historyEntriesJson) as SchemaHistoryEntries)
      : {};
  }

  public async upsertSchemaHistoryEntry(
    entry: SchemaHistoryEntry,
  ): Promise<void> {
    const historyEntries = await this.getSchemaHistory();
    historyEntries[`${entry.title} ${entry.version}`] = entry;

    const historyEntriesJson = JSON.stringify(historyEntries);
    await this.comlink.storage.setItem("schemaHistory", historyEntriesJson);
  }
}
