import { parseArgvDownload } from './parse-argv-download';
import {
	_getVersion,
	_getVersionDownloadByVersion,
	_getVersionInfoBySeries,
	_getVersionInfoByVersion,
	getLatestSeries,
	getLatestVersion,
} from '../util/version-map';
import { prompt } from 'enquirer';
import { chalkByConsole, console } from 'debug-color2';
import { cliSelectSeries, cliSelectVersion } from './version-map';
import { ITSResolvable } from 'ts-type';
import { basename, join } from 'upath2';
import { __plugin_downloaded_dir, EnumVersion } from '../const';
import { copy, pathExists } from 'fs-extra';
import { downloadPlugin, generateDownloadMessage } from '../util/download-plugin';
import { cli_logger } from '../cli-progress';

/**
 * 下載指令的命令列參數型別
 * Type for download command arguments
 */
export type IArgvDownload = Awaited<ReturnType<typeof parseArgvDownload>>;

/**
 * 處理下載指令的命令列參數，解析版本或系列資訊
 * Process download command arguments, resolve version or series information
 *
 * 處理邏輯包含：
 * - 驗證版本/系列是否有效
 * - 在互動模式下提供版本選擇選單
 * - 處理 latest 關鍵字映射
 * - 互斥處理 version 與 series（兩者不能同時存在）
 *
 * Processing logic includes:
 * - Validate version/series existence
 * - Provide version selection menu in interactive mode
 * - Handle 'latest' keyword mapping
 * - Mutually exclusive handling of version and series (cannot coexist)
 *
 * @param argv - 可解析的命令列參數 / Resolvable command-line arguments
 * @returns 包含標準化下載參數的 Promise / Promise containing normalized download parameters
 */
export function _handleArgv(argv: ITSResolvable<IArgvDownload>)
{
	return Promise.resolve(argv)
		.then(async (argv) =>
		{
			let {
				series,
				force,
				version,
				source,
				disableInteractive,
			} = argv;

			console.debug(`disableInteractive: ${disableInteractive}`);

			/**
			 * 處理 version 參數的有效性驗證
			 * Validate the 'version' parameter
			 *
			 * - 'latest' 映射為實際最新版本號
			 * - 若版本號存在對應下載連結則視為有效
			 * - 無效版本在互動模式下清除、非互動模式下拋出錯誤
			 * - 'latest' maps to actual latest version number
			 * - Version is valid if it has a corresponding download link
			 * - Invalid versions are cleared in interactive mode, throw error in non-interactive mode
			 */
			if (version?.length)
			{
				if (version === EnumVersion.latest)
				{
					version = getLatestVersion();
					series = void 0;
				}
				else if (_getVersionDownloadByVersion(version)?.length)
				{
					series = void 0;
				}
				else
				{
					if (disableInteractive)
					{
						throw new RangeError(`目標版本 ${version} 不存在！`)
					}

					version = void 0;
				}
			}

			/**
			 * 處理 series 參數的有效性驗證
			 * Validate the 'series' parameter
			 *
			 * - 'latest' 映射為最新系列，並清除 version（互斥）
			 * - 無效系列在互動模式下清除兩者、非互動模式下拋出錯誤
			 * - 'latest' maps to latest series, clears version (mutually exclusive)
			 * - Invalid series clears both in interactive mode, throws error in non-interactive mode
			 */
			if (series?.length)
			{
				if (series === EnumVersion.latest)
				{
					series = getLatestSeries();
					version = void 0;
				}
				else if (!_getVersion(series)?.length)
				{
					if (disableInteractive)
					{
						throw new RangeError(`目標系列 ${series} 不存在！`)
					}

					series = void 0;
					version = void 0;
				}
			}

			/**
			 * 兩者皆未指定時的互動式選擇流程
			 * Interactive selection flow when neither version nor series is specified
			 *
			 * - 非互動模式下直接報錯
			 * - 互動模式下依序詢問「是否顯示所有版本」與「是否啟用 source 模式」
			 * - 根據 all 選項決定顯示版本選單或系列選單
			 * - Throws error in non-interactive mode
			 * - In interactive mode, asks about showing all versions and enabling source mode
			 * - Shows version menu or series menu based on 'all' option
			 */
			if (!series?.length && !version?.length)
			{
				if (disableInteractive)
				{
					throw new RangeError(`請指定版本或系列！`)
				}

				const all = argv.all ?? await prompt<{
					all: boolean,
				}>({
					name: 'all',
					type: 'confirm',
					message: chalkByConsole((chalk) =>
					{
						return chalk.red(`是否額外顯示非該系列最新版本？`)
					}, console),
				}).then(result =>
				{
					return result.all;
				});

				source = source ?? await prompt<{
					bool: boolean,
				}>({
					name: 'bool',
					type: 'confirm',
					message: chalkByConsole((chalk) =>
					{
						return chalk.red(`下載後作為語言包版本控制模式？`)
					}, console),
				}).then(result =>
				{
					return result.bool;
				});

				return (all ? cliSelectVersion : cliSelectSeries)()
					.then(async (result) =>
					{
						return {
							...result,
							force,
							source,
							disableInteractive,
						}
					})
			}

			return {
				series,
				version,
				force,
				source,
				disableInteractive,
			}
		})
		.then((result: {
			series?: string,
			version?: string,
			force: boolean,
			source: boolean,
			disableInteractive: boolean,
		}) =>
		{
			let {
				series,
				version,
				force,
			} = result;

			/**
			 * 確保 version 與 series 互斥
			 * Ensure version and series are mutually exclusive
			 *
			 * 兩者不能同時存在：優先保留 version，兩者皆有值時清除 series
			 * Both cannot coexist: version takes priority, series is cleared when both have values
			 */
			if (version?.length)
			{
				series = void 0;
			}
			else
			{
				version = void 0;
			}

			if (!series?.length)
			{
				series = void 0;
			}
			else
			{
				version = void 0;
			}

			return {
				/** 確保互斥後的版本系列 / Version series after mutual exclusion enforcement */
				...result,
				series,
				version,
				force,
			}
		})
}

