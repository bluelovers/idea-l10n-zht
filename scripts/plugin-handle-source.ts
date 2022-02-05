/**
 * Created by user on 2022/1/10.
 */

import Bluebird from 'bluebird';
import { resolve } from 'upath2';

export default Bluebird.mapSeries([
	'./fetch-latest-version-of-zh-cn',
	'./download-original-plugin',
	'./unzip',
	'./to-zht',
	'./properties-replace',
] as const, lazyImport);

function lazyImport(target: string)
{
	return Bluebird.resolve(import(resolve(__dirname, target))).then(m => m.default ?? m).delay(2000)
}
