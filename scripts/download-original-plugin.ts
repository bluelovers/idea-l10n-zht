import fetch from 'cross-fetch';
import { Response } from 'node-fetch';
import { outputFile } from 'fs-extra';
import { join } from 'path';
import { __root } from '../test/__root';
import { createProgressEstimator } from '../lib/cli-progress';

const logger = createProgressEstimator(__root);

logger(fetch('https://plugins.jetbrains.com/plugin/download?rel=true&updateId=149295')
	.then((res) => (res as any as Response).buffer())
	.then(buf => {
		return outputFile(join(__root, 'original-plugin', 'zh.zip'), buf)
	}), `download Chinese ​(Simplified)​ Language Pack / 中文语言包`)
;
