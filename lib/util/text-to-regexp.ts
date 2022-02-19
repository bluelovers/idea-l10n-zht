import { zhRegExpWithPluginEnabled } from 'regexp-cjk-with-plugin-enabled';
import escapeStringRegexp from 'escape-string-regexp';
import { zhRegExp } from 'regexp-cjk';

// @ts-ignore
export function textToRegexp<T extends RegExp>(pattern: string | RegExp, flags?: string, RegExpClass: new (...argv: any[]) => T = zhRegExpWithPluginEnabled): T
{
	if (typeof pattern === 'string')
	{
		pattern = escapeStringRegexp(pattern);
	}

	return new RegExpClass(pattern, flags) as any
}