/**
 * 根據解析後的參數執行實際下載操作
 * Execute actual download based on resolved parameters
 *
 * 處理步驟：
 * 1. 根據版本或系列取得版本資訊與下載連結
 * 2. 檢查目標檔案是否已存在，處理 force 選項或互動式確認
 * 3. 下載語言包 ZIP 檔案
 * 4. 若啟用 source 模式，複製為 zh.zip 作為版本控制用
 *
 * Processing steps:
 * 1. Get version info and download URL from version or series
 * 2. Check if target file exists, handle force option or interactive confirmation
 * 3. Download language pack ZIP file
 * 4. If source mode enabled, copy to zh.zip for version control
 *
 * @param argv - 可解析的標準化下載參數 / Resolvable normalized download parameters
 * @returns 包含下載結果資訊的 Promise / Promise containing download result information
 */
export function _handleArgvResult(argv: ITSResolvable<Awaited<ReturnType<typeof _handleArgv>>>)
{
	return Promise.resolve(argv)
		.then(async (result) =>
		{
			const {
				series,
				version,
			} = result;

			/** 根據版本或系列取得版本詳細資訊 / Get version detail info from version or series */
			const info = version?.length ? _getVersionInfoByVersion(version) : _getVersionInfoBySeries(series);

			/** 取得對應版本的下載連結 / Get download URL for the corresponding version */
			const link = _getVersionDownloadByVersion(info.version);

			/** 組合下載檔案的完整路徑 / Construct full path for the download file */
			const file = join(__plugin_downloaded_dir, `zh-${info.version}.zip`);

			const ret = {
				series,
				version: info.version,
				link,
				info,
				file,
			};

			/**
			 * 檢查檔案是否已存在，並根據 force 與互動模式決定是否重新下載
			 * Check if file already exists and decide whether to re-download based on force and interactive mode
			 *
			 * - force 為 true：忽略已存在檔案，強制下載
			 * - 檔案存在且非互動模式：預設不覆蓋
			 * - 檔案存在且互動模式：詢問使用者是否強制下載
			 * - force=true: ignore existing file, force download
			 * - File exists and non-interactive: default to not overwrite
			 * - File exists and interactive: ask user whether to force download
			 */
			let bool = await pathExists(file);

			if (bool && typeof result.force === 'boolean')
			{
				bool = !result.force;
				console.warn(chalkByConsole((chalk) =>
				{
					return `檔案 ${chalk.cyan(basename(file))} 已經存在，但將強制下載`
				}, console))
			}
			else if (bool && !result.disableInteractive)
			{
				await prompt<{
					force: boolean,
				}>({
					name: 'force',
					type: 'confirm',
					message: chalkByConsole((chalk) =>
					{
						return chalk.red(`檔案 ${chalk.cyan(basename(file))} 已經存在，是否強制下載？`)
					}, console),
				}).then(result =>
				{
					bool = !result.force;
				});
			}

			/** 產生下載訊息，顯示下載內容摘要 / Generate download message showing download summary */
			const msg = generateDownloadMessage(info, !bool);

			/**
			 * 檔案已存在且不需下載時僅顯示訊息，否則執行下載
			 * If file exists and no download needed, show message only; otherwise execute download
			 */
			if (bool)
			{
				console.log(msg);
			}
			else
			{
				console.info(link);

				await cli_logger(downloadPlugin(link, file, true), msg)
			}

			let name: string;

			/**
			 * source 模式：將下載的語言包複製為 zh.zip
			 * Source mode: copy downloaded language pack as zh.zip
			 *
			 * 用於語言包版本控制流程，方便後續建構時作為基準檔案
			 * Used in language pack version control workflow as a baseline file for subsequent builds
			 */
			if (result.source)
			{
				name = 'zh';

				let target = join(__plugin_downloaded_dir, `${name}.zip`);

				console.warn(chalkByConsole((chalk) =>
				{
					return `複製 ${chalk.cyan(basename(file))} => ${chalk.cyan(basename(target))}`
				}, console))

				await copy(ret.file, target, {
					overwrite: true,
					errorOnExist: false,
					preserveTimestamps: true,
					dereference: true,
				})
			}

			return {
				...ret,
				name,
			}
		})
}
