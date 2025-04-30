import { internalDownload } from '../lib/cli/internalDownload';
import Bluebird from 'bluebird';
import { getBranchInfo } from '../lib/git/branch-info';
import { async as FastGlob } from '@bluelovers/fast-glob/bluebird';
import { basename, join } from 'upath2';
import { __root } from '../test/__root';
import { __plugin_dev_output_dir, __plugin_downloaded_dir } from '../lib/const';
import JSZip from 'jszip';
import { outputFile, readFile } from 'fs-extra';
import { fixedJSZipDate } from 'jszip-fixed-date';
import { chalkByConsole, console } from 'debug-color2';

export default Bluebird.resolve()
	.then(async () =>
	{
		const { series, isMasterBranch } = getBranchInfo();

		if (isMasterBranch && !series)
		{
			console.warn(`於 2024 版之後，JetBrains 不再更新獨立版語言包，改為內建語言包，所以需要手動提取語言包 Local/JetBrains/Toolbox/WebStorm/plugins/localization-zh/lib`);

			const cwd = join(__plugin_downloaded_dir, 'series');

			let file = await FastGlob<string>([
				'*.jar'
			], {
				cwd,
			})
				.then(ls => ls.sort()[0])
			;

			const zip = new JSZip();

			zip.file(file, await readFile(join(cwd, file)));

			fixedJSZipDate(zip, new Date('2022-01-1 00:00:00Z'));

			const buf = await zip.generateAsync({
				type: "nodebuffer",
				mimeType: 'application/java-archive',
			});

			let target = join(__plugin_downloaded_dir, `zh.zip`);

			console.warn(chalkByConsole((chalk) =>
			{
				return `將 ${chalk.cyan(basename(file))} 打包至 ${chalk.cyan(basename(target))}`
			}, console));

			await outputFile(target, buf)

			return
		}

		return internalDownload(series)
	})
;
