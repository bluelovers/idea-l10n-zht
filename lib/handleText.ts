import { processIdeaSegmentText } from './segment';
import { updateMeta } from './meta';

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
			else if (/Git(hub)?Bundle\.properties$/i.test(file))
			{
				content_new = content_new
					.replace(/提取/g, '獲取')
				;
			}

			return content_new
		})
}
