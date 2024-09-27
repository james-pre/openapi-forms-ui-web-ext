import "react-ace";
// import "ace-builds/esm-resolver";
// import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/mode-xml";

import "ace-builds/src-noconflict/theme-github";

import "ace-builds/src-noconflict/ext-language_tools";

import React, { useEffect, useMemo, useState } from "react";
import OpenApiSchemaInput, {
  SchemaSource,
} from "../../components/OpenApiSchemaInput";
import Oas from "oas";
import { JsonFormsContext } from "@jsonforms/react";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import ServerSelector from "../../components/ServerSelector";
import Ajv from "ajv";
import addAjvFormats from "ajv-formats";
import addMetaSchema2019 from "ajv/dist/refs/json-schema-2019-09";
import { JsonFormsRendererRegistryEntry } from "@jsonforms/core";
import PatternPropertiesRenderer, {
  patternPropertiesControlTester,
} from "../../forms/PatternPropertiesRenderer";
import HeadersComponent from "../../components/Headers";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  CssBaseline,
  Link,
  Stack,
  ThemeProvider,
  Typography,
} from "@mui/material";
import AppBrandName from "@/components/AppBrandName";
import { theme } from "@/theme";
import { ApiGlobalRequestConfigContext } from "@/hooks/apiGlobalRequestConfig.hook";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import HelpIcon from "@/components/HelpIcon";
import { groupBy } from "lodash-es";
import { ExpandMore } from "@mui/icons-material";
import OpenApiOperationHeader from "@/components/OpenApiOperationHeader";
import OpenApiOperationDisplay from "@/components/OpenApiOperationDisplay";
import OpenApiOperationAuthorization from "@/components/OpenApiOperationAuthorization";
import { AuthorizationValue } from "@/utils/authorization";

const queryClient = new QueryClient();

