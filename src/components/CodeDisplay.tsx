import React, { useCallback, useMemo } from "react";
import { IconButton, Stack, Typography } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";
import useAppConfig from "@/hooks/appConfig.hook";

export type CodeDisplayProps = {
  text?: string | null | undefined;
};

const CodeDisplay = React.memo(({ text }: CodeDisplayProps) => {
  const { sandboxLink } = useAppConfig();

  const textHasValue = useMemo(
    () => text !== null && text !== undefined,
    [text],
  );
  const onCopyClick = useCallback(() => {
    if (text !== null && text !== undefined) {
      void (async () => {
        await sandboxLink.copyText(text);
      })();
    }
  }, [sandboxLink, text]);

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
          {textHasValue ? text : <em>Value is empty.</em>}
        </Typography>
      </Stack>
      <Stack alignSelf={"center"}>
        <IconButton disabled={!textHasValue} onClick={onCopyClick}>
          <ContentCopy />
        </IconButton>
      </Stack>
    </Stack>
  );
});
CodeDisplay.displayName = "CodeDisplay";

export default CodeDisplay;
