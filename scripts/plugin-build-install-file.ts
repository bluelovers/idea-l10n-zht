import { async as FastGlob } from '@bluelovers/fast-glob/bluebird';
import {
	__plugin_dev_output_dir,
	__plugin_dev_overwrite_dir,
	__plugin_dev_raw_dir,
	__plugin_downloaded_dir_unzip,
} from '../lib/const';
import { console } from 'debug-color2';
import { outputFile, outputJSON } from 'fs-extra';
import { join } from 'upath2';
import JSZip from "jszip";
import Bluebird from 'bluebird';
import { createMultiBar } from '../lib/cli-progress';
import { cyan } from 'ansi-colors';
import { fixedJSZipDate } from 'jszip-fixed-date';
import { mergePaths } from '../lib/merge-paths';
import { getBuildFileList } from '../lib/get-build-file-list';

const multibar = createMultiBar();

export default FastGlob<string>([
	'*',
	'!*.list.json',
], {
	cwd: __plugin_downloaded_dir_unzip,
	onlyDirectories: true,
}).mapSeries(async (lang) =>
	{
		console.cyan.log(`build ${lang}`);

		const cwd = join(__plugin_downloaded_dir_unzip, lang);
		const cacheList: string[] = await getBuildFileList(lang);

		const jar = new JSZip();

		const bar = multibar.create(cacheList.length, 0);

		const {
			readPathFile,
		} = mergePaths([
			join(__plugin_dev_overwrite_dir, lang),
			join(__plugin_dev_raw_dir, lang),
			cwd,
		]);

		return Bluebird.reduce(cacheList, async (ls, file, index) =>
			{

				bar?.update(index, { filename: file });

				let buf: Buffer = await readPathFile(file);

				if (buf)
				{
					jar.file(file, buf);
					ls.push(file);
				}

				return ls;
			}, [] as string[])
			.then(async (ls) =>
			{
				bar?.update(bar.getTotal() - 1, { filename: cyan(lang + '.jar') });

				fixedJSZipDate(jar, new Date('2022-01-1 00:00:00Z'));

				const buf = await jar.generateAsync({
					type: "nodebuffer",
					mimeType: 'application/java-archive',
				});

				return Promise.all([
					buf,
					outputJSON(join(__plugin_dev_output_dir, lang + '.list.json'), ls, {
						spaces: 2,
					}),
					outputFile(join(__plugin_dev_output_dir, lang + '.jar'), buf),
				] as const).then(ls => ls[0] as Buffer);
			})
			.finally(() =>
			{
				bar?.update(bar.getTotal());
				bar?.stop();
			})
	})
	.then(() =>
	{
		multibar?.stop();
	})
;
