import { getSegment, processText } from "novel-segment-cli";
import { chkcrlf, CR, CRLF, LF } from 'crlf-normalize';
import { EnumDictDatabase } from "novel-segment/lib/const";
import Bluebird from 'bluebird';

let inited: boolean;

export function initIdeaSegmentText()
{
	return Bluebird.resolve()
		.then(() =>
		{
			return !inited && getSegment().then(segment =>
			{

				let db_dict = segment.getDictDatabase(EnumDictDatabase.TABLE);
				let db_synonym = segment.getDictDatabase(EnumDictDatabase.SYNONYM);

				db_dict
					.add(['選項卡', 0x100000, 0])
				;

				db_synonym
					.add(['頁籤', '選項卡'])
					.add(['視窗', '窗口'])
					.add(['默認', '預設'])
					.add(['列印', '打印'])
				;

				inited = true;
			})
		})
}

export function processIdeaSegmentText(text: string)
{
	let _lb = chkcrlf(text);

	return initIdeaSegmentText().then(() => processText(text, {
		convertToZhTw: true,
		crlf: _lb.crlf ? CRLF : (_lb.lf || !_lb.cr) ? LF : CR,
	})).then(text => {
		return text
			//.replace(/打印/, '列印')
	})
}
