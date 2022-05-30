import Bluebird from 'bluebird';
import { outputFile } from 'fs-extra';
import { join } from 'upath2';
import { __root } from '../../test/__root';

/**
 * @see https://plugins.jetbrains.com/docs/intellij/update-plugins-format.html#format-of-updatepluginsxml-file
 * @see https://www.jetbrains.com/help/idea/2016.3/adding-plugins-to-enterprise-repositories.html
 * @see https://intellij-support.jetbrains.com/hc/en-us/community/posts/115000113284-EAP-channel-for-plugins
 */
export default Bluebird.resolve()
	.then(async () =>
	{
		const { version_map_record } = await import('../../lib/const/version-map.json');
		const { __plugin_zh_cn_version } = await import('../../lib/const/link-of-zh-cn');

		const { since } = version_map_record[__plugin_zh_cn_version];

		const href = `https://github.com/bluelovers/idea-l10n-zht/raw/master/plugin-dev-out/zh.jar`;

		return outputFile(join(__root, 'plugin-dev-out', 'updatePlugins.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<plugins>
  <plugin
    id="com.intellij.zh-tw"
    url="${href}"
    version="${__plugin_zh_cn_version}">
    <idea-version since-build="${since}" />
  </plugin>
  <plugin
    id="sc.plugin.com.intellij.zh-tw"
    url="${href}"
    version="${__plugin_zh_cn_version}">
    <idea-version since-build="${since}" />
  </plugin>
</plugins>`)
	})
;
