import React, { useCallback, useMemo, useState } from "react";
import { ControlProps, rankWith } from "@jsonforms/core";
import { JsonForms, withJsonFormsControlProps } from "@jsonforms/react";
import { useJsonFormsConfig } from "../hooks/useJsonFormsConfig.hook";
import { generateDefaultValue } from "../json-schema/generateDefaultValue";
import { unescapeRegexSource } from "../utils/regex";

const PatternPropertiesRenderer = (
  props: ControlProps & { data: Record<string, unknown> },
) => {
  const data = useMemo(
    () => (props.data as Record<string, unknown>) || {},
    [props.data],
  );

  const handleChange = props.handleChange.bind(null);

  const { path, schema } = props;

  const [newKey, setNewKey] = useState("");
  const [selectedPattern, setSelectedPattern] = useState<string>("");
  const [error, setError] = useState("");

  // Extract patternProperties and its regex patterns
  const patternProps = schema.patternProperties!;

  // Memoize the keys and regex patterns
  const regexPatterns = useMemo(
    () => Object.keys(patternProps).map((pattern) => new RegExp(pattern)),
    [patternProps],
  );
  const keyPatternMap = useMemo(
    () =>
      Object.keys(data)
        .map((key) => ({
          [key]: regexPatterns.find((pattern) => pattern.test(key))!,
        }))
        .reduce((x, y) => ({ ...x, ...y }), {}),
    [data, regexPatterns],
  );

  // Function to check if a key matches a specific pattern
  const isValidKey = useCallback((key: string, pattern: string) => {
    const regex = new RegExp(pattern);
    return regex.test(key);
  }, []);

  // Handle adding new key-value pair
  const handleAddKey = useCallback(() => {
    if (!newKey) {
      setError("Key cannot be empty");
      return;
    }

    if (!isValidKey(newKey, selectedPattern)) {
      setError(
        `The key "${newKey}" does not match the selected pattern: ${selectedPattern}`,
      );
      return;
    }

    if (Object.prototype.hasOwnProperty.call(data, newKey)) {
      setError(`The key "${newKey}" already exists.`);
      return;
    }

    const schema = patternProps[selectedPattern];
    const newValue = generateDefaultValue(schema);

    setError("");
    handleChange(path, { ...data, [newKey]: newValue });
    setNewKey("");
  }, [
    data,
    handleChange,
    isValidKey,
    newKey,
    path,
    patternProps,
    selectedPattern,
  ]);

  // Handle removing a key-value pair
  const handleRemovePair = useCallback(
    (key: string) => {
      const updatedData = { ...data };
      delete updatedData[key]; // Remove the selected key-value pair
      handleChange(path, updatedData); // Update the data
    },
    [data, handleChange, path],
  );

  const jsonFormsProps = useJsonFormsConfig();

  // Render input fields using JSONForms
  const renderInputField = useCallback(
    (key: string) => {
      const value = data[key];
      const pattern = keyPatternMap[key];
      const patternSourceUnescaped = unescapeRegexSource(pattern);
      const propertySchema = patternProps[patternSourceUnescaped];

      return (
        <JsonForms
          {...jsonFormsProps}
          data={value}
          onChange={(state) => {
            handleChange(path, {
              ...data,
              [key]: state.data as Record<string, unknown>,
            });
          }}
          schema={propertySchema}
        />
      );
    },
    [data, handleChange, jsonFormsProps, keyPatternMap, path, patternProps],
  );

  return (
    <div>
      <h3>{schema.title}</h3>

      {/* Error message display */}
      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}

      {/* Add new key */}
      <div>
        <select
          value={selectedPattern}
          onChange={(e) => setSelectedPattern(e.target.value)}
          style={{ marginRight: "10px" }}
        >
          <option value="">Select pattern</option>
          {Object.keys(patternProps).map((pattern) => (
            <option key={pattern} value={pattern}>
              {pattern}
            </option>
          ))}
        </select>
        {selectedPattern && (
          <>
            <label>New key</label>
            <input
              type="text"
              placeholder="New key"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              style={{ marginRight: "10px" }}
            />
          </>
        )}
        <button onClick={handleAddKey}>Add key</button>
      </div>

      {/* Existing keys */}
      {Object.keys(data).map((key) => (
        <div key={key} style={{ marginBottom: "10px" }}>
          <label>{key}</label>
          {renderInputField(key)}
          <button onClick={() => handleRemovePair(key)}>Remove</button>
        </div>
      ))}
    </div>
  );
};

// Tester to only pick the renderer when `patternProperties` exists in the schema
const patternPropertiesControlTester = rankWith(
  3, // Increase the rank to ensure the renderer is chosen
  (_, schema) => {
    // Check if the schema has the `patternProperties` key
    return !!(schema && schema.patternProperties);
  },
);

// Export the custom renderer
export default withJsonFormsControlProps(PatternPropertiesRenderer);
export { patternPropertiesControlTester };
