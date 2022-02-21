import { processIdeaSegmentText } from './segment';
import { updateMeta } from './meta';
import { textToRegexp } from './util/text-to-regexp';

export function handleText(content_old: string, info?: {
	file?: string,
})
{
	const file = info?.file ?? '';

	return processIdeaSegmentText(content_old)
		.then(content_new =>
		{
			if (/META-INF\/plugin\.xml$/i.test(file))
			{
				content_new = updateMeta(content_new);
			}
			else if (/(?:Git(?:hub)?|Vcs(?:Log)?|Svn|Diff)Bundle\.properties$/i.test(file))
			{
				content_new = content_new
					.replace(/提取/g, '獲取')
					.replace(/儲存庫/g, '版本庫')
					.replace(/統一/g, '統合')
				;
			}
			else if (/LeakableMapKey\.html$/i.test(file))
			{
				content_new = content_new
					.replace(textToRegexp(/卸載|移除/g), '解除安裝')
				;
			}

			return content_new
		})
}
