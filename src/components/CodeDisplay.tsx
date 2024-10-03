import React, { useCallback, useMemo } from "react";
import { IconButton, Stack, Typography } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";
import useAppConfig from "@/hooks/appConfig.hook";

export type CodeDisplayProps = {
  text?: string | null | undefined;
  wrap?: boolean;
};

const CodeDisplay = React.memo(({ text, wrap = true }: CodeDisplayProps) => {
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
      <Stack bgcolor={"black"} borderRadius={1} flexGrow={1} overflow={"auto"}>
        <Typography
          variant={"body2"}
          color={"white"}
          padding={2}
          sx={() => ({
            whiteSpaceCollapse: "preserve",
          })}
          className={wrap ? "break-all" : "text-nowrap"}
        >
          {textHasValue ? text : <em>{/*No value.*/}</em>}
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
