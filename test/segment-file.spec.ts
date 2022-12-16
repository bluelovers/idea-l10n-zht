import { initIdeaSegmentText, processIdeaSegmentText } from '../lib/segment';
import { readFile } from 'fs-extra';
import { join } from 'upath2';
import { __plugin_dev_raw_dir, __plugin_downloaded_dir_unzip } from '../lib/const';
import { cn2tw_min } from '@lazy-cjk/zh-convert/min';
import { cn2tw } from '@lazy-cjk/zh-convert';
import { array_unique_overwrite } from 'array-hyper-unique';
import { assertTestExpected } from './lib/assertTestExpected';

jest.setTimeout(60 * 1000);

beforeAll(async () =>
{
	await initIdeaSegmentText()
});

/**
 * 繁體
 */
const words = array_unique_overwrite([
	`打印`,
	`粘貼`,
	`剪貼板`,
	`選項卡`,
	`只讀`,
	`標籤頁`,
	`文件夾`,
	`插件`,
	'別別',
	`窗體`,
	`窗口`,
].reduce((ls, s) =>
{

	ls.push(s);
	ls.push(cn2tw_min(s));
	ls.push(cn2tw(s));

	return ls
}, [] as string[]));

const files = [
	'messages/IdeBundle.properties',
	'messages/CloudConfigBundle.properties',
] as const;

/**
 * 檢查原始來源的檔案(簡體)
 */
describe(`src`, () =>
{
	files.forEach(file =>
	{

		test(file, async () =>
		{
			assertTestExpected(words);

			let text = await readFile(join(__plugin_downloaded_dir_unzip, 'zh', file)).then(m => m.toString());

			let actual = await processIdeaSegmentText(text);

			words.forEach(s =>
			{
				expect(actual).not.toContain(s)
			})

			expect(actual).toMatchSnapshot();

		});

	})

})

/**
 * 檢查原始來源的檔案(繁體)
 */
describe(`dev`, () =>
{
	files.forEach(file =>
	{

		test(file, async () =>
		{

			assertTestExpected(words);

			let text = await readFile(join(__plugin_dev_raw_dir, 'zh', file)).then(m => m.toString());

			let actual = await processIdeaSegmentText(text);

			words.forEach(s =>
			{
				expect(actual).not.toContain(s)
			})

			expect(actual).toMatchSnapshot();

		});

	})

})
