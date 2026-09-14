import { processIdeaSegmentText } from './segment';
import { updateMeta } from './meta';
import { textToRegexp } from './util/text-to-regexp';
import { textIncludeCJK } from './util/include-cjk';

/**
 * 處理翻譯後的文字內容，根據檔案類型套用特定的詞彙替換與格式修正
 * Process translated text content, applying file-type-specific vocabulary replacements and format corrections
 *
 * 流程：
 * 1. 先透過分詞斷詞將簡體中文轉為繁體中文
 * 2. 根據檔案路徑匹配，對特定外掛的翻譯內容進行用語統一與修正
 * 3. 統一修正「Java Runtime」的中英文之間空格處理
 *
 * Process:
 * 1. First convert Simplified Chinese to Traditional Chinese via word segmentation
 * 2. Match by file path to unify and correct translations for specific plugins
 * 3. Uniformly fix spacing between Chinese and English in "Java Runtime"
 *
 * @param content_old - 翻譯前的原始文字內容 / Original text content before translation
 * @param info - 附加資訊物件 / Additional info object
 * @param info.file - 當前處理的檔案路徑（用於判斷檔案類型）/ File path being processed (used to determine file type)
 * @returns 處理完成的文字內容 Promise / Promise of processed text content
 */
export function handleText(content_old: string, info?: {
	file?: string,
})
{
	const file = info?.file ?? '';

	return processIdeaSegmentText(content_old)
		.then(content_new =>
		{
			/**
			 * plugin.xml 元資料檔案：需要更新外掛 ID、名稱、描述等中繼資料
			 * plugin.xml metadata file: needs to update plugin ID, name, description and other metadata
			 */
			if (/META-INF\/plugin\.xml$/i.test(file))
			{
				content_new = updateMeta(content_new);
			}
			/**
			 * Git/VCS/Svn/Diff 相關的翻譯套件：統一版本控制相關用語
			 * Git/VCS/Svn/Diff related translation bundles: unify version control terminology
			 *
			 * - 「提取」→「獲取」：統一動詞用法
			 * - 「儲存庫」→「版本庫」：採用台灣慣用的版本控制術語
			 * - 「統一」→「統合」：避免與「統一編號」等詞混淆
			 */
			else if (/(?:Git(?:hub)?|Vcs(?:Log)?|Svn|Diff)Bundle\.properties$/i.test(file))
			{
				content_new = content_new
					.replace(/提取/g, '獲取')
					.replace(/儲存庫/g, '版本庫')
					.replace(/統一/g, '統合')
				;
			}
			/**
			 * LeakableMapKey 頁面：統一「卸載」相關用語
			 * LeakableMapKey page: unify "uninstall" related terminology
			 *
			 * 「卸載」和「移除」統一為「解除安裝」，與 macOS 系統慣用語一致
			 * "卸載" and "移除" are unified to "解除安裝", consistent with macOS system terminology
			 */
			else if (/LeakableMapKey\.html$/i.test(file))
			{
				content_new = content_new
					.replace(textToRegexp(/卸載|移除/g), '解除安裝')
				;
			}
			/**
			 * JavaScript/InspectionGadgets/Php 翻譯套件：統一「縮小」相關用語
			 * JavaScript/InspectionGadgets/Php translation bundles: unify "minimize" related terminology
			 *
			 * 「縮小」在 IDE 上下文中指「限縮範圍」，使用「限縮」更精確
			 * "縮小" in IDE context means "narrowing scope", "限縮" is more precise
			 */
			else if (/(JavaScript|InspectionGadgets|Php)Bundle.properties$/i.test(file))
			{
				content_new = content_new
					.replace(textToRegexp(/縮小/g), '限縮')
				;
			}

			/**
			 * 統一修正「Java Runtime」中英文混排的空格處理
			 * Uniformly fix spacing in mixed Chinese-English "Java Runtime" text
			 *
			 * 處理「Java 執行時」或「Java 运行时」等翻譯，
			 * 統一替換為英文術語 "Java Runtime"，並確保與後方中文之間有空格
			 * Handles translations like "Java 執行時" or "Java 运行时",
			 * uniformly replaces with English term "Java Runtime" with proper spacing before following Chinese text
			 */
			content_new = content_new
				.replace(textToRegexp(/Java (?:运|執)行时(.)?/g), ($0, $1) => {

					if (textIncludeCJK($1))
					{
						$1 = ' ' + $1;
					}

					return 'Java Runtime' + $1
				})
			;

			return content_new
		})
}
