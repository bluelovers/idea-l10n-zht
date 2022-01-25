/**
 * Created by user on 2022/1/9.
 */

import { async as FastGlob } from '@bluelovers/fast-glob/bluebird';
import { __plugin_dev_raw_dir, __plugin_downloaded_dir_unzip } from '../lib/const';
import { outputFile, outputJSON, pathExists, readFile, readJSON, unlink } from 'fs-extra';
import { join } from 'upath2';
import { console } from 'debug-color2';
import { createMultiBar } from '../lib/cli-progress';
import { SingleBar } from 'cli-progress';
import { gray, red } from 'ansi-colors';
import { updateMeta } from '../lib/meta';
import { processIdeaSegmentText } from '../lib/segment';
import { array_unique_overwrite } from 'array-hyper-unique';
import { handleText } from '../lib/handleText';

const multibar = createMultiBar();

export default FastGlob<string>([
	'*',
	'!*.list.json',
], {
	cwd: __plugin_downloaded_dir_unzip,
	onlyDirectories: true,
}).mapSeries(async (lang) =>
	{
		let bar: SingleBar;

		console.cyan.log(`convert ${lang} to zht`);

		const cwd = join(__plugin_downloaded_dir_unzip, lang);
		const cacheList: string[] = await readJSON(join(__plugin_downloaded_dir_unzip, lang + '.list.json'));
		const cacheListNew: string[] = [];

		bar = multibar.create(cacheList.length, 0);

		return FastGlob([
			'**/*',
		], {
			cwd,
		})
			.then(ls =>
			{
				return array_unique_overwrite([
					...cacheList,
					...ls,
				])
			})
			.tap((ls) =>
			{
				bar?.setTotal(ls.length);
			})
			.mapSeries(async (file: string, index) =>
			{
				bar?.update(index, { filename: file });
				const fullpath = join(cwd, file);
				const fullpath_new = join(__plugin_dev_raw_dir, lang, file);

				if (cacheList.includes(file))
				{
					if (!/\.(png|svg)$|MANIFEST\.MF/i.test(file))
					{
						const content_old = await readFile(fullpath).then(content => content.toString());

						let content_new = await handleText(content_old, {
							file,
						});

						if (content_new !== content_old)
						{
							cacheListNew.push(file);
							//console.success(file);
							await outputFile(fullpath_new, content_new);
							return;
						}
					}
				}
				else
				{
					bar?.update(index, { filename: red(file) });

					if (await pathExists(fullpath))
					{
						await unlink(fullpath);
					}
				}

				if (await pathExists(fullpath_new))
				{
					bar?.update(index, { filename: gray(file) });

					await unlink(fullpath_new);
				}

			})
			.tap(() =>
			{
				return outputJSON(join(__plugin_dev_raw_dir, lang + '.list.json'), cacheListNew, {
					spaces: 2,
				})
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
