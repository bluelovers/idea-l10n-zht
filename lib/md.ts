import MarkdownIt from 'markdown-it';
import { outputFile, readFile } from 'fs-extra';
import { join } from 'upath2';
import { __root } from '../test/__root';
import { readFileSync } from 'fs';
// @ts-ignore
import Token from 'markdown-it/lib/token';
import { LazyURL } from 'lazy-url';

/**
 * GitHub 原始檔案基礎 URL（用於解析圖片相對路徑）
 * GitHub raw file base URL (used for resolving image relative paths)
 *
 * 圖片連結需要指向 raw 內容才能正確顯示
 * Image links need to point to raw content for correct rendering
 */
const baseUrl = 'https://raw.githubusercontent.com/bluelovers/idea-l10n-zht/master/';

/**
 * GitHub 瀏覽器頁面基礎 URL（用於解析超連結相對路徑）
 * GitHub browser page base URL (used for resolving hyperlink relative paths)
 *
 * 連結需要指向 GitHub 瀏覽頁面以便使用者在瀏覽器中檢視
 * Links need to point to GitHub browser pages for viewing in browser
 */
const baseUrl2 = 'https://github.com/bluelovers/idea-l10n-zht/blob/master/';

/**
 * 建立並配置 MarkdownIt 實例
 * Create and configure MarkdownIt instance
 *
 * 啟用 HTML、自動連結偵測、換行符號轉換等功能，
 * 並註冊自訂 core ruler 用於重寫 token 中的相對路徑
 * Enables HTML, autolink detection, line break conversion, etc.,
 * and registers a custom core ruler to rewrite relative paths in tokens
 *
 * @returns 配置完成的 MarkdownIt 實例 / Configured MarkdownIt instance
 */
export function createMarkdownIt()
{
	const md = new MarkdownIt({
		html: true,
		linkify: true,
		breaks: true,
		xhtmlOut: true,
		typographer: true,
	});

	/**
	 * 關閉 fuzzy link 偵測，避免誤將非 URL 文字轉為連結
	 * Disable fuzzy link detection to prevent non-URL text from being converted to links
	 */
	md.linkify.set({
		fuzzyLink: false,
	});

	/**
	 * 註冊自訂 core ruler，用於將 Markdown token 中的相對路徑轉換為絕對 GitHub URL
	 * Register custom core ruler to convert relative paths in Markdown tokens to absolute GitHub URLs
	 */
	md.core.ruler.push('baseurl', (state) =>
	{
		_rewriteTokens(state.tokens);
	});

	return md
}

/**
 * 將 Markdown 內容渲染為 HTML
 * Render Markdown content to HTML
 *
 * 前綴 UTF-8 meta 標籤以確保中文正確顯示
 * Prefixes UTF-8 meta tag to ensure correct display of Chinese characters
 *
 * @param input - Markdown 原始文字或位元組陣列 / Markdown raw text or byte array
 * @returns 包含 UTF-8 meta 標籤的完整 HTML 字串 / Complete HTML string with UTF-8 meta tag
 */
export function renderMarkdown(input: string | Uint8Array)
{
	const md = createMarkdownIt();

	return `<meta charset="utf-8"/>` + md.render(input?.toString())
}

/**
 * 遞迴重寫 token 陣列中的圖片與連結路徑
 * Recursively rewrite image and link paths in token array
 *
 * 將 Markdown token 中的相對路徑轉換為 GitHub 絕對 URL，
 * 確保外掛描述頁面中的圖片與連結能正確指向 GitHub 倉庫
 * Converts relative paths in Markdown tokens to absolute GitHub URLs,
 * ensuring images and links in plugin description pages point correctly to the GitHub repository
 *
 * @param tokens - MarkdownIt token 陣列 / MarkdownIt token array
 */
export function _rewriteTokens(tokens: Token[]): void
{
	for (const token of tokens)
	{
		/**
		 * 圖片 token：將 src 屬性的相對路徑轉換為指向 raw 內容的絕對 URL
		 * Image token: convert src attribute relative path to absolute URL pointing to raw content
		 */
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
		/**
		 * 連結 token：將 href 屬性的相對路徑轉換為指向 GitHub 瀏覽頁面的絕對 URL
		 * Link token: convert href attribute relative path to absolute URL pointing to GitHub browser page
		 */
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
		/**
		 * 遞迴處理巢狀 token（如區塊引用、列表等）
		 * Recursively process nested tokens (e.g., blockquotes, lists)
		 */
		if (token.children !== null)
		{
			_rewriteTokens(token.children);
		}
	}
}
