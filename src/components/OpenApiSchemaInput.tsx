import React from "react";
import { Divider, FormLabel, Stack, Typography } from "@mui/material";
import Oas from "oas";
import SchemaInputFileUpload from "@/components/SchemaInputFileUpload";
import SchemaInputUrl from "@/components/SchemaInputUrl";

export type SchemaSource = {
  name: string;
  type: "file" | "url";
};

export type SchemaChangeEventArgs = {
  schema: Oas;
  source: SchemaSource;
};

export interface OpenApiSchemaInputProps {
  onSchemaChange: (eventArgs: SchemaChangeEventArgs) => void;
}

const OpenApiSchemaInput = (props: OpenApiSchemaInputProps) => {
  const { onSchemaChange } = props;

  return (
    <Stack spacing={8}>
      <SchemaInputFileUpload
        onSchemaLoaded={(oas, originalFileName) => {
          onSchemaChange({
            schema: oas,
            source: {
              name: originalFileName,
              type: "file",
            },
          });
        }}
      />

      <Stack>
        <Divider component={"div"} role={"presentation"} textAlign={"center"}>
          <FormLabel>
            <Typography variant={"h6"}>or</Typography>
          </FormLabel>
        </Divider>
      </Stack>

      <SchemaInputUrl
        onSchemaLoaded={(oas, url) => {
          onSchemaChange({ schema: oas, source: { name: url, type: "url" } });
        }}
      />
    </Stack>
  );
};

export default OpenApiSchemaInput;
