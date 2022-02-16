#!/usr/bin/env node

import { cliSelectSeries } from '../lib/cli/version-map';
import { cli_logger } from '../lib/cli-progress';
import { downloadPlugin, generateDownloadMessage } from '../lib/util/download-plugin';
import { basename, join } from 'upath2';
import { __plugin_downloaded_dir } from '../lib/const';
import {
	_getVersion,
	_getVersionDownloadBySeries,
	_getVersionInfoBySeries,
	_getVersionInfoByVersion,
	getLatestSeries,
} from '../lib/util/version-map';
import { console, chalkByConsole } from 'debug-color2';
import { pathExists } from 'fs-extra';
import { prompt } from 'enquirer';
import yargs from 'yargs';

export default yargs
	.option('series', {
		alias: ['s'],
		desc: ` IDE 版本系列`,
		string: true,
	})
	.option('force', {
		alias: ['f'],
		desc: ` 忽略已存在下載檔案`,
		boolean: true,
	})
	.parseAsync()
	.then(argv =>
	{
		let { series, force } = argv;
		if (series?.length)
		{
			if (series === 'latest')
			{
				series = getLatestSeries();
			}
			else if (!_getVersion(series)?.length)
			{
				series = void 0
			}
		}

		if (!series?.length)
		{
			return cliSelectSeries()
				.then(result =>
				{
					return {
						...result,
						force,
					}
				})
		}

		return {
			series,
			force,
		}
	})
	.then(async (result) =>
	{
		const { series } = result;
		const link = _getVersionDownloadBySeries(series);
		const info = _getVersionInfoBySeries(series);
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
		else if (bool)
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

		return ret
	})
;

