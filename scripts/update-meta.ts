import { join } from 'upath2';
import { __plugin_dev_raw_dir } from '../lib/const';
import { outputFile, readFile } from 'fs-extra';
import Bluebird from 'bluebird';
import { updateMeta } from '../lib/meta';

const fullpath_new = join(__plugin_dev_raw_dir, 'zh', 'META-INF/plugin.xml');

export default Bluebird.resolve(readFile(fullpath_new))
	.then(buf => updateMeta(buf.toString()))
	.then(content_new => outputFile(fullpath_new, content_new))
;
