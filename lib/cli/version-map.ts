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

function _handleVersionRow(value: string, version?: string)
{
	version ??= value;

	const info = _getVersionInfoByVersion(version);

	const date = chalkByConsole((chalk) =>
	{
		return chalk.gray(_infoDateToString(info.cdate))
	});

	return {
		name: value,
		hint: `( ${version} ) ${date}`,
	}
}

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
