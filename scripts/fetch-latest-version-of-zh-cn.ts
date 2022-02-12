import { outputFile, outputJSON, readJSON } from 'fs-extra';
import { join } from 'upath2';
import { __root } from '../test/__root';
import fetch from 'cross-fetch';
import { __plugin_zh_cn_id } from '../lib/const/link-of-zh-cn';
import { console } from 'debug-color2';
import Bluebird from 'bluebird';
import { __file_version_map_json } from '../lib/const';
import { array_unique_overwrite } from 'array-hyper-unique';
import type { IVersionApiResult, IVersionMap } from '../lib/const/version-map';
import { maxSatisfying } from 'semver';
import { naturalCompare, createNew } from '@bluelovers/string-natural-compare';
import {
	_getVersionDownloadByVersion, _getVersionInfoBySeries,
	_getVersionInfoByVersion,
	_loadVersionMapAsync, generateDownloadLink,
	getLatestSeries,
} from '../lib/util/version-map';

const _myNaturalCompare = createNew({
	desc: true,
})

export default Bluebird.resolve(fetch('https://plugins.jetbrains.com/api/plugins/13710/updates?channel=&size=5'))
	.then((res) =>
	{
		return res.json() as any as IVersionApiResult;
	})
	.then(async (data) =>
	{

		const oldMap: IVersionMap = await _loadVersionMapAsync()
			.catch(() => void 0)
			.then((map: IVersionMap) =>
			{
				// @ts-ignore
				map ??= {} as IVersionMap;
				map.version_map_record ??= {};
				map.version_download_map ??= {};
				map.series ??= [];
				map.series_latest_map ??= {};

				return map
			})
		;

		const _version_map_list2: IVersionApiResult = array_unique_overwrite(data.concat(Object.values(oldMap.version_map_record)));

		let version_map_record = _version_map_list2.reduce((a, row) =>
		{

			a[row.version] ??= row;

			return a
		}, {} as IVersionMap["version_map_record"]);

		let series_latest_map = Object.keys(version_map_record)
			.sort(_myNaturalCompare)
			.reduce((series_latest_map, v) =>
			{

				const sv = v.split('.')[0];

				const version = series_latest_map[sv] = maxSatisfying([
						v + '.0',
						(series_latest_map[sv] ?? v) + '.0',
					], `*`, {
						loose: true,
					})
						.replace(/\.0$/, '')
				;

				series_latest_map[sv] = version;

				return series_latest_map
			}, {} as IVersionMap["series_latest_map"]);

		const series: IVersionMap["series"] = Object.keys(series_latest_map)
			.sort(_myNaturalCompare)
		;

		const version_download_map: IVersionMap["version_download_map"] = {};

		version_map_record = series
			.reduce((a, sv) =>
			{

				const version = series_latest_map[sv];

				const row = version_map_record[version];

				version_download_map[row.version] = generateDownloadLink(row.id);

				a[version] = row;

				return a
			}, {} as IVersionMap["version_map_record"])
		;

		const record: IVersionMap = {
			version_map_record,
			version_download_map,
			series,
			series_latest_map,
		};

		await outputJSON(__file_version_map_json, record, {
			spaces: 2,
		});

		return record
	})
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
 */
export const __plugin_zh_cn_id: string = '${id}';

/**
 * @default '${sv}'
 */
export const __plugin_zh_cn_series: string = '${sv}';
/**
 * @default '${version}'
 */
export const __plugin_zh_cn_version: string = '${version}';

/**
 * @see ${__plugin_zh_cn_download}
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
