import { Operation } from "oas/operation";
import { JsonForms } from "@jsonforms/react";
import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import * as ajv from "ajv";
import { useJsonFormsConfig } from "@/hooks/useJsonFormsConfig.hook";
import { JSONSchema } from "@/json-schema/JSONSchema";
import { generateDefaultValue } from "@/json-schema/generateDefaultValue";
import OpenApiOperationExamples from "./OpenApiOperationExamples";
import useApiGlobalRequestConfig from "@/hooks/apiGlobalRequestConfig.hook";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import highlight from "ace-builds/src-noconflict/ext-static_highlight.js";
import { modesByName } from "ace-builds/src-noconflict/ext-modelist.js";
import OpenApiOperationAuthorization from "@/components/OpenApiOperationAuthorization";
import {
  applyRequestOptionsFromAuthorizationValues,
  AuthorizationValue,
} from "@/utils/authorization";

const supportedAceModes = Object.freeze(
  ["javascript", "json", "html", "markdown", "text", "xml"].map(
    (mode) => modesByName[mode],
  ),
);

enum Mode {
  View,
  TryIt,
}

export type BodyState = {
  data: unknown;
  errors: ajv.ErrorObject[] | undefined;
};

export type ParametersState = Record<
  string,
  {
    data: unknown;
    errors: ajv.ErrorObject[] | undefined;
  }
>;

export interface OpenApiOperationDisplayProps {
  operation: Operation;
}

