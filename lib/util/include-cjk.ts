import { _re_cjk_conv } from 'regexp-helper/lib/cjk-conv';

/**
 * CJK 字元測試用的正規表達式，支援簡繁中文字元的匹配
 * Regular expression for CJK character testing, supporting Simplified and Traditional Chinese matching
 */
export const REGEXP_TEST = _re_cjk_conv('u');

/**
 * 檢測文字是否包含 CJK（中日韓）字元
 * Detect whether text contains CJK (Chinese-Japanese-Korean) characters
 * @param text - 要檢測的文字 / Text to test
 * @returns 是否包含 CJK 字元 / Whether text contains CJK characters
 */
export function textIncludeCJK(text: string)
{
	return REGEXP_TEST.test(text)
}
