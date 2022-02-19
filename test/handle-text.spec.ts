import { readFile } from 'fs-extra';
import { join } from 'upath2';
import { __plugin_dev_raw_dir, __plugin_downloaded_dir_unzip } from '../lib/const';
import { cn2tw_min } from '@lazy-cjk/zh-convert/min';
import { cn2tw } from '@lazy-cjk/zh-convert';
import { array_unique_overwrite } from 'array-hyper-unique';
import { handleText } from '../lib/handleText';
import { zhRegExpWithPluginEnabled } from 'regexp-cjk-with-plugin-enabled';
import escapeStringRegexp from 'escape-string-regexp';
import { textToRegexp } from '../lib/util/text-to-regexp';
import { ITSArrayListMaybeReadonly, ITSValueOrArrayMaybeReadonly } from 'ts-type/lib/type/base';

jest.setTimeout(60 * 1000);

/**
 * 繁體
 */
const words_git = array_unique_overwrite([
	`提取`,
].reduce((ls, s) =>
{

//	ls.push(s);
//	ls.push(cn2tw_min(s));
//	ls.push(cn2tw(s));

	ls.push(textToRegexp(s));

	return ls
}, [] as RegExp[]));

const files_git = [
	'messages/GitBundle.properties',
	'messages/GithubBundle.properties',
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

export async function handleFile(file: string, cwd: string)
{
	const text = await readFile(join(cwd, file)).then(m => m.toString());

	const actual = await handleText(text, {
		file,
	});

	return {
		text,
		actual,
	}
}
