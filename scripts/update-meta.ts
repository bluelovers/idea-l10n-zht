import { __file_plugin_dev_meta_xml } from '../lib/const';
import { outputFile, readFile } from 'fs-extra';
import Bluebird from 'bluebird';
import { updateMeta } from '../lib/meta';

export default Bluebird.resolve(readFile(__file_plugin_dev_meta_xml))
	.then(buf => updateMeta(buf.toString()))
	.then(content_new => outputFile(__file_plugin_dev_meta_xml, content_new))
;
