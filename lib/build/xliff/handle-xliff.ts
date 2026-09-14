import Bluebird from 'bluebird';
import { CrowdinXLIFFXml } from '../../util/xml/xliff';
import { getElementText, setElementText } from '../../util/xml/elem-value';
import { handleText } from '../../handleText';
import { readFileSync } from 'fs';
import { resolve } from 'upath2';
import { initIdeaSegmentText } from '../../segment';
import { createMultiBar, createSingleBar } from '../../cli-progress';

/**
 * 讀取並解析 XLIFF 翻譯檔案
 * Read and parse an XLIFF translation file
 *
 * @param xliff_file - XLIFF 檔案路徑（相對於 cwd）/ XLIFF file path (relative to cwd)
 * @param cwd - 可選的工作目錄 / Optional working directory
 * @returns 解析後的 CrowdinXLIFFXml 物件 / Parsed CrowdinXLIFFXml object
 */
export function openXLIFFFile(xliff_file: string, cwd?: string)
{
	return new CrowdinXLIFFXml(readFileSync(resolve(cwd, xliff_file)))
}

/**
 * 處理單一 XLIFF 檔案的翻譯轉換
 * Process translation conversion for a single XLIFF file
 *
 * @param xliff_file - XLIFF 檔案路徑 / XLIFF file path
 * @param cwd - 工作目錄 / Working directory
 * @returns 包含處理結果的 Promise / Promise containing processing result
 */
export function handleXLIFFFile(xliff_file: string, cwd: string)
{
	return handleXLIFF(openXLIFFFile(xliff_file, cwd), {
		xliff_file,
		cwd,
	});
}

/**
 * 處理 XLIFF 內容的簡中轉繁中翻譯
 * Process XLIFF content conversion from Simplified Chinese to Traditional Chinese
 *
 * 核心轉換流程：
 * 1. 初始化 IDEA 斷文字典 (segment text)
 * 2. 遍歷所有檔案，僅處理 target-language 為 zh-CN 的檔案
 * 3. 將 target-language 從 zh-CN 改為 zh-TW
 * 4. 逐一處理每個翻譯單元 (trans-unit) 的文字轉換
 *
 * Core conversion flow:
 * 1. Initialize IDEA segment text dictionary
 * 2. Iterate all files, only process files with target-language zh-CN
 * 3. Change target-language from zh-CN to zh-TW
 * 4. Process each trans-unit's text conversion one by one
 *
 * @param source - XLIFF 來源，可為 Buffer、字串或已解析的 CrowdinXLIFFXml / XLIFF source as Buffer, string, or parsed CrowdinXLIFFXml
 * @param runtime - 運行時上下文，包含檔案路徑與工作目錄 / Runtime context with file path and working directory
 * @returns 包含處理結果、是否變更及解析物件的 Promise / Promise with processing result, change flag, and parsed object
 */
export function handleXLIFF(source: Buffer | string | CrowdinXLIFFXml, runtime: {
	xliff_file: string,
	cwd?: string,
})
{
	return Bluebird
		.resolve()
		.then(async () =>
		{
			/** 初始化 IDEA 斷文字典，用於後續文字轉換 / Initialize IDEA segment text dictionary for subsequent text conversion */
			await initIdeaSegmentText();

			/** 若已是解析後的物件則直接使用，否則建立新的解析物件 / Use existing parsed object or create a new one */
			if (source instanceof CrowdinXLIFFXml)
			{
				return source
			}

			return new CrowdinXLIFFXml(source)
		})
		.then(async (obj) =>
		{
			/** 追蹤是否有任何翻譯內容被修改 / Track whether any translation content was modified */
			let changed = false;

			/**
			 * 依序處理每個 XLIFF 檔案
			 * Process each XLIFF file sequentially
			 */
			await Bluebird
				.mapSeries(obj.files, async (row) =>
				{
					/** 僅處理簡體中文 (zh-CN) 來源的翻譯檔案 / Only process Simplified Chinese (zh-CN) source translation files */
					if (row['@target-language'] === 'zh-CN')
					{
						/** 將目標語言從簡中改為繁中 / Change target language from SC to TC */
					row['@target-language'] = 'zh-TW';

						const info = {
							...runtime,
							file: row['@original'],
						};

						const list = [row.body['trans-unit']].flat();

						console.log(info.file);

						let bar = createSingleBar(list.length, 0);

						/**
						 * 逐一處理每個翻譯單元 (trans-unit)
						 * Process each translation unit one by one
						 */
						await Bluebird.mapSeries(list, async (unit, index) =>
						{
							bar?.update(index, { filename: unit['@resname'] ?? unit['@id'] });

//							switch (unit['@resname'])
//							{
//								case 'error.project.requires.older.plugin':
//								case 'icon.nodes.nodePlaceholder.tooltip':
//									console.dir(unit);
//							}

							const content_old = getElementText(unit.target);

							/**
							 * 僅處理有翻譯內容的單元
							 * Only process units that have translation content
							 *
							 * 空翻譯的單元跳過不處理，避免產生空的繁中翻譯
							 * Skip units with empty translations to avoid generating empty TC translations
							 */
							if (content_old?.length > 0)
							{
								let content_new = await handleText(content_old, info);

								/**
								 * 簡中轉繁中文字轉換完成後，更新翻譯單元
								 * After SC-to-TC text conversion, update the translation unit
								 *
								 * 僅在內容有變化時才更新，並移除翻譯審核狀態標記
								 * Only update when content has changed, and remove translation review status markers
								 */
								if (content_new !== content_old)
								{
									unit.target = setElementText(unit.target, content_new);

									changed = true;

									delete unit['@translate'];
								}

								delete unit['@approved'];
								delete unit.target['@state'];
								delete unit.note;
							}
						});

						bar?.update(bar.getTotal());
						bar?.stop();
					}
				});

			return {
				runtime,
				changed,
				obj,
			}
		})
		;
}
