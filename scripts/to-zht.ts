/**
 * Created by user on 2022/1/9.
 */

import { async as FastGlob } from '@bluelovers/fast-glob/bluebird';
import { __plugin_dev_dir, __plugin_downloaded_dir_unzip } from '../lib/const';
import { outputFile, pathExists, readFile, unlink } from 'fs-extra';
import { join } from 'upath2';
import { console } from 'debug-color2';
import { createMultiBar } from '../lib/cli-progress';
import { processText } from 'novel-segment-cli';
import { chkcrlf, CR, CRLF, LF } from 'crlf-normalize';
import { SingleBar } from 'cli-progress';

const multibar = createMultiBar();
let bar: SingleBar;

export default FastGlob([
	'**/*',
	'!*.list.json',
], {
	cwd: __plugin_downloaded_dir_unzip,
})
	.tap((ls) =>
	{
		console.cyan.log(`convert to zht`);
		bar = multibar.create(ls.length, 0);
	})
	.each(async (file: string, index) =>
	{
		bar.update(index + 1, { filename: file });
		let fullpath_new = join(__plugin_dev_dir, file);

		if (!/\.(png)$|MANIFEST\.MF/i.test(file))
		{
			let fullpath = join(__plugin_downloaded_dir_unzip, file);
			const content_old = await readFile(fullpath).then(content => content.toString());

			let _lb = chkcrlf(content_old);

			let content_new = await processText(content_old, {
				convertToZhTw: true,
				crlf: _lb.crlf ? CRLF : (_lb.lf || !_lb.cr) ? LF : CR,
			});

			if (/META-INF\/plugin\.xml$/i.test(file))
			{
				content_new = content_new.replace(/<name>.+<\/name>/, `<name>Chinese (Traditional) Language Pack / 中文語言包</name>`);
			}

			if (content_new !== content_old)
			{
				//console.success(file);
				await outputFile(fullpath_new, content_new);
				return;
			}
		}

		if (await pathExists(fullpath_new))
		{
			//console.warn(file);
			return unlink(fullpath_new);
		}
	})
	.finally(() =>
	{
		bar?.update(bar.getTotal());
		bar?.stop();
		multibar.stop();
	})
;


