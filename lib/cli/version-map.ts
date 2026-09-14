import { prompt } from 'enquirer';
import {
	_getAllVersions,
	_getSeries,
	_getVersion,
	_getVersionInfoByVersion,
	_infoDateToString,
} from '../util/version-map';
import moment from 'moment';
import { console, chalkByConsole } from 'debug-color2';

/**
 * 將版本資訊轉換為 CLI 選項列格式
 * Convert version info to CLI select option row format
 *
 * 在選單中顯示版本號及對應的建立日期，方便使用者辨識
 * Displays version number and corresponding build date in menu for user identification
 *
 * @param value - 版本系列名稱或版本號 / Version series name or version number
 * @param version - 可選的具體版本號，若未提供則使用 value / Optional specific version number, uses value if not provided
 * @returns CLI 選項物件，包含名稱與提示 / CLI option object with name and hint
 */
function _handleVersionRow(value: string, version?: string)
{
	/** 若未指定版本，使用 value 作為預設值 / Use value as default if version not specified */
	version ??= value;

	const info = _getVersionInfoByVersion(version);

	/** 以灰色樣式格式化建立日期 / Format build date in gray style */
	const date = chalkByConsole((chalk) =>
	{
		return chalk.gray(_infoDateToString(info.cdate))
	});

	return {
		/** 版本系列名稱，作為選項顯示文字 / Version series name, used as option display text */
		name: value,
		/** 提示文字，顯示版本號與日期 / Hint text showing version number and date */
		hint: `( ${version} ) ${date}`,
	}
}

/**
 * 提供使用者互動式選擇 IDE 版本
 * Interactive prompt for user to select an IDE version
 *
 * 顯示所有可用版本的選單，使用者可點選其中一個
 * Shows a menu of all available versions for user selection
 *
 * @returns 包含所選版本系列的 Promise / Promise containing selected version series
 */
export function cliSelectVersion()
{
	return prompt<{
		series: string,
	}>({
		name: 'version',
		type: 'select',
		message: '請選擇 IDE 版本：',
		choices: _getAllVersions().map(version =>
		{
			return _handleVersionRow(version)
		}),
	})
}

/**
 * 提供使用者互動式選擇 IDE 版本系列
 * Interactive prompt for user to select an IDE version series
 *
 * 顯示所有可用版本系列的選單，每個系列顯示其最新版本的資訊
 * Shows a menu of all available version series, each displaying latest version info
 *
 * @returns 包含所選版本系列的 Promise / Promise containing selected version series
 */
export function cliSelectSeries()
{
	return prompt<{
		series: string,
	}>({
		name: 'series',
		type: 'select',
		message: '請選擇 IDE 版本系列：',
		choices: _getSeries().map(value =>
		{
			const version = _getVersion(value);

			return _handleVersionRow(value, version)
		}),
	})
}
