import { createMultiBar, createSingleBar } from '../cli-progress';
import { console } from 'debug-color2';
import { SingleBar } from 'cli-progress';
import { join } from 'upath2';
import { __plugin_downloaded_dir, __plugin_downloaded_dir_unzip } from '../const';
import Bluebird from 'bluebird';
import { outputFile, outputJSON, readFile, remove } from 'fs-extra';
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
		.reduce(async (result, file, index) =>
		{
			if (!file.dir && ![
				'inspectionDescriptions/Junit5MalformedParameterized.html',
			].includes(file.name))
			{
				bar?.update(index + 1, { filename: file.name });
				result.ls.push(file.name);

				try
				{
					const fullpath = join(cwd, file.name);
					await outputFile(fullpath, await file.async('nodebuffer'))
						.then(async () =>
						{
							await remove(fullpath);

							return outputFile(fullpath, await file.async('nodebuffer'));
						})
					;
				}
				catch (err)
				{
					result.errors.push({ file: file.name, error: err })
				}
			}
			return result
		}, { ls: [] as string[], errors: [] as { file: string, error: any }[] })
		.tap((result) =>
		{
			return outputJSON(cwd + '.list.json', result.ls, {
				spaces: 2,
			})
		})
		.then((result) =>
		{
			bar?.update(bar.getTotal());
			bar?.stop();

			if (result.errors.length)
			{
				for (const { file, error } of result.errors)
				{
					console.error(`Failed to write ${file}:`, error);
				}
				throw new Error(`${result.errors.length} files failed to write`);
			}
		})
		//.then(() => multibar.stop())
		//.tap(console.dir)
		;
}
