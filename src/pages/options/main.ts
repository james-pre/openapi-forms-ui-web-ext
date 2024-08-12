import { createRoot } from "react-dom/client";
import Options from "./Options";

const appRoot = document.querySelector("#options-root")!;
const root = createRoot(appRoot, {});
root.render(Options());
