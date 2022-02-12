import type { IVersionMap } from '../const/version-map';
import { readJSON, readJSONSync} from 'fs-extra';
import { __file_version_map_json } from '../const';

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
