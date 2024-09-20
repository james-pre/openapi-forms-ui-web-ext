import App from "./App";
import { createRoot } from "react-dom/client";
import { createElement } from "react";

import "@/fonts";
import "./app.css";

const appRoot = document.querySelector("#app-root")!;
const root = createRoot(appRoot, {});
root.render(createElement(App));
