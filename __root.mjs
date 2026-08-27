import path from "path";
import { __ROOT_CORE } from './__root-core.mjs';

export const __ROOT = path.join(__ROOT_CORE);

export const isWin = process.platform === "win32";

export const __TEST_ROOT = path.join(__ROOT, "test");
export const __TEST_FIXTURES = path.join(__TEST_ROOT, "fixtures");
export const __TEST_TEMP = path.join(__TEST_ROOT, "temp");

export const __TEST_CACHE = path.join(__TEST_ROOT, "cache");

