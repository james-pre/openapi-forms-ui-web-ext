import React, { useCallback, useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  FormControl,
  Grid2,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export type HeadersProps = {
  initialHeaders?: Record<string, string>;
  onChange?: (headers: Record<string, string>) => void;
};

const httpRequestHeaderNames = [
  "A-IM",
  "Accept",
  "Accept-Charset",
  "Accept-Datetime",
  "Accept-Encoding",
  "Accept-Language",
  "Access-Control-Request-Method",
  "Access-Control-Request-Headers",
  "Authorization",
  "Cache-Control",
  "Connection",
  "Content-Encoding",
  "Content-Length",
  "Content-MD5",
  "Content-Type",
  "Cookie",
  "Date",
  "Expect",
  "Forwarded",
  "From",
  "Host",
  "HTTP2-Settings",
  "If-Match",
  "If-Modified-Since",
  "If-None-Match",
  "If-Range",
  "If-Unmodified-Since",
  "Max-Forwards",
  "Origin",
  "Pragma",
  "Prefer",
  "Proxy-Authorization",
  "Range",
  "Referer",
  "TE",
  "Trailer",
  "Transfer-Encoding",
  "User-Agent",
  "Upgrade",
  "Via",
  "Warning",
  "Upgrade-Insecure-Requests",
  "X-Requested-With",
  "DNT",
  "X-Forwarded-For",
  "X-Forwarded-Host",
  "X-Forwarded-Proto",
  "Front-End-Https",
  "X-Http-Method-Override",
  "X-ATT-DeviceId",
  "X-Wap-Profile",
  "Proxy-Connection",
  "X-UIDH",
  "X-Csrf-Token",
  "X-Request-ID",
  "X-Correlation-ID",
  "Save-Data",
  "Sec-GPC",
].sort();

const HeadersComponent = ({ initialHeaders = {}, onChange }: HeadersProps) => {
  const localHeadersInit = useCallback(
    () =>
      Object.entries(initialHeaders).map(([key, value]) => ({ key, value })),
    [initialHeaders],
  );

  const [localHeaders, setLocalHeaders] = useState(localHeadersInit);

  useEffect(() => {
    if (!onChange) return;

    const changedHeaders: Record<string, string> = {};
    localHeaders.forEach(({ key, value }) => {
      const trimmedKey = key.trim();
      if (!trimmedKey) return;

      const trimmedValue = value.trimStart();

      if (Object.prototype.hasOwnProperty.call(changedHeaders, key)) {
        changedHeaders[trimmedKey] = `${changedHeaders[key]}, ${trimmedValue}`;
      } else {
        changedHeaders[trimmedKey] = trimmedValue;
      }
    });

    onChange(changedHeaders);
  }, [localHeaders, onChange]);

  const handleHeaderChange = useCallback(
    (index: number, key: string, value: string) => {
      const updatedHeaders = [
        ...localHeaders.slice(0, index),
        { key, value },
        ...localHeaders.slice(index + 1),
      ];
      setLocalHeaders(updatedHeaders);
    },
    [localHeaders],
  );

  const handleAddHeader = useCallback(() => {
    const updatedHeaders = [...localHeaders, { key: "", value: "" }];
    setLocalHeaders(updatedHeaders);
  }, [localHeaders]);

  const handleRemoveHeader = useCallback(
    (index: number) => {
      const updatedHeaders = [
        ...localHeaders.slice(0, index),
        ...localHeaders.slice(index + 1),
      ];
      setLocalHeaders(updatedHeaders);
    },
    [localHeaders],
  );

  return (
    <Stack spacing={1}>
      <Stack spacing={1}>
        {localHeaders.map(({ key, value }, index) => (
          <Grid2 key={index} container={true} spacing={1}>
            <Grid2 size={4}>
              <Stack flexGrow={1}>
                <FormControl>
                  <Autocomplete
                    freeSolo={true}
                    onInputChange={(_event, newKey) => {
                      handleHeaderChange(index, newKey || "", value);
                    }}
                    options={httpRequestHeaderNames}
                    renderInput={(params) => (
                      <TextField {...params} label={"Name"} />
                    )}
                    value={key}
                  />
                </FormControl>
              </Stack>
            </Grid2>
            <Grid2 size={8}>
              <Stack flexGrow={1}>
                <FormControl>
                  <TextField
                    type="text"
                    value={value}
                    label={"Value"}
                    onChange={(e) =>
                      handleHeaderChange(index, key, e.target.value)
                    }
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position={"end"}>
                            <IconButton
                              onClick={() => handleRemoveHeader(index)}
                              aria-label={"delete"}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </FormControl>
              </Stack>
            </Grid2>
          </Grid2>
        ))}
      </Stack>
      <Stack>
        <Grid2 container={true} spacing={1}>
          <Grid2 size={4}>
            <Stack>
              <Button onClick={handleAddHeader} variant={"outlined"}>
                Add header
              </Button>
            </Stack>
          </Grid2>
          <Grid2 size={8}></Grid2>
        </Grid2>
      </Stack>
    </Stack>
  );
};

export default HeadersComponent;
