import React, { useCallback, useEffect, useMemo, useState } from "react";
import OpenApiSchemaInput from "../../components/OpenApiSchemaInput";
import Oas from "oas";
import { JsonFormsContext } from "@jsonforms/react";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import OASNormalize from "oas-normalize";
import OpenApiOperationDisplay, {
  BodyState,
  ExecuteOperationOptions,
  ParametersState,
} from "../../components/OpenApiOperationDisplay";
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

function removeIdsFromSchema(schema: unknown) {
  if (Array.isArray(schema)) {
    schema.forEach(removeIdsFromSchema);
  } else if (typeof schema === "object" && schema !== null) {
    if ("$id" in schema) delete schema.$id;

    Object.keys(schema).forEach((key) => {
      removeIdsFromSchema(schema[key as keyof typeof schema]);
    });
  }
}

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

  const [schema, setSchema] = useState<string | null>(null);
  const [schemaNormalized, setSchemaNormalized] = useState<string | null>(null);
  const [oas, setOas] = useState<Oas | null>(null);
  const [userDefinedHeaders, setUserDefinedHeaders] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    void (async () => {
      if (!schema) return;

      const normalizedOasDocument = await new OASNormalize(schema, {})
        .validate({
          convertToLatest: true,
        })
        .then((definition) => new OASNormalize(definition).deref());
      removeIdsFromSchema(normalizedOasDocument);

      console.log("Normalized OAS Document", normalizedOasDocument);
      setSchemaNormalized(JSON.stringify(normalizedOasDocument));
    })();
  }, [schema, setSchemaNormalized]);
  useEffect(() => {
    if (!schemaNormalized) return;

    const newOas = new Oas(schemaNormalized);
    console.log(newOas);
    setOas(newOas);
  }, [schemaNormalized, setOas]);
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

  const [targetServer, setTargetServer] = useState<string>("");
  const sendRequest = useCallback(
    async (
      operation: Operation,
      bodyState: BodyState,
      parametersState: ParametersState,
      options: ExecuteOperationOptions,
    ) => {
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
          headers[parameter.name] = String(
            parametersState[parameter.name].data,
          );
        });
      const contentType = options.contentType;
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

      const responseText = await fetch(url, {
        method: operation.method,
        body: serializedBody,
        headers: {
          ...userDefinedHeaders,
          ...headers,
        },
      }).then((response) => response.text());
      // TODO: Display the response text,
      //  and try to determine the response type from the Content-Type header or the text content to syntax highlight it
      console.log(responseText);
    },
    [userDefinedHeaders, targetServer],
  );
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null,
  );

  return (
    <>
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
        <h1>OpenAPI Forms UI</h1>
        {!schema ? (
          <>
            <OpenApiSchemaInput onSchemaChange={setSchema} />
          </>
        ) : oas ? (
          <>
            <button
              onClick={() => {
                setSchema(null);
                setSchemaNormalized(null);
                setOas(null);
                setSelectedOperation(null);
              }}
            >
              Back to schema selection
            </button>

            <h2>{oas.api.info?.title}</h2>

            <h3>Target Server</h3>
            <ServerSelector
              availableServers={oas.api.servers?.map(({ url }) => url) ?? []}
              onServerChange={(server) => setTargetServer(server)}
            />

            <h3>Custom headers</h3>
            <p>
              These headers will be sent with any request. Their values may be
              overriden per-request if the request specifies a header parameter
              with the same name.
            </p>
            <Headers
              headers={userDefinedHeaders}
              onChange={(headers) => setUserDefinedHeaders(headers)}
            />

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
                      operation={selectedOperation}
                      onExecute={(bodyState, parametersState, options) =>
                        void sendRequest(
                          selectedOperation,
                          bodyState,
                          parametersState,
                          options,
                        )
                      }
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
        ) : (
          <>
            <p>Loading...</p>
          </>
        )}
      </JsonFormsContext.Provider>
    </>
  );
};

export default App;
