import { Operation } from "oas/operation";
import { JsonForms } from "@jsonforms/react";
import React, { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useJsonFormsConfig } from "@/hooks/useJsonFormsConfig.hook";
import { JSONSchema } from "@/json-schema/JSONSchema";
import OpenApiOperationExamples from "./OpenApiOperationExamples";
import useApiGlobalRequestConfig from "@/hooks/apiGlobalRequestConfig.hook";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import OpenApiOperationAuthorization from "@/components/OpenApiOperationAuthorization";
import {
  applyRequestOptionsFromAuthorizationValues,
  AuthorizationValues,
} from "@/utils/authorization";
import HelpIcon from "@/components/HelpIcon";
import CodeDisplay from "@/components/CodeDisplay";
import useAppConfig from "@/hooks/appConfig.hook";
import { SupportedMediaType } from "@/utils/mediaTypeSerializer";
import { makeCurlCommand } from "@/utils/curl";
import { concatUrlPaths } from "@/utils/url";
import { SecuritySchemeMatrix } from "@/json-schema/security";
import { BodyState, ParametersState } from "@/components/OpenApiOperation";
import { JsonFormsCore } from "@jsonforms/core";
import { ParameterObject } from "oas/types";

enum Mode {
  View,
  TryIt,
}

export interface OpenApiOperationDisplayProps {
  bodyState: BodyState;
  onBodyChange: (state: Pick<JsonFormsCore, "data" | "errors">) => void;
  onParameterChange: (
    state: Pick<JsonFormsCore, "data" | "errors">,
    parameter: ParameterObject,
  ) => void;
  onReset: () => void;
  parametersState: ParametersState;
  operation: Operation;
}

const OpenApiOperationDisplay = ({
  bodyState,
  onBodyChange,
  onParameterChange,
  onReset,
  parametersState,
  operation,
}: OpenApiOperationDisplayProps) => {
  const contentTypeSelectId = useId();
  const { mediaTypeSerializer } = useAppConfig();

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

  const [contentType, setContentType] = useState(() =>
    mediaTypeSerializer.findFirstSupportedMediaType(availableContentTypes),
  );
  const [authorization, setAuthorization] = useState<AuthorizationValues>({
    cookie: {},
    header: {},
    query: {},
  });

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

    const url = new URL(concatUrlPaths(targetServer, path));
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
      serializedBody = mediaTypeSerializer.serialize(body, contentType!);
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
    mediaTypeSerializer,
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
      return makeCurlCommand(
        concatUrlPaths(apiGlobalRequestConfig.targetServer, operation.path),
        operation.method,
        apiGlobalRequestConfig.requestHeaders,
      );

    return makeCurlCommand(
      queryData.requestUrl.href,
      operation.method,
      queryData?.request.headers,
      queryData?.request.body,
    );
  }, [
    apiGlobalRequestConfig.requestHeaders,
    apiGlobalRequestConfig.targetServer,
    operation.method,
    operation.path,
    queryData,
  ]);
  const requestUrlText = useMemo(() => {
    if (!queryData)
      return concatUrlPaths(
        apiGlobalRequestConfig.targetServer,
        operation.path,
      );

    return queryData.requestUrl.href;
  }, [apiGlobalRequestConfig.targetServer, operation.path, queryData]);
  const requestBodyText = useMemo(() => {
    if (!queryData) return undefined;

    return queryData.request.body as string | undefined;
  }, [queryData]);
  const requestHeadersText = useMemo(() => {
    const headers = queryData
      ? queryData.request.headers
      : apiGlobalRequestConfig.requestHeaders;

    return (
      [...new Headers(headers)]
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n") || undefined
    );
  }, [apiGlobalRequestConfig.requestHeaders, queryData]);

  const [responseBodyText, setResponseBodyText] = useState<string | undefined>(
    undefined,
  );
  useEffect(() => {
    void (async () => {
      if (!queryData) {
        setResponseBodyText(undefined);
        return;
      }

      setResponseBodyText(await queryData.response.text());
    })();
  }, [queryData]);
  const responseHeadersText = useMemo(() => {
    if (!queryData) return undefined;

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
              View&nbsp;examples
            </Button>
          )}
        </Stack>
      </Stack>

      {mode === Mode.View && (
        <>
          <OpenApiOperationExamples
            operation={operation}
            onTryExample={({ example, mediaType }) => {
              setContentType(mediaType);
              onBodyChange({
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
                securitySchemeMatrix={
                  operation.getSecurityWithTypes(true) as SecuritySchemeMatrix
                }
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
                          onChange={(state) =>
                            onParameterChange(state, parameter)
                          }
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
                            onChange={(e) =>
                              setContentType(
                                e.target.value as SupportedMediaType,
                              )
                            }
                            value={contentType ?? ""}
                          >
                            {availableContentTypes.map(
                              (availableContentType) => (
                                <MenuItem
                                  key={availableContentType}
                                  disabled={
                                    !mediaTypeSerializer.supports(
                                      availableContentType,
                                    )
                                  }
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
                    <Stack
                      sx={{
                        "& .MuiGrid-item": {
                          maxWidth: "100% !important",
                        },
                      }}
                    >
                      <JsonForms
                        {...jsonFormsProps}
                        data={bodyState.data}
                        onChange={onBodyChange}
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

          <Stack direction={"row"} spacing={2}>
            <Box>
              <Button
                variant={"outlined"}
                className={"uppercase"}
                onClick={onReset}
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

          <Stack>
            {query.isError && (
              <Stack>
                <Alert severity="error">
                  <AlertTitle>Error</AlertTitle>
                  {String(query.error)}
                </Alert>
              </Stack>
            )}
          </Stack>

          <Stack spacing={2}>
            <Stack spacing={2}>
              <Typography variant={"h6"}>Request</Typography>

              <Stack spacing={2}>
                <Stack>
                  <Typography variant={"body1"}>cURL</Typography>
                  <CodeDisplay text={curlText} wrap={false} />
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
                  <Typography variant={"body1"}>Response headers</Typography>
                  <CodeDisplay text={responseHeadersText} />
                </Stack>

                <Stack direction={"row"}>
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
        </Stack>
      )}
    </>
  );
};

export default OpenApiOperationDisplay;
