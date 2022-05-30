import Bluebird from 'bluebird';
import { outputFile, readJSON } from 'fs-extra';
import { join } from 'upath2';
import { __root } from '../../test/__root';
import { LF } from 'crlf-normalize';

/**
 * @see https://plugins.jetbrains.com/docs/intellij/update-plugins-format.html#format-of-updatepluginsxml-file
 * @see https://www.jetbrains.com/help/idea/2016.3/adding-plugins-to-enterprise-repositories.html
 * @see https://intellij-support.jetbrains.com/hc/en-us/community/posts/115000113284-EAP-channel-for-plugins
 */
export default Bluebird.resolve()
	.then(async () =>
	{
		const { version_map_record } = await readJSON(join(__root, 'lib/const/version-map.json')) as typeof import('../../lib/const/version-map')

		const { __plugin_zh_cn_version } = await import('../../lib/const/link-of-zh-cn');

		const href = `https://github.com/bluelovers/idea-l10n-zht/raw/master/plugin-dev-out/zh.jar`;

		const lines: string[] = [];

		lines.push(`<?xml version="1.0" encoding="UTF-8"?>`);
		lines.push(`<plugins>`);

		Object.entries(version_map_record)
			.forEach(([version, data]) =>
			{

				const { since } = data;
				let href = `https://github.com/bluelovers/idea-l10n-zht/raw/v${version}/plugin-dev-out/zh.jar`;

				if (version === __plugin_zh_cn_version)
				{
					href = `https://github.com/bluelovers/idea-l10n-zht/raw/master/plugin-dev-out/zh.jar`;
				}

				lines.push(`  <plugin
    id="com.intellij.zh-tw"
    url="${href}"
    version="${version}">
    <idea-version since-build="${since}" />
  </plugin>
  <plugin
    id="sc.plugin.com.intellij.zh-tw"
    url="${href}"
    version="${version}">
    <idea-version since-build="${since}" />
  </plugin>`);

			})

		lines.push(`</plugins>`);

		return outputFile(join(__root, 'plugin-dev-out', 'updatePlugins.xml'), lines.join(LF))
	})
;
