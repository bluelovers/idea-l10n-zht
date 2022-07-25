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

export type IArgvDownload = Awaited<ReturnType<typeof parseArgvDownload>>;

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
				...result,
				series,
				version,
				force,
			}
		})
}

export function _handleArgvResult(argv: ITSResolvable<Awaited<ReturnType<typeof _handleArgv>>>)
{
	return Promise.resolve(argv)
		.then(async (result) =>
		{
			const {
				series,
				version,
			} = result;

			const info = version?.length ? _getVersionInfoByVersion(version) : _getVersionInfoBySeries(series);

			const link = _getVersionDownloadByVersion(info.version);

			const file = join(__plugin_downloaded_dir, `zh-${info.version}.zip`);

			const ret = {
				series,
				version: info.version,
				link,
				info,
				file,
			};

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

			const msg = generateDownloadMessage(info, !bool);

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
