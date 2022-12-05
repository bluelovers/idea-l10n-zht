import { sync as FastGlob } from '@bluelovers/fast-glob/bluebird';
import { join } from 'upath2';
import { __plugin_downloaded_dir_unzip } from '../lib/const';
import { handlePropertiesFile, LAZY_PROPERTIES, LAZY_PROPERTIES_KEYS } from '../lib/build/properties-replace';
import { DotProperties } from 'dot-properties-loader';
import { escape } from 'dot-properties2/lib/escape';

const lang = 'zh' as const
const cwd = join(__plugin_downloaded_dir_unzip, lang);

describe(`cache original properties`, () =>
{
	const _map: Record<string, Record<string, string>> = {};
	const _map2: Record<string, string> = {};

	describe(`files`, () =>
	{
		FastGlob<string>([
			'**/*.properties',
		], {
			cwd,
		}).forEach(file =>
		{

			const fullpath = join(cwd, file);

			const dp = new DotProperties({
				file: fullpath,
			});

			const tree = dp.tree;
			let _exists = false;

			LAZY_PROPERTIES_KEYS
				.forEach(key =>
				{

					if (key in tree)
					{
						_map[file] ??= {};

						const value = dp.get(key) as string;
						const value_escaped = escape(value, false);

						_map[file][key] = value_escaped;
						_exists = true;

						if (LAZY_PROPERTIES.get(key) === value)
						{
							_map2[key] = value_escaped;
						}
					}

				})
			;

			if (_exists)
			{
				test(file, () =>
				{
					expect(_map[file]).toMatchSnapshot();
				});
			}

		});
	});

	test(`same`, () =>
	{
		expect(_map2).toMatchSnapshot();
	});
});
