import { createMultiBar, createSingleBar } from '../cli-progress';
import { console } from 'debug-color2';
import { SingleBar } from 'cli-progress';
import { join } from 'upath2';
import { __ml_llm_jar, __plugin_downloaded_dir, __plugin_downloaded_dir_unzip } from '../const';
import Bluebird from 'bluebird';
import { outputFile, outputJSON, readFile, remove } from 'fs-extra';
import JSZip from 'jszip';
import { existsSync } from 'node:fs';
import { array_unique_overwrite } from 'array-hyper-unique';

//export const multibar = createMultiBar();

/**
 * 寫入檔案，若目標已存在且鎖定則先刪除再重試
 * Write file to target path; if target exists and is locked, delete and retry
 *
 * 設計邏輯：
 * - 抽離共用的寫入重試邏輯，避免在多處重複 try/catch + catch + remove + outputFile
 * - 鎖定的檔案（如被 IDE 鎖住的 JAR）先刪除後重新寫入
 *
 * Design logic:
 * - Extracts shared write-and-retry logic, avoiding duplicated try/catch + remove + outputFile
 * - Locked files (e.g., JARs locked by IDE) are deleted before rewriting
 *
 * @param fullpath - 寫入的完整路徑 / Full path to write to
 * @param buf - 要寫入的 Buffer / Buffer to write
 */
async function _writeFileWithRetry(fullpath: string, buf: Buffer)
{
	return outputFile(fullpath, buf)
		.catch(async () =>
		{
			await remove(fullpath);
			return outputFile(fullpath, buf);
		})
	;
}

/**
 * 從 ml-llm.jar 中提取 localization/zh/messages/ 目錄到目標目錄
 * Extract localization/zh/messages/ directory from ml-llm.jar to the target directory
 *
 * 設計邏輯：
 * - ml-llm.jar 內的路徑格式為 localization/zh/messages/{file}
 * - 目標路徑需將 localization/zh/ 前綴移除，保留相對路徑 messages/{file}
 * - 此函式僅在 ml-llm.jar 存在時執行，不存在時靜默跳過
 *
 * Design logic:
 * - Path format inside ml-llm.jar is localization/zh/messages/{file}
 * - Target path strips the localization/zh/ prefix, keeping relative path messages/{file}
 * - This function only runs when ml-llm.jar exists; silently skips if absent
 *
 * @param targetDir - 解壓縮的基礎目錄（如 original-plugin-raw/zh）/ Base extraction directory (e.g., original-plugin-raw/zh)
 * @returns 提取的檔案路徑陣列 / Array of extracted file paths
 */
async function _extractMlLlmMessages(targetDir: string): Promise<string[]>
{
	if (!existsSync(__ml_llm_jar))
	{
		return [];
	}

	/** ml-llm.jar 內要提取的目錄前綴 / Directory prefix to extract from ml-llm.jar */
	const srcPrefix = 'localization/zh/messages/';

	const zip = await JSZip.loadAsync(await readFile(__ml_llm_jar));
	const files = zip.file(/^localization\/zh\/messages\//);

	if (!files.length)
	{
		return [];
	}

	const ls: string[] = [];

	/**
	 * 逐檔從 ml-llm.jar 提取並寫入目標目錄
	 * Extract each file from ml-llm.jar and write to target directory
	 *
	 * 路徑轉換：localization/zh/messages/actions.xml → messages/actions.xml
	 * Path transform: localization/zh/messages/actions.xml → messages/actions.xml
	 */
	for (const file of files)
	{
		if (file.dir)
		{
			continue;
		}

		/** 移除 localization/zh/ 前綴，保留相對路徑 / Strip localization/zh/ prefix, keep relative path */
		const relativePath = file.name.slice(srcPrefix.length);
		const fullpath = join(targetDir, 'messages', relativePath);

		ls.push(`messages/${relativePath}`);

		try
		{
			await _writeFileWithRetry(fullpath, await file.async('nodebuffer'));
		}
		catch (err)
		{
			console.error(`Failed to write ml-llm file ${file.name}:`, err);
		}
	}

	return ls;
}

/**
 * 解壓縮語言包 ZIP 檔案並提取其中的 JAR 內容
 * Unzip language pack ZIP file and extract JAR contents within
 *
 * 流程說明：
 * 1. 先提取 ml-llm.jar 中的 localization/zh/messages/ 到目標目錄（若存在）
 * 2. 讀取語言包 ZIP 檔案
 * 3. 從 ZIP 中找出唯一的 .jar 檔案
 * 4. 解壓縮 JAR 中的所有檔案到目標目錄（會覆蓋 ml-llm 的同路徑檔案）
 * 5. 合併兩者檔案清單，語言包優先，輸出至同一個 .list.json
 *
 * Flow:
 * 1. First extract localization/zh/messages/ from ml-llm.jar (if exists)
 * 2. Read language pack ZIP file
 * 3. Find the single .jar file inside the ZIP
 * 4. Extract all files from JAR to target directory (overwrites ml-llm files with same paths)
 * 5. Merge both file lists with language pack taking precedence, output to the same .list.json
 *
 * @param lang - 語言代碼，通常為 'zh' / Language code, typically 'zh'
 */
export function unzipLang(lang: string | 'zh')
{
	console.cyan.log(`unzip ${lang}.zip`);

	const bar: SingleBar = createSingleBar(200, 0);
	const cwd = join(__plugin_downloaded_dir_unzip, lang);

	return Bluebird.resolve()
		/**
		 * 第一步：從 ml-llm.jar 提取 localization/zh/messages/ 到目標目錄
		 * Step 1: Extract localization/zh/messages/ from ml-llm.jar to target directory
		 *
		 * 設計邏輯：
		 * - ml-llm 先提取，因為語言包 JAR 內的同路徑檔案會覆蓋 ml-llm 的檔案
		 * - 確保最終結果以語言包為準（單一事實來源）
		 *
		 * Design logic:
		 * - ml-llm is extracted first because language pack JAR's same-path files will overwrite ml-llm's
		 * - Ensures the language pack takes precedence as the single source of truth
		 */
		.then(() => _extractMlLlmMessages(cwd))
		.then(mlLlmFiles =>
		{
			/**
			 * 第二步：讀取語言包 ZIP 並解壓縮 JAR
			 * Step 2: Read language pack ZIP and extract JAR
			 */
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
					bar?.setTotal(mlLlmFiles.length + ls.length);
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
						bar?.update(mlLlmFiles.length + index + 1, { filename: file.name });
						result.ls.push(file.name);

						try
						{
							const fullpath = join(cwd, file.name);
							await _writeFileWithRetry(fullpath, await file.async('nodebuffer'));
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
				 * 合併 ml-llm 與語言包的檔案清單，語言包優先（同路徑覆蓋 ml-llm）
				 * Merge ml-llm and language pack file lists, language pack takes precedence (same-path overwrites ml-llm)
				 *
				 * 設計邏輯：
				 * - 語言包的檔案在後提取，所以同路徑檔案會覆蓋 ml-llm 的版本
				 * - array_unique_overwrite 保留最後出現的元素，語言包在後故優先
				 *
				 * Design logic:
				 * - Language pack files are extracted later, so same-path files overwrite ml-llm's version
				 * - array_unique_overwrite keeps the last occurrence; language pack is last, so it takes precedence
				 */
				.tap((result) =>
				{
					const merged = array_unique_overwrite([
						...result.ls,
						...mlLlmFiles,
					]);

					return outputJSON(cwd + '.list.json', merged, {
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
		})
		;
}
