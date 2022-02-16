import Bluebird from 'bluebird';
import { resolve } from 'upath2';
import { __root } from '../../test/__root';

type IUnpack<T extends any> = Awaited<T extends PromiseLike<infer D> ? D : T>

type IDefaultImport<T> = Awaited<T extends {
	default: infer D
} ? D : T>

export function _lazyImportCore<T extends any>(module:Promise<Awaited<T>>): Bluebird<IDefaultImport<Awaited<T>>>
{
	return Bluebird.resolve(module).then(m => (m as any).default ?? m)
}

export function _lazyImport<T>(target: string, dir = __root): Bluebird<T>
{
	return _lazyImportCore(import(resolve(dir, target)))
}

export function _lazyImportWithDelay<T>(target: string, dir = __root, delay?: number): Bluebird<T>
{
	return _lazyImport<T>(target, dir).delay(delay || 2000)
}
