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
  const customOptionId = useId();

  const [isCustom, setIsCustom] = useState(false);
  const [server, setServer] = useState(availableServers[0] ?? "");

  useEffect(() => {
    onServerChange?.(server);
  }, []);
  useEffect(() => {
    onServerChange?.(server);
  }, [server]);

  return (
    <>
      <select
        onChange={(e) => {
          const isCustom =
            e.target.selectedOptions.namedItem(customOptionId) !== null;
          setIsCustom(isCustom);
          if (!isCustom) {
            setServer(e.target.value);
          }
        }}
        // value={server}
      >
        {availableServers.map((availableServer) => (
          <option key={availableServer} value={availableServer}>
            {availableServer}
          </option>
        ))}
        {allowCustom && <option id={customOptionId}>Custom</option>}
      </select>

      {isCustom ? (
        <>
          <h4>Custom Server</h4>
          <input
            type={"text"}
            value={server}
            onChange={(e) => setServer(e.target.value)}
          />
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default ServerSelector;
