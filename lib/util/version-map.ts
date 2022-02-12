import type { IVersionMap } from '../const/version-map';
import { outputJSON, readJSON, readJSONSync } from 'fs-extra';
import { __file_version_map_json } from '../const';
import { IVersionApiResult, IVersionApiResultRow } from '../const/version-map';
import { array_unique_overwrite } from 'array-hyper-unique';
import { maxSatisfying } from 'semver';
import { createNew } from '@bluelovers/string-natural-compare';
import { sortObjectKeys } from 'sort-object-keys2';

let versionMap: IVersionMap;

export function _loadVersionMapSync(): IVersionMap
{
	return readJSONSync(__file_version_map_json)
}

export function _loadVersionMapAsync(): Promise<IVersionMap>
{
	return readJSON(__file_version_map_json)
}

export function _versionMap(): IVersionMap
{
	return versionMap ??= _loadVersionMapSync()
}

export function getLatestSeries(data?: IVersionMap)
{
	data ??= _versionMap();
	return data.series[0]
}

export function getLatestVersion(data?: IVersionMap)
{
	data ??= _versionMap();
	return _getVersion(getLatestSeries(data), data)
}

export function _getVersion(series: string, data?: IVersionMap)
{
	data ??= _versionMap();
	return data.series_latest_map[series]
}

export function getVersionLatestInfo(data?: IVersionMap)
{
	data ??= _versionMap();
	return _getVersionInfoByVersion(getLatestVersion(data), data)
}

export function _getVersionInfoByVersion(version: string, data?: IVersionMap)
{
	data ??= _versionMap();
	return data.version_map_record[version]
}

export function _getVersionInfoBySeries(series: string, data?: IVersionMap)
{
	data ??= _versionMap();
	return _getVersionInfoByVersion(_getVersion(series, data), data)
}

export function getVersionLatestDownload(data?: IVersionMap)
{
	data ??= _versionMap();
	return _getVersionDownloadByVersion(getLatestSeries(data), data)
}

export function _getVersionDownloadByVersion(version: string, data?: IVersionMap)
{
	data ??= _versionMap();
	return data.version_download_map[version]
}

/**
 * @example
 * generateDownloadLink(156292)
 * // => https://plugins.jetbrains.com/plugin/download?rel=true&updateId=156292
 */
export function generateDownloadLink(id: string | number)
{
	return `https://plugins.jetbrains.com/plugin/download?rel=true&updateId=${id}`
}

export async function generateVersionMap(data: IVersionApiResult)
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

	const _version_map_list2: IVersionApiResult = array_unique_overwrite(data.concat(Object.values(oldMap.version_map_record))).map(_handleVersionApiResultRow);

	let version_map_record = _version_map_list2.reduce((a, row) =>
	{

		a[row.version] ??= row;

		return a
	}, {} as IVersionMap["version_map_record"]);

	const _myNaturalCompare = createNew({
		desc: true,
	});

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
}

export function _handleVersionApiResultRow(row: IVersionApiResultRow)
{
	sortObjectKeys(row.compatibleVersions, {
		useSource: true,
		keys: [
			"IDEA",
			"IDEA_COMMUNITY",
			"IDEA_EDUCATIONAL",
		]
	});

	return row;
}
