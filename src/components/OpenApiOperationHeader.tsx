import React, { useMemo } from "react";
import { HttpMethods } from "oas/types";
import styled from "@emotion/styled";

export interface OpenApiOperationHeaderProps {
  method: string;
  path: string;
  summary: string;
}

const Header = styled.h3<{ $backgroundColor: string; $color: string }>`
  background-color: ${(props) => props.$backgroundColor};
  color: ${(props) => props.$color};
  display: flex;
  flex-direction: row;
  gap: 1em;
`;

const Summary = styled.span`
  font-style: italic;
`;

const OpenApiOperationHeader = ({
  method,
  path,
  summary,
}: OpenApiOperationHeaderProps) => {
  const methodLowercase: HttpMethods = useMemo(
    () => method.toLowerCase() as HttpMethods,
    [method],
  );
  const methodUppercase: Uppercase<HttpMethods> = useMemo(
    () => method.toUpperCase() as Uppercase<HttpMethods>,
    [method],
  );

  const backgroundColor = useMemo(() => {
    return (
      (
        {
          get: /*"dodgerblue"*/ "#1E90FF",
          put: /*"orange"*/ "#FFA500",
          post: /*"lightgreen"*/ "#90EE90",
          delete: /*"orangered"*/ "#FF4500",
          options: /*"aquamarine"*/ "#7FFFD4",
          head: /*"aquamarine"*/ "#7FFFD4",
          patch: /*"coral"*/ "#FF7F50",
          trace: /*"wheat"*/ "#F5DEB3",
        } as Record<HttpMethods, string>
      )[methodLowercase] || "#1E90FF"
    );
  }, [methodLowercase]);
  const color = useMemo(() => {
    return (
      (
        {
          get: /*"dodgerblue"*/ "#FFFFFFFF",
          put: /*"orange"*/ "#1F2D3DFF",
          post: /*"lightgreen"*/ "#1F2D3DFF",
          delete: /*"orangered"*/ "#FFFFFFFF",
          options: /*"aquamarine"*/ "#1F2D3DFF",
          head: /*"aquamarine"*/ "#1F2D3DFF",
          patch: /*"coral"*/ "#1F2D3DFF",
          trace: /*"wheat"*/ "#1F2D3DFF",
        } as Record<HttpMethods, string>
      )[methodLowercase] || "#FFFFFFFF"
    );
  }, [methodLowercase]);

  return (
    <>
      <Header $backgroundColor={backgroundColor} $color={color}>
        <span>{methodUppercase}</span>
        <span>{path}</span>
        <span>—</span>
        <Summary>{summary}</Summary>
      </Header>
    </>
  );
};

export default OpenApiOperationHeader;
