import { getSourceInfoSync } from '../build/get-source-info';
import { outputJSON, readJSON } from 'fs-extra';
import { __file_publish_tags_json } from '../const';
import { array_unique_overwrite } from 'array-hyper-unique';
import { LF } from 'crlf-normalize';
import { buildCmd, gitTagList } from '@git-lazy/tag-list';
import { console } from 'debug-color2';
import { __root } from '../../test/__root';
import { createNew } from '@bluelovers/string-natural-compare';

export function updatePublishTags()
{
	const _myNaturalCompare = createNew({
		desc: true,
	});

	return readJSON(__file_publish_tags_json)
		.catch(e => [])
		.then(async (tags: string[]) =>
		{
			const __pluginVersion = getSourceInfoSync().pluginMeta.version;

			if (!tags.includes(__pluginVersion))
			{
				tags.push(__pluginVersion);
			}

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
			return outputJSON(__file_publish_tags_json, tags, {
				spaces: 2,
				EOL: LF,
			}).then(() => tags)
		})
		;
}
