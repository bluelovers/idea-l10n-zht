import Bluebird from 'bluebird';
import { console } from 'debug-color2';
import { join, relative } from 'upath2';
import {
	__plugin_dev_output_dir,
	__plugin_dev_overwrite_dir,
	__plugin_dev_raw_dir,
	__plugin_downloaded_dir_unzip,
} from '../const';
import { getBuildFileList } from '../get-build-file-list';
import JSZip from 'jszip';
import { mergePaths } from '../merge-paths';
import { cyan } from 'ansi-colors';
import { fixedJSZipDate } from 'jszip-fixed-date';
import { outputFile, outputJSON } from 'fs-extra';
import { createSingleBar } from '../cli-progress';
import { __root } from '../../test/__root';

/**
 * 將翻譯後的檔案打包為 IntelliJ 插件 JAR 檔案
 * Pack translated files into an IntelliJ plugin JAR file
 *
 * 流程：
 * 1. 讀取建構用的檔案清單
 * 2. 依優先級從覆寫目錄、原始目錄、解壓縮目錄中讀取檔案
 * 3. 將所有檔案加入 JZip 實例
 * 4. 產生 JAR 檔案並輸出到建構目錄
 * 5. 同時輸出檔案清單 JSON 供追溯用途
 *
 * Flow:
 * 1. Read the build file list
 * 2. Read files from overwrite dir, raw dir, and unzipped dir by priority
 * 3. Add all files to the JSZip instance
 * 4. Generate JAR file and output to build directory
 * 5. Also output file list JSON for traceability
 *
 * @param lang - 語言代碼，通常為 'zh' / Language code, typically 'zh'
 * @returns 包含 JAR 檔案 Buffer 的 Promise / Promise containing JAR file Buffer
 */
export function packPluginJar(lang: string | 'zh')
{
	let ls2: Record<string, string> = {};

	return Bluebird.resolve()
		.then(async () =>
		{
			console.cyan.log(`pack plugin jar ${lang}`);

			const cwd = join(__plugin_downloaded_dir_unzip, lang);
			const cacheList: string[] = await getBuildFileList(lang);

			const jar = new JSZip();

			const bar = createSingleBar(cacheList.length, 0);

			/**
			 * 設定多目錄合併讀取器，按優先級查找檔案
			 * Setup multi-directory merge reader, find files by priority
			 *
			 * 優先級順序：覆寫目錄(lang) > 覆寫目錄(語言基底) > 原始目錄 > 解壓縮目錄
			 * Priority: overwrite dir(lang) > overwrite dir(lang base) > raw dir > unzipped dir
			 */
			const {
				readPathFile,
				getPath,
			} = mergePaths([
				join(__plugin_dev_overwrite_dir, lang),
				join(__plugin_dev_overwrite_dir, lang.split('-')[0]),
				join(__plugin_dev_raw_dir, lang),
				cwd,
			]);

			/**
			 * 逐檔讀取並加入 JAR 打包清單
			 * Read each file and add to JAR packaging list
			 *
			 * 若檔案找不到（buf 為 null），記錄為 null 供追溯
			 * If file not found (buf is null), record as null for traceability
			 */
			return Bluebird.reduce(cacheList, async (ls, file, index) =>
				{

					bar?.update(index, { filename: file });

					let buf: Buffer = await readPathFile(file);

					if (buf)
					{
						jar.file(file, buf);
						ls.push(file);

						ls2[file] = relative(__root, await getPath(file));
					}
					else
					{
						ls2[file] = null;
					}

					return ls;
				}, [] as string[])
				.then(async (ls) =>
				{
					bar?.update(bar.getTotal() - 1, { filename: cyan(lang + '.jar') });

					/** 修正 JAR 內所有檔案的時間戳記為固定日期，確保可重複建構 / Fix all file timestamps in JAR to a fixed date for reproducible builds */
					fixedJSZipDate(jar, new Date('2022-01-1 00:00:00Z'));

					/** 產生 JAR 檔案的 Buffer / Generate JAR file buffer */
					const buf = await jar.generateAsync({
						type: "nodebuffer",
						mimeType: 'application/java-archive',
					});

					/**
					 * 輸出 JAR 檔案、檔案清單 JSON 與追溯清單 JSON 到建構目錄
					 * Output JAR file, file list JSON, and traceability list JSON to build directory
					 */
					return Promise.all([
						buf,
						outputJSON(join(__plugin_dev_output_dir, lang + '.list.json'), ls, {
							spaces: 2,
						}),
						outputJSON(join(__plugin_dev_output_dir, lang + '.list2.json'), ls2, {
							spaces: 2,
						}),
						outputFile(join(__plugin_dev_output_dir, lang + '.jar'), buf),
					] as const).then(ls => ls[0] as Buffer);
				})
				.finally(() =>
				{
					bar?.update(bar.getTotal());
					bar?.stop();
				})
		})
		;
}
