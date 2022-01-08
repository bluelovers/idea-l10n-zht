import JSZip from "jszip";
import { outputFile, readFile } from 'fs-extra';
import { join } from 'path';
import { __root } from '../test/__root';
import Bluebird from 'bluebird';
import { createProgressEstimator } from '../lib/cli-progress';

const logger = createProgressEstimator(__root);

logger(Bluebird.resolve(readFile(join(__root, 'original-plugin', 'zh.zip')))
	.then<JSZip>(JSZip.loadAsync)
	.then(async (zip) => {
		let file = zip.file(/\.jar$/);

		return file[0].async('nodebuffer').then(JSZip.loadAsync)
	})
	.then(zip => {
		return Object.values(zip.files)
	})
	.each(async (file) => {
		return !file.dir && outputFile(join(__root, 'original-plugin-raw', 'zh', file.name), await file.async('nodebuffer'))
	})
	//.tap(console.dir)
	, `unzip zh.zip`)
;

