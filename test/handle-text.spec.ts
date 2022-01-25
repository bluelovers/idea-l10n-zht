import { readFile } from 'fs-extra';
import { join } from 'upath2';
import { __plugin_dev_raw_dir, __plugin_downloaded_dir_unzip } from '../lib/const';
import { cn2tw_min } from '@lazy-cjk/zh-convert/min';
import { cn2tw } from '@lazy-cjk/zh-convert';
import { array_unique_overwrite } from 'array-hyper-unique';
import { handleText } from '../lib/handleText';

jest.setTimeout(60 * 1000);

/**
 * 繁體
 */
const words = array_unique_overwrite([
	`提取`,
].reduce((ls, s) =>
{

	ls.push(s);
	ls.push(cn2tw_min(s));
	ls.push(cn2tw(s));

	return ls
}, [] as string[]));

const files = [
	'messages/GitBundle.properties',
	'messages/GithubBundle.properties',
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

			let text = await readFile(join(__plugin_downloaded_dir_unzip, 'zh', file)).then(m => m.toString());

			let actual = await handleText(text, {
				file,
			});

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

			let text = await readFile(join(__plugin_dev_raw_dir, 'zh', file)).then(m => m.toString());

			let actual = await handleText(text, {
				file,
			});

			words.forEach(s =>
			{
				expect(actual).not.toContain(s)
			})

			expect(actual).toMatchSnapshot();

		});

	})

})
