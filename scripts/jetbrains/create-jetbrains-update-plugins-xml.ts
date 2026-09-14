/**
 * 生成 JetBrains 插件倉庫的 updatePlugins.xml
 * Generate updatePlugins.xml for JetBrains plugin repository
 *
 * 根據所有歷史版本標籤生成 XML 格式的插件更新清單，
 * 供 IntelliJ 系列 IDE 的企業版倉庫使用。
 * Generates XML-formatted plugin update list from all historical version tags,
 * used for IntelliJ-based IDE enterprise repositories.
 *
 * @see https://plugins.jetbrains.com/docs/intellij/update-plugins-format.html#format-of-updatepluginsxml-file
 * @see https://www.jetbrains.com/help/idea/2016.3/adding-plugins-to-enterprise-repositories.html
 */
import Bluebird from 'bluebird';
import { outputFile, readJSON } from 'fs-extra';
import { join } from 'upath2';
import { __root } from '../../test/__root';
import { LF } from 'crlf-normalize';
import { pathToFileURL } from 'node:url';
import { _getVersionInfoBySeries, _getVersionInfoByVersion } from '../../lib/util/version-map';
import { array_unique, array_unique_overwrite } from 'array-hyper-unique';
import { __file_publish_tags_json } from '../../lib/const';
import { updatePublishTags } from '../../lib/git/update-publish-tags';
import { getSourceInfoSync } from '../../lib/build/get-source-info';
import { createNew } from '@bluelovers/string-natural-compare';
import { PluginXml } from '../../lib/util/xml/plugin-xml';
import { versionToParts } from '@lazy-node/semver-part';

/** 使用自然排序（降序）對版本號進行排序 / Use natural sort (descending) for version numbers */
const _myNaturalCompare = createNew({
	desc: true,
});

/**
 * @see https://plugins.jetbrains.com/docs/intellij/update-plugins-format.html#format-of-updatepluginsxml-file
 * @see https://www.jetbrains.com/help/idea/2016.3/adding-plugins-to-enterprise-repositories.html
 * @see https://intellij-support.jetbrains.com/hc/en-us/community/posts/115000113284-EAP-channel-for-plugins
 */
export default Bluebird.resolve()
	.then(async () =>
	{
		const tags = await updatePublishTags();

		const pluginMeta = getSourceInfoSync().pluginMeta;

		const __pluginVersion = pluginMeta.version;

		const { __plugin_zh_cn_version } = await import('../../lib/const/link-of-zh-cn');

		const pkg = await import(pathToFileURL(join(__root, 'package.json')).href);

		const lines: string[] = [];

		lines.push(`<?xml version="1.0" encoding="UTF-8"?>`);
		lines.push(`<plugins>`);

		/**
		 * 合併所有版本（簡體中文版版本、歷史標籤、當前版本）並去重排序，
		 * 確保 XML 中包含所有可安裝的版本
		 * Merge all versions (zh-CN version, historical tags, current version),
		 * deduplicate and sort to include all installable versions in the XML
		 */
		array_unique([
			__plugin_zh_cn_version,
			...tags,
			__pluginVersion,
		])
			.sort(_myNaturalCompare)
			.forEach((version) =>
			{

				const since = getVersionSinceLazy(version, pluginMeta);

				/** 預設使用版本標籤的下載 URL / Use tag-based download URL by default */
				let href = `https://github.com/bluelovers/idea-l10n-zht/raw/v${version}/plugin-dev-out/zh.jar`;

				/**
				 * 簡體中文版使用 master 分支的 URL（因為與簡體版同步）
				 * zh-CN version uses master branch URL (synced with simplified Chinese version)
				 */
				if (version === __plugin_zh_cn_version)
				{
					href = `https://github.com/bluelovers/idea-l10n-zht/raw/master/plugin-dev-out/zh.jar`;
				}

				lines.push(`  <plugin
    id="com.intellij.zh-tw"
    url="${href}"
    version="${version}">
    <idea-version since-build="${since}" />
    <name>${pluginMeta.name}</name>
    <description><![CDATA[${pkg.description}]]></description>
  </plugin>
  <!--plugin
    id="sc.plugin.com.intellij.zh-tw"
    url="${href}"
    version="${version}">
    <idea-version since-build="${since}" />
    <name>${pluginMeta.name}</name>
    <description><![CDATA[${pkg.description}]]></description>
  </plugin-->`);

			})

		lines.push(`</plugins>`);

		return outputFile(join(__root, 'plugin-dev-out', 'updatePlugins.xml'), lines.join(LF))
	})
;

/**
 * 延遲取得版本對應的 since-build 值
 * Lazily get the since-build value for a given version
 *
 * 判斷邏輯 / Logic:
 * - series >= 251：直接使用主版本號作為 since-build（新版 IDE 格式）
 * - series < 251：從版本對應表查找精確的 since-build 值
 *   若查不到則回退到 pluginMeta 的預設值
 *
 * @param versionOrSeries - 版本號或主版本系列號 / Version number or major series number
 * @param pluginMeta - 插件的 XML 元資料 / Plugin XML metadata
 * @returns since-build 值 / since-build value
 */
function getVersionSinceLazy(versionOrSeries: string, pluginMeta: PluginXml)
{
	const series = versionToParts(versionOrSeries)[0];

	// @ts-ignore
	if (series >= 251)
	{
		return series
	}

	return (_getVersionInfoByVersion(versionOrSeries) ?? _getVersionInfoBySeries(versionOrSeries))?.since ?? pluginMeta.versionSinceBuild(true) ?? series
}
