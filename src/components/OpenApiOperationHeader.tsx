import React, { useCallback, useMemo } from "react";
import { HttpMethods } from "oas/types";
import { Chip, IconButton, Stack, Typography, useTheme } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";

export interface OpenApiOperationHeaderProps {
  method: string;
  path: string;
}

const OpenApiOperationHeader = ({
  method,
  path,
}: OpenApiOperationHeaderProps) => {
  const methodLowercase: HttpMethods = useMemo(
    () => method.toLowerCase() as HttpMethods,
    [method],
  );
  const methodUppercase: Uppercase<HttpMethods> = useMemo(
    () => method.toUpperCase() as Uppercase<HttpMethods>,
    [method],
  );
  const theme = useTheme();

  const backgroundColor = useMemo(() => {
    return (
      (
        {
          get: /*"dodgerblue"*/ theme.palette.common.blue.light,
          put: /*"orange"*/ theme.palette.common.yellow.light,
          post: /*"lightgreen"*/ theme.palette.common.green.light,
          delete: /*"orangered"*/ theme.palette.common.red.light,
          // options: /*"aquamarine"*/ "#7FFFD4",
          // head: /*"aquamarine"*/ "#7FFFD4",
          patch: /*"coral"*/ theme.palette.common.cyan.light,
          // trace: /*"wheat"*/ "#F5DEB3",
        } as Record<HttpMethods, string>
      )[methodLowercase] || theme.palette.common.blue.light
    );
  }, [methodLowercase, theme]);
  const color = useMemo(() => {
    return (
      (
        {
          get: /*"dodgerblue"*/ theme.palette.common.blue.dark,
          put: /*"orange"*/ theme.palette.common.yellow.dark,
          post: /*"lightgreen"*/ theme.palette.common.green.dark,
          delete: /*"orangered"*/ theme.palette.common.red.dark,
          // options: /*"aquamarine"*/ "#1F2D3DFF",
          // head: /*"aquamarine"*/ "#1F2D3DFF",
          patch: /*"coral"*/ theme.palette.common.cyan.dark,
          // trace: /*"wheat"*/ "#1F2D3DFF",
        } as Record<HttpMethods, string>
      )[methodLowercase] || theme.palette.common.blue.dark
    );
  }, [methodLowercase, theme]);

  const onCopyClick = useCallback(async () => {
    // TODO: Fix extension permission issues
    await window.navigator.clipboard.writeText(path);
  }, [path]);

  return (
    <Stack direction={"row"} spacing={3} alignItems={"center"}>
      <Chip
        label={<Typography fontWeight={"bold"}>{methodUppercase}</Typography>}
        size={"medium"}
        variant={"filled"}
        sx={(theme) => ({
          backgroundColor: backgroundColor,
          color: color,
          minWidth: theme.typography.fontSize * 6,
          /*"& .MuiChip-label": {
              fontWeight: 700,
            },*/
        })}
      />

      <Typography variant={"h6"}>{path}</Typography>

      <IconButton
        aria-label={"copy path"}
        onClick={(e) => {
          e.stopPropagation();

          void onCopyClick();
        }}
      >
        <ContentCopy />
      </IconButton>
    </Stack>
  );
};

export default OpenApiOperationHeader;
