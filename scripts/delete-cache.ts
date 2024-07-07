/**
 * Created by user on 2018/4/17/017.
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
