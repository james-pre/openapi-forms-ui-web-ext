import {configDotenv} from "dotenv";
import path from "node:path";

configDotenv();
const msEdgePath = path.resolve(process.env.MSEDGE_PATH || getMsEdgePath());
if (!msEdgePath) {
    throw new Error('Cannot determine the path to Microsoft Edge');
}

function getMsEdgePath() {
    return {
        darwin: undefined,
        linux: undefined,
        win32: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    }[process.platform];
}

export default {
    "run": {
        target: ["chromium"],
        chromiumBinary: msEdgePath
    }
}
