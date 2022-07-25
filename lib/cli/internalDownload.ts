import { _isSeries } from '../util/version-map';
import { _handleArgv, _handleArgvResult, IArgvDownload } from './handle-argv';
import { EnumVersion } from '../const';

export function internalDownload(versionOrSeries?: string)
{
	const key: 'version' | 'series' = versionOrSeries?.length && _isSeries(versionOrSeries) ? 'series' : 'version';

	return Promise.resolve(<IArgvDownload>{
			[key]: versionOrSeries ?? EnumVersion.latest,
			source: true,
			disableInteractive: true,
		})
		.then(_handleArgv)
		.then(_handleArgvResult)
}
