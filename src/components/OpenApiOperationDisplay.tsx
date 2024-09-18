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
import OpenApiOperationExamples from "./OpenApiOperationExamples";

export enum Mode {
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
  const [mode, setMode] = useState(Mode.View);

  const onClearClick = useCallback(() => {
    Object.entries(parametersStateInitializer()).forEach(([name, state]) =>
      setParameterState({ name, ...state }),
    );
    updateBodyState(bodyStateInitializer());
  }, [bodyStateInitializer, parametersStateInitializer]);
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
      {mode === Mode.View && (
        <>
          <button type="button" onClick={() => setMode(Mode.TryIt)}>
            Try It
          </button>
          <OpenApiOperationExamples
            onTryExample={(example) => {
              updateBodyState({
                data: example.value,
                errors: undefined,
              });
              setMode(Mode.TryIt);
            }}
            operation={operation}
          />
        </>
      )}

      {mode === Mode.TryIt && (
        <>
          <button type="button" onClick={() => setMode(Mode.View)}>
            Cancel
          </button>
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
            <button onClick={onClearClick}>Clear</button>
            <button onClick={onExecuteClick}>Execute</button>
          </div>
        </>
      )}
    </>
  );
};

export default OpenApiOperationDisplay;
