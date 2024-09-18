import React, { useEffect, useId, useMemo, useState } from "react";
import { Operation } from "oas/operation";
import { MediaTypeExample } from "../json-schema/MediaTypeExample";

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

  const hasExamples = useMemo(
    () => Object.keys(examples.mediaTypes).length > 0,
    [examples],
  );

  const [selectedExampleMediaType, setSelectedExampleMediaType] = useState<
    keyof typeof examples.mediaTypes | undefined
  >(hasExamples ? Object.keys(examples.mediaTypes)[0] : undefined);
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
  useEffect(() => {
    setSelectedExampleMediaType(
      hasExamples ? Object.keys(examples.mediaTypes)[0] : undefined,
    );
  }, [examples, hasExamples]);
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
        <div>
          <label htmlFor={mediaTypeSelectId}>Media Type</label>
          <select
            id={mediaTypeSelectId}
            onChange={(e) => setSelectedExampleMediaType(e.target.value)}
            value={selectedExampleMediaType}
          >
            {Object.keys(examples.mediaTypes).map((requestExampleMediaType) => (
              <option
                key={requestExampleMediaType}
                value={requestExampleMediaType}
              >
                {requestExampleMediaType}
              </option>
            ))}
          </select>
          <label htmlFor={keySelectId}>Example</label>
          <select
            disabled={selectedExampleMediaType === undefined}
            id={keySelectId}
            onChange={(e) => setSelectedExampleKey(Number(e.target.value))}
            value={selectedExampleKey}
          >
            {selectedExampleMediaType === undefined ? (
              <>
                <option value={undefined}>Select a media type first</option>
              </>
            ) : (
              (examples.mediaTypes[selectedExampleMediaType] ?? []).map(
                ({ title, summary, description }, idx) => (
                  <option key={idx} value={idx}>
                    {title ?? summary ?? description ?? idx}
                  </option>
                ),
              )
            )}
          </select>
          <div>
            {selectedExample ? (
              <>
                <p>{selectedExample.summary}</p>
                <p>{selectedExample.description}</p>
                <pre>
                  <code>{JSON.stringify(selectedExample.value, null, 2)}</code>
                </pre>
              </>
            ) : (
              <>
                <p>Select an example</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <i>No examples available</i>
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
        .map(({ mediaType, examples }) => ({
          [mediaType]: examples,
        }))
        .reduce((x, y) => ({ ...x, ...y }), {}),
    }),
    [operation],
  );

  const responseExamplesByStatus = useMemo(
    () => operation.getResponseExamples() ?? [],
    [operation],
  );
  const [responseExamplesSelectedStatus, setResponseExamplesSelectedStatus] =
    useState<string | undefined>(responseExamplesByStatus[0]?.status);
  useEffect(() => {
    setResponseExamplesSelectedStatus(responseExamplesByStatus[0]?.status);
  }, [responseExamplesByStatus]);
  const selectedResponseExamples = useMemo(
    () =>
      responseExamplesByStatus.find(
        (responseExamples) =>
          responseExamples.status === responseExamplesSelectedStatus,
      ),
    [responseExamplesByStatus, responseExamplesSelectedStatus],
  );

  const [selectedRequestExampleForTryIt, setSelectedRequestExampleForTryIt] =
    useState<MediaTypeExample | undefined>(undefined);

  return (
    <>
      <p>Examples</p>
      <p>Request Examples</p>
      <Examples
        examples={requestExamples}
        onExampleSelected={(example) =>
          setSelectedRequestExampleForTryIt(example)
        }
      />
      {Object.keys(requestExamples.mediaTypes).length > 0 && (
        <button
          type="button"
          disabled={selectedRequestExampleForTryIt === undefined}
          onClick={() => onTryExample?.(selectedRequestExampleForTryIt!)}
        >
          Try this example
        </button>
      )}

      <p>Response Examples</p>
      {responseExamplesByStatus && responseExamplesByStatus.length > 0 ? (
        <>
          <label htmlFor={responseExamplesStatusCodeSelectId}>
            Response status code
          </label>
          <select
            id={responseExamplesStatusCodeSelectId}
            onChange={(e) => setResponseExamplesSelectedStatus(e.target.value)}
            value={responseExamplesSelectedStatus}
          >
            {responseExamplesByStatus.map((responseExample) => (
              <option
                key={responseExample.status}
                value={responseExample.status}
              >
                {responseExample.status}
                {responseExample.onlyHeaders && <i>-</i>}
              </option>
            ))}
          </select>

          <>
            {selectedResponseExamples ? (
              <>
                {selectedResponseExamples.onlyHeaders && (
                  <i>No response body</i>
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
                <p>Select an response status code</p>
              </>
            )}
          </>
        </>
      ) : (
        <i>No examples available</i>
      )}
    </>
  );
};

export default OpenApiOperationExamples;
