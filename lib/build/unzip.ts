import { createMultiBar, createSingleBar } from '../cli-progress';
import { console } from 'debug-color2';
import { SingleBar } from 'cli-progress';
import { join } from 'upath2';
import { __plugin_downloaded_dir, __plugin_downloaded_dir_unzip } from '../const';
import Bluebird from 'bluebird';
import { outputFile, outputJSON, readFile, remove } from 'fs-extra';
import JSZip from 'jszip';

//export const multibar = createMultiBar();

/**
 * 解壓縮語言包 ZIP 檔案並提取其中的 JAR 內容
 * Unzip language pack ZIP file and extract JAR contents within
 *
 * 流程說明：
 * 1. 讀取 ZIP 檔案
 * 2. 從 ZIP 中找出唯一的 .jar 檔案
 * 3. 解壓縮 JAR 中的所有檔案到目標目錄
 * 4. 輸出檔案清單 JSON 供後續建構步驟使用
 *
 * Flow:
 * 1. Read ZIP file
 * 2. Find the single .jar file inside the ZIP
 * 3. Extract all files from JAR to target directory
 * 4. Output file list JSON for subsequent build steps
 *
 * @param lang - 語言代碼，通常為 'zh' / Language code, typically 'zh'
 */
export function unzipLang(lang: string | 'zh')
{
	console.cyan.log(`unzip ${lang}.zip`);

	const bar: SingleBar = createSingleBar(200, 0);
	const cwd = join(__plugin_downloaded_dir_unzip, lang);

	return Bluebird.resolve(readFile(join(__plugin_downloaded_dir, `${lang}.zip`)))
		.then<JSZip>(JSZip.loadAsync)
		.then(async (zip) =>
		{
			/**
			 * 從 ZIP 中提取 .jar 檔案
			 * Extract .jar file from ZIP
			 *
			 * 語言包 ZIP 中應只包含一個 .jar 檔案，多個或零個都視為異常
			 * Language pack ZIP should contain exactly one .jar file; multiple or zero is an error
			 */
			let file = zip.file(/\.jar$/);

			if (!file.length || file.length > 1)
			{
				throw new Error(`files of .jar should be only one file, but get ${file}`)
			}

			return file[0].async('nodebuffer').then(JSZip.loadAsync)
		})
		.then(zip =>
		{
			/** 取得 JAR 中所有檔案的列表 / Get list of all files in the JAR */
			return Object.values(zip.files)
		})
		.tap((ls) =>
		{
			bar?.setTotal(ls.length);
		})
		/**
		 * 逐個檔案解壓縮到目標目錄
		 * Extract each file to the target directory
		 *
		 * 跳過目錄項和特定 HTML 檔案（如 JUnit5 描述檔），
		 * 寫入失敗時自動刪除後重試
		 * Skips directory entries and specific HTML files (e.g., JUnit5 descriptions),
		 * automatically deletes and retries on write failure
		 */
		.reduce(async (result, file, index) =>
		{
			/** 跳過目錄和排除的特定檔案 / Skip directories and excluded specific files */
			if (!file.dir && ![
				'inspectionDescriptions/Junit5MalformedParameterized.html',
			].includes(file.name))
			{
				bar?.update(index + 1, { filename: file.name });
				result.ls.push(file.name);

				try
				{
					const fullpath = join(cwd, file.name);
					/**
					 * 寫入檔案，若目標已存在且鎖定則先刪除再重試
					 * Write file; if target exists and is locked, delete and retry
					 */
					await outputFile(fullpath, await file.async('nodebuffer'))
						.catch(async () =>
						{
							await remove(fullpath);

							return outputFile(fullpath, await file.async('nodebuffer'));
						})
					;
				}
				/**
				 * 記錄寫入失敗的檔案，後續統一處理
				 * Record failed file writes for unified error handling later
				 */
				catch (err)
				{
					result.errors.push({ file: file.name, error: err })
				}
			}
			return result
		}, { ls: [] as string[], errors: [] as { file: string, error: any }[] })
		/**
		 * 將解壓縮的檔案清單輸出為 JSON，供後續建構步驟參照
		 * Output extracted file list as JSON for reference by subsequent build steps
		 */
		.tap((result) =>
		{
			return outputJSON(cwd + '.list.json', result.ls, {
				spaces: 2,
			})
		})
		.then((result) =>
		{
			bar?.update(bar.getTotal());
			bar?.stop();

			/** 若有檔案寫入失敗，逐一報告錯誤並拋出異常 / Report each failed file write and throw error if any exist */
			if (result.errors.length)
			{
				for (const { file, error } of result.errors)
				{
					console.error(`Failed to write ${file}:`, error);
				}
				throw new Error(`${result.errors.length} files failed to write`);
			}
		})
		//.then(() => multibar.stop())
		//.tap(console.dir)
		;
}
