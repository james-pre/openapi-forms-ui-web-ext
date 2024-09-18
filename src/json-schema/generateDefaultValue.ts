import { JSONSchema } from "./JSONSchema";

export function generateDefaultValue(schema: JSONSchema): unknown {
  if (schema.const !== undefined) {
    return schema.const;
  }
  if (schema.default !== undefined) {
    return schema.default;
  }

  switch (schema.type) {
    case "string":
      return undefined;
    case "number":
      return 0;
    case "integer":
      return 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object": {
      const obj: Record<string, unknown> = {};
      if (schema.properties) {
        for (const key in schema.properties) {
          obj[key] = generateDefaultValue(schema.properties[key] as JSONSchema);
        }
      }
      return obj;
    }
    default:
      return null;
  }
}
