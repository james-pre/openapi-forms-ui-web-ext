import React, { useState } from "react";
import Oas from "oas";
import { Checkbox, FormControlLabel, Stack, Typography } from "@mui/material";
import HelpIcon from "@/components/HelpIcon";
import { SecuritySchemeObject } from "oas/types";
import { SecurityScheme, SecuritySchemeMatrix } from "@/json-schema/security";
import OpenApiOperationAuthorization from "@/components/OpenApiOperationAuthorization";
import { AuthorizationValues } from "@/utils/authorization";

export type OpenApiGlobalAuthorizationProps = {
  oas: Oas;
  onAuthorizationChange?: (authorization: AuthorizationValues) => void;
};

const OpenApiGlobalAuthorization = ({
  oas,
  onAuthorizationChange,
}: OpenApiGlobalAuthorizationProps) => {
  const [includeCredentials, setIncludeCredentials] = useState(false);

  const matrix: SecuritySchemeMatrix = (oas.api.security ?? []).map(
    (security) => {
      return Object.keys(security).map((securitySchemeKey) => {
        return {
          security: {
            _key: securitySchemeKey,
            ...(oas.api.components!.securitySchemes![
              securitySchemeKey
            ] as SecuritySchemeObject),
          },
        } as SecurityScheme;
      });
    },
  );

  return (
    <>
      <Stack spacing={2}>
        <Stack spacing={1}>
          <Stack direction={"row"} alignItems={"center"} spacing={1}>
            <Typography variant={"h6"}>Global Request Authorization</Typography>
            {/*<HelpIcon />*/}
          </Stack>

          <OpenApiOperationAuthorization
            emptySecuritySchemesLabel={<em>No global security schemes.</em>}
            onAuthorizationChange={onAuthorizationChange}
            securitySchemeMatrix={matrix}
          />
        </Stack>

        <Stack>
          <Stack direction={"row"} alignItems={"center"} spacing={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeCredentials}
                  onChange={(e) => setIncludeCredentials(e.target.checked)}
                />
              }
              label={"Include credentials"}
              style={{ marginInlineEnd: 0 }}
            />

            <HelpIcon
              href={
                "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#including_credentials"
              }
              tooltip={
                "Checking this box will set `credentials: 'include'` in the fetch call. " +
                "This will have the effect of including the cookies on the associated origin with the request. " +
                "The server must respond with appropriate CORS headers to the pre-flight request, or the request will fail."
              }
            />
          </Stack>
        </Stack>
      </Stack>
    </>
  );
};

export default OpenApiGlobalAuthorization;
