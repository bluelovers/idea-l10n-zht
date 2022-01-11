/**
 * Created by user on 2022/1/10.
 */

import Bluebird from 'bluebird';
import { resolve } from 'upath2';

export default Bluebird.mapSeries([
	'./download-original-plugin',
	'./unzip',
	'./to-zht',
] as const, lazyImport);

function lazyImport(target: string)
{
	return import(resolve(__dirname, target)).then(m => m.default ?? m)
}
