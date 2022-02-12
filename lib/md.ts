import MarkdownIt from 'markdown-it';
import { outputFile, readFile } from 'fs-extra';
import { join } from 'upath2';
import { __root } from '../test/__root';
import { readFileSync } from 'fs';
import Token from 'markdown-it/lib/token';
import { LazyURL } from 'lazy-url';

const baseUrl = 'https://raw.githubusercontent.com/bluelovers/idea-l10n-zht/master/';

const baseUrl2 = 'https://github.com/bluelovers/idea-l10n-zht/blob/master/';

export function createMarkdownIt()
{
	const md = new MarkdownIt({
		html: true,
		linkify: true,
		breaks: true,
		xhtmlOut: true,
		typographer: true,
	});

	md.linkify.set({
		fuzzyLink: false,
	});

	md.core.ruler.push('baseurl', (state) =>
	{
		_rewriteTokens(state.tokens);
	});

	return md
}

export function renderMarkdown(input: string | Uint8Array)
{
	const md = createMarkdownIt();

	return `<meta charset="utf-8"/>` + md.render(input?.toString())
}

export function _rewriteTokens(tokens: Token[]): void
{
	for (const token of tokens)
	{
		if (token.type === 'image')
		{
			for (const attr of token.attrs)
			{
				if (attr[0] === 'src')
				{
					//attr[1] = baseUrl + attr[1];
					attr[1] = new LazyURL(attr[1], baseUrl).href;
					break;
				}
			}
		}
		else if (token.type === 'link_open')
		{
			for (const attr of token.attrs)
			{
				if (attr[0] === 'href')
				{
					//attr[1] = baseUrl + attr[1];
					attr[1] = new LazyURL(attr[1], baseUrl2).href;
					break;
				}
			}
		}
		// Process recursively
		if (token.children !== null)
		{
			_rewriteTokens(token.children);
		}
	}
}
