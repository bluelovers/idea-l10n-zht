import { join } from 'upath2';
import { __root } from '../test/__root';

/**
 * original-plugin
 */
export const __plugin_downloaded_dir = join(__root, 'original-plugin');
/**
 * original-plugin-raw
 */
export const __plugin_downloaded_dir_unzip = join(__root, 'original-plugin-raw');

/**
 * plugin-dev-raw
 */
export const __plugin_dev_raw_dir = join(__root, 'plugin-dev-raw');
/**
 * plugin-dev-out
 */
export const __plugin_dev_output_dir = join(__root, 'plugin-dev-out');

/**
 * plugin-dev-overwrite
 */
export const __plugin_dev_overwrite_dir = join(__root, 'plugin-dev-overwrite');

/**
 * lib/static/table.txt
 */
export const __dict_table_txt = join(__root, 'lib/static/table.txt');

/**
 * lib/static/synonym.txt
 */
export const __dict_synonym_txt = join(__root, 'lib/static/synonym.txt');

/**
 * lib/static/lazy.properties
 */
export const __dict_properties_lazy = join(__root, 'lib/static/lazy.properties');

/**
 * lib/const/version-map.json
 */
export const __file_version_map_json = join(__root, 'lib/const/version-map.json');

/**
 * lib/const/publish-tags.json
 */
export const __file_publish_tags_json = join(__root, 'lib/const/publish-tags.json');

export const enum EnumVersion
{
	latest = 'latest',
}

/**
 * plugin-dev-raw/zh/META-INF/plugin.xml
 */
export const __file_plugin_dev_meta_xml = join(__plugin_dev_raw_dir, 'zh', 'META-INF/plugin.xml');

/**
 * original-plugin-raw/zh/META-INF/plugin.xml
 */
export const __file_plugin_src_meta_xml = join(__plugin_downloaded_dir_unzip, 'zh', 'META-INF/plugin.xml');
