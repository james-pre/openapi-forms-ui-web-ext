import {
  Autocomplete,
  FormControl,
  FormLabel,
  InputLabel,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useId, useState } from "react";

export interface ServerSelectorProps {
  allowCustom?: boolean;
  availableServers: string[];
  onServerChange?: (server: string) => void;
}

const ServerSelector = ({
  allowCustom = true,
  availableServers,
  onServerChange,
}: ServerSelectorProps) => {
  const autocompleteId = useId();
  const [server, setServer] = useState(availableServers[0] ?? "");

  useEffect(
    () => {
      onServerChange?.(server);
    },
    // Trigger onServerChange once when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useEffect(() => {
    onServerChange?.(server);
  }, [onServerChange, server]);

  return (
    <FormControl>
      <FormLabel htmlFor={autocompleteId}>
        <Typography variant={"body1"} color={"textPrimary"}>
          Target Server
        </Typography>
      </FormLabel>

      <Autocomplete
        id={autocompleteId}
        freeSolo={allowCustom}
        onInputChange={(_event, value) => setServer(value)}
        options={availableServers}
        renderInput={(params) => <TextField {...params} />}
        value={server}
      />
    </FormControl>
  );
};

export default ServerSelector;
