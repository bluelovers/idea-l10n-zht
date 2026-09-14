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

/**
 * 模組級快取的版本對照表，避免重複讀取檔案
 * Module-level cached version map, avoiding repeated file reads
 */
let versionMap: IVersionMap;

/**
 * 同步讀取版本對照表 JSON 檔案
 * Synchronously read version map JSON file
 * @param file - 檔案路徑（預設使用 __file_version_map_json） / File path (defaults to __file_version_map_json)
 * @returns 版本對照表物件 / Version map object
 */
export function _loadVersionMapSync(file?: string): IVersionMap
{
	return readJSONSync(file ?? __file_version_map_json)
}

/**
 * 非同步讀取版本對照表 JSON 檔案
 * Asynchronously read version map JSON file
 * @param file - 檔案路徑（預設使用 __file_version_map_json） / File path (defaults to __file_version_map_json)
 * @returns 版本對照表 Promise / Promise of version map object
 */
export function _loadVersionMapAsync(file?: string): Promise<IVersionMap>
{
	return readJSON(file ?? __file_version_map_json)
}

/**
 * 合併多個版本對照表（深層合併）
 * Merge multiple version maps (deep merge)
 * @param maps - 至少兩個版本對照表 / At least two version maps
 * @returns 合併後的版本對照表 / Merged version map
 */
export function _mergeVersionMap(...maps: [IVersionMap, IVersionMap, ...IVersionMap[]]): IVersionMap
{
	return defaultsDeep(...maps)
}

/**
 * 取得快取的版本對照表（若未載入則同步載入）
 * Get cached version map (synchronously load if not loaded yet)
 * @returns 版本對照表物件 / Version map object
 */
export function _versionMap(): IVersionMap
{
	return versionMap ??= _loadVersionMapSync()
}

/**
 * 取得所有可用的版本號列表
 * Get list of all available version numbers
 * @param data - 版本對照表（可選，預設為快取版本） / Version map (optional, defaults to cached)
 * @returns 版本號陣列 / Array of version numbers
 */
export function _getAllVersions(data?: IVersionMap)
{
	data ??= _versionMap();
	return Object.keys(data.version_download_map)
}

/**
 * 取得所有系列版本號（如 "2024"、"2023" 等主版本）
 * Get all series version numbers (e.g. "2024", "2023" etc. major versions)
 * @param data - 版本對照表 / Version map
 * @returns 系列版本號陣列 / Array of series version numbers
 */
export function _getSeries(data?: IVersionMap)
{
	data ??= _versionMap();
	return data.series
}

/**
 * 取得最新的系列版本號
 * Get the latest series version number
 * @param data - 版本對照表 / Version map
 * @returns 最新的系列版本號 / Latest series version number
 */
export function getLatestSeries(data?: IVersionMap)
{
	return _getSeries(data)[0]
}

/**
 * 取得最新系列的完整版本號
 * Get the full version number of the latest series
 * @param data - 版本對照表 / Version map
 * @returns 最新完整版本號 / Latest full version number
 */
export function getLatestVersion(data?: IVersionMap)
{
	data ??= _versionMap();
	return _getVersion(getLatestSeries(data), data)
}

/**
 * 從版本字串中提取系列號（取第一個段落，如 "2024.3" -> "2024"）
 * Extract series number from version string (takes first segment, e.g. "2024.3" -> "2024")
 * @param versionOrSeries - 版本字串或系列號 / Version string or series number
 * @returns 系列號字串 / Series number string
 */
export function _getSeriesFromVersionString(versionOrSeries: string)
{
	return versionOrSeries.split('.')[0]
}

/**
 * 判斷輸入值是否為系列號（不含點號分隔符）
 * Determine if input is a series number (without dot separator)
 * @param versionOrSeries - 版本字串或系列號 / Version string or series number
 * @returns 是否為系列號 / Whether it is a series number
 */
export function _isSeries(versionOrSeries: string)
{
	return versionOrSeries === _getSeriesFromVersionString(versionOrSeries)
}

/**
 * 根據系列號取得該系列的最新版本號
 * Get the latest version number for a given series
 * @param series - 系列號 / Series number
 * @param data - 版本對照表 / Version map
 * @returns 該系列的最新版本號 / Latest version number for the series
 */
export function _getVersion(series: string, data?: IVersionMap)
{
	data ??= _versionMap();
	return data.series_latest_map[_getSeriesFromVersionString(series)]
}

/**
 * 取得最新版本的詳細資訊
 * Get detailed info for the latest version
 * @param data - 版本對照表 / Version map
 * @returns 版本詳細資訊 / Version details
 */
export function getVersionLatestInfo(data?: IVersionMap)
{
	data ??= _versionMap();
	return _getVersionInfoByVersion(getLatestVersion(data), data)
}

/**
 * 根據版本號取得版本詳細資訊
 * Get version details by version number
 * @param version - 完整版本號 / Full version number
 * @param data - 版本對照表 / Version map
 * @returns 版本詳細資訊 / Version details
 */
