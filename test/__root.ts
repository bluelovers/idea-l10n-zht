import { join } from "path";
import { console } from 'debug-color2';
import { enableDebug } from '@git-lazy/debug';

enableDebug();

console.enabledColor = true;

export const __root = join(__dirname, '..');

export const isWin = process.platform === "win32";

export const temp_root = join(__root, 'test/temp');
