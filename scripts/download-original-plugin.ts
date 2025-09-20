import { internalDownload } from '../lib/cli/internalDownload';
import Bluebird from 'bluebird';
import { getBranchInfo } from '../lib/git/branch-info';
import { async as FastGlob } from '@bluelovers/fast-glob/bluebird';
import { basename, join } from 'upath2';
import { __plugin_downloaded_dir } from '../lib/const';
import JSZip from 'jszip';
import { copySync, outputFile, readFile } from 'fs-extra';
import { fixedJSZipDate } from 'jszip-fixed-date';
import { chalkByConsole, console } from 'debug-color2';
import { homedir } from 'os';
import { existsSync } from 'node:fs';
import { PluginXml } from '../lib/util/xml/plugin-xml';

export default Bluebird.resolve()
	.then(async () =>
	{
		const { series, isMasterBranch } = getBranchInfo();

		if (isMasterBranch && !series)
		{
			console.warn(`於 2024 版之後，JetBrains 不再更新獨立版語言包，改為內建語言包，所以需要手動提取語言包 Local/JetBrains/Toolbox/WebStorm/plugins/localization-zh/lib`);

			const cwd = join(__plugin_downloaded_dir, 'series');

			let homeDir = homedir();
			let ideDir: string;
			let pluginFile = join('plugins/localization-zh/lib', 'localization-zh.jar');

			for (let ide of [
				'IntelliJ IDEA Ultimate',
				'WebStorm',
				'PyCharm Professional',
			])
			{
				let temp = join(homeDir, 'AppData/Local', 'JetBrains/Toolbox', ide);
				if (existsSync(join(temp, pluginFile)))
				{
					ideDir = temp;
					break;
				}
			}

			if (ideDir)
			{
				console.info(`ideDir:`, ideDir);

				let src = join(ideDir, pluginFile);

				const info = await readFile(src)
					.then(JSZip.loadAsync)
					.then(zip =>
					{
						return zip.file('META-INF/plugin.xml').async('nodebuffer')
					})
					.then(buf =>
					{
						return new PluginXml(buf);
					})
				;

				copySync(src, join(cwd, `localization-zh-${info.version}.jar`))
			}

			let file = await FastGlob<string>([
					'*.jar',
				], {
					cwd,
				})
					.then(ls =>
					{
						return ls.sort().at(-1);
					})
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
