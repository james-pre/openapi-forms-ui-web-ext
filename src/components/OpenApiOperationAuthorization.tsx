import { Operation } from "oas/operation";
import React, { useEffect, useId, useMemo, useState } from "react";
import {
  Autocomplete,
  FormControl,
  FormLabel,
  Grid2,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AuthorizationType, AuthorizationValue } from "@/utils/authorization";

type AuthorizationOption = {
  label: string;
  type: AuthorizationType;
};

export type OpenApiOperationAuthorizationProps = {
  onAuthorizationChange?: (authorization: AuthorizationValue) => void;
  operation: Operation;
};

const OpenApiOperationAuthorization = ({
  onAuthorizationChange,
  operation,
}: OpenApiOperationAuthorizationProps) => {
  const authorizationOptionNone = useMemo<AuthorizationOption>(
    () => ({ label: "None", type: "none" }),
    [],
  );
  const authorizationOptions = useMemo<AuthorizationOption[]>(
    () => [
      { label: "API Key", type: "api-key" },
      { label: "Basic", type: "basic" },
      { label: "Bearer", type: "bearer" },
      { label: "Cookie", type: "cookie" },
      { label: "Header", type: "header" },
      { label: "Query", type: "query" },
      authorizationOptionNone,
    ],
    [authorizationOptionNone],
  );

  const authorizationTypeId = useId();
  const authorizationValueField1Id = useId();
  const authorizationValueField2Id = useId();

  const [selectedAuthorizationOption, setSelectedAuthorizationOption] =
    useState(() => authorizationOptionNone);

  const [authorizationValue, setAuthorizationValue] =
    useState<AuthorizationValue>({ type: "none" });
  useEffect(() => {
    onAuthorizationChange?.(authorizationValue);
  }, [authorizationValue, onAuthorizationChange]);

  return (
    <Stack spacing={1}>
      <Grid2 container={true} spacing={1}>
        <Grid2 size={{ xs: 12, md: 2 }}>
          <Stack>
            <FormControl>
              <FormLabel htmlFor={authorizationTypeId}>
                Authorization type
              </FormLabel>
              <Autocomplete
                id={authorizationTypeId}
                getOptionLabel={(option) => option.label}
                onChange={(_, newValue) => {
                  const newAuthorizationOption =
                    newValue ?? authorizationOptionNone;

                  setSelectedAuthorizationOption(newAuthorizationOption);
                  setAuthorizationValue({
                    type: newAuthorizationOption.type,
                    name: "",
                    password: "",
                    username: "",
                    value: "",
                  });
                }}
                options={authorizationOptions}
                renderInput={(params) => <TextField {...params} />}
                value={selectedAuthorizationOption}
              />
            </FormControl>
          </Stack>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 10 }}>
          <Stack>
            {authorizationValue.type === "api-key" && (
              <FormControl>
                <FormLabel htmlFor={authorizationValueField1Id}>
                  API key
                </FormLabel>
                <TextField
                  id={authorizationValueField1Id}
                  onChange={(e) =>
                    setAuthorizationValue({
                      ...authorizationValue,
                      value: e.target.value,
                    })
                  }
                  value={authorizationValue.value}
                />
              </FormControl>
            )}

            {authorizationValue.type === "basic" && (
              <Grid2 container={true} spacing={1}>
                <Grid2 size={6}>
                  <Stack>
                    <FormControl>
                      <FormLabel htmlFor={authorizationValueField1Id}>
                        Username
                      </FormLabel>
                      <TextField
                        id={authorizationValueField1Id}
                        onChange={(e) =>
                          setAuthorizationValue({
                            ...authorizationValue,
                            username: e.target.value,
                          })
                        }
                        value={authorizationValue.username}
                      />
                    </FormControl>
                  </Stack>
                </Grid2>
                <Grid2 size={6}>
                  <Stack>
                    <FormControl>
                      <FormLabel htmlFor={authorizationValueField2Id}>
                        Password
                      </FormLabel>
                      <TextField
                        id={authorizationValueField2Id}
                        onChange={(e) =>
                          setAuthorizationValue({
                            ...authorizationValue,
                            password: e.target.value,
                          })
                        }
                        type={"password"}
                        value={authorizationValue.password}
                      />
                    </FormControl>
                  </Stack>
                </Grid2>
              </Grid2>
            )}

            {authorizationValue.type === "bearer" && (
              <FormControl>
                <FormLabel htmlFor={authorizationValueField1Id}>
                  Bearer token
                </FormLabel>
                <TextField
                  id={authorizationValueField1Id}
                  onChange={(e) =>
                    setAuthorizationValue({
                      ...authorizationValue,
                      value: e.target.value,
                    })
                  }
                  value={authorizationValue.value}
                />
              </FormControl>
            )}

            {/* If the AuthorizationType is 'cookie', we pass `credentials: include` to the fetch call */}
            {authorizationValue.type === "cookie" && (
              <>
                <Typography>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Aliquam animi assumenda blanditiis doloremque dolorum ea earum
                  error et impedit iste libero minima mollitia, nihil possimus
                  sapiente sequi vel? Quibusdam, velit.
                </Typography>
              </>
            )}

            {authorizationValue.type === "header" && (
              <Grid2 container={true} spacing={1}>
                <Grid2 size={6}>
                  <Stack>
                    <FormControl>
                      <FormLabel htmlFor={authorizationValueField1Id}>
                        Name
                      </FormLabel>
                      <TextField
                        id={authorizationValueField1Id}
                        onChange={(e) =>
                          setAuthorizationValue({
                            ...authorizationValue,
                            name: e.target.value,
                          })
                        }
                        value={authorizationValue.name}
                      />
                    </FormControl>
                  </Stack>
                </Grid2>
                <Grid2 size={6}>
                  <Stack>
                    <FormControl>
                      <FormLabel htmlFor={authorizationValueField2Id}>
                        Value
                      </FormLabel>
                      <TextField
                        id={authorizationValueField2Id}
                        onChange={(e) =>
                          setAuthorizationValue({
                            ...authorizationValue,
                            value: e.target.value,
                          })
                        }
                        value={authorizationValue.value}
                      />
                    </FormControl>
                  </Stack>
                </Grid2>
              </Grid2>
            )}

            {authorizationValue.type === "query" && (
              <Grid2 container={true} spacing={1}>
                <Grid2 size={6}>
                  <Stack>
                    <FormControl>
                      <FormLabel htmlFor={authorizationValueField1Id}>
                        Query parameter name
                      </FormLabel>
                      <TextField
                        id={authorizationValueField1Id}
                        onChange={(e) =>
                          setAuthorizationValue({
                            ...authorizationValue,
                            name: e.target.value,
                          })
                        }
                        value={authorizationValue.name}
                      />
                    </FormControl>
                  </Stack>
                </Grid2>
                <Grid2 size={6}>
                  <Stack>
                    <FormControl>
                      <FormLabel htmlFor={authorizationValueField2Id}>
                        Value
                      </FormLabel>
                      <TextField
                        id={authorizationValueField2Id}
                        onChange={(e) =>
                          setAuthorizationValue({
                            ...authorizationValue,
                            value: e.target.value,
                          })
                        }
                        value={authorizationValue.value}
                      />
                    </FormControl>
                  </Stack>
                </Grid2>
              </Grid2>
            )}

            {/* Nothing to configure for the 'none' AuthorizationType */}
            {authorizationValue.type === "none" && <></>}
          </Stack>
        </Grid2>
      </Grid2>
    </Stack>
  );
};

export default OpenApiOperationAuthorization;
