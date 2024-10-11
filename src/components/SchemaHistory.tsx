import React, { useEffect, useState } from "react";
import useAppConfig from "@/hooks/appConfig.hook";
import { SchemaSource } from "@/components/OpenApiSchemaInput";
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { AttachFile, FileOpen, Link as LinkIcon } from "@mui/icons-material";
import { orderBy } from "lodash-es";

export type SchemaHistoryEntry = {
  lastOpened: number;
  schema: string;
  source: SchemaSource;
  title: string;
  version: string;
};

export type SchemaHistoryEntries = {
  [titleAndVersion: string]: SchemaHistoryEntry;
};

export type SchemaHistoryProps = {
  onEntrySelected?: (entry: SchemaHistoryEntry) => void;
};

const SchemaHistory = ({ onEntrySelected }: SchemaHistoryProps) => {
  const { sandboxLink } = useAppConfig();
  const [historyEntries, setHistoryEntries] = useState<SchemaHistoryEntry[]>(
    [],
  );
  useEffect(() => {
    void (async () => {
      const historyEntries = await sandboxLink.getSchemaHistory();
      setHistoryEntries(
        orderBy(Object.values(historyEntries), ["lastOpened"], ["desc"]),
      );
    })();
  }, [sandboxLink]);

  return (
    <Stack spacing={1}>
      <Typography textAlign={"center"} variant={"h6"}>
        Schema History
      </Typography>

      <Stack spacing={1}>
        <List>
          {historyEntries.map((entry, index) => (
            <ListItem
              alignItems={"flex-start"}
              key={index}
              secondaryAction={
                <IconButton
                  aria-label={"load schema"}
                  edge={"end"}
                  onClick={() => onEntrySelected?.(entry)}
                >
                  <FileOpen />
                </IconButton>
              }
            >
              <ListItemIcon>
                {entry.source.type === "file" && <AttachFile />}
                {entry.source.type === "url" && <LinkIcon />}
              </ListItemIcon>
              <ListItemText
                primary={`${entry.title} ${entry.version}`}
                secondary={
                  <span className={"flex flex-col"}>
                    <Typography component={"span"} variant={"body1"}>
                      {entry.source.name}
                    </Typography>
                    <Typography component={"span"} variant={"body2"}>
                      {new Date(entry.lastOpened).toLocaleString()}
                    </Typography>
                  </span>
                }
              />
            </ListItem>
          ))}
        </List>
      </Stack>
    </Stack>
  );
};

export default SchemaHistory;
