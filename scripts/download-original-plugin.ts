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
			console.warn(`於 2024 版之後，JetBrains 不再更新獨立版語言包，改為內建語言包，所以需要手動提取語言包`);

			const cwd = join(__plugin_downloaded_dir, 'series');

			let homeDir = homedir();
			let ideDir: string;
			let foundPluginFile: string | undefined;

			const jetBrainsDir = join(homeDir, 'AppData/Local', 'JetBrains');
			const toolboxDir = join(jetBrainsDir, 'Toolbox');

			const pluginCandidates = [
				join('plugins/localization-zh/lib', 'localization-zh.jar'),
			];

			const ideMap = [
				{ toolbox: 'IntelliJ IDEA Ultimate', base: 'IntelliJIdea', programs: 'IntelliJ IDEA' },
				{ toolbox: 'WebStorm', base: 'WebStorm', programs: 'WebStorm' },
				{ toolbox: 'PyCharm Professional', base: 'PyCharm', programs: 'PyCharm' },
			];

			for (let ide of ideMap)
			{
				let temp = join(toolboxDir, ide.toolbox);

				for (let candidate of pluginCandidates)
				{
					if (existsSync(join(temp, candidate)))
					{
						ideDir = temp;
						foundPluginFile = candidate;
						break;
					}
				}

				if (ideDir)
				{
					break;
				}
			}

			if (!ideDir)
			{
				const programsDir = join(homeDir, 'AppData/Local', 'Programs');

				for (let ide of ideMap)
				{
					let temp = join(programsDir, ide.programs);

					if (existsSync(join(temp, pluginCandidates[0])))
					{
						ideDir = temp;
						foundPluginFile = pluginCandidates[0];
						break;
					}

					if (!existsSync(temp))
					{
						continue;
					}

					const dirs = await FastGlob<string>([`${ide.programs}*`], {
						cwd: programsDir,
						onlyFiles: false,
						suppressErrors: true,
					});

					for (let dir of dirs)
					{
						if (dir === ide.programs)
						{
							continue;
						}

						let temp2 = join(programsDir, dir);

						for (let candidate of pluginCandidates)
						{
							if (existsSync(join(temp2, candidate)))
							{
								ideDir = temp2;
								foundPluginFile = candidate;
								break;
							}
						}

						if (ideDir)
						{
							break;
						}
					}

					if (ideDir)
					{
						break;
					}
				}
			}

			if (ideDir && foundPluginFile)
			{
				console.info(`ideDir:`, ideDir);
				console.info(`foundPluginFile:`, foundPluginFile);

				let src = join(ideDir, foundPluginFile);

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
