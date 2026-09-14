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
import { __plugin_downloaded_dir, __plugin_other_plugins_dir } from '../lib/const';
import JSZip from 'jszip';
import { copySync, outputFile, readFile } from 'fs-extra';
import { fixedJSZipDate } from 'jszip-fixed-date';
import { chalkByConsole, console } from 'debug-color2';
import { searchIdePluginFile } from '../lib/util/ide-search';
import { readPluginInfoFromZip, copyPluginZipAndExtractFile } from '../lib/util/zip';

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

			/**
			 * 使用共用搜尋函式在 IDE 安裝目錄中查找語言包
			 * Use shared search function to find language pack in IDE installation directories
			 *
			 * 搜尋策略（三階段）：
			 * 1. JetBrains Toolbox 安裝目錄
			 * 2. Programs 基礎目錄
			 * 3. Programs 版本目錄（如 WebStorm2026.2）
			 *
			 * Search strategy (three phases):
			 * 1. JetBrains Toolbox installation directories
			 * 2. Programs base directories
			 * 3. Programs versioned directories (e.g., WebStorm2026.2)
			 */
			const langPackSearchResult = await searchIdePluginFile(
				join('plugins/localization-zh/lib', 'localization-zh.jar'),
			);

			/**
			 * 找到語言包後，讀取其 plugin.xml 取得版本號並複製到工作目錄
			 * After finding the language pack, read its plugin.xml to get the version and copy to working directory
			 */
			if (langPackSearchResult)
			{
				const { ideDir, pluginFilePath } = langPackSearchResult;

				console.info(`ideDir:`, ideDir);
				console.info(`foundPluginFile:`, pluginFilePath);

				const src = join(ideDir, pluginFilePath);

				/** 從 ZIP 中讀取插件版本資訊 / Read plugin version info from ZIP */
				const info = await readPluginInfoFromZip(src);

				copySync(src, join(cwd, `localization-zh-${info.version}.jar`))
			}

			/**
			 * 使用四階段搜尋邏輯找 ml-llm.zip，提取 ml-llm.jar 到 other-plugins 目錄
			 * Use the four-phase search logic to find ml-llm.zip, extract ml-llm.jar to other-plugins directory
			 *
			 * 設計邏輯：
			 * - 與語言包共用相同的搜尋邏輯（searchIdePluginFile），
			 *   只是目標相對路徑不同（plugins/ml-llm.zip）
			 * - ml-llm.zip 位於 JetBrains 共用目錄的 plugins/ 下（如 WebStorm2026.2/plugins/），
			 *   由搜尋函式的第四階段命中
			 *
			 * Design logic:
			 * - Shares the same search logic as the language pack (searchIdePluginFile),
			 *   only the target relative path differs (plugins/ml-llm.zip)
			 * - ml-llm.zip is under the JetBrains shared directory's plugins/ (e.g., WebStorm2026.2/plugins/),
			 *   found by Phase 4 of the search function
			 */
			const mlLlmSearchResult = await searchIdePluginFile(
				'plugins/ml-llm.zip',
				{
					searchJetBrainsDir: true,
				},
			);

			if (mlLlmSearchResult)
			{
				await copyPluginZipAndExtractFile(
					join(mlLlmSearchResult.ideDir, mlLlmSearchResult.pluginFilePath),
					join(__plugin_downloaded_dir, 'ml-llm.zip'),
					'ml-llm/lib/ml-llm.jar',
					join(__plugin_other_plugins_dir, 'ml-llm.jar'),
				);
			}
			else
			{
				console.warn(`未找到 ml-llm.zip，已跳過 ml-llm 插件提取`);
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
						// @ts-ignore
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
