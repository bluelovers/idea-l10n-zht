import { async as FastGlob } from '@bluelovers/fast-glob/bluebird';
import { __dict_properties_lazy, __plugin_dev_raw_dir } from '../lib/const';
import { SingleBar } from 'cli-progress';
import { console } from 'debug-color2';
import { join } from 'upath2';
import { createMultiBar } from '../lib/cli-progress';
import DotProperties from 'dot-properties-loader';
import { outputJSON } from 'fs-extra';

const multibar = createMultiBar();

const LAZY_PROPERTIES = new DotProperties({
	file: __dict_properties_lazy,
});

const LAZY_PROPERTIES_KEYS = Object.keys(LAZY_PROPERTIES.tree);

export default FastGlob<string>([
	'*',
	'!*.list.json',
], {
	cwd: __plugin_dev_raw_dir,
	onlyDirectories: true,
}).mapSeries(async (lang) =>
	{
		let bar: SingleBar;

		console.cyan.log(`update ${lang} properties`);

		const cwd = join(__plugin_dev_raw_dir, lang);

		bar = multibar.create(100, 0);

		const changedList = [] as string[];

		return FastGlob([
			'**/*.properties',
		], {
			cwd,
		})
			.tap((ls) =>
			{
				bar?.setTotal(ls.length);
			})
			.mapSeries(async (file: string, index) =>
			{
				bar?.update(index, { filename: file });
				const fullpath = join(cwd, file);

				const dp = new DotProperties({
					file: fullpath,
				});

				let _changed = false;

				const tree = dp.tree;

				LAZY_PROPERTIES_KEYS
					.forEach(key =>
					{

						if (key in tree)
						{
							dp.set(key, LAZY_PROPERTIES.get(key) as any);

							_changed = true;
						}

					})
				;

				if (_changed)
				{
					changedList.push(file);
					dp.save({
						file: fullpath,
						options: {
							latin1: false,
							keySep: '=',
						},
					});
				}
			})
			.tap(() =>
			{
				return outputJSON(join(__plugin_dev_raw_dir, lang + '.list.properties.changed.json'), changedList, {
					spaces: 2,
				})
			})
			.finally(() =>
			{
				bar?.update(bar.getTotal());
				bar?.stop();
			})
	})
	.then(() =>
	{
		multibar?.stop();
	})
;
