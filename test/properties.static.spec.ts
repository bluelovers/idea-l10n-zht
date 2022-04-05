//@noUnusedParameters:false

import { __dict_properties_lazy, __plugin_downloaded_dir_unzip } from '../lib/const';
import DotProperties from 'dot-properties-loader';
import { textToRegexp } from '../lib/util/text-to-regexp';

describe(`static properties`, () =>
{
	const LAZY_PROPERTIES = new DotProperties({
		file: __dict_properties_lazy,
	});

	const wts = [
		'插件',
		'軟件包',
		'抓屏',
	].map(s => {
		return [s, textToRegexp(s as string)] as const
	});

	Object.keys(LAZY_PROPERTIES.tree)
		.forEach(key => {

			describe(key, () => {

				const value = LAZY_PROPERTIES.get(key)

				wts
					.forEach(([s, r]) => {

						test(s, () => {

							expect(value).not.toMatch(r);

						})

					})
				;

			});

		})
	;

})
