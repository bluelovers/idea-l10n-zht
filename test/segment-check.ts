import { async as FastGlob } from '@bluelovers/fast-glob/bluebird';
import { join } from 'upath2';
import { __root } from './__root';
import { outputJSON, readFile } from 'fs-extra';
import { initIdeaSegmentText } from '../lib/segment';
import { debug_token } from 'novel-segment/lib/util/index';
import { printPrettyDiff } from '@novel-segment/pretty-diff';
import { chalkByConsole, console } from 'debug-color2';

const cwd = join(__root, 'test', 'temp');

/**
 * 人工檢查分詞系統產生的結果列表來了解為什麼沒有發生預期的轉換
 */
export default FastGlob<string>([
	'*.txt',
], {
	cwd,
})
	.mapSeries(async (file) =>
	{
		console.info(file);

		const input = await readFile(join(cwd, file)).then(buf => buf.toString());

		return initIdeaSegmentText()
			.then(seg => seg.doSegment(input))
			.tap(result => debug_token(result))
			.tap(result =>{
				console.gray("==================");

				console.log(result.map(w => w.w).join('／'));

				printPrettyDiff(input, result);
				console.gray("==================");
			})
			.tap(result => outputJSON(join(cwd, file + '.json'), result, {
				spaces: 2,
			}))
			;
	})
;
