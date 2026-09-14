/**
 * XLIFF 翻譯檔轉換腳本（簡體中文 → 繁體中文）
 * XLIFF translation file conversion script (zh-CN → zh-TW)
 *
 * 從已下載的 XLIFF 檔案中讀取簡體中文翻譯，轉換後輸出為繁體中文版本，
 * 同時將合併的 XLIFF 檔拆分為各模組獨立的 XLIFF 檔案。
 * Reads simplified Chinese translations from downloaded XLIFF files, converts them to
 * traditional Chinese, and splits the merged XLIFF into individual module XLIFF files.
 */
import { async as FastGlob } from "@bluelovers/fast-glob/bluebird";
import { join } from 'upath2';
import { __plugin_dev_output_dir, __plugin_downloaded_dir } from '../../lib/const';
import { handleXLIFF, handleXLIFFFile, openXLIFFFile } from '../../lib/build/xliff/handle-xliff';
import { outputFile } from "fs-extra";
import Bluebird from 'bluebird';

/** XLIFF 原始檔案所在目錄 / Directory containing original XLIFF files */
const cwd = join(__plugin_downloaded_dir, 'xliff');
/** 轉換後 XLIFF 檔案的輸出目錄 / Output directory for converted XLIFF files */
const target_out = join(__plugin_dev_output_dir, 'xliff');

/**
 * 搜尋所有 zh-cn XLIFF 檔案並逐一轉換
 * Search for all zh-cn XLIFF files and convert them one by one
 */
export default FastGlob<string>([
	'*.zh-cn.xliff',
	//'*intellij.zh-cn.xliff',
], {
	cwd,
}).mapSeries(xliff_file => {
	return handleXLIFFFile(xliff_file, cwd)
		.tap(result => {

			/**
			 * 將原始檔名中的 .zh-cn.xliff 替換為 .xliff 以作為輸出路徑
			 * Replace .zh-cn.xliff with .xliff in original filename for output path
			 */
			const new_file = join(target_out, xliff_file.replace('.zh-cn.xliff', '.xliff'));
			const new_dir = new_file.replace('.xliff', '');

			const old_dir = join(cwd, xliff_file.replace('.zh-cn.xliff', ''));

			/**
			 * 同時寫入三種檔案：
			 * 1. 轉換後的合併 XLIFF 檔
			 * 2. 拆分後的各模組 XLIFF 檔（轉換後）
			 * 3. 拆分後的各模組 XLIFF 檔（原始簡體中文）
			 *
			 * Write three types of files simultaneously:
			 * 1. Converted merged XLIFF file
			 * 2. Split module XLIFF files (converted)
			 * 3. Split module XLIFF files (original simplified Chinese)
			 */
			return Promise.all([
				outputFile(new_file, result.obj.toString()),
				Bluebird.each(result.obj.splitFiles(), (row) =>
				{
					return outputFile(join(new_dir, `${row.name}.xliff`), row.xml)
				}),
				Bluebird.each(openXLIFFFile(xliff_file, cwd).splitFiles(), (row) =>
				{
					return outputFile(join(old_dir, `${row.name}.xliff`), row.xml)
				}),
			])
		})
	;
})
