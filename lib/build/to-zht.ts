import { SingleBar } from 'cli-progress';
import { console } from 'debug-color2';
import { join } from 'upath2';
import { __plugin_dev_raw_dir, __plugin_downloaded_dir_unzip } from '../const';
import { outputFile, outputJSON, pathExists, readFile, readJSON, unlink } from 'fs-extra';
import { async as FastGlob } from '@bluelovers/fast-glob/bluebird';
import { array_unique_overwrite } from 'array-hyper-unique';
import { handleText } from '../handleText';
import { gray, red } from 'ansi-colors';
import { createMultiBar, createSingleBar } from '../cli-progress';
import Bluebird from 'bluebird';
import { initIdeaSegmentText } from '../segment';

//export const multibar = createMultiBar();

/**
 * 將解壓縮後的語言包檔案進行簡中轉繁中文字轉換
 * Perform SC-to-TC text conversion on extracted language pack files
 *
 * 處理流程：
 * 1. 讀取先前解壓縮的檔案清單 (cacheList)
 * 2. 使用 FastGlob 掃描目標目錄中的所有檔案
 * 3. 合併兩份清單（去除重複），逐一處理每個檔案
 * 4. 對於已知檔案進行文字轉換，新發現的檔案從目標目錄移除
 * 5. 輸出轉換後的檔案清單 JSON
 *
 * Processing flow:
 * 1. Read previously extracted file list (cacheList)
 * 2. Scan all files in target directory using FastGlob
 * 3. Merge both lists (deduplicated), process each file
 * 4. Apply text conversion to known files, remove newly discovered files from target
 * 5. Output converted file list JSON
 *
 * @param lang - 語言代碼，通常為 'zh' / Language code, typically 'zh'
 */
export function convertLang(lang: string | 'zh')
{
	return Bluebird.resolve()
		.then(async () =>
		{
			let bar: SingleBar;

			console.cyan.log(`convert ${lang} to zht`);

			const cwd = join(__plugin_downloaded_dir_unzip, lang);
			/** 從先前解壓縮步驟產生的檔案清單中讀取已知檔案 / Read known files from the file list produced by the previous unzip step */
			const cacheList: string[] = await readJSON(join(__plugin_downloaded_dir_unzip, lang + '.list.json'));
			const cacheListNew: string[] = [];

			bar = createSingleBar(cacheList.length, 0);

			/** 初始化 IDEA 斷文字典 / Initialize IDEA segment text dictionary */
			await initIdeaSegmentText();

			/**
			 * 掃描目標目錄所有檔案，與已知清單合併去重
			 * Scan all files in target directory, merge with known list and deduplicate
			 */
			return FastGlob([
				'**/*',
			], {
				cwd,
			})
				.then(ls =>
				{
					return array_unique_overwrite([
						...cacheList,
						...ls,
					])
				})
				.tap((ls) =>
				{
					bar?.setTotal(ls.length);
				})
				.mapSeries(async (file: string, index) =>
				{
					bar?.update(index, { filename: file });
					const fullpath = join(cwd, file);
					const fullpath_new = join(__plugin_dev_raw_dir, lang, file);

					/**
					 * 已知檔案（在 cacheList 中）進行文字轉換
					 * Apply text conversion for known files (in cacheList)
					 *
					 * 排除二進位檔案（PNG、SVG）和 MANIFEST.MF
					 * Exclude binary files (PNG, SVG) and MANIFEST.MF
					 */
					if (cacheList.includes(file))
					{
						if (!/\.(png|svg)$|MANIFEST\.MF/i.test(file))
						{
							const content_old = await readFile(fullpath).then(content => content.toString());

							let content_new = await handleText(content_old, {
								file,
							});

							if (content_new !== content_old)
							{
								cacheListNew.push(file);
								//console.success(file);
								await outputFile(fullpath_new, content_new);
								return;
							}
						}
					}
					/**
					 * 非已知檔案（新增檔案），從目標目錄移除
					 * Non-known file (newly added), remove from target directory
					 */
					else
					{
						bar?.update(index, { filename: red(file) });

						if (await pathExists(fullpath))
						{
							await unlink(fullpath);
						}
					}

					/** 清理目標目錄中不再需要的檔案 / Clean up files no longer needed in target directory */
					if (await pathExists(fullpath_new))
					{
						bar?.update(index, { filename: gray(file) });

						await unlink(fullpath_new);
					}

				})
					/**
					 * 輸出轉換後的檔案清單 JSON，僅包含實際有變更的檔案
					 * Output converted file list JSON, containing only actually changed files
					 */
					.tap(() =>
				{
					return outputJSON(join(__plugin_dev_raw_dir, lang + '.list.json'), cacheListNew, {
						spaces: 2,
					})
				})
				.finally(() =>
				{
					bar?.update(bar.getTotal());
					bar?.stop();
					//multibar?.stop();
				})
		})
}
