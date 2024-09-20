import React from "react";
import { Divider, FormLabel, Stack, Typography } from "@mui/material";
import Oas from "oas";
import SchemaInputFileUpload from "@/components/SchemaInputFileUpload";
import SchemaInputUrl from "@/components/SchemaInputUrl";

export interface OpenApiSchemaInputProps {
  onSchemaChange: (schema: Oas) => void;
}

const OpenApiSchemaInput = (props: OpenApiSchemaInputProps) => {
  const { onSchemaChange } = props;

  return (
    <Stack spacing={8}>
      <SchemaInputFileUpload
        onSchemaLoaded={(oas) => {
          onSchemaChange(oas);
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
        onSchemaLoaded={(oas) => {
          onSchemaChange(oas);
        }}
      />
    </Stack>
  );
};

export default OpenApiSchemaInput;
