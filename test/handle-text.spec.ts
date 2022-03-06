import { join } from 'upath2';
import { __plugin_dev_raw_dir, __plugin_downloaded_dir_unzip } from '../lib/const';
import { array_unique_overwrite } from 'array-hyper-unique';
import { textToRegexp } from '../lib/util/text-to-regexp';
import { ITSArrayListMaybeReadonly, ITSValueOrArrayMaybeReadonly } from 'ts-type/lib/type/base';
import { handleFile } from './lib/handle.file';
import { before } from 'lodash';
import { initIdeaSegmentText } from '../lib/segment';

jest.setTimeout(60 * 1000);

beforeAll(async () => {
	await initIdeaSegmentText()
});

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

type ITestConfig = [words: ITSValueOrArrayMaybeReadonly<string | RegExp>, notMatch?: boolean];

type ITestInput = [file: string, ...config: ITestConfig] | readonly [file: string, ...config: ITestConfig];

type ITestInput2 =
	[file: ITSValueOrArrayMaybeReadonly<string>, ...config: ITestConfig]
	| readonly [file: string, ...config: ITestConfig];

const tests = _handleTestsSetting([
	[`inspectionDescriptions/LeakableMapKey.html`, `解除安裝`],
	[files_git, words_git, true],
	[
		[
			`messages/JavaScriptBundle.properties`,
			`messages/PhpBundle.properties`,
			`messages/InspectionGadgetsBundle.properties`,
		], `縮小`, true,
	],
	[`messages/ActionsBundle.properties`, `縮小`],
	[`messages/IdeBundle.properties`, [`Java 運行時`, `Java 執行時`], true],
]);

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

function _handleTestsSetting(tests: ITSArrayListMaybeReadonly<ITestInput2>): Record<string, ITestConfig[]>
{
	// @ts-ignore
	return tests.reduce((data: Record<string, ITestConfig[]>, [file, words, not]) =>
	{

		[file].flat()
			.forEach(file =>
			{
				data[file] ??= [];

				[words].flat()
					.forEach(words =>
					{
						data[file].push([words, not])
					})
				;

			})
		;

		return data
	}, {} as Record<string, ITestConfig[]>);
}

function _initTests(data: Record<string, ITestConfig[]>, cwd: string)
{
	Object.keys(data)
		.sort()
		.forEach((file) =>
		{
			_doTests(file, data[file], cwd)
		})
	;
}

function _doTests(file: string, configs: ITestConfig[], cwd: string)
{
	test(file, async () =>
	{
		let { actual } = await handleFile(file, cwd);

		configs.forEach(([s, not]) =>
		{
			let t = expect(actual);

			if (not)
			{
				// @ts-ignore
				t = t.not
			}

			t.toMatch(textToRegexp(s as string));
		});

		expect(actual).toMatchSnapshot();
	})
}
