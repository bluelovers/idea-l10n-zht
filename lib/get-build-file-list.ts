import { readJSON } from 'fs-extra';
import { join } from 'upath2';
import { __plugin_dev_overwrite_dir, __plugin_downloaded_dir_unzip } from './const';
import Bluebird from 'bluebird';
import { async as FastGlob } from '@bluelovers/fast-glob/bluebird';
import { array_unique_overwrite } from 'array-hyper-unique';

/**
 * 取得翻譯打包所需的完整檔案清單
 * Get complete file list required for translation packaging
 *
 * 合併兩個來源的檔案清單：
 * 1. 從原始外掛解壓縮目錄中讀取預先產生的檔案列表 JSON
 * 2. 從覆寫目錄中使用 FastGlob 搜尋所有可覆寫的檔案
 * Merges file lists from two sources:
 * 1. Reads pre-generated file list JSON from the uncompressed original plugin directory
 * 2. Searches all overwritable files from the overwrite directory using FastGlob
 *
 * 最終去重後回傳，確保每個檔案只被處理一次
 * Returns the deduplicated result to ensure each file is processed only once
 *
 * @param lang - 語言代碼（如 "zh"）/ Language code (e.g., "zh")
 * @returns 去重後的完整檔案路徑陣列 Promise / Promise of deduplicated complete file path array
 */
export function getBuildFileList(lang: string)
{
	return Bluebird.props({
			/** 從原始外掛的 JSON 清單檔讀取檔案列表 / Read file list from original plugin's JSON list file */
			ls: readJSON(join(__plugin_downloaded_dir_unzip, lang + '.list.json')) as Promise<string[]>,
			/** 從覆寫目錄搜尋所有可覆寫的檔案（包含 META-INF 和所有子目錄）/ Search all overwritable files from overwrite directory (including META-INF and all subdirectories) */
			ls2: FastGlob<string>([
				'META-INF/**/*',
				'**/*',
			], {
				cwd: join(__plugin_dev_overwrite_dir, lang),
			}),
		})
		.then(data =>
		{
			/**
			 * 將兩個來源的檔案陣列扁平化為單一陣列
			 * Flatten both source file arrays into a single array
			 */
			return Object.values(data).flat()
		})
		.then(ls => array_unique_overwrite(ls))
}