const App = () => {
  const renderers = useMemo(
    () => [
      /*{
              renderer: withJsonFormsControlProps((props: ControlProps) => (
                <>
                  {/!*<p>{JSON.stringify(props)}</p>*!/}
                  <p>{props.label}</p>
                  <p>{props.description}</p>
                  <input
                    type="file"
                    value={props.data}
                    onChange={(e) => props.handleChange(props.path, e.target.value)}
                  />
                </>
              )),
              tester: rankWith(3, (uiSchema, schema, context) => {
                // @ts-ignore
                const scope: string = uiSchema["scope"];
                if (!scope) return false;
      
                let scopedSchema = schema;
                if (scope !== "#") {
                  const scopeSplit = scope.slice(2).split("/");
                  const [path, ...scopes] = scopeSplit;
                  if (path !== "properties") return false;
      
                  scopes.forEach((scope) => {
                    scopedSchema = scopedSchema.properties![scope];
                  });
                }
      
                console.log(scopedSchema);
                return (
                  scopedSchema.type === "file" || scopedSchema.format === "binary"
                );
              }),
            } as JsonFormsRendererRegistryEntry,*/
      ...materialRenderers,
      {
        tester: patternPropertiesControlTester,
        renderer: PatternPropertiesRenderer,
      } as JsonFormsRendererRegistryEntry,
    ],
    [],
  );
  const cells = useMemo(() => materialCells, []);

  const [oas, setOas] = useState<Oas | null>(null);
  const [schemaSource, setSchemaSource] = useState<SchemaSource>(null!);
  const groupedOperations = useMemo(() => {
    if (!oas) return {};

    const operations = Object.entries(oas?.getPaths()).flatMap(([, pathInfo]) =>
      Object.values(pathInfo),
    );

    return groupBy(operations, (operation) => operation.getTags()[0]?.name);
  }, [oas]);

  const [targetServer, setTargetServer] = useState<string>("");
  const [userDefinedHeaders, setUserDefinedHeaders] = useState<
    Record<string, string>
  >({
    Accept: "*/*",
  });
  const [globalRequestAuthorization, setGlobalRequestAuthorization] =
    useState<AuthorizationValue>({ type: "none" });

  const ajv = useMemo(() => {
    const a = new Ajv({
      strict: "log",
      meta: false,
      defaultMeta: "https://json-schema.org/draft/2019-09/schema",
    });
    addAjvFormats(a, {});
    addMetaSchema2019.call(a);

    return a;
  }, []);
  useEffect(() => {
    console.log("ajv", ajv);
  }, [ajv]);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <ThemeProvider theme={theme}>
          <ApiGlobalRequestConfigContext.Provider
            value={{
              authorization: globalRequestAuthorization,
              requestHeaders: userDefinedHeaders,
              targetServer: targetServer,
            }}
          >
            <CssBaseline />
            <JsonFormsContext.Provider
              value={{
                cells,
                renderers,
                core: {
                  ajv: ajv,
                  data: undefined!,
                  schema: undefined!,
                  uischema: undefined!,
                },
              }}
            >
              <Container
                sx={(theme) => ({
                  paddingTop: theme.spacing(4),
                  paddingBottom: theme.spacing(4),
                })}
              >
                {!oas ? (
                  <Stack spacing={24}>
                    <Stack textAlign={"center"}>
                      <AppBrandName />
                    </Stack>

                    <Stack alignSelf={"center"} className="md:w-1/2">
                      <OpenApiSchemaInput
                        onSchemaChange={({ schema, source }) => {
                          setSchemaSource(source);
                          setOas(schema);
                        }}
                      />
                    </Stack>
                  </Stack>
                ) : (
                  <Stack spacing={3}>
                    <Stack direction={"row"} alignItems={"center"}>
                      <Stack flexGrow={1} spacing={1}>
                        <AppBrandName />
                        <Typography variant={"subtitle2"}>
                          <Stack
                            direction={"row"}
                            spacing={1}
                            alignItems={"baseline"}
                          >
                            <Typography>Current schema:</Typography>
                            {schemaSource.type === "url" ? (
                              <Link
                                href={schemaSource.name}
                                target={"_blank"}
                                typography={"subtitle2"}
                                underline={"hover"}
                              >
                                {schemaSource.name}
                              </Link>
                            ) : (
                              <Typography>{schemaSource.name}</Typography>
                            )}
                          </Stack>
                        </Typography>
                      </Stack>
                      <Box>
                        <Button
                          className={"uppercase"}
                          onClick={() => {
                            setOas(null);
                          }}
                          variant={"contained"}
                        >
                          Change schema
                        </Button>
                      </Box>
                    </Stack>

                    <Stack>
                      <Typography variant={"h5"}>
                        {oas.api.info.title}
                      </Typography>
                    </Stack>

                    <Stack
                      sx={(theme) => ({
                        maxWidth: theme.breakpoints.values.sm,
                      })}
                    >
                      <ServerSelector
                        availableServers={
                          oas.api.servers?.map(({ url }) => url) ?? []
                        }
                        onServerChange={(server) => setTargetServer(server)}
                      />
                    </Stack>

                    <Stack>
                      <Stack
                        direction={"row"}
                        alignItems={"center"}
                        spacing={1}
                      >
                        <Typography variant={"h5"}>
                          Global Request Configuration
                        </Typography>
                        <HelpIcon
                          tooltip={
                            "These configurations apply to any requests. " +
                            "You may override some or all of these properties on a per-request basis under each individual request."
                          }
                        />
                      </Stack>
                    </Stack>

                    <Stack spacing={1}>
                      <Stack
                        direction={"row"}
                        alignItems={"center"}
                        spacing={1}
                      >
                        <Typography variant={"h6"}>
                          Global Request Headers
                        </Typography>
                        <HelpIcon
                          tooltip={
                            "A header value may be overriden per-request if the " +
                            "request specifies a header parameter with the same name."
                          }
                        />
                      </Stack>

                      <HeadersComponent
                        initialHeaders={userDefinedHeaders}
                        onChange={(headers) => setUserDefinedHeaders(headers)}
                      />
                    </Stack>

                    <Stack>
                      <Stack
                        direction={"row"}
                        alignItems={"center"}
                        spacing={1}
                      >
                        <Typography variant={"h6"}>
                          Global Request Authorization
                        </Typography>
                        {/*<HelpIcon />*/}
                      </Stack>

                      <OpenApiOperationAuthorization
                        onAuthorizationChange={setGlobalRequestAuthorization}
                        operation={null!}
                      />
                      {/*<Typography variant={"h6"}>Credentials</Typography>
                      <Stack
                        direction={"row"}
                        alignItems={"center"}
                        spacing={1}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={includeCredentials}
                              onChange={(e) =>
                                setIncludeCredentials(e.target.checked)
                              }
                            />
                          }
                          label={"Include credentials"}
                          style={{ marginInlineEnd: 0 }}
                        />

                        <HelpIcon
                          href={
                            "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#including_credentials"
                          }
                          tooltip={
                            "Checking this box will set `credentials: 'include'` in the fetch call. " +
                            "This will have the effect of including the cookies on the associated origin with the request. " +
                            "The server must respond with appropriate CORS headers to the pre-flight request, or the request will fail."
                          }
                        />
                      </Stack>*/}
                    </Stack>

                    <Stack spacing={0}>
                      {Object.entries(groupedOperations).map(
                        ([categoryName, operations]) => (
                          <Accordion
                            key={categoryName}
                            variant={"outlined"}
                            slotProps={{
                              heading: { component: "h5" },
                              transition: { unmountOnExit: true },
                            }}
                            sx={{
                              backgroundColor: "inherit",
                              borderLeft: 0,
                              borderRight: 0,
                              borderTop: 0,
                              borderRadius: 0,
                              "::before": {
                                display: "none",
                              },
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMore />}
                              sx={{
                                // ":hover:not(.Mui-expanded)": {
                                ":hover": {
                                  backgroundColor: theme.palette.action.hover,
                                },
                              }}
                            >
                              <Typography variant={"h5"}>
                                {categoryName}
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Stack spacing={1}>
                                {operations.map((operation) => (
                                  <Accordion
                                    key={operation.getOperationId()}
                                    variant={"outlined"}
                                    slotProps={{
                                      heading: { component: "div" },
                                      transition: { unmountOnExit: false },
                                    }}
                                    sx={{
                                      "::before": {
                                        display: "none",
                                      },
                                    }}
                                  >
                                    <AccordionSummary
                                      expandIcon={<ExpandMore />}
                                    >
                                      <OpenApiOperationHeader
                                        method={operation.method}
                                        path={operation.path}
                                      />
                                    </AccordionSummary>
                                    <AccordionDetails>
                                      <OpenApiOperationDisplay
                                        operation={operation}
                                      />
                                    </AccordionDetails>
                                  </Accordion>
                                ))}
                              </Stack>
                            </AccordionDetails>
                          </Accordion>
                        ),
                      )}
                    </Stack>

                    {/*<div style={{ display: "flex", flexDirection: "row" }}>
                      <div style={{ width: "30dvw" }}>
                        {Object.entries(oas.getPaths()).map(
                          ([path, pathInfo]) =>
                            Object.entries(pathInfo).map(
                              ([method, operation]) => (
                                <div key={path + " " + method}>
                                  <button
                                    role="button"
                                    onClick={() =>
                                      setSelectedOperation(operation)
                                    }
                                  >
                                    {operation.getSummary()}
                                  </button>
                                </div>
                              ),
                            ),
                        )}
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        {selectedOperation ? (
                          <>
                            <OpenApiOperationHeader
                              method={selectedOperation.method}
                              path={selectedOperation.path}
                              summary={selectedOperation.getSummary()}
                            />
                            <OpenApiOperationDisplay
                              key={selectedOperation.getOperationId()}
                              operation={selectedOperation}
                            />
                          </>
                        ) : (
                          <>
                            <p>Select an operation from the sidebar</p>
                          </>
                        )}
                      </div>
                    </div>*/}
                  </Stack>
                )}
              </Container>
            </JsonFormsContext.Provider>
          </ApiGlobalRequestConfigContext.Provider>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;
