import DotProperties from 'dot-properties-loader';
import { __dict_properties_lazy, __plugin_dev_raw_dir } from '../const';
import Bluebird from 'bluebird';
import { SingleBar } from 'cli-progress';
import { console } from 'debug-color2';
import { join } from 'upath2';
import { async as FastGlob } from '@bluelovers/fast-glob/bluebird';
import { outputJSON } from 'fs-extra';
import { createSingleBar } from '../cli-progress';
import { textIncludeCJK } from '../util/include-cjk';
import { sortObjectKeys } from 'sort-object-keys2';
import { parse, ITree, stringify, IStringifyOptions, ILine, parseLines } from 'dot-properties2';

/**
 * properties 檔案序列化的預設選項
 * Default options for properties file serialization
 *
 * 使用 UTF-8 編碼（非 latin1），以 '=' 作為鍵值分隔符
 * Uses UTF-8 encoding (not latin1), '=' as key-value separator
 */
export const defaultPropertiesStringifyOptions: IStringifyOptions = Object.freeze({
	latin1: false,
	keySep: '=',
});

/**
 * 延遲載入的 properties 字典，包含預設的繁體中文翻譯
 * Lazy-loaded properties dictionary containing default Traditional Chinese translations
 */
export const LAZY_PROPERTIES = new DotProperties({
	file: __dict_properties_lazy,
});

/**
 * 延遲字典中所有鍵的列表，用於快速查找
 * List of all keys in the lazy dictionary, used for quick lookup
 */
export const LAZY_PROPERTIES_KEYS = Object.keys(LAZY_PROPERTIES.tree);

/**
 * 替換語言包中 properties 檔案的翻譯內容
 * Replace translation content in language pack properties files
 *
 * 流程：
 * 1. 掃描目標目錄中所有 .properties 檔案
 * 2. 逐一讀取並使用延遲字典替換已知翻譯
 * 3. 記錄有變更的檔案及可能需要人工審核的翻譯
 * 4. 輸出變更清單與待審核清單 JSON
 *
 * Flow:
 * 1. Scan all .properties files in the target directory
 * 2. Read each file and replace known translations using the lazy dictionary
 * 3. Record changed files and translations that may need manual review
 * 4. Output change list and review list JSON
 *
 * @param lang - 語言代碼，通常為 'zh' / Language code, typically 'zh'
 */
export function replaceProperties(lang: string | 'zh')
{
	return Bluebird.resolve()
		.then(async () =>
		{
			let bar: SingleBar;

			console.cyan.log(`update ${lang} properties`);

			const cwd = join(__plugin_dev_raw_dir, lang);

			bar = createSingleBar(100, 0);

			/**
			 * changedList: 記錄有翻譯替換的檔案列表
			 * Changed list: records files that had translation replacements
			 *
			 * maybeRecord: 記錄可能需要人工審核的翻譯（非 CJK 且非純英文的值）
			 * Maybe record: records translations that may need manual review (non-CJK and non-pure-English values)
			 */
			const changedList = [] as string[];
			const maybeRecord = {} as {
				[file: string]: {
					[key: string]: string,
				},
			};

			return FastGlob([
				'**/*.properties',
			], {
				cwd,
			})
				.tap((ls) =>
				{
					bar?.setTotal(ls.length);
				})
				.mapSeries(async (file: string, index) =>
				{
					bar?.update(index, { filename: file });

					const {
						fullpath,
						dp,
						_changed,
					} = handlePropertiesFile(file, cwd)

					/** 變更的檔案加入清單並儲存 / Add changed file to list and save */
					if (_changed)
					{
						changedList.push(file);
						saveProperties(dp, fullpath);
					}

					/**
					 * 掃描所有翻譯值，篩選出可能需要人工審核的項目
					 * Scan all translation values, filter items that may need manual review
					 *
					 * 條件：值非空、不含 CJK 字元、且非純英文單字（可能為未翻譯的其他語言）
					 * Condition: value is non-empty, contains no CJK characters, and is not a pure English word (may be untranslated foreign language)
					 */
					for (let key in dp.tree)
					{
						let value = dp.get(key) as string;

						if (value?.length && !textIncludeCJK(value as string) && !/^\w+$/.test(value))
						{
							maybeRecord[file] ??= {};
							maybeRecord[file][key] = value as string;
						}

					}
				})
					/**
					 * 排序並輸出變更清單與待審核清單 JSON
					 * Sort and output change list and review-needed list JSON
					 */
					.tap(() =>
				{
					sortObjectKeys(maybeRecord, {
						useSource: true,
					});

					return Promise.all([
						outputJSON(join(__plugin_dev_raw_dir, lang + '.list.properties.changed.json'), changedList, {
							spaces: 2,
						}),
						outputJSON(join(__plugin_dev_raw_dir, lang + '.list.properties.maybe.json'), maybeRecord, {
							spaces: 2,
						}),
					])
				})
				.finally(() =>
				{
					bar?.update(bar.getTotal());
					bar?.stop();
				})
		})
		;
}

/**
 * 核心替換邏輯：使用延遲字典逐一比對並替換 properties 中的翻譯
 * Core replacement logic: compare and replace translations in properties using the lazy dictionary one by one
 *
 * @param dp - 已載入的 DotProperties 實例 / Loaded DotProperties instance
 * @returns 包含 DotProperties 實例與是否有變更的旗標 / DotProperties instance and change flag
 */
export function _handlePropertiesFileCore(dp: DotProperties)
{
	let _changed = false;

	const tree = dp.tree;

	/**
	 * 遍歷延遲字典中的所有鍵，若 properties 中存在相同鍵則進行替換
	 * Iterate all keys in the lazy dictionary, replace if same key exists in properties
	 */
	LAZY_PROPERTIES_KEYS
		.forEach(key =>
		{

			if (key in tree)
			{
				dp.set(key, LAZY_PROPERTIES.get(key) as any);

				_changed = true;
			}

		})
	;

	return {
		dp,
		_changed,
	}
}

/**
 * 處理單一 properties 檔案的翻譯替換
 * Process translation replacement for a single properties file
 *
 * @param file - properties 檔案的相對路徑 / Relative path of the properties file
 * @param cwd - 工作目錄 / Working directory
 * @returns 包含檔案資訊、DotProperties 實例與變更旗標 / File info, DotProperties instance, and change flag
 */
export function handlePropertiesFile(file: string, cwd: string)
{
	const fullpath = join(cwd, file);

	const dp = new DotProperties({
		file: fullpath,
	});

	const { _changed } = _handlePropertiesFileCore(dp);

	return {
		file,
		cwd,
		fullpath,
		dp,
		_changed,
	}
}

/**
 * 將 DotProperties 序列化為 properties 檔案格式的字串
 * Serialize DotProperties to properties file format string
 *
 * @param dp - DotProperties 實例 / DotProperties instance
 * @returns 序列化後的 properties 字串 / Serialized properties string
 */
export function stringifyProperties(dp: DotProperties)
{
	return dp.stringify(defaultPropertiesStringifyOptions)
}

/**
 * 將 DotProperties 儲存到指定檔案路徑
 * Save DotProperties to a specified file path
 *
 * @param dp - DotProperties 實例 / DotProperties instance
 * @param fullpath - 目標檔案的完整路徑 / Full path of the target file
 */
export function saveProperties(dp: DotProperties, fullpath: string)
{
	return dp.save({
		file: fullpath,
		options: defaultPropertiesStringifyOptions,
	})
}
