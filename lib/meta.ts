import { renderMarkdown } from './md';
import { readFileSync } from 'fs';
import { join } from 'upath2';
import { __root } from '../test/__root';
import { PluginXml } from './util/xml/plugin-xml';
import { insertAfterObjectKey } from './util/insertAfterObjectKey';

export function updateMeta(content_new: string)
{
	const html = renderMarkdown(readFileSync(join(__root, 'README.md')));

	const obj = new PluginXml(content_new);
	obj.removeUntilBuild();

	obj.id = 'com.intellij.zh-tw';
	obj.name = `Chinese (Traditional) Language Pack / 繁體中文語言包`;

	obj.root['vendor'] = {
		'@url': 'https://github.com/bluelovers/idea-l10n-zht',
		'#': 'bluelovers',
	}

	insertAfterObjectKey(obj.root, 'category', 'Language Pack', 'vendor');

	obj.description = html;
	obj.changeNnotes = `See <a href="https://github.com/bluelovers/idea-l10n-zht/commits/master">https://github.com/bluelovers/idea-l10n-zht/commits/master</a> or <a href="https://github.com/bluelovers/idea-l10n-zht/blob/master/CHANGELOG.md">CHANGELOG.md</a>`;

	delete obj.root['incompatible-with'];

	return obj.toString();
}
