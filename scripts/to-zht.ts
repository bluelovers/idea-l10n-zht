/**
 * Created by user on 2022/1/9.
 */

import { async as FastGlob } from '@bluelovers/fast-glob/bluebird';
import { __plugin_dev_raw_dir, __plugin_downloaded_dir_unzip } from '../lib/const';
import { outputFile, outputJSON, pathExists, readFile, readJSON, unlink } from 'fs-extra';
import { join } from 'upath2';
import { console } from 'debug-color2';
import { createMultiBar } from '../lib/cli-progress';
import { processText } from 'novel-segment-cli';
import { chkcrlf, CR, CRLF, LF } from 'crlf-normalize';
import { SingleBar } from 'cli-progress';
import { gray, red } from 'ansi-colors';

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
			.tap((ls) =>
			{
				bar.setTotal(ls.length);
			})
			.each(async (file: string, index) =>
			{
				bar.update(index, { filename: file });
				const fullpath = join(cwd, file);
				const fullpath_new = join(__plugin_dev_raw_dir, lang, file);

				if (cacheList.includes(file))
				{
					if (!/\.(png|svg)$|MANIFEST\.MF/i.test(file))
					{
						const content_old = await readFile(fullpath).then(content => content.toString());

						let _lb = chkcrlf(content_old);

						let content_new = await processText(content_old, {
							convertToZhTw: true,
							crlf: _lb.crlf ? CRLF : (_lb.lf || !_lb.cr) ? LF : CR,
						});

						if (/META-INF\/plugin\.xml$/i.test(file))
						{
							content_new = content_new
								.replace(/<name>.+<\/name>/, `<name>Chinese (Traditional) Language Pack / 中文語言包</name>`)
								.replace(/<vendor>.+<\/vendor>/, `<vendor>bluelovers</vendor>`)
							;
						}

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
					bar.update(index, { filename: red(file) });

					if (await pathExists(fullpath))
					{
						await unlink(fullpath);
					}
				}

				if (await pathExists(fullpath_new))
				{
					bar.update(index, { filename: gray(file) });

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
				bar.update(bar.getTotal());
				bar.stop();
			})
	})
	.finally(() =>
	{
		multibar.stop();
	})
;
