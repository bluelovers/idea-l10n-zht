import { getSegment, processText } from "novel-segment-cli";
import { detectLineBreak } from 'crlf-normalize';
import Bluebird from 'bluebird';
import Segment from "novel-segment/lib";
import { load as loadSynonym } from '@novel-segment/loaders/segment/synonym';
import { load as loadTable } from '@novel-segment/loaders/segment/index';
import { __dict_synonym_txt, __dict_table_txt } from './const';
import { EnumDictDatabase } from "@novel-segment/types";

/**
 * 全域快取的 Segment 分詞器實例
 * Globally cached Segment tokenizer instance
 *
 * 使用 singleton 模式確保分詞器只初始化一次，避免重複載入詞典的效能開銷
 * Uses singleton pattern to ensure tokenizer is initialized only once, avoiding performance overhead of repeated dictionary loading
 */
let inited: Segment;

/**
 * 初始化 IDEA 分詞斷詞引擎（使用 singleton 模式）
 * Initialize IDEA word segmentation engine (singleton pattern)
 *
 * 載入自訂詞典表與同義詞詞典，配置分詞器以支援簡繁轉換。
 * 首次呼叫時建立 Segment 實例並快取，後續呼叫直接回傳快取實例
 * Loads custom dictionary table and synonym dictionary, configures tokenizer for Simplified-Traditional Chinese conversion.
 * Creates and caches Segment instance on first call, subsequent calls return cached instance
 *
 * @returns 已初始化的 Segment 分詞器 Promise / Initialized Segment tokenizer Promise
 */
export function initIdeaSegmentText()
{
	return Bluebird.resolve()
		.then(async () =>
		{
			/**
			 * Singleton 檢查：若已初始化則直接回傳快取實例
			 * Singleton check: return cached instance if already initialized
			 */
			if (!inited)
			{
				inited = await getSegment({
					//disableCache: true,
					optionsSegment: {
						nodeNovelMode: true,
					},
				}).then(async (segment) =>
				{
					/**
					 * 取得詞典資料庫與同義詞資料庫的參考
					 * Get references to dictionary database and synonym database
					 */
					const db_dict = segment.getDictDatabase(EnumDictDatabase.TABLE);
					const db_synonym = segment.getDictDatabase(EnumDictDatabase.SYNONYM);

					/**
					 * 暫存 autoCjk 設定並強制啟用，確保在載入詞典時能正確處理 CJK 字元
					 * Temporarily store autoCjk setting and force enable it to correctly handle CJK characters during dictionary loading
					 */
					const autoCjk = db_dict.options.autoCjk;
					db_dict.options.autoCjk = true;

					/*
					db_dict
						.add(['選項卡', 0x100000, 0])
						.add(['標籤頁', 0x100000, 0])
						.add(['標簽頁', 0x100000, 0])
					;
					 */

					db_dict
						.remove('复上')
						.remove('复分析')
						.remove('为重')
						.remove('出新')
					;

					/**
					 * 載入自訂斷詞詞典表，逐筆加入詞典資料庫以提升分詞準確度
					 * Load custom segmentation dictionary table, adding entries one by one to improve segmentation accuracy
					 */
					await loadTable(__dict_table_txt)
						.each(data =>
						{
							return db_dict.add(data as any);
						})
					;

					/**
					 * 還原 autoCjk 設定為原始值
					 * Restore autoCjk setting to its original value
					 */
					db_dict.options.autoCjk = autoCjk;

					/**
					 * 載入同義詞詞典，用於將簡體用語替換為對應的繁體用語
					 * Load synonym dictionary, used for replacing Simplified Chinese terms with corresponding Traditional Chinese terms
					 */
					await loadSynonym(__dict_synonym_txt)
						.each(data =>
						{
							return db_synonym.add(data as any, false, true);
						})
					;

					/*
					db_synonym
						.add(['頁籤', '選項卡', '標籤頁', '標簽頁', '选项卡', '标签页', '标签页'])
						.add(['視窗', '窗口', '窗口'])
						.add(['預設', '默認', '默认'])
						.add(['列印', '打印', '打印'])
						.add(['貼上', '粘貼', '粘贴'])
						.add(['剪貼簿', '剪貼板', '剪贴板'])
						.add(['剪下', '剪切', '剪切'])
						.add(['註釋', '注釋', '注释'])
						.add(['唯讀', '只讀', '只读'])
						.add(['選單', '菜單', '菜单'])
						.add(['日誌', '日志'])
						.add(['註解', '注解', '注解'])
						.add(['磁碟', '磁盤', '磁盘'])
					;
					 */

					/**
					 * 將初始化完成的分詞器存入全域快取並回傳
					 * Store the initialized tokenizer into global cache and return
					 */
					return inited = segment;
				})
			}
			return inited
		})
}

/**
 * 處理 IDEA 翻譯文字的分詞與簡繁轉換
 * Process IDEA translation text with word segmentation and Simplified-Traditional conversion
 *
 * 先確保分詞引擎已初始化，再將文字進行斷詞處理並轉換為繁體中文。
 * 最後手動替換「后」→「後」和「于」→「於」，
 * 因為這兩個字的簡繁對應有多義性（如「皇后」vs「以後」），需交由上下文判斷
 * First ensures tokenizer is initialized, then segments the text and converts to Traditional Chinese.
 * Finally manually replaces "后"→"後" and "于"→"於",
 * because these characters have ambiguous Simplified-Traditional mappings (e.g., "皇后" vs "以後"), requiring contextual judgment
 *
 * @param text - 待處理的翻譯文字 / Translation text to process
 * @returns 處理完成的繁體中文文字 Promise / Promise of processed Traditional Chinese text
 */
export function processIdeaSegmentText(text: string)
{
	return initIdeaSegmentText()
		.then(() => processText(text, {
			/** 啟用簡體轉繁體功能 / Enable Simplified to Traditional Chinese conversion */
			convertToZhTw: true,
			/** 保留原始文字的換行符號類型 / Preserve original line break style */
			crlf: detectLineBreak(text),
		}))
		.then(text =>
		{
			/**
			 * 手動替換多義簡繁字元：「后」→「後」、「于」→「於」
			 * Manual replacement of ambiguous Simplified-Traditional characters
			 *
			 * 這兩個字在簡體中各對應多個繁體字（后/後、于/於/於），
			 * 斷詞引擎無法完全正確處理，需額外替換
			 * These characters each map to multiple Traditional characters,
			 * which the segmentation engine cannot fully handle correctly, requiring additional replacement
			 */
			return text
				.replace(/后/g, '後')
				.replace(/于/g, '於')
				;
		})
}
