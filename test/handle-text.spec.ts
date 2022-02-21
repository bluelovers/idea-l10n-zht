import { join } from 'upath2';
import { __plugin_dev_raw_dir, __plugin_downloaded_dir_unzip } from '../lib/const';
import { array_unique_overwrite } from 'array-hyper-unique';
import { textToRegexp } from '../lib/util/text-to-regexp';
import { ITSArrayListMaybeReadonly, ITSValueOrArrayMaybeReadonly } from 'ts-type/lib/type/base';
import { handleFile } from './lib/handle.file';

jest.setTimeout(60 * 1000);

/**
 * 繁體
 */
const words_git = array_unique_overwrite([
	`提取`,
	//`签出`,
	`儲存庫`,
]);

const files_git = [
	'messages/GitBundle.properties',
	'messages/GithubBundle.properties',
	'messages/VcsBundle.properties',
	'messages/VcsLogBundle.properties',
	'messages/SvnBundle.properties',
	'messages/DiffBundle.properties',
] as const;

type ITestInput = [file: string, words: ITSValueOrArrayMaybeReadonly<string | RegExp>, notMatch?: boolean] | readonly [file: string, words: ITSValueOrArrayMaybeReadonly<string | RegExp>, notMatch?: boolean];

const tests: ITSArrayListMaybeReadonly<ITestInput> = [
	[`inspectionDescriptions/LeakableMapKey.html`, `解除安裝`],
	...files_git.map(file => [file, words_git, true] as const),
];

/**
 * 檢查原始來源的檔案(簡體)
 */
describe(`src`, () =>
{
	const cwd = join(__plugin_downloaded_dir_unzip, 'zh');

	_initTests(tests, cwd);

})

/**
 * 檢查處理過的檔案(繁體)
 */
describe(`dev`, () =>
{
	const cwd = join(__plugin_dev_raw_dir, 'zh');

	_initTests(tests, cwd);

})

function _initTests(tests: ITSArrayListMaybeReadonly<ITestInput>, cwd: string)
{
	tests.forEach((testInput) => _doTests(testInput, cwd))
}

function _doTests([file, words, not]: ITestInput, cwd: string)
{
	test(file, async () =>
	{
		let { actual } = await handleFile(file, cwd);

		[words].flat().forEach(s =>
		{
			let t = expect(actual);

			if (not)
			{
				// @ts-ignore
				t = t.not
			}

			t.toMatch(textToRegexp(s));
		});

		expect(actual).toMatchSnapshot();
	})
}

