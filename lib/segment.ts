import { getSegment, processText } from "novel-segment-cli";
import { detectLineBreak } from 'crlf-normalize';
import Bluebird from 'bluebird';
import Segment from "novel-segment/lib";
import { load as loadSynonym } from '@novel-segment/loaders/segment/synonym';
import { load as loadTable } from '@novel-segment/loaders/segment/index';
import { __dict_synonym_txt, __dict_table_txt } from './const';
import { EnumDictDatabase } from "@novel-segment/types";

let inited: Segment;

export function initIdeaSegmentText()
{
	return Bluebird.resolve()
		.then(async () =>
		{
			if (!inited)
			{
				inited = await getSegment({
					//disableCache: true,
					optionsSegment: {
						nodeNovelMode: true,
					},
				}).then(async (segment) =>
				{
					const db_dict = segment.getDictDatabase(EnumDictDatabase.TABLE);
					const db_synonym = segment.getDictDatabase(EnumDictDatabase.SYNONYM);

					const autoCjk = db_dict.options.autoCjk;
					db_dict.options.autoCjk = true;

					/*
					db_dict
						.add(['選項卡', 0x100000, 0])
						.add(['標籤頁', 0x100000, 0])
						.add(['標簽頁', 0x100000, 0])
					;
					 */

					db_dict
						.remove('复上')
						.remove('复分析')
						.remove('为重')
						.remove('出新')
					;

					await loadTable(__dict_table_txt)
						.each(data =>
						{
							return db_dict.add(data as any);
						})
					;

					db_dict.options.autoCjk = autoCjk;

					await loadSynonym(__dict_synonym_txt)
						.each(data =>
						{
							return db_synonym.add(data as any, false, true);
						})
					;

					/*
					db_synonym
						.add(['頁籤', '選項卡', '標籤頁', '標簽頁', '选项卡', '标签页', '标签页'])
						.add(['視窗', '窗口', '窗口'])
						.add(['預設', '默認', '默认'])
						.add(['列印', '打印', '打印'])
						.add(['貼上', '粘貼', '粘贴'])
						.add(['剪貼簿', '剪貼板', '剪贴板'])
						.add(['剪下', '剪切', '剪切'])
						.add(['註釋', '注釋', '注释'])
						.add(['唯讀', '只讀', '只读'])
						.add(['選單', '菜單', '菜单'])
						.add(['日誌', '日志'])
						.add(['註解', '注解', '注解'])
						.add(['磁碟', '磁盤', '磁盘'])
					;
					 */

					return inited = segment;
				})
			}
			return inited
		})
}

export function processIdeaSegmentText(text: string)
{
	return initIdeaSegmentText()
		.then(() => processText(text, {
			convertToZhTw: true,
			crlf: detectLineBreak(text),
		}))
		.then(text =>
		{
			return text
				.replace(/后/g, '後')
				.replace(/于/g, '於')
				;
		})
}
