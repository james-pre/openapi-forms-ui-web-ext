import { Operation } from "oas/operation";
import { JsonForms } from "@jsonforms/react";
import React, {
  useCallback,
  useId,
  useMemo,
  useReducer,
  useState,
} from "react";
import * as ajv from "ajv";
import { useJsonFormsConfig } from "../hooks/useJsonFormsConfig.hook";
import { JSONSchema } from "../json-schema/JSONSchema";
import { generateDefaultValue } from "../json-schema/generateDefaultValue";

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

export type ExecuteOperationOptions = {
  contentType: string | undefined;
};

export interface OpenApiOperationDisplayProps {
  onExecute?: (
    bodyState: BodyState,
    parametersState: ParametersState,
    options: ExecuteOperationOptions,
  ) => void;
  operation: Operation;
}

const OpenApiOperationDisplay = ({
  onExecute,
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
    () =>
      parameters
        .map(({ name, schema }) => ({
          [name]: {
            data: schema ? generateDefaultValue(schema) : null,
            errors: undefined,
          },
        }))
        .reduce<ParametersState>((x, y) => ({ ...x, ...y }), {}),
  );
  const [bodyState, updateBodyState] = useReducer(
    (state: BodyState, { data, errors }: BodyState) => ({
      ...state,
      data,
      errors,
    }),
    {
      data: requestBodySchema ? generateDefaultValue(requestBodySchema) : null,
      errors: undefined,
    },
  );
  const [contentType, setContentType] = useState(() =>
    availableContentTypes.at(0),
  );

  const onExecuteClick = useCallback(
    () =>
      onExecute?.(bodyState, parametersState, {
        contentType: contentType,
      }),
    [bodyState, contentType, onExecute, parametersState],
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
        <button onClick={onExecuteClick}>Execute</button>
      </div>
    </>
  );
};

export default OpenApiOperationDisplay;
