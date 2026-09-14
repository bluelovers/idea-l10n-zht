/**
 * 排序靜態字典與屬性檔
 * Sort static dictionary and properties files
 *
 * 排序三種靜態資源檔：
 * 1. 字典表 (dict-table) - 分詞用的詞組對應表
 * 2. 同義詞表 (synonym) - 同義詞替換規則
 * 3. 屬性檔 (properties) - 懶載入的翻譯屬性值
 *
 * 排序可確保 git diff 僅顯示實際內容變更，避免因順序差異產生噪音。
 * Sorting ensures git diffs only show actual content changes,
 * avoiding noise from ordering differences.
 */
import { loadFile as loadFileSynonym } from "@novel-segment/sort-synonym";
import { stringifyHandleDictLinesList } from "@novel-segment/util-compare";
import { __dict_properties_lazy, __dict_synonym_txt, __dict_table_txt } from '../lib/const';
import { outputFile, writeFile } from 'fs-extra';
import { LF } from 'crlf-normalize';
import { loadFile as loadFileTable } from '@novel-segment/sort-dict-table';
import DotProperties from 'dot-properties-loader';
import { basename } from 'path';

export default Promise.all([
	/** 排序並寫入字典表 / Sort and write dictionary table */
	loadFileTable(__dict_table_txt)
		.then(list =>
		{
			const lines = stringifyHandleDictLinesList(list);

			return writeFile(__dict_table_txt, lines.join(LF) + LF)
				.then(() => console.log(`sort ${basename(__dict_table_txt)}`))
		}),
	/** 排序並寫入同義詞表 / Sort and write synonym table */
	loadFileSynonym(__dict_synonym_txt)
		.then(list =>
		{
			const lines = stringifyHandleDictLinesList(list);

			return writeFile(__dict_synonym_txt, lines.join(LF) + LF)
				.then(() => console.log(`sort ${basename(__dict_synonym_txt)}`))
		}),
	/**
	 * 排序屬性檔：讀取後依 key 排序，重建 DotProperties 物件寫回
	 * Sort properties file: read, sort by key, rebuild DotProperties object and write back
	 */
	Promise.resolve()
		.then(() =>
		{

			const LAZY_PROPERTIES = new DotProperties({
				file: __dict_properties_lazy,
			});

			/** 取得所有 key 並排序以確保輸出順序一致 / Get all keys and sort for consistent output order */
			const LAZY_PROPERTIES_KEYS = Object.keys(LAZY_PROPERTIES.tree).sort();

			const dp = new DotProperties({
				source: '',
			});

			/** 依排序後的順序逐一設定屬性值 / Set property values one by one in sorted order */
			LAZY_PROPERTIES_KEYS.forEach(key =>
			{
				dp.set(key, LAZY_PROPERTIES.get(key) as any);
			});

			let text = dp.stringify({
				latin1: false,
				keySep: '=',
			});

			return outputFile(__dict_properties_lazy, text + LF)
				.then(() => console.log(`sort ${basename(__dict_properties_lazy)}`))
		}),
])
