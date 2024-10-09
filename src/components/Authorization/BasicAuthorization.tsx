import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { FormControl, FormLabel, Grid2, Stack, TextField } from "@mui/material";

export type BasicAuthorizationProps = {
  onChange?: (value: string) => void;
};

const BasicAuthorization = ({ onChange }: BasicAuthorizationProps) => {
  const usernameId = useId();
  const passwordId = useId();

  const textEncoder = useMemo(() => new TextEncoder(), []);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const usernameOnChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  }, []);
  const passwordOnChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  useEffect(() => {
    if (!onChange) return;

    const bytes = textEncoder.encode(username + ":" + password);
    const binString = Array.from(bytes, (byte) =>
      String.fromCodePoint(byte),
    ).join("");

    onChange(btoa(binString));
  }, [onChange, password, textEncoder, username]);

  return (
    <>
      <Grid2 container={true} spacing={1}>
        <Grid2 size={6}>
          <Stack>
            <FormControl>
              <FormLabel htmlFor={usernameId}>Username</FormLabel>
              <TextField
                id={usernameId}
                onChange={usernameOnChange}
                value={username}
              />
            </FormControl>
          </Stack>
        </Grid2>
        <Grid2 size={6}>
          <Stack>
            <FormControl>
              <FormLabel htmlFor={passwordId}>Password</FormLabel>
              <TextField
                id={passwordId}
                onChange={passwordOnChange}
                type={"password"}
                value={password}
              />
            </FormControl>
          </Stack>
        </Grid2>
      </Grid2>
    </>
  );
};

export default BasicAuthorization;
