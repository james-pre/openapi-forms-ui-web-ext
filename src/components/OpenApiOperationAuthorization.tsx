import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FormControl,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
} from "@mui/material";
import { AuthorizationValues } from "@/utils/authorization";
import BasicAuthorization from "@/components/Authorization/BasicAuthorization";
import {
  SecurityScheme,
  SecuritySchemeArray,
  SecuritySchemeMatrix,
} from "@/json-schema/security";

export type OpenApiOperationAuthorizationProps = {
  emptySecuritySchemesLabel?: React.ReactNode;
  onAuthorizationChange?: (authorization: AuthorizationValues) => void;
  securitySchemeMatrix: SecuritySchemeMatrix;
};

const OpenApiOperationAuthorization = ({
  emptySecuritySchemesLabel = <em>No security schemes.</em>,
  onAuthorizationChange,
  securitySchemeMatrix,
}: OpenApiOperationAuthorizationProps) => {
  const [
    selectedSecuritySchemeMatrixIndex,
    setSelectedSecuritySchemeMatrixIndex,
  ] = useState(-1);

  const securityOnChange = useCallback((event: SelectChangeEvent<number>) => {
    setSelectedSecuritySchemeMatrixIndex(Number(event.target.value));
  }, []);

  const selectedSecuritySchemes = useMemo(() => {
    return securitySchemeMatrix[selectedSecuritySchemeMatrixIndex];
  }, [securitySchemeMatrix, selectedSecuritySchemeMatrixIndex]);

  const [authorizationValues, setAuthorizationValues] =
    useState<AuthorizationValues>({
      cookie: {},
      header: {},
      query: {},
    });
  useEffect(() => {
    setAuthorizationValues({ cookie: {}, header: {}, query: {} });
  }, [selectedSecuritySchemeMatrixIndex]);
  useEffect(() => {
    if (onAuthorizationChange) {
      onAuthorizationChange(authorizationValues);
    }
  }, [authorizationValues, onAuthorizationChange]);

  const updateAuthorizationValue = useCallback(
    (_in: keyof typeof authorizationValues, key: string, value: string) => {
      setAuthorizationValues((prev) => ({
        ...prev,
        [_in]: {
          ...prev[_in],
          [key]: value,
        },
      }));
    },
    [],
  );
  const updateHeaderValue = useCallback(
    (key: string, value: string) => {
      updateAuthorizationValue("header", key, value);
    },
    [updateAuthorizationValue],
  );

  const renderSecurityScheme = useCallback(
    (scheme: SecurityScheme) => {
      if (scheme.security.type === "apiKey") {
        const schemeParameterKey = scheme.security.name;
        const schemeIn = scheme.security.in;

        if (schemeIn === "cookie") {
          return (
            <Alert severity="warning">
              Unsupported position in &apos;{schemeIn}&apos;. Ensure the cookie
              is present, and check the &quot;Include credentials&quot; checkbox
              in the &quot;Global Request Authorization&quot; configuration
              section.
            </Alert>
          );
        }

        return (
          <>
            <FormControl>
              <TextField
                helperText={scheme.security.description}
                label={`${scheme.security._key} (${scheme.security.type})`}
                onChange={(e) =>
                  updateAuthorizationValue(
                    schemeIn,
                    schemeParameterKey,
                    e.target.value,
                  )
                }
                value={authorizationValues[schemeIn][schemeParameterKey] ?? ""}
              />
            </FormControl>
          </>
        );
      }

      if (scheme.security.type === "http") {
        if (scheme.security.scheme === "basic") {
          return (
            <BasicAuthorization
              onChange={(basic) => updateHeaderValue("Authorization", basic)}
            />
          );
        }
        if (scheme.security.scheme === "bearer") {
          return (
            <>
              <FormControl>
                <FormLabel>
                  {scheme.security._key} ({scheme.security.type}){" "}
                  {scheme.security.bearerFormat &&
                    `(${scheme.security.bearerFormat})`}
                </FormLabel>
                <TextField
                  onChange={(e) =>
                    updateHeaderValue(
                      "Authorization",
                      `Bearer ${e.target.value}`,
                    )
                  }
                  value={
                    authorizationValues.header["Authorization"]?.substring(
                      "Bearer ".length,
                    ) ?? ""
                  }
                />
              </FormControl>
            </>
          );
        }

        const customHttpSecurityScheme = scheme.security.scheme;
        return (
          <>
            <FormControl>
              <FormLabel>
                {scheme.security._key} ({scheme.security.type}) (
                {customHttpSecurityScheme})
              </FormLabel>
              <TextField
                onChange={(e) =>
                  updateHeaderValue(
                    "Authorization",
                    `${customHttpSecurityScheme} ${e.target.value}`,
                  )
                }
                value={
                  authorizationValues.header["Authorization"]?.substring(
                    `${customHttpSecurityScheme} `.length,
                  ) ?? ""
                }
              />
            </FormControl>
          </>
        );
      }

      if (scheme.security.type === "oauth2") {
        return (
          <Alert severity="error">
            Unsupported security scheme type &apos;{scheme.security.type}&apos;.
          </Alert>
        );
      }

      if (scheme.security.type === "openIdConnect") {
        return (
          <Alert severity="error">
            Unsupported security scheme type &apos;{scheme.security.type}&apos;.
          </Alert>
        );
      }

      return (
        <>
          <Alert severity="error">
            Unknown security scheme type &apos;{scheme.security?.["type"]}
            &apos;.
          </Alert>
        </>
      );
    },
    [authorizationValues, updateAuthorizationValue, updateHeaderValue],
  );

  const renderSecuritySchemes = useCallback(
    (securitySchemes: SecuritySchemeArray) => {
      return (
        <>
          <Stack spacing={1}>
            {securitySchemes.map((securityScheme, index) => (
              <Stack key={index}>{renderSecurityScheme(securityScheme)}</Stack>
            ))}
          </Stack>
        </>
      );
    },
    [renderSecurityScheme],
  );

  if (securitySchemeMatrix.length === 0) {
    return <Stack>{emptySecuritySchemesLabel}</Stack>;
  }

  return (
    <Stack spacing={1}>
      <Stack>
        <FormControl>
          <InputLabel>Security</InputLabel>
          <Select
            label={"Security"}
            onChange={securityOnChange}
            value={selectedSecuritySchemeMatrixIndex}
            variant={"outlined"}
          >
            <MenuItem value={-1}>
              <em>None</em>
            </MenuItem>
            {securitySchemeMatrix.map((securitySchemes, index) => {
              return (
                <MenuItem key={index} value={index}>
                  {securitySchemes
                    .map(
                      (securityScheme) =>
                        `${securityScheme.security._key} (${securityScheme.security.type})`,
                    )
                    .join(" & ")}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Stack>

      {selectedSecuritySchemes ? (
        <Stack>{renderSecuritySchemes(selectedSecuritySchemes)}</Stack>
      ) : (
        <></>
      )}
    </Stack>
  );
};

export default OpenApiOperationAuthorization;
