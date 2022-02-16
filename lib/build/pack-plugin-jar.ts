import Bluebird from 'bluebird';
import { console } from 'debug-color2';
import { join } from 'upath2';
import {
	__plugin_dev_output_dir,
	__plugin_dev_overwrite_dir,
	__plugin_dev_raw_dir,
	__plugin_downloaded_dir_unzip,
} from '../const';
import { getBuildFileList } from '../get-build-file-list';
import JSZip from 'jszip';
import { mergePaths } from '../merge-paths';
import { cyan } from 'ansi-colors';
import { fixedJSZipDate } from 'jszip-fixed-date';
import { outputFile, outputJSON } from 'fs-extra';
import { createSingleBar } from '../cli-progress';

export function packPluginJar(lang: string | 'zh')
{
	return Bluebird.resolve()
		.then(async () =>
		{
			console.cyan.log(`pack plugin jar ${lang}`);

			const cwd = join(__plugin_downloaded_dir_unzip, lang);
			const cacheList: string[] = await getBuildFileList(lang);

			const jar = new JSZip();

			const bar = createSingleBar(cacheList.length, 0);

			const {
				readPathFile,
			} = mergePaths([
				join(__plugin_dev_overwrite_dir, lang),
				join(__plugin_dev_overwrite_dir, lang.split('-')[0]),
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
		;
}
