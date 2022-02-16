#!/usr/bin/env node

import { cliSelectSeries } from '../lib/cli/version-map';
import { cli_logger } from '../lib/cli-progress';
import { downloadPlugin, generateDownloadMessage } from '../lib/util/download-plugin';
import { join } from 'upath2';
import { __plugin_downloaded_dir } from '../lib/const';
import {
	_getVersion,
	_getVersionDownloadBySeries,
	_getVersionInfoBySeries,
	_getVersionInfoByVersion,
} from '../lib/util/version-map';
import { console, chalkByConsole } from 'debug-color2';
import { pathExists } from 'fs-extra';

cliSelectSeries()
	.then(async (result) =>
	{
		const series = result.series;
		const link = _getVersionDownloadBySeries(series);
		const info = _getVersionInfoBySeries(series);

		const file = join(__plugin_downloaded_dir, `zh-${info.version}.zip`);

		const bool = await pathExists(file);
		const msg = generateDownloadMessage(info, !bool);

		if (bool)
		{
			console.warn(`檔案已經存在，忽略下載`);
			console.log(msg);
			return
		}

		console.info(link);

		return cli_logger(downloadPlugin(link, file), msg)
	})
;
