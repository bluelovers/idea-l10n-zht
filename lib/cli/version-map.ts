import { prompt } from 'enquirer';
import { _getSeries, _getVersion, _getVersionInfoByVersion } from '../util/version-map';
import moment from 'moment';
import { console, chalkByConsole } from 'debug-color2';

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

			const info = _getVersionInfoByVersion(version);

			const date = chalkByConsole((chalk) => {
				return chalk.gray(moment(+info.cdate).format())
			});

			return {
				name: value,
				hint: `( ${version} ) ${date}`,
			}
		}),
	})
}
