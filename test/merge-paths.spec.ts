import { basename, extname } from 'path';
import { mergePaths } from '../lib/merge-paths';
import { join } from 'upath2';
import { __plugin_dev_overwrite_dir, __plugin_dev_raw_dir } from '../lib/const';

describe(`ignore`, () =>
{

	test.skip(`dummy`, () => {});

	const {
		isMatch,
	} = mergePaths([]);

	[
		//'intentionDescriptions/AdapterToListenerIntention/description.html',
	].forEach(file => {

		test(file, () =>
	{

		let actual = isMatch(file);

		expect(actual).toBeFalsy();

	});

	})

})
