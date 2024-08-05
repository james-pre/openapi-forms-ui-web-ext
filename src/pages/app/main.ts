import { createRoot } from "react-dom/client";
import App from "./App";

const appRoot = document.querySelector("#app-root")!;
const root = createRoot(appRoot, {});
root.render(App());
