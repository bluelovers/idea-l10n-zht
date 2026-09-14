/**
 * Created by user on 2022/1/10.
 */

/**
 * 原始插件處理的主流程腳本
 * Main pipeline script for processing the original plugin
 *
 * 按順序執行以下步驟（依賴前一步驟的輸出作為下一步驟的輸入）：
 * 1. fetch-latest-version-of-zh-cn - 取得簡體中文版最新版本資訊
 * 2. download-original-plugin - 下載原始簡體中文插件
 * 3. unzip - 解壓縮已下載的語言包
 * 4. to-zht - 將簡體中文轉換為繁體中文
 * 5. properties-replace - 替換 properties 屬性檔中的翻譯文字
 *
 * Executes the following steps in sequence (each step depends on the previous output):
 * 1. fetch-latest-version-of-zh-cn - Fetch latest zh-CN version info
 * 2. download-original-plugin - Download original simplified Chinese plugin
 * 3. unzip - Extract downloaded language pack
 * 4. to-zht - Convert simplified Chinese to traditional Chinese
 * 5. properties-replace - Replace translation text in properties files
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

/**
 * 動態匯入指定腳本並回傳其預設匯出值
 * Dynamically import a script and return its default export
 *
 * @param target - 腳本的相對路徑 / Relative path of the script
 * @returns 腳本的預設匯出值 / Default export value of the script
 */
function lazyImport(target: string)
{
	const base = import.meta.url;
	const final = new URL(target, base).href;

	return _lazyImportCore(import(final))
}
