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
import metaSchemaDraft06 from "ajv/dist/refs/json-schema-draft-06.json";
import metaSchemaDraft07 from "ajv/dist/refs/json-schema-draft-07.json";
import addMetaSchema2019 from "ajv/dist/refs/json-schema-2019-09";
import addMetaSchema2020 from "ajv/dist/refs/json-schema-2020-12";
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
import {
  ApiGlobalRequestConfig,
  ApiGlobalRequestConfigContext,
} from "@/hooks/apiGlobalRequestConfig.hook";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import HelpIcon from "@/components/HelpIcon";
import { groupBy } from "lodash-es";
import { ExpandMore } from "@mui/icons-material";
import OpenApiOperationHeader from "@/components/OpenApiOperationHeader";
import OpenApiOperationDisplay from "@/components/OpenApiOperationDisplay";
import { AuthorizationValues } from "@/utils/authorization";
import { MediaTypeSerializer } from "@/utils/mediaTypeSerializer";
import { AppConfig, AppConfigContext } from "@/hooks/appConfig.hook";
import { SandboxLink } from "@/utils/sandboxLink";
import OpenApiGlobalAuthorization from "@/components/Authorization/OpenApiGlobalAuthorization";
import OpenApiOperation from "@/components/OpenApiOperation";

const queryClient = new QueryClient();

const App = () => {
  const renderers = useMemo(
    () => [
      ...materialRenderers,
      {
        tester: patternPropertiesControlTester,
        renderer: PatternPropertiesRenderer,
      } as JsonFormsRendererRegistryEntry,
    ],
    [],
  );
  const cells = useMemo(() => materialCells, []);
  const initialUserDefinedHeaders: Record<string, string> = useMemo(
    () => ({
      Accept: "*/*",
    }),
    [],
  );

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
  const [userDefinedHeaders, setUserDefinedHeaders] = useState(
    initialUserDefinedHeaders,
  );
  const [globalRequestAuthorization, setGlobalRequestAuthorization] =
    useState<AuthorizationValues>({ cookie: {}, header: {}, query: {} });

  const ajv = useMemo(() => {
    const a = new Ajv({
      strict: "log",
      meta: false,
      defaultMeta: "https://json-schema.org/draft/2019-09/schema",
    });
    addAjvFormats(a, {});
    a.addMetaSchema(metaSchemaDraft06);
    a.addMetaSchema(metaSchemaDraft07);
    addMetaSchema2019.call(a);
    addMetaSchema2020.call(a);

    return a;
  }, []);
  const mediaTypeSerializer = useMemo(() => new MediaTypeSerializer(), []);
  const sandboxLink = useMemo(() => new SandboxLink(), []);

  useEffect(() => {
    console.log("ajv", ajv);
  }, [ajv]);
  useEffect(() => {
    console.log("oas", oas);
  }, [oas]);

  const appConfig = useMemo<AppConfig>(
    () => ({
      mediaTypeSerializer,
      sandboxLink,
    }),
    [mediaTypeSerializer, sandboxLink],
  );
  const apiGlobalRequestConfig = useMemo(
    () =>
      ({
        authorization: globalRequestAuthorization,
        requestHeaders: userDefinedHeaders,
        targetServer: targetServer,
      }) as ApiGlobalRequestConfig,
    [globalRequestAuthorization, userDefinedHeaders, targetServer],
  );
  const jsonFormsStateContext = useMemo(
    () => ({
      cells,
      renderers,
      core: {
        ajv: ajv,
        data: undefined!,
        schema: undefined!,
        uischema: undefined!,
      },
    }),
    [ajv, cells, renderers],
  );

  return (
    <>
      <AppConfigContext.Provider value={appConfig}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <ThemeProvider theme={theme}>
            <ApiGlobalRequestConfigContext.Provider
              value={apiGlobalRequestConfig}
            >
              <CssBaseline />
              <JsonFormsContext.Provider value={jsonFormsStateContext}>
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

                      <Stack
                        alignSelf={"center"}
                        sx={() => ({
                          width: { xs: "100%", md: "50%" },
                        })}
                      >
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
                          onChange={setUserDefinedHeaders}
                        />
                      </Stack>

                      <Stack>
                        <OpenApiGlobalAuthorization
                          oas={oas}
                          onAuthorizationChange={setGlobalRequestAuthorization}
                        />
                      </Stack>

                      <Stack spacing={0}>
                        {Object.entries(groupedOperations).map(
                          ([categoryName, operations]) => (
                            <Accordion
                              key={categoryName}
                              variant={"outlined"}
                              slotProps={{
                                heading: { component: "h5" },
                                transition: { unmountOnExit: false },
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
                                    <OpenApiOperation
                                      key={operation.getOperationId()}
                                      operation={operation}
                                    />
                                  ))}
                                </Stack>
                              </AccordionDetails>
                            </Accordion>
                          ),
                        )}
                      </Stack>
                    </Stack>
                  )}
                </Container>
              </JsonFormsContext.Provider>
            </ApiGlobalRequestConfigContext.Provider>
          </ThemeProvider>
        </QueryClientProvider>
      </AppConfigContext.Provider>
    </>
  );
};

export default App;
