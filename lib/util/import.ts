import Bluebird from 'bluebird';
import { resolve } from 'upath2';
import { __root } from '../../test/__root';
import { pathToFileURL, fileURLToPath } from 'node:url';

/**
 * 解包 Promise 或類 Promise 型別為其內部解析型別
 * Unwrap a Promise or Promise-like type to its resolved type
 */
type IUnpack<T extends any> = Awaited<T extends PromiseLike<infer D> ? D : T>

/**
 * 解包含有 default export 的模組型別，取得其預設匯出的型別
 * Unwrap a module type with default export, extracting the type of its default export
 */
type IDefaultImport<T> = Awaited<T extends {
	default: infer D
} ? D : T>

/**
 * 核心懶載入邏輯：解析 Promise 模組並自動提取 default export
 * Core lazy loading logic: resolve Promise module and automatically extract default export
 * @param module - 模組的 Promise import / Promise-based module import
 * @returns 模組的預設匯出或模組本身 / Module's default export or the module itself
 */
export function _lazyImportCore<T extends any>(module:Promise<Awaited<T>>): Bluebird<IDefaultImport<Awaited<T>>>
{
	return Bluebird.resolve(module).then(m => (m as any).default ?? m)
}

/**
 * 懶載入模組：將相對路徑轉為 URL 並非同步 import
 * Lazy load a module: convert relative path to URL and asynchronously import
 * @param target - 要載入的模組相對路徑 / Relative path of the module to load
 * @param dir - 基礎目錄路徑（預設為 __root） / Base directory path (defaults to __root)
 * @returns 模組的預設匯出或模組本身 / Module's default export or the module itself
 */
export function _lazyImport<T>(target: string, dir = __root): Bluebird<T>
{
	const base = pathToFileURL(dir).href + '/';
	const final = new URL(target, base).href;

	console.dir({
		base,
		target,
		final
	});

	return _lazyImportCore(import(final))
}

/**
 * 帶有延遲的懶載入：載入模組後等待指定毫秒數再回傳（用於避免載入衝突）
 * Lazy load with delay: load module then wait specified milliseconds before returning (used to avoid loading conflicts)
 * @param target - 要載入的模組相對路徑 / Relative path of the module to load
 * @param dir - 基礎目錄路徑（預設為 __root） / Base directory path (defaults to __root)
 * @param delay - 延遲毫秒數（預設 2000ms） / Delay in milliseconds (default 2000ms)
 * @returns 模組的預設匯出或模組本身 / Module's default export or the module itself
 */
export function _lazyImportWithDelay<T>(target: string, dir = __root, delay?: number): Bluebird<T>
{
	return _lazyImport<T>(target, dir).delay(delay || 2000)
}
