import React, { useCallback, useId, useMemo, useState } from "react";
import { ControlProps, rankWith } from "@jsonforms/core";
import { JsonForms, withJsonFormsControlProps } from "@jsonforms/react";
import { useJsonFormsConfig } from "@/hooks/useJsonFormsConfig.hook";
import { generateDefaultValue } from "@/json-schema/generateDefaultValue";
import { unescapeRegexSource } from "@/utils/regex";
import merge from "lodash-es/merge";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  Grid2,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";

const PatternPropertiesRenderer = (
  props: ControlProps & { data: Record<string, unknown> },
) => {
  const data = useMemo(
    () => (props.data as Record<string, unknown>) || {},
    [props.data],
  );

  const newKeyPatternSelectId = useId();
  const newKeyTextFieldId = useId();

  const handleChange = props.handleChange.bind(null);

  const { path, schema } = props;

  const [newKey, setNewKey] = useState("");
  const [selectedPattern, setSelectedPattern] = useState("");
  const [error, setError] = useState("");

  const patternProps = schema.patternProperties!;

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
        .reduce<Record<string, RegExp>>(merge, {}),
    [data, regexPatterns],
  );

  const isValidKey = useCallback((key: string, pattern: string) => {
    const regex = new RegExp(pattern);
    return regex.test(key);
  }, []);

  const handleAddKey = useCallback(() => {
    if (!selectedPattern) {
      setError("Please select a pattern");
      return;
    }

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
      setError(`The key "${newKey}" already exists`);
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

  const handleRemovePair = useCallback(
    (key: string) => {
      const updatedData = { ...data };
      delete updatedData[key];
      handleChange(path, updatedData);
    },
    [data, handleChange, path],
  );

  const jsonFormsProps = useJsonFormsConfig();

  const renderExistingKey = useCallback(
    (key: string) => {
      const value = data[key];
      const pattern = keyPatternMap[key];
      const patternSourceUnescaped = unescapeRegexSource(pattern);
      const propertySchema = patternProps[patternSourceUnescaped];

      return (
        <Accordion
          defaultExpanded={true}
          variant={"outlined"}
          slotProps={{
            transition: { unmountOnExit: true },
          }}
        >
          <AccordionSummary>
            <Stack
              direction={"row"}
              flexGrow={1}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Typography variant={"h6"}>{key}</Typography>
              <Tooltip title={"Delete"}>
                <IconButton onClick={() => handleRemovePair(key)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
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
          </AccordionDetails>
        </Accordion>
      );
    },
    [
      data,
      handleChange,
      handleRemovePair,
      jsonFormsProps,
      keyPatternMap,
      path,
      patternProps,
    ],
  );

  return (
    <Card
      sx={(theme) => ({
        marginBottom: theme.spacing(1),
      })}
    >
      <CardHeader
        title={<Typography variant={"h5"}>{schema.title}</Typography>}
      />
      <CardContent>
        <Stack spacing={1}>
          <Stack spacing={2}>
            {error && (
              <Alert severity="error">
                <Typography>{error}</Typography>
              </Alert>
            )}

            <Grid2 container={true} spacing={1}>
              <Grid2 size={6}>
                <Stack direction={"row"}>
                  <FormControl style={{ flexGrow: 1 }}>
                    <InputLabel htmlFor={newKeyPatternSelectId}>
                      Pattern
                    </InputLabel>
                    <Select
                      id={newKeyPatternSelectId}
                      variant={"outlined"}
                      label={"Pattern"}
                      onChange={(e) => setSelectedPattern(e.target.value)}
                      value={selectedPattern}
                    >
                      <MenuItem disabled={true} value="">
                        Select a pattern
                      </MenuItem>
                      {Object.keys(patternProps).map((pattern) => (
                        <MenuItem key={pattern} value={pattern}>
                          {pattern}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Grid2>

              <Grid2 size={6}>
                <FormControl style={{ flexGrow: 1 }}>
                  <TextField
                    id={newKeyTextFieldId}
                    label={"New key"}
                    onChange={(e) => setNewKey(e.target.value)}
                    value={newKey}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton edge="end" onClick={handleAddKey}>
                              <Add />
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </FormControl>
              </Grid2>
            </Grid2>
          </Stack>

          {Object.keys(data).map((key) => (
            <Stack key={key}>{renderExistingKey(key)}</Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
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

export default withJsonFormsControlProps(PatternPropertiesRenderer);
export { patternPropertiesControlTester };
