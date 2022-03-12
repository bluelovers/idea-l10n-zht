import Bluebird from 'bluebird';
import { CrowdinXLIFFXml } from '../../util/xml/xliff';
import { getElementText, setElementText } from '../../util/xml/elem-value';
import { handleText } from '../../handleText';
import { readFileSync } from 'fs';
import { join } from 'upath2';
import { initIdeaSegmentText } from '../../segment';

export function handleXLIFFFile(xliff_file: string, cwd: string)
{
	return handleXLIFF(readFileSync(join(cwd, xliff_file)), {
		xliff_file,
	});
}

export function handleXLIFF(source: Buffer | string, runtime: {
	xliff_file: string
})
{
	return Bluebird
		.resolve()
		.then(async () =>
		{
			await initIdeaSegmentText();

			return new CrowdinXLIFFXml(source)
		})
		.then(async (obj) =>
		{
			let changed = false;

			await Bluebird
				.mapSeries(obj.files, async (row) =>
				{
					if (row['@target-language'] === 'zh-CN')
					{
						row['@target-language'] = 'zh-TW';

						const info = {
							...runtime,
							file: row['@original'],
						};

						await Bluebird.mapSeries([row.body['trans-unit']].flat(), async (unit) =>
						{
							const content_old = getElementText(unit.target);

							let content_new = await handleText(content_old, info);

							if (content_new !== content_old)
							{
								unit.target = setElementText(unit.target, content_new);

								changed = true;
							}

							delete unit['@approved'];
							delete unit.target['@state'];
						});
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