const OpenApiOperationDisplay = ({
  operation,
}: OpenApiOperationDisplayProps) => {
  const contentTypeSelectId = useId();
  const responseTextId = useId();
  const responseTextElementRef = useRef<HTMLElement>(null!);
  const responseTypeLabelId = useId();
  const responseTypeSelectId = useId();

  const requestBody = useMemo(() => {
    let x = operation.getRequestBody();
    if (Array.isArray(x)) {
      x = x[1];
    }

    return x || null;
  }, [operation]);
  const requestBodySchema = useMemo(
    () => (requestBody ? (requestBody.schema as JSONSchema) : null),
    [requestBody],
  );
  const parameters = useMemo(() => operation.getParameters(), [operation]);
  const availableContentTypes = useMemo(
    () => operation.getRequestBodyMediaTypes(),
    [operation],
  );
  const jsonFormsProps = useJsonFormsConfig();
  const apiGlobalRequestConfig = useApiGlobalRequestConfig();

  const parametersStateInitializer = useCallback(
    () =>
      parameters
        .map(({ name, schema }) => ({
          [name]: {
            data: schema ? generateDefaultValue(schema) : null,
            errors: undefined,
          },
        }))
        .reduce<ParametersState>((x, y) => ({ ...x, ...y }), {}),
    [parameters],
  );
  const [parametersState, setParameterState] = useReducer(
    (
      state: ParametersState,
      {
        data,
        errors,
        name,
      }: {
        data: ParametersState[""]["data"];
        errors: ParametersState[""]["errors"];
        name: string;
      },
    ) => ({
      ...state,
      [name]: { data, errors },
    }),
    {},
    parametersStateInitializer,
  );
  const bodyStateInitializer = useCallback(
    () => ({
      data: requestBodySchema ? generateDefaultValue(requestBodySchema) : null,
      errors: undefined,
    }),
    [requestBodySchema],
  );
  const [bodyState, updateBodyState] = useReducer(
    (state: BodyState, { data, errors }: BodyState) => ({
      ...state,
      data,
      errors,
    }),
    {},
    bodyStateInitializer,
  );
  const [contentType, setContentType] = useState(() =>
    availableContentTypes.at(0),
  );
  const [authorization, setAuthorization] = useState<AuthorizationValue>({
    type: "none",
  });

  const resetRequestState = useCallback(() => {
    Object.entries(parametersStateInitializer()).forEach(([name, state]) =>
      setParameterState({ name, ...state }),
    );
    updateBodyState(bodyStateInitializer());
  }, [bodyStateInitializer, parametersStateInitializer]);

  const [mode, setMode] = useState(Mode.View);

  const sendRequest = useCallback(async () => {
    const { targetServer } = apiGlobalRequestConfig;

    let path = operation.path;
    operation
      .getParameters()
      .filter((parameter) => parameter.in === "path")
      .forEach((parameter) => {
        path = path.replace(
          `{${parameter.name}}`,
          String(parametersState[parameter.name].data),
        );
      });

    const url = new URL(targetServer + path);
    operation
      .getParameters()
      .filter((parameter) => parameter.in === "query")
      .forEach((parameter) => {
        url.searchParams.set(
          parameter.name,
          String(parametersState[parameter.name].data),
        );
      });

    const headers: Record<string, string> = {};
    operation
      .getParameters()
      .filter((parameter) => parameter.in === "header")
      .forEach((parameter) => {
        headers[parameter.name] = String(parametersState[parameter.name].data);
      });
    if (contentType) {
      headers["Content-Type"] = contentType;
    }

    const body = bodyState.data;
    let serializedBody = undefined;
    if (
      operation.method !== "get" &&
      operation.method !== "head" &&
      body !== undefined
    ) {
      // TODO: Support serialization of more content-types
      switch (contentType) {
        case "application/json": {
          serializedBody = JSON.stringify(body);
          break;
        }
        case "application/xml": {
          break;
        }
        case "application/x-www-form-urlencoded": {
          break;
        }
        case "multipart/form-data": {
          break;
        }
        default:
          throw new Error(`Unknown content type ${contentType}`);
      }
    }

    const requestInit: RequestInit = {
      method: operation.method,
      body: serializedBody,
      headers: {
        ...apiGlobalRequestConfig.requestHeaders,
        ...headers,
      },
    };
    const { url: finalUrl } = applyRequestOptionsFromAuthorizationValues(
      url,
      requestInit,
      apiGlobalRequestConfig.authorization,
      authorization,
    );

    return await fetch(finalUrl, requestInit);
  }, [
    apiGlobalRequestConfig,
    authorization,
    bodyState.data,
    contentType,
    operation,
    parametersState,
  ]);
  const getQueryKey = useCallback(
    () => [operation.getOperationId()],
    [operation],
  );

  const queryClient = useQueryClient();
  const query = useQuery<Response | null>(
    {
      queryKey: getQueryKey(),
      queryFn: sendRequest,
      initialData: () => null,
      enabled: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
    },
    queryClient,
  );
  const { data: queryData, refetch: refetchQuery } = query;
  const [aceMode, setAceMode] = useState("ace/mode/text");
  const [responseText, setResponseText] = useState<string | null>(null);
  useEffect(() => {
    void (async () => {
      if (!queryData) return;

      setResponseText(await queryData.text());
    })();
  }, [queryData]);
  useEffect(() => {
    setAceMode(() => {
      const responseContentType = queryData?.headers.get("Content-Type");
      if (!responseContentType) return "ace/mode/text";

      const mode =
        {
          "application/javascript": "javascript",
          "application/json": "json",
          "text/html": "html",
          "text/markdown": "markdown",
          "application/xml": "xml",
        }[responseContentType] || "text";

      return (
        supportedAceModes.find(
          (supportedAceMode) => supportedAceMode.name === mode,
        )?.mode || "ace/mode/text"
      );
    });
  }, [queryData]);
  useEffect(() => {
    if (responseText === null || !responseTextElementRef.current) return;

    highlight(responseTextElementRef.current, {
      mode: aceMode,
      theme: "ace/theme/github",
    });
  }, [aceMode, responseText]);

  const onClearResponseClick = useCallback(async () => {
    await queryClient.setQueryData(getQueryKey(), null);
  }, [getQueryKey, queryClient]);
  useEffect(() => {
    return () => {
      void queryClient.setQueryData(getQueryKey(), null);
    };
  }, [getQueryKey, /*mode,*/ queryClient]);

  const onExecuteClick = useCallback(async () => {
    await refetchQuery({ cancelRefetch: true });
  }, [refetchQuery]);

  return (
    <>
      {/*<Typography variant={"h6"}>{operation.getSummary()}</Typography>*/}

      <Stack alignItems={"flex-start"} direction={"row"}>
        <Stack flexGrow={1}>
          <Typography variant={"body1"}>
            {operation.getDescription()}
          </Typography>
        </Stack>
        <Stack>
          {mode === Mode.View && (
            <Button
              disableElevation={true}
              onClick={() => setMode(Mode.TryIt)}
              type={"button"}
              variant={"outlined"}
            >
              Try&nbsp;It
            </Button>
          )}
          {mode === Mode.TryIt && (
            <Button
              disableElevation={true}
              onClick={() => setMode(Mode.View)}
              type={"button"}
              variant={"outlined"}
            >
              Cancel
            </Button>
          )}
        </Stack>
      </Stack>

      {mode === Mode.View && (
        <>
          <OpenApiOperationExamples
            operation={operation}
            onTryExample={(example) => {
              updateBodyState({
                data: example.value,
                errors: undefined,
              });
              setMode(Mode.TryIt);
            }}
          />
        </>
      )}

      {mode === Mode.TryIt && (
        <>
          <OpenApiOperationAuthorization
            key={operation.getOperationId()}
            onAuthorizationChange={setAuthorization}
            operation={operation}
          />

          <p>Request Parameters</p>
          {parameters.length > 0 ? (
            parameters.map((parameter) => {
              return (
                <>
                  <JsonForms
                    key={parameter.name}
                    {...jsonFormsProps}
                    data={parametersState[parameter.name]?.data}
                    onChange={({ data, errors }) => {
                      setParameterState({ data, errors, name: parameter.name });
                    }}
                    schema={{
                      title: parameter.name,
                      description: parameter.description,
                      ...parameter.schema,
                    }}
                  />
                </>
              );
            })
          ) : (
            <>
              <i>No request parameters</i>
            </>
          )}

          <p>Request Body</p>
          {requestBodySchema ? (
            <>
              {availableContentTypes.length > 0 ? (
                <div>
                  <label htmlFor={contentTypeSelectId}>Content Type</label>
                  <select
                    id={contentTypeSelectId}
                    onChange={(e) => setContentType(e.target.value)}
                    value={contentType}
                  >
                    {availableContentTypes.map((availableContentType) => (
                      <option
                        key={availableContentType}
                        value={availableContentType}
                      >
                        {availableContentType}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <></>
              )}
              <JsonForms
                {...jsonFormsProps}
                data={bodyState.data}
                onChange={({ data, errors }) => {
                  updateBodyState({ data, errors });
                }}
                schema={requestBodySchema}
              />
            </>
          ) : (
            <>
              <i>No request body</i>
            </>
          )}
          <div>
            <button type={"button"} onClick={resetRequestState}>
              Reset
            </button>
          </div>

          <div>
            <button onClick={() => void onClearResponseClick()}>
              Clear Response
            </button>
            <button
              onClick={() => void onExecuteClick()}
              disabled={query.isFetching}
            >
              Execute
            </button>
          </div>

          <p>Response</p>
          {query.isPending ? (
            <p>Executing...</p>
          ) : query.isError ? (
            <p>Error: {String(query.error)}</p>
          ) : (
            <>
              {query.data === null ? (
                <>Execute to view the response</>
              ) : (
                <>
                  <p>{query.data.status}</p>
                  {responseText !== null ? (
                    <>
                      <FormControl variant={"outlined"}>
                        <InputLabel id={responseTypeLabelId}>
                          Response Type
                        </InputLabel>
                        <Select
                          id={responseTypeSelectId}
                          label={"Response Type"}
                          labelId={responseTypeLabelId}
                          onChange={(e) => setAceMode(e.target.value)}
                          variant={"outlined"}
                          value={aceMode}
                        >
                          {supportedAceModes.map((supportedAceMode) => (
                            <MenuItem
                              key={supportedAceMode.name}
                              value={supportedAceMode.mode}
                            >
                              {supportedAceMode.caption}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Box
                        key={aceMode}
                        id={responseTextId}
                        ref={responseTextElementRef}
                        style={{
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {responseText}
                      </Box>
                    </>
                  ) : (
                    <p>Downloading response...</p>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default OpenApiOperationDisplay;
