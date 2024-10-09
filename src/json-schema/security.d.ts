import type { KeyedSecuritySchemeObject } from "oas/types";

export type SecurityScheme = {
  security: KeyedSecuritySchemeObject & {
    in?: "cookie" | "header" | "query";
  };
  type?:
    | "apiKey"
    | "Basic"
    | "Bearer"
    | "Cookie"
    | "Header"
    | "http"
    | "OAuth2"
    | "Query";
};
export type SecuritySchemeArray = SecurityScheme[];
export type SecuritySchemeMatrix = SecuritySchemeArray[];
