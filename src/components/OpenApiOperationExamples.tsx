import React, { useEffect, useId, useMemo, useState } from "react";
import { Operation } from "oas/operation";
import { MediaTypeExample } from "@/json-schema/MediaTypeExample";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import useAppConfig from "@/hooks/appConfig.hook";
import CodeDisplay from "@/components/CodeDisplay";
import SplitView from "@/components/SplitView";

export type OpenApiOperationExamplesProps = {
  onTryExample?: (example: MediaTypeExample) => void;
  operation: Operation;
};

const Examples = ({
  examples,
  onExampleSelected,
}: {
  examples: {
    mediaTypes: Record<string, MediaTypeExample[]>;
  };
  onExampleSelected?: (example: MediaTypeExample) => void;
}) => {
  const mediaTypeSelectId = useId();
  const keySelectId = useId();
  const { mediaTypeSerializer } = useAppConfig();

  const hasExamples = useMemo(
    () => Object.keys(examples.mediaTypes).length > 0,
    [examples],
  );

  const [selectedExampleMediaType, setSelectedExampleMediaType] = useState<
    keyof typeof examples.mediaTypes | undefined
  >(
    hasExamples
      ? mediaTypeSerializer.findFirstSupportedMediaType(
          Object.keys(examples.mediaTypes),
        )
      : undefined,
  );
  const [selectedExampleKey, setSelectedExampleKey] = useState<
    number | undefined
  >(selectedExampleMediaType !== undefined ? 0 : undefined);
  const selectedExample = useMemo(
    () =>
      selectedExampleMediaType !== undefined && selectedExampleKey !== undefined
        ? examples.mediaTypes[selectedExampleMediaType]?.[selectedExampleKey]
        : undefined,
    [examples, selectedExampleKey, selectedExampleMediaType],
  );
  const selectedExampleSerializedValue = useMemo(() => {
    if (!selectedExample || !selectedExampleMediaType) return "";

    return mediaTypeSerializer.serialize(
      selectedExample.value,
      selectedExampleMediaType as (typeof mediaTypeSerializer.supportedMediaTypes)[number],
    );
  }, [mediaTypeSerializer, selectedExample, selectedExampleMediaType]);

  useEffect(() => {
    setSelectedExampleMediaType(
      hasExamples
        ? mediaTypeSerializer.findFirstSupportedMediaType(
            Object.keys(examples.mediaTypes),
          )
        : undefined,
    );
  }, [examples, hasExamples, mediaTypeSerializer]);
  useEffect(() => {
    setSelectedExampleKey(
      selectedExampleMediaType !== undefined ? 0 : undefined,
    );
  }, [selectedExampleMediaType]);
  useEffect(() => {
    if (selectedExample && onExampleSelected)
      onExampleSelected(selectedExample);
  }, [onExampleSelected, selectedExample]);

  return (
    <>
      {hasExamples ? (
        <Stack spacing={2}>
          <SplitView
            left={
              <Stack>
                <FormControl>
                  <InputLabel htmlFor={mediaTypeSelectId}>
                    Media type
                  </InputLabel>
                  <Select
                    variant={"outlined"}
                    id={mediaTypeSelectId}
                    label={"Media type"}
                    onChange={(e) =>
                      setSelectedExampleMediaType(e.target.value)
                    }
                    value={selectedExampleMediaType ?? ""}
                  >
                    {Object.keys(examples.mediaTypes).map(
                      (requestExampleMediaType) => {
                        const isSupported = mediaTypeSerializer.supports(
                          requestExampleMediaType,
                        );

                        return (
                          <MenuItem
                            key={requestExampleMediaType}
                            disabled={!isSupported}
                            value={requestExampleMediaType}
                          >
                            <Typography>{requestExampleMediaType}</Typography>
                          </MenuItem>
                        );
                      },
                    )}
                  </Select>
                </FormControl>
              </Stack>
            }
            right={
              <Stack>
                <FormControl>
                  <InputLabel htmlFor={keySelectId}>Example</InputLabel>
                  <Select
                    variant={"outlined"}
                    // disabled={selectedExampleMediaType === undefined}
                    id={keySelectId}
                    label={"Example"}
                    onChange={(e) =>
                      setSelectedExampleKey(Number(e.target.value))
                    }
                    value={selectedExampleKey ?? ""}
                  >
                    {selectedExampleMediaType === undefined ? (
                      <>
                        <MenuItem disabled={true} value={""}>
                          <i>Select a media type first.</i>
                        </MenuItem>
                      </>
                    ) : (
                      (examples.mediaTypes[selectedExampleMediaType] ?? []).map(
                        ({ title, summary, description }, idx) => (
                          <MenuItem key={idx} value={idx}>
                            {title ??
                              summary ??
                              description ??
                              `Example #${idx + 1}`}
                          </MenuItem>
                        ),
                      )
                    )}
                  </Select>
                </FormControl>
              </Stack>
            }
          />

          <Stack>
            {selectedExample ? (
              <>
                <Typography>{selectedExample.summary}</Typography>
                <Typography>{selectedExample.description}</Typography>
                <CodeDisplay text={selectedExampleSerializedValue} />
              </>
            ) : (
              <>
                <i>Select an example to visualize it.</i>
              </>
            )}
          </Stack>
        </Stack>
      ) : (
        <i>No examples available.</i>
      )}
    </>
  );
};

