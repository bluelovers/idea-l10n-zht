import JSZip from "jszip";
import { outputFile, outputJSON, readFile } from 'fs-extra';
import { join } from 'upath2';
import Bluebird from 'bluebird';
import { __plugin_downloaded_dir, __plugin_downloaded_dir_unzip } from '../lib/const';
import { SingleBar } from 'cli-progress';
import { console } from 'debug-color2';
import { createMultiBar } from '../lib/cli-progress';

const multibar = createMultiBar();

export default unzipLang('zh')
	.finally(() => multibar.stop())
;

function unzipLang(lang: string | 'zh')
{
	console.cyan.log(`unzip ${lang}.zip`);

	let bar: SingleBar;

	return Bluebird.resolve(readFile(join(__plugin_downloaded_dir, `${lang}.zip`)))
		.then<JSZip>(JSZip.loadAsync)
		.then(async (zip) =>
		{
			let file = zip.file(/\.jar$/);

			if (!file.length || file.length > 1)
			{
				throw new Error(`files of .jar should be only one file, but get ${file}`)
			}

			return file[0].async('nodebuffer').then(JSZip.loadAsync)
		})
		.then(zip =>
		{
			return Object.values(zip.files)
		})
		.tap((ls) =>
		{
			bar = multibar.create(ls.length, 0);
		})
		.reduce(async (ls, file, index) =>
		{
			if (!file.dir)
			{
				bar.update(index + 1, { filename: file.name });
				ls.push(file.name);
				await outputFile(join(__plugin_downloaded_dir_unzip, lang, file.name), await file.async('nodebuffer'))
			}
			return ls
		}, [] as string[])
		.tap(ls =>
		{
			return outputJSON(join(__plugin_downloaded_dir_unzip, lang + '.list.json'), ls, {
				spaces: 2,
			})
		})
		.finally(() =>
		{
			bar?.update(bar.getTotal());
			bar?.stop();
		})
		//.tap(console.dir)
		;
}
