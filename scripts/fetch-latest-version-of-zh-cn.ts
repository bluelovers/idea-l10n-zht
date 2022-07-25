import { outputFile } from 'fs-extra';
import { join } from 'upath2';
import { __root } from '../test/__root';
import fetch from 'cross-fetch';
import { __plugin_zh_cn_id } from '../lib/const/link-of-zh-cn';
import { console } from 'debug-color2';
import Bluebird from 'bluebird';
import type { IVersionApiResult } from '../lib/const/version-map';
import {
	_getVersionDownloadByVersion,
	_getVersionInfoBySeries,
	generateVersionMap,
	getLatestSeries,
} from '../lib/util/version-map';

export default Bluebird.resolve(fetch('https://plugins.jetbrains.com/api/plugins/13710/updates?channel=&size=5'))
	.then((res) =>
	{
		return res.json() as any as IVersionApiResult;
	})
	.then(generateVersionMap)
	.then((data) =>
	{
		const sv = getLatestSeries(data);
		const row = _getVersionInfoBySeries(sv, data);

		const id = row.id.toString();
		const version = row.version.toString();

		if (__plugin_zh_cn_id !== id)
		{
			console.success(`發現新版本 #${id} version: ${version}`);

			const __plugin_zh_cn_download = _getVersionDownloadByVersion(version, data);

			return outputFile(join(__root, 'lib/const/link-of-zh-cn.ts'), `
/**
 * @default '${id}'
 * @deprecated
 */
export const __plugin_zh_cn_id: string = '${id}';

/**
 * @default '${sv}'
 * @deprecated
 */
export const __plugin_zh_cn_series: string = '${sv}';
/**
 * @default '${version}'
 * @deprecated
 */
export const __plugin_zh_cn_version: string = '${version}';

/**
 * @see ${__plugin_zh_cn_download}
 * @deprecated
 */
export const __plugin_zh_cn_download: string = '${__plugin_zh_cn_download}';

`);
		}

		console.gray(`沒有發現新版本`);
	})
	.catch((e) =>
	{
		console.error(`嘗試偵測新版本時發生錯誤`);
		console.error(e);
	})
;
