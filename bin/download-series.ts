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

cliSelectSeries()
	.then((result) =>
	{
		const series = result.series;
		const link = _getVersionDownloadBySeries(series);
		const info = _getVersionInfoBySeries(series);

		console.info(link);

		return cli_logger(downloadPlugin(link, join(__plugin_downloaded_dir, `zh-${info.version}.zip`)), generateDownloadMessage(info))
	})
;
