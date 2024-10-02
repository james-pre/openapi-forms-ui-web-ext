export type SupportedMediaType = InstanceType<
  typeof MediaTypeSerializer
>["supportedMediaTypes"][number];

const swaggerApplicationXWwwFormUrlencodedSerializer = {
  // deserialize: <T>(serialized: string): T => {},
  serialize: (input: unknown): string | null | undefined => {
    const serializeValue = (value: unknown): string | null | undefined => {
      switch (typeof value) {
        case "undefined":
          return undefined;
        case "object":
          return JSON.stringify(value);
        case "boolean":
          return String(value);
        case "number":
          return value.toString();
        case "string":
          return value;
        case "function":
          return value.toString();
        case "symbol":
          return value.toString();
        case "bigint":
          return value.toString();
      }
    };

    switch (typeof input) {
      case "object": {
        if (input === null) return null;

        const search = new URLSearchParams();
        Object.entries(input).forEach(([key, value]) => {
          const serializedValue = serializeValue(value);

          // TODO Add options to specify how to handle null/undefined values
          search.append(key, serializedValue ?? "");
        });

        return search.toString();
      }
      default:
        return serializeValue(input);
    }
  },
};

export class MediaTypeSerializer {
  // TODO: Support more media types
  public readonly supportedMediaTypes = Object.freeze([
    "application/json",
    "application/x-www-form-urlencoded",
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
  ): string | null | undefined {
    switch (mediaType) {
      case "application/json":
        return JSON.stringify(
          input,
          null,
          prettyPrintSpacing !== undefined && prettyPrintSpacing !== null
            ? prettyPrintSpacing
            : undefined,
        );
      case "application/x-www-form-urlencoded":
        return swaggerApplicationXWwwFormUrlencodedSerializer.serialize(input);
      default:
        throw new Error("Unsupported media type for serialization");
    }
  }

  public deserialize<T>(serialized: string, mediaType: SupportedMediaType): T {
    switch (mediaType) {
      case "application/json":
        return JSON.parse(serialized) as T;
      default:
        throw new Error("Unsupported media type for deserialization");
    }
  }
}
