import React, { useCallback, useMemo, useReducer } from "react";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import OpenApiOperationHeader from "@/components/OpenApiOperationHeader";
import OpenApiOperationDisplay from "@/components/OpenApiOperationDisplay";
import { Operation } from "oas/operation";
import * as ajv from "ajv";
import { generateDefaultValue } from "@/json-schema/generateDefaultValue";
import merge from "lodash-es/merge";
import { JSONSchema } from "@/json-schema/JSONSchema";

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

export type OpenApiOperationProps = {
  operation: Operation;
};

const OpenApiOperation = ({ operation }: OpenApiOperationProps) => {
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
  const parametersStateInitializer = useCallback(
    () =>
      parameters
        .map(({ name, schema }) => ({
          [name]: {
            data: schema ? generateDefaultValue(schema) : null,
            errors: undefined,
          },
        }))
        .reduce<ParametersState>(merge, {}),
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

  const resetRequestState = useCallback(() => {
    Object.entries(parametersStateInitializer()).forEach(([name, state]) =>
      setParameterState({ name, ...state }),
    );
    updateBodyState(bodyStateInitializer());
  }, [bodyStateInitializer, parametersStateInitializer]);

  return (
    <>
      <Accordion
        variant={"outlined"}
        slotProps={{
          heading: { component: "div" },
          transition: { unmountOnExit: true },
        }}
        sx={{
          "::before": {
            display: "none",
          },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <OpenApiOperationHeader
            method={operation.method}
            path={operation.path}
          />
        </AccordionSummary>
        <AccordionDetails>
          <OpenApiOperationDisplay
            bodyState={bodyState}
            onBodyChange={({ data, errors }) =>
              updateBodyState({ data, errors })
            }
            onParameterChange={({ data, errors }, parameter) => {
              setParameterState({
                data,
                errors,
                name: parameter.name,
              });
            }}
            onReset={() => void resetRequestState()}
            parametersState={parametersState}
            operation={operation}
          />
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default OpenApiOperation;
