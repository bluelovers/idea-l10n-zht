import { processIdeaSegmentText } from './segment';
import { updateMeta } from './meta';
import { textToRegexp } from './util/text-to-regexp';
import { textIncludeCJK } from './util/include-cjk';

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
			else if (/(JavaScript|InspectionGadgets|Php)Bundle.properties$/i.test(file))
			{
				content_new = content_new
					.replace(textToRegexp(/縮小/g), '限縮')
				;
			}

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
