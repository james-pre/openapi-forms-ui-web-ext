import React, { useEffect, useId, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  FormLabel,
  IconButton,
  LinearProgress,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Oas from "oas";
import { filesize } from "filesize";
import Dropzone from "react-dropzone";
import chroma from "chroma-js";
import { parseSchema } from "@/json-schema/parseSchema";

export type SchemaInputFileUploadProps = {
  onSchemaLoaded?: (schema: Oas) => void;
};

const FileInputBorderedContainer = styled(Box)(({ theme }) => ({
  borderColor: theme.palette.grey["200"],
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
}));

const ProgressBarNoTransition = styled(LinearProgress)(() => ({
  ".MuiLinearProgress-bar": {
    transition: "none",
  },
}));

const dragOverlayOpacity = 0.3;

enum LoadingState {
  Progress = "progress",
  Error = "error",
  Success = "success",
}

const SchemaInputFileUpload = ({
  onSchemaLoaded,
}: SchemaInputFileUploadProps) => {
  const fileInputId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!file) return;
    setError(null);
    setLoadingProgress(0);
    setLoadingState(LoadingState.Progress);

    void (async () => {
      let text;
      try {
        text = await file.text();
      } catch (e) {
        setError(String(e));
        setLoadingState(LoadingState.Error);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 250));
      let oas: Oas;
      try {
        oas = await parseSchema(text);
      } catch (e) {
        setError(String(e));
        setLoadingState(LoadingState.Error);
        return;
      }

      // Ensure the loading animation takes at least 500ms
      setTimeout(() => {
        setLoadingState(LoadingState.Success);
        onSchemaLoaded?.(oas);
      }, 250);
    })();
  }, [file, onSchemaLoaded]);

  useEffect(() => {
    let timerId: number | undefined;

    const maxDuration = 500;
    const maxProgress = 100;
    let start: number | undefined = undefined;
    const callback: FrameRequestCallback = (time) => {
      if (start === undefined) start = time;
      const elapsed = time - start;

      if (loadingState === LoadingState.Progress) {
        setLoadingProgress(
          Math.min((elapsed / maxDuration) * maxProgress, maxProgress),
        );
      } else {
        setLoadingProgress(
          loadingState === LoadingState.Error ? 0 : maxProgress,
        );
      }
      timerId = requestAnimationFrame(callback);
    };
    timerId = requestAnimationFrame(callback);

    return () => {
      if (timerId !== undefined) cancelAnimationFrame(timerId);
    };
  }, [loadingState]);

  return (
    <Dropzone
      onDrop={(acceptedFiles) => {
        setIsDragging(false);
        setFile(acceptedFiles[0]);
      }}
      noClick={true}
      multiple={false}
      preventDropOnDocument={true}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
    >
      {({ getRootProps, getInputProps }) => (
        <Stack alignSelf={"stretch"} spacing={1.5}>
          <Stack alignItems={"center"}>
            <FormLabel htmlFor={fileInputId}>
              <Typography variant={"h6"}>Upload a file</Typography>
            </FormLabel>
            <input
              id={fileInputId}
              type="file"
              className="hidden"
              {...getInputProps()}
            />
          </Stack>
          <Stack {...getRootProps()}>
            {file ? (
              <Box position={"relative"}>
                <Card elevation={0}>
                  <CardContent>
                    <Stack direction={"row"} alignItems={"center"} spacing={2}>
                      <Box>
                        <UploadFileIcon
                          sx={(theme) => ({
                            ...(loadingState === LoadingState.Error
                              ? {
                                  color: theme.palette.error.main,
                                }
                              : {
                                  color: theme.palette.common.blue.dark,
                                }),
                          })}
                        />
                      </Box>
                      <Box flexGrow={1}>
                        <Stack>
                          <Box>
                            <Typography
                              variant={"body1"}
                              color={
                                loadingState === LoadingState.Error
                                  ? "error"
                                  : "textPrimary"
                              }
                            >
                              <span>{file.name}</span>
                            </Typography>
                          </Box>
                          <Box>
                            <Stack direction={"row"} spacing={1}>
                              {loadingState === LoadingState.Error ? (
                                <Typography variant={"body2"} color={"error"}>
                                  {error}
                                </Typography>
                              ) : (
                                <Typography
                                  variant={"body2"}
                                  color={"textSecondary"}
                                >
                                  {filesize(file.size)}
                                </Typography>
                              )}
                              <Typography
                                variant={"body2"}
                                color={
                                  loadingState === LoadingState.Error
                                    ? "error"
                                    : "textSecondary"
                                }
                              >
                                <span>&bull;</span>
                              </Typography>
                              <Typography
                                variant={"body2"}
                                color={
                                  loadingState === LoadingState.Error
                                    ? "error"
                                    : "textSecondary"
                                }
                              >
                                {loadingState === LoadingState.Progress &&
                                  "Loading"}
                                {loadingState === LoadingState.Error &&
                                  "Failed"}
                                {loadingState === LoadingState.Success &&
                                  "Complete"}
                              </Typography>
                            </Stack>
                          </Box>
                          <Box className={"w-1/2"}>
                            <ProgressBarNoTransition
                              variant="determinate"
                              value={loadingProgress}
                              color={
                                loadingState === LoadingState.Error
                                  ? "error"
                                  : "info"
                              }
                            />
                          </Box>
                        </Stack>
                      </Box>
                      <Box>
                        <IconButton
                          aria-label={"delete"}
                          onClick={() => {
                            setFile(null);
                            setLoadingState(null);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
                {isDragging && (
                  <Box
                    position="absolute"
                    className="bottom-0 left-0 right-0 top-0 border border-dashed"
                    sx={(theme) => ({
                      backgroundColor: theme.palette.common.blue.light,
                      borderColor: theme.palette.common.blue.dark,
                      borderRadius: `${theme.shape.borderRadius}px`,
                      opacity: dragOverlayOpacity,
                    })}
                  ></Box>
                )}
              </Box>
            ) : (
              <FileInputBorderedContainer
                className="border border-dashed"
                sx={(theme) => ({
                  ...(isDragging
                    ? {
                        backgroundColor: chroma(theme.palette.common.blue.light)
                          .alpha(dragOverlayOpacity)
                          .css(),
                        borderColor: chroma(theme.palette.common.blue.dark)
                          .alpha(dragOverlayOpacity)
                          .css(),
                      }
                    : {}),
                })}
              >
                <Stack spacing={2} textAlign={"center"}>
                  <Stack alignItems={"center"}>
                    <UploadFileIcon
                      sx={(theme) => ({
                        color: theme.palette.common.blue.dark,
                      })}
                    />
                  </Stack>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant={"body1"}>
                        <FormLabel
                          htmlFor={fileInputId}
                          className="cursor-pointer underline"
                          sx={(theme) => ({
                            color: theme.palette.common.blue.dark,
                          })}
                        >
                          <span>Choose file</span>
                        </FormLabel>
                        &nbsp;or drag and drop
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant={"body2"}>
                        <i className="">No file chosen.</i>
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </FileInputBorderedContainer>
            )}
          </Stack>
        </Stack>
      )}
    </Dropzone>
  );
};

export default SchemaInputFileUpload;