const OpenApiOperationExamples = ({
  onTryExample,
  operation,
}: OpenApiOperationExamplesProps) => {
  const responseExamplesStatusCodeSelectId = useId();

  const requestExamples = useMemo(
    () => ({
      mediaTypes: operation
        .getRequestBodyExamples()
        .filter(({ examples }) => examples.length > 0)
        .map(({ mediaType, examples }) => ({
          [mediaType]: examples,
        }))
        .reduce((x, y) => ({ ...x, ...y }), {}),
    }),
    [operation],
  );

  const responseExamplesByStatus = useMemo(
    () =>
      (operation.getResponseExamples() ?? [])
        .map((responseExampleByStatus) => {
          return {
            [responseExampleByStatus.status]: {
              ...responseExampleByStatus,
              mediaTypes: Object.entries(responseExampleByStatus.mediaTypes)
                .map(([mediaType, responseExample]) =>
                  responseExample.length > 0
                    ? {
                        [mediaType]: responseExample,
                      }
                    : {},
                )
                .reduce((x, y) => ({ ...x, ...y }), {}),
            },
          };
        })
        .reduce((x, y) => ({ ...x, ...y }), {}),
    [operation],
  );
  const [responseExamplesSelectedStatus, setResponseExamplesSelectedStatus] =
    useState<string | undefined>(Object.keys(responseExamplesByStatus)[0]);
  useEffect(() => {
    setResponseExamplesSelectedStatus(Object.keys(responseExamplesByStatus)[0]);
  }, [responseExamplesByStatus]);
  const selectedResponseExamples = useMemo(
    () =>
      responseExamplesSelectedStatus
        ? responseExamplesByStatus[responseExamplesSelectedStatus]
        : undefined,
    [responseExamplesByStatus, responseExamplesSelectedStatus],
  );

  const [selectedRequestExampleForTryIt, setSelectedRequestExampleForTryIt] =
    useState<MediaTypeExample | undefined>(undefined);

  return (
    <Stack spacing={2}>
      <Typography variant={"h6"}>Examples</Typography>

      <SplitView
        left={
          <Stack spacing={2}>
            <Typography variant={"h6"}>Request Examples</Typography>
            <Examples
              examples={requestExamples}
              onExampleSelected={(example) =>
                setSelectedRequestExampleForTryIt(example)
              }
            />

            {Object.keys(requestExamples.mediaTypes).length > 0 && (
              <Stack direction={"row"}>
                <Button
                  variant={"outlined"}
                  className={"uppercase"}
                  disabled={selectedRequestExampleForTryIt === undefined}
                  onClick={() =>
                    onTryExample?.(selectedRequestExampleForTryIt!)
                  }
                >
                  Try this example
                </Button>
              </Stack>
            )}
          </Stack>
        }
        right={
          <Stack spacing={2}>
            <Typography variant={"h6"}>Response Examples</Typography>

            {responseExamplesByStatus &&
            Object.keys(responseExamplesByStatus).length > 0 ? (
              <>
                <FormControl>
                  <InputLabel htmlFor={responseExamplesStatusCodeSelectId}>
                    Response status code
                  </InputLabel>
                  <Select
                    variant={"outlined"}
                    id={responseExamplesStatusCodeSelectId}
                    label={"Response status code"}
                    onChange={(e) =>
                      setResponseExamplesSelectedStatus(e.target.value)
                    }
                    value={responseExamplesSelectedStatus}
                  >
                    {Object.values(responseExamplesByStatus).map(
                      (responseExample) => (
                        <MenuItem
                          key={responseExample.status}
                          value={responseExample.status}
                        >
                          <Tooltip
                            title={
                              responseExample.onlyHeaders &&
                              "Response contains only headers"
                            }
                          >
                            <Stack direction={"row"} spacing={1}>
                              {responseExample.status}
                              {responseExample.onlyHeaders && (
                                //<Rule />
                                <i>*</i>
                              )}
                            </Stack>
                          </Tooltip>
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>

                <>
                  {selectedResponseExamples ? (
                    <>
                      {selectedResponseExamples.onlyHeaders && (
                        <i>No response body.</i>
                      )}
                      {!selectedResponseExamples.onlyHeaders && (
                        <Examples
                          key={selectedResponseExamples.status}
                          examples={selectedResponseExamples}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <i>Select a response status code.</i>
                    </>
                  )}
                </>
              </>
            ) : (
              <i>No examples available.</i>
            )}
          </Stack>
        }
      />
    </Stack>
  );
};

export default OpenApiOperationExamples;
