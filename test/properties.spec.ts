//@noUnusedParameters:false

import { basename, extname } from 'path';
import { handlePropertiesFile, stringifyProperties } from '../lib/build/properties-replace';
import { __plugin_downloaded_dir_unzip } from '../lib/const';
import { join } from 'upath2';
import { handleFile } from './lib/handle.file';

describe(`messages/AnalysisBundle.properties`, () =>
{
	const file = `messages/AnalysisBundle.properties`;
	const cwd = join(__plugin_downloaded_dir_unzip, 'zh');

	test(`handlePropertiesFile`, () =>
	{

		let {
			dp,
		} = handlePropertiesFile(file, cwd);

		const actual = stringifyProperties(dp);

		_chk(actual);

	});

	test(`handleFile`, async () =>
	{

		let { actual } = await handleFile(file, cwd);

		_chk(actual);

	});

	function _chk(actual: string)
	{
		expect(actual).toContain(`inspection.dead.code.problem.synopsis29.constructor`);
		expect(actual).not.toContain(`[native code]`);
		expect(actual).toMatchSnapshot();
	}

})

