import { zhRegExpWithPluginEnabled } from 'regexp-cjk-with-plugin-enabled';
import escapeStringRegexp from 'escape-string-regexp';
import { zhRegExp } from 'regexp-cjk';

/**
 * 將文字或正規表達式轉換為支援中文的正規表達式
 * 透過 zhRegExpWithPluginEnabled 提供對 CJK 字元的跨字元匹配支援
 * Convert text or regex to a Chinese-supporting regular expression
 * Uses zhRegExpWithPluginEnabled to provide cross-character matching for CJK characters
 * @param pattern - 要轉換的文字或正規表達式 / Text or regex to convert
 * @param flags - 正規表達式修飾詞 / Regular expression flags
 * @param RegExpClass - 正規表達式類別建構函式（預設使用 zhRegExpWithPluginEnabled） / RegExp class constructor (defaults to zhRegExpWithPluginEnabled)
 * @returns 轉換後的正規表達式 / Converted regular expression
 */
// @ts-ignore
export function textToRegexp<T extends RegExp>(pattern: string | RegExp, flags?: string, RegExpClass: new (...argv: any[]) => T = zhRegExpWithPluginEnabled): T
{
	if (typeof pattern === 'string')
	{
		pattern = escapeStringRegexp(pattern);
	}

	return new RegExpClass(pattern, flags) as any
}
