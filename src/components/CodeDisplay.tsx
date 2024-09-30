import React, { useCallback } from "react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";

export type CodeDisplayProps = {
  text: string;
};

const CodeDisplay = React.memo(({ text }: CodeDisplayProps) => {
  const onCopyClick = useCallback(() => {}, []);

  return (
    <Stack direction={"row"} spacing={1}>
      <Stack bgcolor={"black"} borderRadius={1} flexGrow={1}>
        <Typography
          variant={"body2"}
          color={"white"}
          whiteSpace={"pre-wrap"}
          padding={2}
          className={"break-all"}
        >
          {text}
        </Typography>
      </Stack>
      <Stack alignSelf={"center"}>
        <IconButton onClick={onCopyClick}>
          <ContentCopy />
        </IconButton>
      </Stack>
    </Stack>
  );
});
CodeDisplay.displayName = "CodeDisplay";

export default CodeDisplay;
