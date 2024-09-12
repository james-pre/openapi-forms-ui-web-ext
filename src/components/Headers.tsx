import React, { useState, useEffect, useCallback } from "react";

export type HeadersProps = {
  headers?: Record<string, string>;
  onChange?: (headers: Record<string, string>) => void;
};

const Headers = ({ headers = {}, onChange }: HeadersProps) => {
  const [localHeaders, setLocalHeaders] = useState(headers);

  useEffect(() => {
    setLocalHeaders(headers);
  }, [headers]);

  const handleHeaderChange = useCallback(
    (key: string, value: string) => {
      const updatedHeaders = { ...localHeaders, [key]: value };
      setLocalHeaders(updatedHeaders);
      onChange?.(updatedHeaders);
    },
    [localHeaders, onChange],
  );

  const handleAddHeader = useCallback(() => {
    const updatedHeaders = { ...localHeaders, "": "" };
    setLocalHeaders(updatedHeaders);
    onChange?.(updatedHeaders);
  }, [localHeaders, onChange]);

  const handleRemoveHeader = useCallback(
    (key: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _, ...updatedHeaders } = localHeaders;
      setLocalHeaders(updatedHeaders);
      onChange?.(updatedHeaders);
    },
    [localHeaders, onChange],
  );

  const handleKeyChange = useCallback(
    (newKey: string, key: string, value: string) => {
      const updatedHeaders = { ...localHeaders, [newKey]: value };
      delete updatedHeaders[key];
      setLocalHeaders(updatedHeaders);
      onChange?.(updatedHeaders);
    },
    [localHeaders, onChange],
  );

  return (
    <div>
      {Object.entries(localHeaders).map(([key, value], index) => (
        <div key={index}>
          <label>
            Key:
            <input
              type="text"
              value={key}
              onChange={(e) => handleKeyChange(e.target.value, key, value)}
            />
          </label>
          <label>
            Value:
            <input
              type="text"
              value={value}
              onChange={(e) => handleHeaderChange(key, e.target.value)}
            />
          </label>
          <button onClick={() => handleRemoveHeader(key)}>Remove</button>
        </div>
      ))}
      <button onClick={handleAddHeader}>Add Header</button>
    </div>
  );
};

export default Headers;
