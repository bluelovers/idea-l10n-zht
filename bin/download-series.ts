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
} from '../lib/util/version-map';
import { console, chalkByConsole } from 'debug-color2';
import { pathExists } from 'fs-extra';
import { prompt } from 'enquirer';

export default cliSelectSeries()
	.then(async (result) =>
	{
		const series = result.series;
		const link = _getVersionDownloadBySeries(series);
		const info = _getVersionInfoBySeries(series);

		const file = join(__plugin_downloaded_dir, `zh-${info.version}.zip`);

		let bool = await pathExists(file);

		if (bool)
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
			return
		}

		console.info(link);

		return cli_logger(downloadPlugin(link, file, true), msg)
	})
;
