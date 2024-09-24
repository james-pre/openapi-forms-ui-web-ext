/*
declare module "ace-builds/src-noconflict/mode-html";
declare module "ace-builds/src-noconflict/mode-javascript";
declare module "ace-builds/src-noconflict/mode-json";
declare module "ace-builds/src-noconflict/mode-markdown";
declare module "ace-builds/src-noconflict/mode-text";
declare module "ace-builds/src-noconflict/mode-xml";

declare module "ace-builds/src-noconflict/theme-github";
declare module "ace-builds/src-noconflict/ext-language_tools";
*/

declare module "ace-builds/src-noconflict/ext-static_highlight.js" {
  export default function highlight(
    el: HTMLElement,
    options: { mode: string; theme: string },
  ): void;
}

declare module "ace-builds/src-noconflict/ext-modelist.js" {
  export declare class Mode {
    name: string;
    caption: string;
    mode: string;
    extensions: string;
  }

  export declare const getModeForPath: (path: string) => string;
  export declare const modes: Mode[];
  export declare const modesByName: Record<string, Mode>;

  /*export default {
    getModeForPath: getModeForPath,
    modes: modes,
    modesByName: modesByName,
  };*/
}
