import Oas from "oas";
import OASNormalize from "oas-normalize";

const removeIdsFromSchema = (schema: unknown) => {
  if (Array.isArray(schema)) {
    schema.forEach(removeIdsFromSchema);
  } else if (typeof schema === "object" && schema !== null) {
    if ("$id" in schema) delete schema.$id;

    Object.keys(schema).forEach((key) => {
      removeIdsFromSchema(schema[key as keyof typeof schema]);
    });
  }
};

const fixupSchema = (schema: unknown) => {
  removeIdsFromSchema(schema);
};

export const parseSchema = async (schema: string): Promise<Oas> => {
  const normalizedOasDocument = await new OASNormalize(schema, {
    enablePaths: true,
  })
    .validate({
      convertToLatest: true,
    })
    .then((definition) => new OASNormalize(definition).deref());
  fixupSchema(normalizedOasDocument);

  return new Oas(JSON.stringify(normalizedOasDocument));
};
