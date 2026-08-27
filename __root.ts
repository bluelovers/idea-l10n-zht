/**
 * 專案根路徑定義 / Project Root Path Definitions
 *
 * 使用中央化路徑管理，避免相對路徑 ../ 地獄
 * Centralized path management to avoid relative path ../../.. hell
 */
/// <reference types="node" />

import path from "path";
import { __ROOT_CORE } from './__root-core.mjs';

export const __ROOT = path.join(__ROOT_CORE);

export const isWin = process.platform === "win32";

/** `test/` */
export const __TEST_ROOT = path.join(__ROOT, "test");
/** `test/fixtures` */
export const __TEST_FIXTURES = path.join(__TEST_ROOT, "fixtures") ;
/**
 * `test/temp`
 * 存放未經整理或處理過的資料，以及各種暫存
 */
export const __TEST_TEMP = path.join(__TEST_ROOT, "temp");
/**
 * `test/cache`
 *
 * 存放處理過的資料或 coookies
 */
export const __TEST_CACHE = path.join(__TEST_ROOT, "cache");

