import { Operation } from "oas/operation";
import { JsonForms } from "@jsonforms/react";
import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useReducer,
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
  Divider,
  FormControl,
  Grid2,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import OpenApiOperationAuthorization from "@/components/OpenApiOperationAuthorization";
import {
  applyRequestOptionsFromAuthorizationValues,
  AuthorizationValue,
} from "@/utils/authorization";
import HelpIcon from "@/components/HelpIcon";
import CodeDisplay from "@/components/CodeDisplay";

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

  const [mode, setMode] = useState(Mode.TryIt);

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
    const { url: requestUrl } = applyRequestOptionsFromAuthorizationValues(
      url,
      requestInit,
      apiGlobalRequestConfig.authorization,
      authorization,
    );
    console.log("requestUrl", requestUrl);
    console.log("request", requestInit);

    const response = await fetch(requestUrl, requestInit);

    console.log("response", response);

    return { request: requestInit, requestUrl, response };
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
  const query = useQuery(
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

  const curlText = useMemo(() => {
    if (!queryData)
      return [
        `curl -X '${operation.method.toUpperCase()}'`,
        `'${apiGlobalRequestConfig.targetServer}${operation.path}'`,
        `-H 'Accept: */*'`,
      ].join(" \\\n\t");

    return [
      `curl -X '${queryData.request.method!.toUpperCase()}'`,
      `'${queryData.requestUrl.href}'`,
      `-H ${[...new Headers(queryData.request.headers)].map(([key, value]) => `'${key}: ${value}'`).join(" \\\n\t-H ")}`,
    ].join(" \\\n\t");
  }, [
    apiGlobalRequestConfig.targetServer,
    operation.method,
    operation.path,
    queryData,
  ]);
  const requestUrlText = useMemo(() => {
    if (!queryData)
      return `${apiGlobalRequestConfig.targetServer}${operation.path}`;

    return queryData.requestUrl.href;
  }, [apiGlobalRequestConfig.targetServer, operation.path, queryData]);
  const requestBodyText = useMemo(() => {
    if (!queryData) return "\n";

    return (queryData.request.body as string) || "\n";
  }, [queryData]);
  const requestHeadersText = useMemo(() => {
    if (!queryData) return "Accept: */*";

    return [...new Headers(queryData.request.headers)]
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
  }, [queryData]);

  const [responseBodyText, setResponseBodyText] = useState("\n");
  useEffect(() => {
    void (async () => {
      if (!queryData) {
        setResponseBodyText("\n");
        return;
      }

      setResponseBodyText(await queryData.response.text());
    })();
  }, [queryData]);
  const responseHeadersText = useMemo(() => {
    if (!queryData) return "\n";

    return [...queryData.response.headers]
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
  }, [queryData]);

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
        <Stack spacing={1}>
          <Grid2 container={true} spacing={2}>
            <Grid2 size={6}>
              <Stack spacing={2}>
                <Stack spacing={2}>
                  <Stack direction={"row"} alignItems={"center"} spacing={1}>
                    <Typography variant={"h6"}>Authorization</Typography>
                    <HelpIcon
                      tooltip={
                        "This will take precedence over the global request authorization"
                      }
                    />
                  </Stack>
                  <OpenApiOperationAuthorization
                    onAuthorizationChange={setAuthorization}
                    operation={operation}
                  />
                </Stack>

                <Stack spacing={2}>
                  <Typography variant={"h6"} marginBottom={1}>
                    Request Parameters
                  </Typography>
                  <Stack>
                    {parameters.length > 0 ? (
                      parameters.map((parameter) => {
                        return (
                          <Stack key={parameter.name}>
                            <JsonForms
                              {...jsonFormsProps}
                              data={parametersState[parameter.name]?.data}
                              onChange={({ data, errors }) => {
                                setParameterState({
                                  data,
                                  errors,
                                  name: parameter.name,
                                });
                              }}
                              schema={{
                                title: parameter.name,
                                description: parameter.description,
                                ...parameter.schema,
                              }}
                            />
                          </Stack>
                        );
                      })
                    ) : (
                      <>
                        <i>No request parameters.</i>
                      </>
                    )}
                  </Stack>
                </Stack>

                <Stack spacing={2}>
                  <Typography variant={"h6"} marginBottom={1}>
                    Request Body
                  </Typography>
                  <Stack>
                    {requestBodySchema ? (
                      <Stack spacing={1}>
                        {availableContentTypes.length > 0 && (
                          <Stack spacing={1}>
                            <FormControl>
                              <InputLabel htmlFor={contentTypeSelectId}>
                                Content type
                              </InputLabel>
                              <Select
                                variant={"outlined"}
                                id={contentTypeSelectId}
                                label={"Content type"}
                                onChange={(e) => setContentType(e.target.value)}
                                value={contentType}
                              >
                                {availableContentTypes.map(
                                  (availableContentType) => (
                                    <MenuItem
                                      key={availableContentType}
                                      value={availableContentType}
                                    >
                                      {availableContentType}
                                    </MenuItem>
                                  ),
                                )}
                              </Select>
                            </FormControl>
                            <Divider variant={"fullWidth"} />
                          </Stack>
                        )}
                        <Stack>
                          <JsonForms
                            {...jsonFormsProps}
                            data={bodyState.data}
                            onChange={({ data, errors }) => {
                              updateBodyState({ data, errors });
                            }}
                            schema={requestBodySchema}
                          />
                        </Stack>
                      </Stack>
                    ) : (
                      <>
                        <i>No request body.</i>
                      </>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </Grid2>
            <Grid2 size={6}>
              <Stack spacing={2}>
                <Stack spacing={2}>
                  <Typography variant={"h6"}>Request</Typography>

                  <Stack spacing={2}>
                    <Stack>
                      <Typography variant={"body1"}>cURL</Typography>
                      <CodeDisplay text={curlText} />
                    </Stack>

                    <Stack>
                      <Typography variant={"body1"}>Request URL</Typography>
                      <CodeDisplay text={requestUrlText} />
                    </Stack>

                    <Stack>
                      <Typography variant={"body1"}>Request body</Typography>
                      <CodeDisplay text={requestBodyText} />
                    </Stack>

                    <Stack>
                      <Typography variant={"body1"}>Request headers</Typography>
                      <CodeDisplay text={requestHeadersText} />
                    </Stack>
                  </Stack>
                </Stack>
                <Stack spacing={2}>
                  <Typography variant={"h6"}>
                    Response
                    {query.data &&
                      ` (HTTP ${query.data.response.status} ${query.data.response.statusText}`.trimEnd() +
                        ")"}
                  </Typography>

                  <Stack spacing={2}>
                    <Stack>
                      <Typography variant={"body1"}>Response body</Typography>
                      <CodeDisplay text={responseBodyText} />
                    </Stack>

                    <Stack>
                      <Typography variant={"body1"}>
                        Response headers
                      </Typography>
                      <CodeDisplay text={responseHeadersText} />
                    </Stack>

                    <Stack direction={"row"} justifyContent={"flex-end"}>
                      <Button
                        className={"uppercase"}
                        variant={"outlined"}
                        onClick={() => void onClearResponseClick()}
                      >
                        Clear response
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Grid2>
          </Grid2>

          <Stack direction={"row"} spacing={2}>
            <Box>
              <Button
                variant={"outlined"}
                className={"uppercase"}
                onClick={() => void resetRequestState()}
              >
                Clear parameters
              </Button>
            </Box>
            <Box>
              <Button
                variant={"contained"}
                className={"uppercase"}
                disabled={query.isFetching}
                disableElevation={true}
                onClick={() => void onExecuteClick()}
              >
                Execute request
              </Button>
            </Box>
          </Stack>

          {query.isError && (
            <Stack>
              <Typography color={"error"}>
                <Typography variant={"h6"}>Error</Typography>
                <Typography>{String(query.error)}</Typography>
              </Typography>
            </Stack>
          )}
        </Stack>
      )}
    </>
  );
};

export default OpenApiOperationDisplay;
