import React, { useCallback, useEffect, useMemo, useState } from "react";
import OpenApiSchemaInput from "../../components/OpenApiSchemaInput";
import Oas from "oas";
import { JsonFormsContext } from "@jsonforms/react";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import OASNormalize from "oas-normalize";
import Accordion from "../../components/Accordion";
import OpenApiOperationDisplay, {
  BodyState,
  ExecuteOperationOptions,
  ParametersState,
} from "../../components/OpenApiOperationDisplay";
import OpenApiOperationHeader from "../../components/OpenApiOperationHeader";
import ServerSelector from "../../components/ServerSelector";
import { Operation } from "oas/operation";

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
    ],
    [],
  );
  const cells = useMemo(() => materialCells, []);

  const [schema, setSchema] = useState<string | null>(null);
  const [schemaNormalized, setSchemaNormalized] = useState<string | null>(null);
  const [oas, setOas] = useState<Oas | null>(null);

  useEffect(() => {
    (async () => {
      if (!schema) return;

      const normalizedOasDocument = await new OASNormalize(schema, {}).validate(
        {
          convertToLatest: true,
        },
      );
      console.log(normalizedOasDocument);
      setSchemaNormalized(JSON.stringify(normalizedOasDocument));
    })();
  }, [schema, setSchemaNormalized]);
  useEffect(() => {
    (async () => {
      if (!schemaNormalized) return;

      const newOas = new Oas(schemaNormalized);
      await newOas.dereference({ preserveRefAsJSONSchemaTitle: true });
      console.log(newOas);
      setOas(newOas);
    })();
  }, [schemaNormalized, setOas]);

  const operation = useMemo(() => {
    return oas?.operation("/pet/{petId}/uploadImage", "post") ?? null;
  }, [oas]);
  const [targetServer, setTargetServer] = useState<string>("");
  useEffect(() => {
    console.log(targetServer);
  }, [targetServer]);
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
            `${parametersState[parameter.name].data}`,
          );
        });

      const url = new URL(targetServer + path);
      operation
        .getParameters()
        .filter((parameter) => parameter.in === "query")
        .forEach((parameter) => {
          url.searchParams.set(
            parameter.name,
            `${parametersState[parameter.name].data}`,
          );
        });

      const headers: Record<string, string> = {};
      operation
        .getParameters()
        .filter((parameter) => parameter.in === "header")
        .forEach((parameter) => {
          headers[parameter.name] = `${parametersState[parameter.name].data}`;
        });
      const contentType = options.contentType;
      if (contentType) {
        headers["Content-Type"] = contentType;
      }

      const body = bodyState.data;
      console.log(body);
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

      const response = await fetch(url, {
        method: operation.method,
        body: serializedBody,
        headers: {
          ...headers,
        },
      }).then((response) => response.json());
      // TODO: Support deserialization of more content-types
      console.log(response);
    },
    [targetServer],
  );

  return (
    <>
      <JsonFormsContext.Provider
        value={{
          cells,
          renderers,
        }}
      >
        <h1>My App</h1>
        {!schema ? (
          <>
            <OpenApiSchemaInput onSchemaChange={setSchema} />
          </>
        ) : oas && operation ? (
          <>
            <button
              onClick={() => {
                setSchema(null);
                setOas(null);
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

            {/*<div>{getOperationForm(operation)}</div>*/}
            <h3>Available Operations</h3>
            <div>
              {Object.entries(oas.getPaths()).map(([path, pathInfo]) =>
                Object.entries(pathInfo).map(([method, operation]) => (
                  <div
                    key={path + " " + method}
                    className="accordion-container"
                  >
                    <Accordion
                      header={
                        <OpenApiOperationHeader
                          method={method}
                          path={path}
                          summary={operation.getSummary()}
                        />
                      }
                    >
                      <OpenApiOperationDisplay
                        onExecute={(bodyState, parametersState, options) =>
                          sendRequest(
                            operation,
                            bodyState,
                            parametersState,
                            options,
                          )
                        }
                        operation={operation}
                      />
                    </Accordion>
                  </div>
                )),
              )}
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
