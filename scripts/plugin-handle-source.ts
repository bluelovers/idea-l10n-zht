/**
 * Created by user on 2022/1/10.
 */

import Bluebird from 'bluebird';
import { _lazyImportCore } from '../lib/util/import';

export default Bluebird.mapSeries([
	'./fetch-latest-version-of-zh-cn.ts',
	'./download-original-plugin.ts',
	'./unzip.ts',
	'./to-zht.ts',
	'./properties-replace.ts',
] as const, lazyImport);

function lazyImport(target: string)
{
	const base = import.meta.url;
	const final = new URL(target, base).href;

	return _lazyImportCore(import(final))
}
