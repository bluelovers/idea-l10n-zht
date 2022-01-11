import { async as FastGlob } from '@bluelovers/fast-glob/bluebird';
import { __plugin_dev_output_dir, __plugin_dev_raw_dir, __plugin_downloaded_dir_unzip } from '../lib/const';
import { console } from 'debug-color2';
import { outputFile, outputJSON, pathExists, readFile, readJSON } from 'fs-extra';
import { join } from 'upath2';
import JSZip from "jszip";
import Bluebird from 'bluebird';
import { createMultiBar } from '../lib/cli-progress';
import { cyan, gray } from 'ansi-colors';

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
		const cacheList: string[] = await readJSON(join(__plugin_downloaded_dir_unzip, lang + '.list.json'));

		const jar = new JSZip();

		const bar = multibar.create(cacheList.length, 0);

		return Bluebird.reduce(cacheList, async (ls, file, index) =>
			{

				bar.update(index, { filename: file });

				const fullpath = join(cwd, file);
				const fullpath_new = join(__plugin_dev_raw_dir, lang, file);
				let buf: string | Buffer;

				if (/^(search|postfixTemplates|intentionDescriptions)\//.test(file))
				{
					bar.update(index, { filename: gray(file) });
					return ls;
				}
				else if (await pathExists(fullpath_new))
				{
					buf = await readFile(fullpath_new);
				}
				else
				{
					buf = await readFile(fullpath);
				}

				jar.file(file, buf);

				ls.push(file);

				return ls;
			}, [] as string[])
			.then(async (ls) =>
			{
				bar.update(bar.getTotal() - 1, { filename: cyan(lang + '.jar') });

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
				bar.update(bar.getTotal());
				bar.stop();
			})
	})
	.finally(() =>
	{
		multibar.stop();
	})
;
