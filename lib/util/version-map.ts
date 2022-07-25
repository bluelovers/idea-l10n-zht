import type { IVersionMap } from '../const/version-map';
import { outputJSON, readJSON, readJSONSync } from 'fs-extra';
import { __file_version_map_json } from '../const';
import { IVersionApiResult, IVersionApiResultRow } from '../const/version-map';
import { array_unique_overwrite } from 'array-hyper-unique';
import { maxSatisfying } from 'semver';
import { createNew } from '@bluelovers/string-natural-compare';
import { sortObjectKeys } from 'sort-object-keys2';
import { defaultsDeep } from 'lodash';
import moment from 'moment';

let versionMap: IVersionMap;

export function _loadVersionMapSync(file?: string): IVersionMap
{
	return readJSONSync(file ?? __file_version_map_json)
}

export function _loadVersionMapAsync(file?: string): Promise<IVersionMap>
{
	return readJSON(file ?? __file_version_map_json)
}

export function _mergeVersionMap(...maps: [IVersionMap, IVersionMap, ...IVersionMap[]]): IVersionMap
{
	return defaultsDeep(...maps)
}

export function _versionMap(): IVersionMap
{
	return versionMap ??= _loadVersionMapSync()
}

export function _getAllVersions(data?: IVersionMap)
{
	data ??= _versionMap();
	return Object.keys(data.version_download_map)
}

export function _getSeries(data?: IVersionMap)
{
	data ??= _versionMap();
	return data.series
}

export function getLatestSeries(data?: IVersionMap)
{
	return _getSeries(data)[0]
}

export function getLatestVersion(data?: IVersionMap)
{
	data ??= _versionMap();
	return _getVersion(getLatestSeries(data), data)
}

export function _getSeriesFromVersionString(versionOrSeries: string)
{
	return versionOrSeries.split('.')[0]
}

export function _isSeries(versionOrSeries: string)
{
	return versionOrSeries === _getSeriesFromVersionString(versionOrSeries)
}

export function _getVersion(series: string, data?: IVersionMap)
{
	data ??= _versionMap();
	return data.series_latest_map[_getSeriesFromVersionString(series)]
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

export function _getVersionDownloadBySeries(series: string, data?: IVersionMap)
{
	data ??= _versionMap();
	return _getVersionDownloadByVersion(_getVersion(series, data), data)
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

export function _initVersionMap<T extends IVersionMap>(map: T)
{
	// @ts-ignore
	map ??= {} as IVersionMap;

	map.version_map_record ??= {};
	map.version_download_map ??= {};
	map.series ??= [];
	map.series_latest_map ??= {};

	return map
}

export async function generateVersionMap(data: IVersionApiResult)
{
	const oldMap: IVersionMap = await _loadVersionMapAsync()
		.catch(() => void 0)
		.then(_initVersionMap)
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

	const version_map_record_extra = version_map_record;
	const version_download_map: IVersionMap["version_download_map"] = {};

	let series_latest_map = Object.keys(version_map_record)
		.sort(_myNaturalCompare)
		.reduce((series_latest_map, v) =>
		{
			const sv = _getSeriesFromVersionString(v);

			const version = series_latest_map[sv] = maxSatisfying([
					v + '.0',
					(series_latest_map[sv] ?? v) + '.0',
				], `*`, {
					loose: true,
				})
					.replace(/\.0$/, '')
			;

			series_latest_map[sv] = version;

			version_download_map[v] = generateDownloadLink(version_map_record[v].id);

			return series_latest_map
		}, {} as IVersionMap["series_latest_map"]);

	const series: IVersionMap["series"] = Object.keys(series_latest_map)
		.sort(_myNaturalCompare)
	;

	version_map_record = series
		.reduce((a, sv) =>
		{

			const version = series_latest_map[sv];

			const row = version_map_record[version];

			a[version] = row;

			delete version_map_record_extra[version];

			return a
		}, {} as IVersionMap["version_map_record"])
	;

	Object.keys(version_map_record_extra)
		.forEach(version =>
		{

			const {
				id,
				cdate,
				since,
			} = version_map_record_extra[version];

			version_map_record_extra[version] = {
				id,
				version,
				cdate,
				since,
			} as any;

			version_map_record[version] ??= version_map_record_extra[version];

		})
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
	row.compatibleVersions && sortObjectKeys(row.compatibleVersions, {
		useSource: true,
		keys: [
			"IDEA",
			"IDEA_COMMUNITY",
			"IDEA_EDUCATIONAL",
		]
	});

	delete row.downloads;

	return row;
}

export function _infoDateToMoment(cdate: string | number)
{
	return moment(+cdate)
}

export function _infoDateToString(cdate: string | number)
{
	return _infoDateToMoment(cdate).format()
}
