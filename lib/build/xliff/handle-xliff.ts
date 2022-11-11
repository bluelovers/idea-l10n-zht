import Bluebird from 'bluebird';
import { CrowdinXLIFFXml } from '../../util/xml/xliff';
import { getElementText, setElementText } from '../../util/xml/elem-value';
import { handleText } from '../../handleText';
import { readFileSync } from 'fs';
import { resolve } from 'upath2';
import { initIdeaSegmentText } from '../../segment';
import { createMultiBar, createSingleBar } from '../../cli-progress';

export function openXLIFFFile(xliff_file: string, cwd?: string)
{
	return new CrowdinXLIFFXml(readFileSync(resolve(cwd, xliff_file)))
}

export function handleXLIFFFile(xliff_file: string, cwd: string)
{
	return handleXLIFF(openXLIFFFile(xliff_file, cwd), {
		xliff_file,
		cwd,
	});
}

export function handleXLIFF(source: Buffer | string | CrowdinXLIFFXml, runtime: {
	xliff_file: string,
	cwd?: string,
})
{
	return Bluebird
		.resolve()
		.then(async () =>
		{
			await initIdeaSegmentText();

			if (source instanceof CrowdinXLIFFXml)
			{
				return source
			}

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

						const list = [row.body['trans-unit']].flat();

						console.log(info.file);

						let bar = createSingleBar(list.length, 0);

						await Bluebird.mapSeries(list, async (unit, index) =>
						{
							bar?.update(index, { filename: unit['@resname'] ?? unit['@id'] });

//							switch (unit['@resname'])
//							{
//								case 'error.project.requires.older.plugin':
//								case 'icon.nodes.nodePlaceholder.tooltip':
//									console.dir(unit);
//							}

							const content_old = getElementText(unit.target);

							if (content_old?.length > 0)
							{
								let content_new = await handleText(content_old, info);

								if (content_new !== content_old)
								{
									unit.target = setElementText(unit.target, content_new);

									changed = true;

									delete unit['@translate'];
								}

								delete unit['@approved'];
								delete unit.target['@state'];
								delete unit.note;
							}
						});

						bar?.update(bar.getTotal());
						bar?.stop();
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
