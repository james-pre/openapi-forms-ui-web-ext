export type SupportedMediaType = InstanceType<
  typeof MediaTypeSerializer
>["supportedMediaTypes"][number];

export class MediaTypeSerializer {
  // TODO: Support more media types
  public readonly supportedMediaTypes = Object.freeze([
    "application/json",
  ] as const);

  public supports(mediaType: string): boolean {
    return this.supportedMediaTypes.includes(mediaType as SupportedMediaType);
  }

  public findFirstSupportedMediaType(
    mediaTypes: string[],
  ): SupportedMediaType | undefined {
    return mediaTypes.find((mediaType) => this.supports(mediaType)) as
      | SupportedMediaType
      | undefined;
  }

  public serialize(
    input: unknown,
    mediaType: SupportedMediaType,
    { prettyPrintSpacing = 2 } = {},
  ): string {
    switch (mediaType) {
      case "application/json":
        return JSON.stringify(
          input,
          null,
          prettyPrintSpacing !== undefined && prettyPrintSpacing !== null
            ? prettyPrintSpacing
            : undefined,
        );
      default:
        throw new Error("Unsupported media type");
    }
  }

  public deserialize<T>(serialized: string, mediaType: SupportedMediaType): T {
    switch (mediaType) {
      case "application/json":
        return JSON.parse(serialized) as T;
      default:
        throw new Error("Unsupported media type");
    }
  }
}
