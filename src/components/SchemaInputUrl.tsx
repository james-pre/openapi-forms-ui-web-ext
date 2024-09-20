import React, { useCallback, useId, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Oas from "oas";
import { parseSchema } from "@/json-schema/parseSchema";

export type SchemaInputUrlProps = {
  initialUrl?: string;
  onSchemaLoaded?: (schema: Oas) => void;
};

enum LoadingState {
  Progress = "progress",
  Error = "error",
  Success = "success",
}

const SchemaInputUrl = ({
  initialUrl,
  onSchemaLoaded,
}: SchemaInputUrlProps) => {
  const schemaUrlInputId = useId();

  const [url, setUrl] = useState(
    () => initialUrl ?? "https://petstore.swagger.io/v2/swagger.json",
  );
  const [loadingState, setLoadingState] = useState<LoadingState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onUrlButtonClick = useCallback(async () => {
    setError(null);
    setLoadingState(LoadingState.Progress);

    let schema: string = null!;
    try {
      schema = await fetch(url).then((response) => {
        if (!response.ok)
          throw new Error(
            `Server responded with status ${response.status} ${response.statusText}`,
          );

        return response.text();
      });
    } catch (e) {
      setError(String(e));
      setLoadingState(LoadingState.Error);
      return;
    }

    let oas: Oas = null!;
    try {
      oas = await parseSchema(schema);
    } catch (e) {
      console.error(e);
      setError(String(e));
      setLoadingState(LoadingState.Error);
      return;
    }

    setLoadingState(LoadingState.Success);
    onSchemaLoaded?.(oas);
  }, [url, onSchemaLoaded]);

  return (
    <Stack alignItems={"stretch"} spacing={4}>
      <Stack alignItems={"center"} spacing={1.5}>
        <FormLabel htmlFor={schemaUrlInputId}>
          <Typography variant={"h6"}>
            Retrieve the schema from an URL
          </Typography>
        </FormLabel>
        <TextField
          id={schemaUrlInputId}
          className="w-full"
          variant="outlined"
          size="medium"
          type="url"
          placeholder="Enter schema url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </Stack>

      <Stack spacing={1} alignItems={"center"}>
        <Box position={"relative"} alignSelf={"stretch"}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            className="w-full"
            onClick={() => void onUrlButtonClick()}
            disabled={loadingState === LoadingState.Progress}
          >
            <span className="uppercase">Load Schema</span>
          </Button>
          {loadingState === LoadingState.Progress && (
            <CircularProgress
              size={"24px"}
              className={"absolute left-1/2 top-1/2"}
              sx={() => ({
                marginTop: "-12px",
                marginLeft: "-12px",
              })}
            />
          )}
        </Box>
        {error && (
          <Typography variant={"body1"} color={"error"}>
            {error}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

export default SchemaInputUrl;
