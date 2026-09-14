import { getSourceInfoSync } from '../build/get-source-info';
import { outputJSON, readJSON } from 'fs-extra';
import { __file_publish_tags_json } from '../const';
import { array_unique_overwrite } from 'array-hyper-unique';
import { LF } from 'crlf-normalize';
import { buildCmd, gitTagList } from '@git-lazy/tag-list';
import { console } from 'debug-color2';
import { __root } from '../../test/__root';
import { createNew } from '@bluelovers/string-natural-compare';

/**
 * 更新發佈用的版本標籤清單
 * Update the publish version tags list
 *
 * 從 Git 標籤與插件版本資訊中收集所有版本號，合併去重後以降序排序，
 * 並將結果寫回 JSON 檔案供發佈流程使用
 * Collects all version numbers from Git tags and plugin version info, deduplicates and sorts in descending order,
 * then writes the result back to JSON file for publish workflow usage
 *
 * @returns 去重且排序後的版本標籤陣列 / Deduplicated and sorted version tags array
 */
export function updatePublishTags()
{
	/** 建立降序自然排序比較器 / Create a descending natural-order comparator */
	const _myNaturalCompare = createNew({
		desc: true,
	});

	return readJSON(__file_publish_tags_json)
		.catch(e => [])
		.then(async (tags: string[]) =>
		{
			/**
			 * 取得當前插件版本號並加入標籤清單（若尚未存在）
			 * Get current plugin version and add to tags list if not already present
			 *
			 * 確保當前版本號永遠出現在發佈標籤中
			 * Ensures the current version always appears in publish tags
			 */
			const __pluginVersion = getSourceInfoSync().pluginMeta.version;

			if (!tags.includes(__pluginVersion))
			{
				tags.push(__pluginVersion);
			}

			/**
			 * 從 Git 標籤中提取版本號（格式 vX.Y）並加入清單
			 * Extract version numbers from Git tags (format vX.Y) and add to the list
			 *
			 * 只匹配主版本.次版本格式的標籤，忽略預發布版本等其他格式
			 * Only matches tags in major.minor format, ignoring pre-release and other formats
			 */
			await gitTagList({
				cwd: __root,
				target: null,
			})
				.each(row => {

					const m = /^v(\d+\.\d+)$/.exec(row[0]);

					if (m?.[1])
					{
						tags.push(m[1]);
					}

				})
			;

			return array_unique_overwrite(tags.filter(v => v)).sort(_myNaturalCompare)
		})
		.then(tags =>
		{
			/**
			 * 將排序後的版本標籤寫入 JSON 檔案
			 * Write sorted version tags to JSON file
			 *
			 * 使用 LF 換行符以確保跨平台一致性
			 * Uses LF line endings for cross-platform consistency
			 */
			return outputJSON(__file_publish_tags_json, tags, {
				spaces: 2,
				EOL: LF,
			}).then(() => tags)
		})
		;
}
