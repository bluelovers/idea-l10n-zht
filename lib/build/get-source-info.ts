import { readFile } from 'fs-extra';
import { __file_plugin_dev_meta_xml, __file_plugin_src_meta_xml } from '../const';
import { PluginXml } from '../util/xml/plugin-xml';
import { _getVersionDownloadByVersion } from '../util/version-map';
import { readFileSync } from 'fs';

function _handleInput(useSrc: boolean)
{
	useSrc = !!useSrc;

	const file = useSrc ? __file_plugin_src_meta_xml : __file_plugin_dev_meta_xml;

	return {
		useSrc,
		file,
	}
}

export function _getSourceInfoCore(input: {
	useSrc: boolean,
	file: string,
	content: Buffer | string,
})
{
	const pluginMeta = new PluginXml(input.content);

	return {
		useSrc: !!input.useSrc,
		file: input.file,
		pluginMeta,
		getDownloadURL()
		{
			return _getVersionDownloadByVersion(pluginMeta.version)
		},
	}
}

export function getSourceInfoSync(useSrc?: boolean)
{
	const input = _handleInput(useSrc);

	const content = readFileSync(input.file);

	return _getSourceInfoCore({
		...input,
		content,
	})
}

export function getSourceInfo(useSrc?: boolean)
{
	const input = _handleInput(useSrc);

	return readFile(input.file)
		.then(content =>
		{
			return _getSourceInfoCore({
				...input,
				content,
			})
		})
}
