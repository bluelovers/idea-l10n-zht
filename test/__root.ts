import { join } from "path";

export const __root = join(__dirname, '..');

export const isWin = process.platform === "win32";
