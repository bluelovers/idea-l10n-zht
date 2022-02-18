import { _re_cjk_conv } from 'regexp-helper/lib/cjk-conv';

export const REGEXP_TEST = _re_cjk_conv('u');

export function textIncludeCJK(text: string)
{
	return REGEXP_TEST.test(text)
}
