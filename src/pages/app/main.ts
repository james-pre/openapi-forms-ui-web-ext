import { createRoot } from "react-dom/client";
import App from "./App";
import { createElement } from "react";

const appRoot = document.querySelector("#app-root")!;
const root = createRoot(appRoot, {});
root.render(createElement(App));
