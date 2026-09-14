import { readFile } from 'fs-extra';
import { __file_plugin_dev_meta_xml, __file_plugin_src_meta_xml } from '../const';
import { PluginXml } from '../util/xml/plugin-xml';
import { _getVersionDownloadByVersion } from '../util/version-map';
import { readFileSync } from 'fs';

/**
 * 根據 useSrc 標誌選擇對應的 plugin.xml 檔案路徑
 * Select corresponding plugin.xml file path based on useSrc flag
 *
 * @param useSrc - 是否使用來源版本的 plugin.xml / Whether to use source version of plugin.xml
 * @returns 包含 useSrc 與對應檔案路徑的物件 / Object with useSrc and corresponding file path
 */
function _handleInput(useSrc: boolean)
{
	useSrc = !!useSrc;

	const file = useSrc ? __file_plugin_src_meta_xml : __file_plugin_dev_meta_xml;

	return {
		useSrc,
		file,
	}
}

/**
 * 核心邏輯：解析 plugin.xml 並提供版本資訊與下載連結
 * Core logic: parse plugin.xml and provide version info and download URL
 *
 * @param input - 包含 useSrc、檔案路徑與內容的物件 / Object with useSrc, file path, and content
 * @returns 包含 pluginMeta 解析結果與 getDownloadURL 方法的物件 / Object with parsed pluginMeta and getDownloadURL method
 */
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
		/**
		 * 取得對應版本的下載連結
		 * Get download URL for the corresponding version
		 */
		getDownloadURL()
		{
			return _getVersionDownloadByVersion(pluginMeta.version)
		},
	}
}

/**
 * 同步版本：讀取並解析 plugin.xml 的版本資訊
 * Synchronous version: read and parse plugin.xml version info
 *
 * @param useSrc - 是否使用來源版本的 plugin.xml / Whether to use source version of plugin.xml
 * @returns 包含版本資訊與下載連結方法的物件 / Object with version info and download URL method
 */
export function getSourceInfoSync(useSrc?: boolean)
{
	const input = _handleInput(useSrc);

	const content = readFileSync(input.file);

	return _getSourceInfoCore({
		...input,
		content,
	})
}

/**
 * 非同步版本：讀取並解析 plugin.xml 的版本資訊
 * Asynchronous version: read and parse plugin.xml version info
 *
 * @param useSrc - 是否使用來源版本的 plugin.xml / Whether to use source version of plugin.xml
 * @returns 包含版本資訊與下載連結方法的 Promise / Promise with version info and download URL method
 */
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
