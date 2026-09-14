/**
 * 更新插件 meta.xml 資訊腳本
 * Script to update plugin meta.xml information
 *
 * 讀取插件的 meta.xml 檔案，透過 updateMeta 更新其中的版本資訊等欄位，
 * 再將更新後的內容寫回原檔案。
 * Reads the plugin's meta.xml, updates version and other fields via updateMeta,
 * then writes the updated content back to the file.
 */
import { __file_plugin_dev_meta_xml } from '../lib/const';
import { outputFile, readFile } from 'fs-extra';
import Bluebird from 'bluebird';
import { updateMeta } from '../lib/meta';

export default Bluebird.resolve(readFile(__file_plugin_dev_meta_xml))
	.then(buf => updateMeta(buf.toString()))
	.then(content_new => outputFile(__file_plugin_dev_meta_xml, content_new))
;