export function _getVersionInfoByVersion(version: string, data?: IVersionMap)
{
	data ??= _versionMap();
	return data.version_map_record[version]
}

/**
 * 根據系列號取得該系列最新版本的詳細資訊
 * Get detailed info for the latest version of a series
 * @param series - 系列號 / Series number
 * @param data - 版本對照表 / Version map
 * @returns 版本詳細資訊 / Version details
 */
export function _getVersionInfoBySeries(series: string, data?: IVersionMap)
{
	data ??= _versionMap();
	return _getVersionInfoByVersion(_getVersion(series, data), data)
}

/**
 * 取得最新系列版本的下載連結
 * Get download URL for the latest series version
 * @param data - 版本對照表 / Version map
 * @returns 下載連結字串 / Download URL string
 */
export function getVersionLatestDownload(data?: IVersionMap)
{
	data ??= _versionMap();
	return _getVersionDownloadByVersion(getLatestSeries(data), data)
}

/**
 * 根據版本號取得下載連結
 * Get download URL by version number
 * @param version - 完整版本號 / Full version number
 * @param data - 版本對照表 / Version map
 * @returns 下載連結字串 / Download URL string
 */
export function _getVersionDownloadByVersion(version: string, data?: IVersionMap)
{
	data ??= _versionMap();
	return data.version_download_map[version]
}

/**
 * 根據系列號取得該系列最新版本的下載連結
 * Get download URL for the latest version of a series
 * @param series - 系列號 / Series number
 * @param data - 版本對照表 / Version map
 * @returns 下載連結字串 / Download URL string
 */
export function _getVersionDownloadBySeries(series: string, data?: IVersionMap)
{
	data ??= _versionMap();
	return _getVersionDownloadByVersion(_getVersion(series, data), data)
}

/**
 * 根據 JetBrains 插件市場的 updateId 產生下載連結
 * Generate download URL from JetBrains plugin marketplace updateId
 * @example
 * generateDownloadLink(156292)
 * // => https://plugins.jetbrains.com/plugin/download?rel=true&updateId=156292
 * @param id - 插件更新識別碼 / Plugin update identifier
 * @returns 下載連結字串 / Download URL string
 */
export function generateDownloadLink(id: string | number)
{
	return `https://plugins.jetbrains.com/plugin/download?rel=true&updateId=${id}`
}

/**
 * 初始化版本對照表物件，確保所有必要欄位存在
 * Initialize version map object, ensuring all required fields exist
 * @param map - 待初始化的對照表物件 / Map object to initialize
 * @returns 初始化後的對照表 / Initialized map
 */
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

/**
 * 根據 API 回傳的版本資料產生完整的版本對照表，並寫入 JSON 檔案
 * Generate complete version map from API version data and write to JSON file
 * @param data - 從 JetBrains 插件 API 取得的版本資料 / Version data from JetBrains plugin API
 * @returns 產生的完整版本對照表 / Generated complete version map
 */
export async function generateVersionMap(data: IVersionApiResult)
{
	const oldMap: IVersionMap = await _loadVersionMapAsync()
		.catch(() => void 0)
		.then(_initVersionMap)
	;

	/**
	 * 合併新版與舊版資料並去重，確保資料來源完整
	 * Merge new and old data with deduplication, ensuring complete data source
	 */
	const _version_map_list2: IVersionApiResult = array_unique_overwrite(data.concat(Object.values(oldMap.version_map_record))).map(_handleVersionApiResultRow);

	/**
	 * 以版本號為 key 建立版本記錄對照表
	 * Build version record lookup table with version number as key
	 */
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

	/**
	 * 依序遍歷所有版本號，找出每個系列的最新版本並產生下載連結
	 * Iterate all version numbers in order, find the latest version for each series and generate download links
	 */
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

	/**
	 * 重建版本記錄，只保留每個系列的最新版本記錄，並從 extra 中移除
	 * Rebuild version records, keeping only the latest version record per series, removing from extra
	 */
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

	/**
	 * 精簡非最新版本的記錄，只保留必要的 id、version、cdate、since 欄位
	 * Trim non-latest version records, keeping only essential id, version, cdate, since fields
	 */
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

/**
 * 處理單筆 API 版本結果資料，排序相容版本並移除下載欄位
 * Process single API version result row, sorting compatible versions and removing downloads field
 * @param row - API 版本結果列 / API version result row
 * @returns 處理後的版本結果列 / Processed version result row
 */
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

/**
 * 將日期字串或時間戳轉為 moment 物件
 * Convert date string or timestamp to moment object
 * @param cdate - 建立日期（字串或時間戳） / Creation date (string or timestamp)
 * @returns moment 物件 / moment object
 */
export function _infoDateToMoment(cdate: string | number)
{
	return moment(+cdate)
}

/**
 * 將日期字串或時間戳轉為格式化的日期字串
 * Convert date string or timestamp to formatted date string
 * @param cdate - 建立日期（字串或時間戳） / Creation date (string or timestamp)
 * @returns 格式化的日期字串 / Formatted date string
 */
export function _infoDateToString(cdate: string | number)
{
	return _infoDateToMoment(cdate).format()
}
