import { createMultiBar, createSingleBar } from '../cli-progress';
import { console } from 'debug-color2';
import { SingleBar } from 'cli-progress';
import { join } from 'upath2';
import { __plugin_downloaded_dir, __plugin_downloaded_dir_unzip } from '../const';
import Bluebird from 'bluebird';
import { outputFile, outputJSON, readFile } from 'fs-extra';
import JSZip from 'jszip';

//export const multibar = createMultiBar();

export function unzipLang(lang: string | 'zh')
{
	console.cyan.log(`unzip ${lang}.zip`);

	const bar: SingleBar = createSingleBar(200, 0);
	const cwd = join(__plugin_downloaded_dir_unzip, lang);

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
			bar?.setTotal(ls.length);
		})
		.reduce(async (ls, file, index) =>
		{
			if (!file.dir && ![
				'inspectionDescriptions/Junit5MalformedParameterized.html',
			].includes(file.name))
			{
				bar?.update(index + 1, { filename: file.name });
				ls.push(file.name);
				await outputFile(join(cwd, file.name), await file.async('nodebuffer'))
			}
			return ls
		}, [] as string[])
		.tap(ls =>
		{
			return outputJSON(cwd + '.list.json', ls, {
				spaces: 2,
			})
		})
		.then(() =>
		{
			bar?.update(bar.getTotal());
			bar?.stop();
		})
		//.then(() => multibar.stop())
		//.tap(console.dir)
		;
}
