import React, { useEffect, useMemo, useState } from "react";
import OpenApiSchemaInput from "../../components/OpenApiSchemaInput";
import Oas from "oas";
import { JsonFormsContext } from "@jsonforms/react";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import OpenApiOperationDisplay from "../../components/OpenApiOperationDisplay";
import OpenApiOperationHeader from "../../components/OpenApiOperationHeader";
import ServerSelector from "../../components/ServerSelector";
import { Operation } from "oas/operation";
import Ajv from "ajv";
import addAjvFormats from "ajv-formats";
import addMetaSchema2019 from "ajv/dist/refs/json-schema-2019-09";
import { JsonFormsRendererRegistryEntry } from "@jsonforms/core";
import PatternPropertiesRenderer, {
  patternPropertiesControlTester,
} from "../../forms/PatternPropertiesRenderer";
import Headers from "../../components/Headers";
import {
  Checkbox,
  CssBaseline,
  FormControl,
  FormControlLabel,
  InputLabel,
  Link,
  Stack,
  ThemeProvider,
  Tooltip,
} from "@mui/material";
import AppBrandName from "@/components/AppBrandName";
import { theme } from "@/theme";
import { ApiRequestConfigContext } from "@/hooks/apiRequestConfig.hook";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

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
import { HelpOutline } from "@mui/icons-material";

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
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null,
  );

  const [userDefinedHeaders, setUserDefinedHeaders] = useState<
    Record<string, string>
  >({});
  const [targetServer, setTargetServer] = useState<string>("");
  const [includeCredentials, setIncludeCredentials] = useState(false);

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
          <ApiRequestConfigContext.Provider
            value={{
              includeCredentials: includeCredentials,
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
              {!oas ? (
                <>
                  <Stack spacing={24}>
                    <Stack textAlign={"center"}>
                      <AppBrandName />
                    </Stack>

                    <Stack alignSelf={"center"} className="md:w-1/2">
                      <OpenApiSchemaInput onSchemaChange={setOas} />
                    </Stack>
                  </Stack>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setOas(null);
                      setSelectedOperation(null);
                    }}
                  >
                    Back to schema selection
                  </button>

                  <h2>{oas.api.info?.title}</h2>

                  <h3>Target Server</h3>
                  <ServerSelector
                    availableServers={
                      oas.api.servers?.map(({ url }) => url) ?? []
                    }
                    onServerChange={(server) => setTargetServer(server)}
                  />

                  <h3>Custom headers</h3>
                  <p>
                    These headers will be sent with any request. Their values
                    may be overriden per-request if the request specifies a
                    header parameter with the same name.
                  </p>
                  <Headers
                    headers={userDefinedHeaders}
                    onChange={(headers) => setUserDefinedHeaders(headers)}
                  />

                  <h3>Credentials</h3>
                  <Stack direction={"row"} alignItems={"center"}>
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
                    />

                    <Tooltip
                      title={
                        "Checking this box will set `credentials: 'include'` in the fetch call. " +
                        "This will have the effect of including the cookies on the associated origin with the request. " +
                        "The server must respond with appropriate CORS headers to the pre-flight request, or the request will fail."
                      }
                    >
                      <Link
                        href={
                          "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#including_credentials"
                        }
                        rel={"noopener"}
                        target={"_blank"}
                        display={"flex"}
                      >
                        <HelpOutline />
                      </Link>
                    </Tooltip>
                  </Stack>

                  <h3>Available Operations</h3>
                  <div style={{ display: "flex", flexDirection: "row" }}>
                    <div style={{ width: "30dvw" }}>
                      {Object.entries(oas.getPaths()).map(([path, pathInfo]) =>
                        Object.entries(pathInfo).map(([method, operation]) => (
                          <div key={path + " " + method}>
                            <button
                              role="button"
                              onClick={() => setSelectedOperation(operation)}
                            >
                              {operation.getSummary()}
                            </button>
                          </div>
                        )),
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
                  </div>
                </>
              )}
            </JsonFormsContext.Provider>
          </ApiRequestConfigContext.Provider>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;
