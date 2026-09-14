/**
 * Created by user on 2018/4/17/017.
 */

/**
 * 清除分詞快取資料
 * Delete word segmentation cache data
 *
 * 使用 novel-segment-cli 的 removeCache 清除分詞引擎的快取資料庫，
 * 確保下次執行時使用最新的字典資料而非過期的快取。
 * Uses novel-segment-cli's removeCache to clear the segmentation engine's cache database,
 * ensuring the latest dictionary data is used on the next run instead of stale cache.
 */
import * as path from 'path';
import * as fs from 'fs-extra';
import FastGlob from '@bluelovers/fast-glob/bluebird';
import { removeSync } from 'fs-extra';
import { __root, temp_root } from '../test/__root';
import { removeCache } from 'novel-segment-cli';

//let cache_file = path.join(ProjectConfig.temp_root, 'cache.db');

console.time(`[delete] cache`);

removeCache()
	.tap(() => {

		console.timeEnd(`[delete] cache`);

	})
;
