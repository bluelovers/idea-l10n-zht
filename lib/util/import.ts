import Bluebird from 'bluebird';
import { resolve } from 'upath2';
import { __root } from '../../test/__root';

export function _lazyImport<T>(target: string, dir = __root): Bluebird<T>
{
	return Bluebird.resolve(import(resolve(dir, target))).then(m => m.default ?? m)
}

export function _lazyImportWithDelay<T>(target: string, dir = __root, delay?: number): Bluebird<T>
{
	return _lazyImport<T>(target, dir).delay(delay || 2000)
}
