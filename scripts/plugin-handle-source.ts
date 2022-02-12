/**
 * Created by user on 2022/1/10.
 */

import Bluebird from 'bluebird';
import { resolve } from 'upath2';
import { _lazyImport, _lazyImportWithDelay } from '../lib/util/import';

export default Bluebird.mapSeries([
	'./fetch-latest-version-of-zh-cn',
	'./download-original-plugin',
	'./unzip',
	'./to-zht',
	'./properties-replace',
] as const, lazyImport);

function lazyImport(target: string)
{
	return _lazyImportWithDelay(target, __dirname)
}
