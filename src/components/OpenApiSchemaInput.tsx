import React, { ChangeEvent, useCallback } from "react";

export interface OpenApiSchemaInputProps {
  onSchemaChange: (schema: string) => void;
}

const OpenApiSchemaInput = (props: OpenApiSchemaInputProps) => {
  const { onSchemaChange } = props;

  const [url, setUrl] = React.useState("https://petstore.swagger.io/v2/swagger.json");

  const onFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      let schema: string = null!;
      try {
        schema = await file.text();
      } catch (error) {
        console.error(error);
      }
      if (!schema) return;

      onSchemaChange(schema);
    },
    [onSchemaChange],
  );
  const onUrlButtonClick = useCallback(async () => {
    let schema: string = null!;
    try {
      schema = await fetch(url).then((response) => response.text());
    } catch (error) {
      console.error(error);
    }
    if (!schema) return;

    onSchemaChange(schema);
  }, [url, onSchemaChange]);

  return (
    <>
      <p>Upload a file</p>
      <input type="file" accept=".json" onChange={onFileChange} />
      <p>or</p>
      <div>
        <p>Retrieve the schema from an URL</p>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="button" onClick={onUrlButtonClick}>Get</button>
      </div>
    </>
  );
};

export default OpenApiSchemaInput;
