import { Operation } from "oas/operation";
import { JsonForms, JsonFormsContext } from "@jsonforms/react";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { JSONSchema } from "../JSONSchema";
import * as ajv from "ajv";

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
  onExecute?: (bodyState: BodyState, parametersState: ParametersState) => void;
  operation: Operation;
}

const OpenApiOperationDisplay = ({
  onExecute,
  operation,
}: OpenApiOperationDisplayProps) => {
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

  const jsonFormsContext = useContext(JsonFormsContext);
  const cells = useMemo(() => jsonFormsContext.cells ?? [], [jsonFormsContext]);
  const renderers = useMemo(
    () => jsonFormsContext.renderers ?? [],
    [jsonFormsContext],
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
  );
  const [bodyState, updateBodyState] = useReducer(
    (state: BodyState, { data, errors }: BodyState) => ({
      ...state,
      data,
      errors,
    }),
    {
      data: null,
      errors: undefined,
    },
  );
  const onExecuteClick = useCallback(
    () => onExecute?.(bodyState, parametersState),
    [bodyState, onExecute, parametersState],
  );

  return (
    <>
      <p>{operation.getDescription()}</p>

      <p>Request Parameters</p>
      {parameters.length > 0 ? (
        parameters.map((parameter) => {
          return (
            <>
              {/*<pre>
                  <code>{JSON.stringify(parameter, null, 2)}</code>
                </pre>*/}
              <JsonForms
                key={parameter.name}
                cells={cells}
                data={parametersState[parameter.name]?.data}
                onChange={({ data, errors }) => {
                  setParameterState({ data, errors, name: parameter.name });
                }}
                renderers={renderers}
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
        <JsonForms
          cells={cells}
          data={bodyState.data}
          onChange={({ data, errors }) => {
            updateBodyState({ data, errors });
          }}
          renderers={renderers}
          schema={requestBodySchema}
        />
      ) : (
        <>
          <i>No request body</i>
        </>
      )}

      <div>
        <button onClick={onExecuteClick}>Execute</button>
      </div>
    </>
  );
};

export default OpenApiOperationDisplay;
