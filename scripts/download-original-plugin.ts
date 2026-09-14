/**
 * 下載原始簡體中文插件
 * Download the original simplified Chinese plugin
 *
 * 根據分支資訊決定下載策略：
 * - master 分支：2024 版之後 JetBrains 不再更新獨立版語言包，
 *   需從本地已安裝的 IDE 中提取內建的語言包 JAR
 * - 其他分支：使用 internalDownload 直接從市集下載
 *
 * Download strategy based on branch info:
 * - master branch: After 2024, JetBrains stopped updating standalone language packs,
 *   so the built-in language pack JAR must be extracted from locally installed IDEs
 * - Other branches: Download directly from the marketplace using internalDownload
 */
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

		/**
		 * master 分支且無 series 資訊時：從本地 IDE 提取內建語言包
		 * On master branch without series info: extract built-in language pack from local IDE
		 */
		if (isMasterBranch && !series)
		{
			console.warn(`於 2024 版之後，JetBrains 不再更新獨立版語言包，改為內建語言包，所以需要手動提取語言包`);

			const cwd = join(__plugin_downloaded_dir, 'series');

			let homeDir = homedir();
			let ideDir: string;
			let foundPluginFile: string | undefined;

			const jetBrainsDir = join(homeDir, 'AppData/Local', 'JetBrains');
			const toolboxDir = join(jetBrainsDir, 'Toolbox');

			/**
			 * 語言包 JAR 在 IDE 安裝目錄中的相對路徑候選
			 * Relative path candidates for the language pack JAR in the IDE installation directory
			 */
			const pluginCandidates = [
				join('plugins/localization-zh/lib', 'localization-zh.jar'),
			];

			/**
			 * JetBrains IDE 對照表：Toolbox 安裝路徑、基礎目錄名、 Programs 安裝路徑
			 * JetBrains IDE mapping: Toolbox install path, base directory name, Programs install path
			 */
			const ideMap = [
				{ toolbox: 'IntelliJ IDEA Ultimate', base: 'IntelliJIdea', programs: 'IntelliJ IDEA' },
				{ toolbox: 'WebStorm', base: 'WebStorm', programs: 'WebStorm' },
				{ toolbox: 'PyCharm Professional', base: 'PyCharm', programs: 'PyCharm' },
			];

			/**
			 * 第一輪搜尋：在 JetBrains Toolbox 安裝目錄中查找語言包
			 * First search: look for language pack in JetBrains Toolbox install directories
			 */
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

			/**
			 * 第二輪搜尋：在 Programs 目錄中查找（包含版本後綴的目錄）
			 * Second search: look in Programs directories (including version-suffixed directories)
			 */
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

					/** 搜尋可能帶有版本後綴的目錄（如 WebStorm-2024.1）/ Search for directories with version suffixes (e.g. WebStorm-2024.1) */
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

			/**
			 * 找到語言包後，讀取其 plugin.xml 取得版本號並複製到工作目錄
			 * After finding the language pack, read its plugin.xml to get the version and copy to working directory
			 */
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

			/**
			 * 取得最新版本的 JAR 檔案並重新打包為 ZIP
			 * Get the latest version JAR file and repackage as ZIP
			 *
			 * 固定 ZIP 日期為 2022-01-01 以確保構建可重複（避免因日期差異導致 hash 不同）
			 * Fix ZIP date to 2022-01-01 for reproducible builds (avoid hash differences caused by date)
			 */
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
