import { _isSeries } from '../util/version-map';
import { _handleArgv, _handleArgvResult, IArgvDownload } from './handle-argv';
import { EnumVersion } from '../const';

/**
 * 內部程式化下載語言包（非互動式）
 * Internal programmatic download of language pack (non-interactive)
 *
 * 用於其他模組直接呼叫以下載指定版本或系列的語言包，
 * 自動判斷輸入為版本號或系列名稱，並強制啟用 source 模式
 * Used by other modules to directly download a language pack for a specific version or series.
 * Automatically determines whether input is a version number or series name,
 * and forces source mode enabled
 *
 * @param versionOrSeries - 可選的版本號或系列名稱，若未提供則使用最新版本 / Optional version number or series name, uses latest if not provided
 * @returns 包含下載結果的 Promise / Promise containing download result
 */
export function internalDownload(versionOrSeries?: string)
{
	/** 判斷輸入是版本號還是系列名稱，空值時預設為版本模式 / Determine if input is version or series name, defaults to version mode when empty */
	const key: 'version' | 'series' = versionOrSeries?.length && _isSeries(versionOrSeries) ? 'series' : 'version';

	return Promise.resolve(<IArgvDownload>{
			[key]: versionOrSeries ?? EnumVersion.latest,
			source: true,
			disableInteractive: true,
		})
		.then(_handleArgv)
		.then(_handleArgvResult)
}
